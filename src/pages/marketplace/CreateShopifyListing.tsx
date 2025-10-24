import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Download, Store, Upload, Check, MoreVertical, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { getPlatform } from "@/config/marketplaceTemplates";

import { DescriptionSection } from "@/components/marketplace/sections/DescriptionSection";
import { SEOTagsSection } from "@/components/marketplace/sections/SEOTagsSection";
import { ProductAssociationSection } from "@/components/marketplace/sections/ProductAssociationSection";
import { MadisonAssistantPanel, MadisonAssistantHandle } from "@/components/marketplace/MadisonAssistantPanel";
import { supabase } from "@/integrations/supabase/client";

// Detect mobile devices
const isMobile = typeof window !== 'undefined' && (
  window.innerWidth < 768 || 
  /iPhone|Android|iPad/i.test(navigator.userAgent)
);

const CreateShopifyListing = () => {
  const navigate = useNavigate();
  const platform = getPlatform('shopify');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    product_type: '',
    vendor: ''
  });

  const [productId, setProductId] = useState<string | null>(null);
  const [externalId, setExternalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [savedTimestamp, setSavedTimestamp] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [currentListingId, setCurrentListingId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [manualShopifyId, setManualShopifyId] = useState('');
  const [sessionAlert, setSessionAlert] = useState<string | null>(null);
  const madisonRef = useRef<MadisonAssistantHandle>(null);

  // Fetch organization ID on mount and rehydrate listing ID
  useEffect(() => {
    const fetchOrgId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();
      
      if (orgMember) setOrganizationId(orgMember.organization_id);
    };
    fetchOrgId();
    
    // Rehydrate listing ID from localStorage
    const savedListingId = localStorage.getItem('shopify_listing_id');
    if (savedListingId && !currentListingId) {
      console.log('[Rehydrate] Restoring listing ID from localStorage:', savedListingId);
      setCurrentListingId(savedListingId);
    }
  }, []);

  // Monitor listing ID changes for debugging
  useEffect(() => {
    const normalizedExternalId = externalId?.trim() || null;
    const normalizedManualId = manualShopifyId?.trim() || null;
    const canPush = Boolean(currentListingId && (normalizedExternalId || normalizedManualId));
    
    console.log('[ListingID Changed]', { 
      currentListingId, 
      externalId: normalizedExternalId, 
      manualShopifyId: normalizedManualId,
      canPush
    });
  }, [currentListingId, externalId, manualShopifyId]);

  if (!platform) {
    return <div>Platform configuration not found</div>;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  // Ensure fresh session, especially for mobile
  const ensureFreshSession = async () => {
    if (isMobile) {
      await supabase.auth.refreshSession();
    }
    let { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.refreshSession();
      ({ data: { session } } = await supabase.auth.getSession());
    }
    return session;
  };

  // Helper to invoke with explicit Authorization header
  const invokeUpdate = async (listingId: string, productId: string, token: string) => {
    return await supabase.functions.invoke('update-shopify-product', {
      headers: { Authorization: `Bearer ${token}` },
      body: { listing_id: listingId, shopify_product_id: productId },
    });
  };

  const saveOrUpdateListing = async (): Promise<string | null> => {
    // If we have a listing ID, update it with latest data
    if (currentListingId) {
      const { error } = await supabase
        .from('marketplace_listings')
        .update({
          title: formData.title,
          platform_data: formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentListingId);
      
      if (error) throw error;
      return currentListingId;
    }
    
    // Otherwise, insert new listing
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .single();

    if (!orgMember) throw new Error('Organization not found');

    const listingData = {
      organization_id: orgMember.organization_id,
      platform: 'shopify',
      product_id: productId,
      external_id: externalId,
      title: formData.title,
      platform_data: formData,
      status: 'draft' as const,
      created_by: user.id
    };

    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert([listingData])
      .select()
      .single();

    if (error) throw error;

    const listingId = data?.id;
    if (listingId) {
      setCurrentListingId(listingId);
      localStorage.setItem('shopify_listing_id', listingId);
    }
    
    return listingId || null;
  };

  const handleSave = async () => {
    // Validate only essential required fields (title and description)
    if (!formData.title.trim()) {
      toast.error("Please add a product title");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please add a product description");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: orgMember } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .single();

      if (!orgMember) throw new Error('Organization not found');

      const listingData = {
        organization_id: orgMember.organization_id,
        platform: 'shopify',
        product_id: productId,
        external_id: externalId,
        title: formData.title,
        platform_data: formData,
        status: 'draft' as const,
        created_by: user.id
      };

      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert([listingData])
        .select()
        .single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw new Error(error.message || 'Failed to save to database');
      }

      let listingId = data?.id;

      if (!listingId) {
        // Fallback: query for the just-created listing
        console.log('[Save] No ID returned, querying for created listing...');
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('marketplace_listings')
          .select('id')
          .eq('organization_id', orgMember.organization_id)
          .eq('platform', 'shopify')
          .eq('title', formData.title)
          .eq('created_by', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fallbackError) {
          console.error('Fallback query error:', fallbackError);
          throw new Error('Failed to retrieve saved listing');
        }
        
        listingId = fallbackData?.id;
      }

      if (listingId) {
        // Immediately update state and localStorage
        setCurrentListingId(listingId);
        localStorage.setItem('shopify_listing_id', listingId);
        setPushStatus((data?.push_status as 'pending' | 'success' | 'failed') || 'pending');
        
        // Force a re-render check
        setTimeout(() => {
          console.log('[Save] Listing ID updated, button should now be enabled');
        }, 0);
      }
      
      // Show success state with timestamp
      setSaveSuccess(true);
      const now = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      setSavedTimestamp(now);
      toast.success(
        listingId 
          ? `Listing saved! (ID: ${listingId.slice(0, 8)}...)` 
          : "Draft saved!"
      );
      
      // Compute canPush for debugging
      const normalizedExternalId = externalId?.trim() || null;
      const normalizedManualId = manualShopifyId?.trim() || null;
      const canPush = Boolean(listingId && (normalizedExternalId || normalizedManualId));
      
      console.log('[Save] Success:', { 
        listingId, 
        externalId: normalizedExternalId,
        manualShopifyId: normalizedManualId,
        canPush 
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Save error details:', error);
      toast.error(error.message || "Failed to save listing");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToShopify = async () => {
    const shopifyProductId = externalId || manualShopifyId;
    if (!shopifyProductId) {
      toast.error("Please link a product or enter a Shopify Product ID");
      return;
    }

    setSessionAlert(null);
    setIsPushing(true);

    try {
      // Step 1: Save/update listing to ensure DB has latest data
      toast.info('Saving latest changes...');
      const listingId = await saveOrUpdateListing();
      if (!listingId) {
        throw new Error('Failed to save listing');
      }
      setCurrentListingId(listingId);

      // Step 2: Ensure fresh session with explicit token
      const session = await ensureFreshSession();
      if (!session?.access_token) {
        setSessionAlert('Your session expired. Please sign in again.');
        throw new Error('No active session. Please log in again.');
      }

      console.log('[Push] Invoking with explicit auth:', {
        listing_id: listingId,
        shopify_product_id: shopifyProductId
      });

      // Step 3: First attempt with explicit Authorization header
      let { data, error } = await invokeUpdate(listingId, shopifyProductId, session.access_token);

      // Step 4: Handle 401 with retry (mobile session quirks)
      if (error?.message?.includes('401') || data?.status === 401) {
        console.log('[Push] 401 on first attempt; refreshing and retrying...');
        await supabase.auth.refreshSession();
        const { data: s2 } = await supabase.auth.getSession();
        
        const retry = await invokeUpdate(
          listingId, 
          shopifyProductId, 
          s2?.session?.access_token || ''
        );
        
        if (retry.error || retry.data?.error) {
          if (isMobile) {
            setSessionAlert('Your session expired. Please sign in again.');
          }
          throw new Error(retry.data?.error || retry.error?.message || 'Failed to push after retry');
        }
        
        toast.success('✅ Successfully synced to Shopify.');
        setPushStatus('success');
        setExternalId(shopifyProductId);
        return;
      }

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Push failed');
      }

      console.log('[Push] Success:', data);
      toast.success('✅ Successfully synced to Shopify.');
      setPushStatus('success');
      setExternalId(shopifyProductId);
    } catch (err: any) {
      console.error('[Push] Error:', err);
      setPushStatus('failed');
      toast.error(`❌ Push failed: ${err.message}`);
      if (import.meta.env.DEV) {
        console.error('[Push] Full error details:', err);
      }
    } finally {
      setIsPushing(false);
    }
  };

  const handleExportCSV = () => {
    // Shopify CSV format
    const csvContent = [
      // Header
      ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Type', 'Tags', 'Published'].join(','),
      // Data row
      [
        formData.title.toLowerCase().replace(/\s+/g, '-'),
        `"${formData.title}"`,
        `"${formData.description.replace(/"/g, '""')}"`,
        formData.vendor || '',
        formData.product_type || '',
        `"${formData.tags.join(', ')}"`,
        'FALSE'
      ].join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `shopify-listing-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("CSV exported! Upload to Shopify via Products > Import");
  };

  // Compute button enabled state using latest values
  const normalizedExternalId = externalId?.trim() || null;
  const normalizedManualId = manualShopifyId?.trim() || null;
  const isPushButtonEnabled = Boolean(
    currentListingId && 
    (normalizedExternalId || normalizedManualId) && 
    !isPushing
  );

  console.log('[Render] Push button state:', { 
    currentListingId, 
    normalizedExternalId, 
    normalizedManualId, 
    isPushButtonEnabled 
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Row 1: Navigation + Title + Mobile Actions */}
            <div className="flex items-center justify-between gap-2">
              {/* Left side: Back button + Title */}
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/marketplace')}
                  className="shrink-0"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">Back to Marketplace</span>
                </Button>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-2 rounded-lg bg-green-500/10 shrink-0">
                    <Store className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-base sm:text-lg md:text-xl font-semibold truncate">Create Shopify Listing</h1>
                    <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block truncate">E-commerce platform - Professional product listings</p>
                  </div>
                </div>
              </div>
              
              {/* Right side: Mobile sheet trigger + Desktop save button */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Mobile: Show sheet trigger + save button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[85vh]">
                    <SheetHeader>
                      <SheetTitle>Listing Actions</SheetTitle>
                      <SheetDescription>
                        Manage your Shopify listing
                      </SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-4">
                      {/* Session alert for mobile */}
                      {sessionAlert && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription>{sessionAlert}</AlertDescription>
                        </Alert>
                      )}

                      {/* Status indicators */}
                      <div className="flex flex-col gap-2">
                        {pushStatus === 'success' && (
                          <div className="text-sm text-green-600 flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                            <span>Synced with Shopify</span>
                          </div>
                        )}
                        {pushStatus === 'failed' && (
                          <div className="text-sm text-red-600 flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                            <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                            <span>Push failed</span>
                          </div>
                        )}
                        {savedTimestamp && (
                          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            Saved at {savedTimestamp}
                          </div>
                        )}
                      </div>
                      
                      {/* Export CSV */}
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleExportCSV}
                        disabled={!formData.title || !formData.description}
                        className="w-full h-12"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                      
                      {/* Shopify Product ID */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Shopify Product ID</Label>
                        {externalId ? (
                          <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 p-3 rounded-lg">
                            <Check className="w-4 h-4 shrink-0" />
                            <div className="text-xs">
                              <p className="font-semibold">ID: {externalId}</p>
                              <p className="text-green-700/80">From linked product</p>
                            </div>
                          </div>
                        ) : (
                          <Input
                            placeholder="Enter Shopify Product ID"
                            value={manualShopifyId}
                            onChange={(e) => setManualShopifyId(e.target.value)}
                            className="h-12 text-base"
                          />
                        )}
                      </div>
                      
                      {/* Push to Shopify */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div>
                              <Button
                                size="lg"
                                onClick={handlePushToShopify}
                                disabled={!isPushButtonEnabled}
                                className={`w-full h-12 transition-all ${
                                  isPushButtonEnabled
                                    ? "bg-aged-brass hover:bg-aged-brass/90 text-white"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                {isPushing ? (
                                  <span className="animate-pulse">Pushing...</span>
                                ) : (
                                  "Push to Shopify"
                                )}
                              </Button>
                            </div>
                          </TooltipTrigger>
                          {(!currentListingId || (!externalId?.trim() && !manualShopifyId?.trim())) && (
                            <TooltipContent>
                              <p>
                                {!currentListingId && "Save draft first"}
                                {currentListingId && !externalId?.trim() && !manualShopifyId?.trim() && "Select a synced product or enter Shopify Product ID"}
                              </p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </SheetContent>
                </Sheet>
                
                {/* Save button - visible on all screen sizes */}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  variant={saveSuccess ? "default" : "outline"}
                  className={`flex items-center gap-2 transition-all h-9 ${
                    saveSuccess ? "bg-aged-brass hover:bg-aged-brass/90 text-white" : ""
                  }`}
                >
                  {saveSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Draft"}</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Row 2: Desktop-only action buttons */}
            <div className="hidden md:flex items-center justify-end gap-2 flex-wrap">
              {/* Status indicators */}
              {pushStatus === 'success' && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                  Synced
                </span>
              )}
              {pushStatus === 'failed' && (
                <span className="text-xs text-red-600 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-red-600 rounded-full"></span>
                  Push failed
                </span>
              )}
              
              {/* Export CSV */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!formData.title || !formData.description}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              
              {/* Shopify Product ID section */}
              <div className="flex items-center gap-2">
                {savedTimestamp && (
                  <span className="text-xs text-charcoal/60">
                    Saved at {savedTimestamp}
                  </span>
                )}
                {externalId ? (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-2 rounded-lg">
                    <Check className="w-4 h-4" />
                    <div className="text-xs">
                      <p className="font-semibold">ID: {externalId}</p>
                      <p className="text-green-700/80">From linked product</p>
                    </div>
                  </div>
                ) : (
                  <Input
                    placeholder="Or enter Shopify Product ID"
                    value={manualShopifyId}
                    onChange={(e) => setManualShopifyId(e.target.value)}
                    className="w-56 h-9 text-sm"
                  />
                )}
                
                {/* Push to Shopify */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          size="sm"
                          onClick={handlePushToShopify}
                          disabled={!isPushButtonEnabled}
                          className={`transition-all ${
                            isPushButtonEnabled
                              ? "bg-aged-brass hover:bg-aged-brass/90 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isPushing ? (
                            <span className="animate-pulse">Pushing...</span>
                          ) : (
                            "Push to Shopify"
                          )}
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {(!currentListingId || (!externalId?.trim() && !manualShopifyId?.trim())) && (
                      <TooltipContent>
                        <p>
                          {!currentListingId && "Save draft first"}
                          {currentListingId && !externalId?.trim() && !manualShopifyId?.trim() && "Select a synced product or enter Shopify Product ID"}
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <ProductAssociationSection
              productId={productId}
              onProductSelect={setProductId}
              onProductDataChange={(product) => {
                if (product?.shopify_product_id) {
                  const normalizedId = String(product.shopify_product_id);
                  setExternalId(normalizedId);
                  
                  handleUpdate({
                    title: product.name || '',
                    description: product.description || '',
                    product_type: product.product_type || '',
                    vendor: product.collection || product.brand || '',
                  });
                  
                  toast.success("Product linked!");
                } else if (product) {
                  setExternalId(null);
                  handleUpdate({
                    title: product.name || '',
                    description: product.description || '',
                    product_type: product.product_type || '',
                    vendor: product.collection || product.brand || '',
                  });
                  toast.info("Product data loaded");
                }
              }}
            />

            <Card className="p-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Product Title <span className="text-red-500">*</span>
                  </Label>
                  <span className="text-xs text-charcoal/60">
                    {formData.title.length}/255
                  </span>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Arabian Jasmine - Premium Fragrance Oil"
                  maxLength={255}
                  className="text-lg"
                />
              </div>
            </Card>

            <DescriptionSection
              description={formData.description}
              onUpdate={(desc) => handleInputChange('description', desc)}
              formData={formData}
              onUpdateAll={handleUpdate}
              madisonRef={madisonRef}
            />

            <SEOTagsSection
              tags={formData.tags}
              onUpdate={(tags) => handleInputChange('tags', tags)}
            />
          </div>

          {/* Right: Madison Assistant */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MadisonAssistantPanel
                ref={madisonRef}
                platform="shopify"
                formData={formData}
                productId={productId || undefined}
                organizationId={organizationId || undefined}
                onUpdateField={handleUpdate}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShopifyListing;
