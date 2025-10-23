import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Download, Store, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getPlatform } from "@/config/marketplaceTemplates";
import { BasicInformationSection } from "@/components/marketplace/sections/BasicInformationSection";
import { DescriptionSection } from "@/components/marketplace/sections/DescriptionSection";
import { SEOTagsSection } from "@/components/marketplace/sections/SEOTagsSection";
import { ProductAssociationSection } from "@/components/marketplace/sections/ProductAssociationSection";
import { MadisonAssistantPanel, MadisonAssistantHandle } from "@/components/marketplace/MadisonAssistantPanel";
import { supabase } from "@/integrations/supabase/client";

const CreateShopifyListing = () => {
  const navigate = useNavigate();
  const platform = getPlatform('shopify');

  const [formData, setFormData] = useState({
    title: '',
    product_type: '',
    vendor: '',
    category: '',
    price: '',
    compare_at_price: '',
    description: '',
    tags: [] as string[],
    sku: '',
    weight: '',
    quantity: '1'
  });

  const [productId, setProductId] = useState<string | null>(null);
  const [externalId, setExternalId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [currentListingId, setCurrentListingId] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [manualShopifyId, setManualShopifyId] = useState('');
  const madisonRef = useRef<MadisonAssistantHandle>(null);

  // Fetch organization ID on mount
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
  }, []);

  if (!platform) {
    return <div>Platform configuration not found</div>;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = (updates: any) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSave = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast.error("Please add a product title");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Please add a product description");
      return;
    }
    if (!formData.price) {
      toast.error("Please set a price");
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
        status: 'draft' as const
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

      if (!data) {
        throw new Error('No data returned after save');
      }

      setCurrentListingId(data.id);
      setPushStatus((data.push_status as 'pending' | 'success' | 'failed') || 'pending');

      toast.success("Draft saved! You can now push to Shopify.");
    } catch (error: any) {
      console.error('Save error details:', error);
      toast.error(error.message || "Failed to save listing");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToShopify = async () => {
    if (!currentListingId) {
      toast.error("Please save your listing first");
      return;
    }

    const shopifyProductId = externalId || manualShopifyId;
    if (!shopifyProductId) {
      toast.error("Please link a product or enter a Shopify Product ID");
      return;
    }

    setIsPushing(true);
    try {
      const { data, error } = await supabase.functions.invoke(
        'update-shopify-product',
        {
          body: { 
            listing_id: currentListingId,
            shopify_product_id: shopifyProductId
          }
        }
      );

      if (error) throw error;

      setPushStatus('success');
      toast.success("Successfully pushed to Shopify!");
    } catch (error: any) {
      console.error('Error pushing to Shopify:', error);
      setPushStatus('failed');
      toast.error(error.message || "Failed to push to Shopify");
    } finally {
      setIsPushing(false);
    }
  };

  const handleExportCSV = () => {
    // Shopify CSV format
    const csvContent = [
      // Header
      ['Handle', 'Title', 'Body (HTML)', 'Vendor', 'Product Category', 'Type', 'Tags', 'Published', 'Variant Price', 'Variant Compare At Price', 'Variant SKU', 'Variant Grams', 'Image Src'].join(','),
      // Data row
      [
        formData.title.toLowerCase().replace(/\s+/g, '-'),
        `"${formData.title}"`,
        `"${formData.description.replace(/"/g, '""')}"`,
        formData.vendor || '',
        formData.category || '',
        formData.product_type || '',
        `"${formData.tags.join(', ')}"`,
        'FALSE',
        formData.price || '',
        formData.compare_at_price || '',
        formData.sku || '',
        formData.weight || '',
        ''
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/marketplace')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Marketplace
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Store className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Create Shopify Listing</h1>
                  <p className="text-sm text-muted-foreground">E-commerce platform - Professional product listings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!formData.title || !formData.description}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Shopify Product ID"
                  value={manualShopifyId}
                  onChange={(e) => setManualShopifyId(e.target.value)}
                  className="w-48 h-9"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePushToShopify}
                  disabled={isPushing || !currentListingId || (!externalId && !manualShopifyId)}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isPushing ? "Pushing..." : "Push to Shopify"}
                </Button>
              </div>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
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
                  setExternalId(product.shopify_product_id);
                  
                  // Auto-fill form from product data
                  handleUpdate({
                    title: product.name || '',
                    description: product.description || '',
                    category: product.category || '',
                    product_type: product.product_type || '',
                    vendor: product.collection || product.brand || '',
                  });
                  
                  toast.success("Product linked and form pre-filled!");
                } else if (product) {
                  setExternalId(null);
                  
                  // Still pre-fill even without Shopify ID
                  handleUpdate({
                    title: product.name || '',
                    description: product.description || '',
                    category: product.category || '',
                    product_type: product.product_type || '',
                    vendor: product.collection || product.brand || '',
                  });
                  
                  toast.info("Product data loaded (no Shopify ID yet)");
                } else {
                  setExternalId(null);
                }
              }}
            />

            <BasicInformationSection
              title={formData.title}
              category={formData.category}
              price={formData.price}
              quantity={formData.quantity}
              onUpdate={handleUpdate}
            />

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

            {/* Additional Shopify Fields */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Optional)</Label>
                  <Input
                    id="sku"
                    type="text"
                    placeholder="e.g., NOIR-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Stock Keeping Unit</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight in grams (Optional)</Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="0"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">For shipping calculations</p>
                </div>
              </div>
            </Card>
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
