import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileDown, Eye, Save, Upload, Loader2, ExternalLink, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProductAssociationSection } from "@/components/marketplace/sections/ProductAssociationSection";
import { BasicInformationSection } from "@/components/marketplace/sections/BasicInformationSection";
import { DescriptionSection } from "@/components/marketplace/sections/DescriptionSection";
import { ImagesSection } from "@/components/marketplace/sections/ImagesSection";
import { SEOTagsSection } from "@/components/marketplace/sections/SEOTagsSection";
import { MadisonAssistantPanel } from "@/components/marketplace/MadisonAssistantPanel";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";

export default function CreateEtsyListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [etsyConnected, setEtsyConnected] = useState(false);
  const [etsySyncStatus, setEtsySyncStatus] = useState<{
    synced: boolean;
    etsyUrl?: string;
    lastSync?: string;
  } | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    productId: null as string | null,
    title: "",
    category: "",
    price: "",
    quantity: "1",
    description: "",
    tags: [] as string[],
    images: [] as string[]
  });

  // Load existing listing if editing
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setListingId(id);
      loadListing(id);
    }
  }, [searchParams]);

  // Check if Etsy is connected
  useEffect(() => {
    const checkEtsyConnection = async () => {
      if (!currentOrganizationId) return;
      
      const { data } = await supabase
        .from("etsy_connections")
        .select("id, is_active")
        .eq("organization_id", currentOrganizationId)
        .eq("is_active", true)
        .maybeSingle();
      
      setEtsyConnected(!!data);
    };

    checkEtsyConnection();
  }, [currentOrganizationId]);

  const loadListing = async (id: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Safely access platform_data properties
        const platformData = data.platform_data as any || {};
        
        // Populate form with existing data
        setFormData({
          productId: data.product_id,
          title: data.title || "",
          category: platformData.category || "",
          price: platformData.price || "",
          quantity: platformData.quantity || "1",
          description: platformData.description || "",
          tags: platformData.tags || [],
          images: platformData.images || []
        });

        // Check Etsy sync status
        if (data.etsy_listing_id) {
          setEtsySyncStatus({
            synced: true,
            etsyUrl: data.external_url,
            lastSync: data.last_etsy_sync,
          });
        }
      }
    } catch (error) {
      console.error('Error loading listing:', error);
      toast({
        title: "Error loading listing",
        description: "Could not load the listing data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      const platformData = {
        category: formData.category,
        price: formData.price,
        quantity: formData.quantity,
        description: formData.description,
        tags: formData.tags,
        images: formData.images
      };

      if (listingId) {
        // Update existing listing
        const { error } = await supabase
          .from("marketplace_listings")
          .update({
            title: formData.title || "Untitled Draft",
            product_id: formData.productId,
            platform_data: platformData,
            updated_at: new Date().toISOString()
          })
          .eq('id', listingId);

        if (error) throw error;

        toast({
          title: "Listing updated",
          description: "Your Etsy listing has been updated."
        });
      } else {
        // Create new listing
        const { error } = await supabase
          .from("marketplace_listings")
          .insert({
            organization_id: currentOrganizationId,
            product_id: formData.productId,
            platform: "etsy",
            title: formData.title || "Untitled Draft",
            status: "draft",
            platform_data: platformData,
            created_by: user?.id
          });

        if (error) throw error;

        toast({
          title: "Draft saved",
          description: "Your Etsy listing has been saved as a draft."
        });
      }

      // Navigate back to library
      navigate('/marketplace-library');
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Error saving draft",
        description: "There was a problem saving your listing.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    // TODO: Implement CSV export
    toast({
      title: "Export CSV",
      description: "CSV export coming soon!"
    });
  };

  const handlePreview = () => {
    // TODO: Implement preview
    toast({
      title: "Preview",
      description: "Preview feature coming soon!"
    });
  };

  // Push listing to Etsy
  const handlePushToEtsy = async () => {
    if (!listingId) {
      // Need to save first
      toast({
        title: "Save Required",
        description: "Please save the listing as a draft first, then push to Etsy.",
        variant: "destructive",
      });
      return;
    }

    if (!etsyConnected) {
      toast({
        title: "Etsy Not Connected",
        description: "Please connect your Etsy shop in Settings > Integrations first.",
        variant: "destructive",
      });
      return;
    }

    // Validate required fields
    if (!formData.title?.trim()) {
      toast({ title: "Missing Title", description: "Please add a title for your listing.", variant: "destructive" });
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      toast({ title: "Invalid Price", description: "Please set a valid price.", variant: "destructive" });
      return;
    }

    setPushing(true);
    try {
      const { data, error } = await supabase.functions.invoke("etsy-push-listing", {
        body: { listingId },
      });

      if (error) throw error;

      if (data?.success) {
        setEtsySyncStatus({
          synced: true,
          etsyUrl: data.etsyUrl,
          lastSync: new Date().toISOString(),
        });

        toast({
          title: "Pushed to Etsy!",
          description: data.message || "Your listing has been created as a draft on Etsy.",
        });
      } else {
        throw new Error(data?.error || "Failed to push to Etsy");
      }
    } catch (err: any) {
      console.error("Error pushing to Etsy:", err);
      toast({
        title: "Push Failed",
        description: err.message || "Failed to push listing to Etsy. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPushing(false);
    }
  };

  return (
    <div className="min-h-screen bg-parchment-white">
      {/* Header */}
      <div className="border-b border-aged-brass/20 bg-white">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/marketplace")}
                className="text-charcoal hover:text-ink-black"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-serif text-2xl text-ink-black">
                  {listingId ? 'Edit Etsy Listing' : 'Create Etsy Listing'}
                </h1>
                <p className="text-sm text-charcoal/60">Craft a marketplace-optimized listing with Madison's guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Etsy Sync Status */}
              {etsySyncStatus?.synced && (
                <div className="flex items-center gap-2 mr-2">
                  <Badge variant="outline" className="text-green-600 border-green-600 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    Synced to Etsy
                  </Badge>
                  {etsySyncStatus.etsyUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={etsySyncStatus.etsyUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              )}

              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                onClick={handleExportCSV}
              >
                <FileDown className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              
              {/* Push to Etsy Button */}
              <Button
                onClick={handlePushToEtsy}
                disabled={pushing || !etsyConnected}
                className="bg-[#F56400] hover:bg-[#E55400] text-white"
                title={!etsyConnected ? "Connect Etsy in Settings first" : undefined}
              >
                {pushing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Pushing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {etsySyncStatus?.synced ? "Update on Etsy" : "Push to Etsy"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Split Layout */}
      <div className="max-w-[1600px] mx-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-charcoal/70">Loading listing...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Side - Form */}
            <div className="lg:col-span-2 space-y-4">
            <ProductAssociationSection 
              productId={formData.productId}
              onProductSelect={(productId) => updateFormData({ productId })}
            />
            
            <BasicInformationSection
              title={formData.title}
              category={formData.category}
              price={formData.price}
              quantity={formData.quantity}
              onUpdate={updateFormData}
            />

            <DescriptionSection
              description={formData.description}
              onUpdate={(description) => updateFormData({ description })}
            />

            <ImagesSection
              images={formData.images}
              onUpdate={(images) => updateFormData({ images })}
            />

            <SEOTagsSection
              tags={formData.tags}
              onUpdate={(tags) => updateFormData({ tags })}
            />
          </div>

          {/* Right Side - Madison Panel */}
          <div className="lg:col-span-1">
            <MadisonAssistantPanel 
              platform="etsy"
              formData={formData}
              onUpdateField={updateFormData}
              organizationId={currentOrganizationId || undefined}
              productId={formData.productId || undefined}
            />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
