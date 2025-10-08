import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Upload, X, Printer, Check } from "lucide-react";

interface BrandConfig {
  logo_url?: string;
  brand_colors?: string[];
  typography_font?: string;
}

export function BrandGuidelinesTab() {
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const [brandConfig, setBrandConfig] = useState<BrandConfig>({
    brand_colors: ["#B8956A", "#FFFFFF", "#000000", "#F5F5F5"],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadBrandConfig();
  }, [currentOrganizationId]);

  const loadBrandConfig = async () => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("brand_config")
        .eq("id", currentOrganizationId)
        .single();

      if (error) throw error;

      const config = (data?.brand_config as any) || {};
      setBrandConfig({
        logo_url: config.logo_url,
        brand_colors: config.brand_colors || ["#B8956A", "#FFFFFF", "#000000", "#F5F5F5"],
        typography_font: config.typography_font || "Inter",
      });
    } catch (error) {
      console.error("Error loading brand config:", error);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentOrganizationId) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, SVG, or WebP image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5242880) {
      toast({
        title: "File too large",
        description: "Logo must be under 5MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${currentOrganizationId}/logo.${fileExt}`;

      // Delete old logo if exists
      if (brandConfig.logo_url) {
        const oldPath = brandConfig.logo_url.split("/").slice(-2).join("/");
        await supabase.storage.from("brand-assets").remove([oldPath]);
      }

      // Upload new logo
      const { error: uploadError } = await supabase.storage
        .from("brand-assets")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("brand-assets")
        .getPublicUrl(fileName);

      // Update brand config
      const newConfig = { ...brandConfig, logo_url: publicUrl };
      setBrandConfig(newConfig);

      await saveBrandConfig(newConfig);

      toast({
        title: "Logo uploaded",
        description: "Your brand logo has been saved.",
      });
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload failed",
        description: "Could not upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleColorChange = (index: number, color: string) => {
    const newColors = [...(brandConfig.brand_colors || [])];
    newColors[index] = color;
    setBrandConfig({ ...brandConfig, brand_colors: newColors });
  };

  const saveBrandConfig = async (config?: BrandConfig) => {
    if (!currentOrganizationId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          brand_config: (config || brandConfig) as any,
        })
        .eq("id", currentOrganizationId);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "Your brand guidelines have been updated.",
      });
    } catch (error) {
      console.error("Error saving brand config:", error);
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header with Print Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Brand Guidelines</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Define your visual identity - logo, colors, and typography
          </p>
        </div>
        <Button onClick={handlePrint} variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Print Guidelines
        </Button>
      </div>

      {/* Logo Section */}
      <Card className="print:border-2 print:border-foreground">
        <CardHeader>
          <CardTitle>Brand Logo</CardTitle>
          <CardDescription>Upload your primary brand logo (PNG, JPG, SVG, or WebP, max 5MB)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {brandConfig.logo_url ? (
            <div className="relative inline-block">
              <img
                src={brandConfig.logo_url}
                alt="Brand Logo"
                className="max-h-32 object-contain border border-border/40 rounded-lg p-4 bg-card"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground print:hidden"
                onClick={() => {
                  setBrandConfig({ ...brandConfig, logo_url: undefined });
                  saveBrandConfig({ ...brandConfig, logo_url: undefined });
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div
              onClick={() => logoInputRef.current?.click()}
              className="border-2 border-dashed border-border/60 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors print:hidden"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Click to upload your logo</p>
            </div>
          )}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleLogoUpload}
            className="hidden"
          />
          {brandConfig.logo_url && (
            <Button
              variant="outline"
              onClick={() => logoInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2 print:hidden"
            >
              <Upload className="w-4 h-4" />
              {isUploading ? "Uploading..." : "Replace Logo"}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Color Palette Section */}
      <Card className="print:border-2 print:border-foreground">
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Define up to 4 core brand colors</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="space-y-3">
                <Label className="text-sm font-medium">
                  {index === 0 ? "Primary Color" : index === 1 ? "Secondary Color" : `Accent Color ${index - 1}`}
                </Label>
                <div className="flex gap-3 items-center">
                  <div
                    className="h-20 w-20 rounded-lg border-2 border-border/40 flex-shrink-0 shadow-sm print:border-foreground"
                    style={{ backgroundColor: brandConfig.brand_colors?.[index] }}
                  />
                  <div className="flex-1 space-y-2">
                    <input
                      type="color"
                      value={brandConfig.brand_colors?.[index] || "#FFFFFF"}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="h-10 w-full rounded border border-border/40 cursor-pointer print:hidden"
                    />
                    <Input
                      value={brandConfig.brand_colors?.[index] || "#FFFFFF"}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      placeholder="#000000"
                      className="bg-input border-border/40 font-mono text-sm"
                      readOnly={typeof window !== 'undefined' && window.matchMedia('print').matches}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button onClick={() => saveBrandConfig()} disabled={isSaving} className="gap-2 print:hidden">
            <Check className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Colors"}
          </Button>
        </CardContent>
      </Card>

      {/* Typography Section */}
      <Card className="print:border-2 print:border-foreground">
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Your brand's font family</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Font Family</Label>
            <Input
              value={brandConfig.typography_font || "Inter"}
              onChange={(e) => setBrandConfig({ ...brandConfig, typography_font: e.target.value })}
              placeholder="Inter, Cormorant Garamond, etc."
              className="bg-input border-border/40"
            />
          </div>

          {/* Typography Sample */}
          <div className="border border-border/40 rounded-lg p-6 bg-card print:border-2 print:border-foreground">
            <div style={{ fontFamily: brandConfig.typography_font || "Inter" }} className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Alphabet</p>
                <p className="text-2xl">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-2xl">abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-2xl">0123456789</p>
              </div>
              <div className="pt-4 border-t border-border/20">
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Sample Text</p>
                <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
              </div>
            </div>
          </div>

          <Button onClick={() => saveBrandConfig()} disabled={isSaving} className="gap-2 print:hidden">
            <Check className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Typography"}
          </Button>
        </CardContent>
      </Card>

      {/* Print-only footer */}
      <div className="hidden print:block mt-8 pt-4 border-t border-foreground/20">
        <p className="text-sm text-muted-foreground text-center">
          Brand Guidelines · Generated from Scriptora
        </p>
      </div>
    </div>
  );
}
