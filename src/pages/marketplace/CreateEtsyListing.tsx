import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

export default function CreateEtsyListing() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

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

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      // Get organization ID
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .single();

      if (!orgMember) throw new Error("Organization not found");

      const { error } = await supabase
        .from("marketplace_listings")
        .insert({
          organization_id: orgMember.organization_id,
          product_id: formData.productId,
          platform: "etsy",
          title: formData.title || "Untitled Draft",
          status: "draft",
          platform_data: {
            category: formData.category,
            price: formData.price,
            quantity: formData.quantity,
            description: formData.description,
            tags: formData.tags,
            images: formData.images
          },
          created_by: user?.id
        });

      if (error) throw error;

      toast({
        title: "Draft saved",
        description: "Your Etsy listing has been saved as a draft."
      });
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
                <h1 className="font-serif text-2xl text-ink-black">Create Etsy Listing</h1>
                <p className="text-sm text-charcoal/60">Craft a marketplace-optimized listing with Madison's guidance</p>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
}
