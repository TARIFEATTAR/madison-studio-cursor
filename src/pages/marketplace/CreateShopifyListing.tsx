import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Download, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getPlatform } from "@/config/marketplaceTemplates";
import { BasicInformationSection } from "@/components/marketplace/sections/BasicInformationSection";
import { DescriptionSection } from "@/components/marketplace/sections/DescriptionSection";
import { SEOTagsSection } from "@/components/marketplace/sections/SEOTagsSection";
import { ProductAssociationSection } from "@/components/marketplace/sections/ProductAssociationSection";
import { MadisonAssistantPanel } from "@/components/marketplace/MadisonAssistantPanel";
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
    weight: ''
  });

  const [productId, setProductId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!platform) {
    return <div>Platform configuration not found</div>;
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        listing_data: formData,
        status: 'draft' as const
      };

      const { error } = await supabase
        .from('marketplace_listings')
        .insert(listingData);

      if (error) throw error;

      toast.success("Shopify listing saved!");
      navigate('/marketplace-library');
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save listing");
    } finally {
      setIsSaving(false);
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={!formData.title || !formData.description}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
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
            />

            <BasicInformationSection
              platform={platform}
              formData={formData}
              onInputChange={handleInputChange}
            />

            <DescriptionSection
              platform={platform}
              formData={formData}
              onInputChange={handleInputChange}
            />

            <SEOTagsSection
              platform={platform}
              formData={formData}
              onInputChange={handleInputChange}
            />

            {/* Additional Shopify Fields */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">SKU (Optional)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="e.g., NOIR-001"
                    value={formData.sku}
                    onChange={(e) => handleInputChange('sku', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Stock Keeping Unit</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Weight in grams (Optional)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="0"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">For shipping calculations</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Madison Assistant */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <MadisonAssistantPanel
                platform="shopify"
                formData={formData}
                productId={productId}
                onApplySuggestion={(field, value) => handleInputChange(field, value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateShopifyListing;
