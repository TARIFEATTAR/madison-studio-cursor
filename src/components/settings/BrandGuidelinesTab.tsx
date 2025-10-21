import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { IndustrySelector } from "./IndustrySelector";
import { BrandKnowledgeCenter } from "@/components/onboarding/BrandKnowledgeCenter";
import { BrandDocumentStatus } from "./BrandDocumentStatus";
import { BrandKnowledgeManager } from "./BrandKnowledgeManager";
import { downloadWorksheet } from "@/utils/worksheetGenerator";
import { FileText, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface BrandGuidelines {
  brand_name?: string;
  brand_voice?: string;
  forbidden_phrases?: string;
  brand_story?: string;
  target_audience?: string;
}

export function BrandGuidelinesTab() {
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const [isSaving, setIsSaving] = useState(false);
  const [brandDocuments, setBrandDocuments] = useState<any[]>([]);
  const [guidelines, setGuidelines] = useState<BrandGuidelines>({
    brand_name: "",
    brand_voice: "",
    forbidden_phrases: "",
    brand_story: "",
    target_audience: "",
  });

  useEffect(() => {
    loadBrandGuidelines();
    loadBrandDocuments();
  }, [currentOrganizationId]);

  const loadBrandGuidelines = async () => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", currentOrganizationId)
        .single();

      if (error) throw error;

      const settings = (data?.settings as any) || {};
      const saved = settings.brand_guidelines || {};
      setGuidelines({
        brand_name: saved.brand_name || "",
        brand_voice: saved.brand_voice || "",
        forbidden_phrases: saved.forbidden_phrases || "",
        brand_story: saved.brand_story || "",
        target_audience: saved.target_audience || "",
      });
    } catch (error) {
      console.error("Error loading brand guidelines:", error);
    }
  };

  const loadBrandDocuments = async () => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from('brand_documents')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBrandDocuments(data || []);
    } catch (error) {
      console.error('Error loading brand documents:', error);
    }
  };

  const handleSave = async () => {
    if (!currentOrganizationId) return;

    setIsSaving(true);
    try {
      // First get current settings
      const { data: orgData } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", currentOrganizationId)
        .single();

      const currentSettings = (orgData?.settings as any) || {};

      // Update with brand guidelines
      const { error } = await supabase
        .from("organizations")
        .update({
          settings: {
            ...currentSettings,
            brand_guidelines: guidelines,
          } as any,
        })
        .eq("id", currentOrganizationId);

      if (error) throw error;

      toast({
        title: "Changes saved",
        description: "Your brand guidelines have been updated.",
      });
    } catch (error) {
      console.error("Error saving brand guidelines:", error);
      toast({
        title: "Save failed",
        description: "Could not save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadWorksheet = async () => {
    try {
      await downloadWorksheet({ organizationName: guidelines.brand_name });
      toast({
        title: "Worksheet downloaded",
        description: "Fill it out and upload to the Create page to auto-fill your brief"
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-8">
      <IndustrySelector />

      {/* Brand Knowledge Manager - New Section */}
      {currentOrganizationId && (
        <>
          <BrandKnowledgeManager />
          <Separator className="my-8" />
        </>
      )}

      {/* Visual Standards for AI Image Generation */}
      {currentOrganizationId && (
        <>
          <Card className="bg-paper-light border-cream-dark">
            <CardHeader>
              <CardTitle className="text-charcoal flex items-center gap-2">
                <FileText className="w-5 h-5 text-brass" />
                Visual Standards for AI Image Generation
              </CardTitle>
              <CardDescription>
                Upload your brand's visual guidelines (photography rules, color palettes, lighting mandates, etc.) 
                to train Madison's creative direction for AI-generated images
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BrandDocumentStatus 
                organizationId={currentOrganizationId}
                documents={brandDocuments}
                onRetry={loadBrandDocuments}
              />
            </CardContent>
          </Card>
          <Separator className="my-8" />
        </>
      )}

      {/* Content Brief Worksheets */}
      <Card className="bg-paper-light border-cream-dark">
        <CardHeader>
          <CardTitle className="text-charcoal">Content Brief Worksheets</CardTitle>
          <CardDescription>
            Download fillable worksheets to plan content offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-parchment-white rounded-lg">
            <FileText className="w-5 h-5 mt-1 text-brass" />
            <div className="flex-1">
              <h4 className="font-medium mb-1 text-charcoal">Content Brief Worksheet</h4>
              <p className="text-sm text-warm-gray mb-3">
                Fill out offline and upload to auto-populate the Create form
              </p>
              <Button 
                onClick={handleDownloadWorksheet}
                className="flex items-center gap-2 bg-brass hover:bg-brass-light text-charcoal"
              >
                <Download className="w-4 h-4" />
                Download Worksheet (PDF)
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-warm-gray space-y-2">
            <p><strong>How to use:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Download and print the worksheet (or fill digitally)</li>
              <li>Complete all fields for your content brief</li>
              <li>Scan the QR code or go to Create page</li>
              <li>Upload your completed worksheet</li>
              <li>Review auto-filled data and generate content</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      {/* Brand Knowledge Center - AI-Powered Document Processing */}
      {currentOrganizationId && (
        <>
          <BrandKnowledgeCenter organizationId={currentOrganizationId} />
        </>
      )}
    </div>
  );
}
