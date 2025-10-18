import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, FileDown, Eye, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export default function CreateTikTokShopListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);

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
          description: "Your TikTok Shop listing has been updated."
        });
      } else {
        // Create new listing
        const { error } = await supabase
          .from("marketplace_listings")
          .insert({
            organization_id: currentOrganizationId,
            product_id: formData.productId,
            platform: "tiktok_shop",
            title: formData.title || "Untitled Draft",
            status: "draft",
            platform_data: platformData,
            created_by: user?.id
          });

        if (error) throw error;

        toast({
          title: "Draft saved",
          description: "Your TikTok Shop listing has been saved as a draft."
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
    toast({
      title: "Export CSV",
      description: "CSV export coming soon!"
    });
  };

  const handlePreview = () => {
    toast({
      title: "Preview",
      description: "Preview feature coming soon!"
    });
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
                  {listingId ? 'Edit TikTok Shop Listing' : 'Create TikTok Shop Listing'}
                </h1>
                <p className="text-sm text-charcoal/60">Create viral-worthy product listings for TikTok Shop</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
              <Button
                className="bg-aged-brass hover:bg-aged-brass/90"
                onClick={handlePreview}
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
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
              platform="tiktok_shop"
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
