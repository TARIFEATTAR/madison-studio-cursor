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
  const [guidelines, setGuidelines] = useState<BrandGuidelines>({
    brand_name: "Scriptora",
    brand_voice: "",
    forbidden_phrases: "",
    brand_story: "",
    target_audience: "",
  });

  useEffect(() => {
    loadBrandGuidelines();
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
        brand_name: saved.brand_name || "Scriptora",
        brand_voice: saved.brand_voice || "",
        forbidden_phrases: saved.forbidden_phrases || "",
        brand_story: saved.brand_story || "",
        target_audience: saved.target_audience || "",
      });
    } catch (error) {
      console.error("Error loading brand guidelines:", error);
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
          
          <Separator className="my-8" />
        </>
      )}

      <div className="bg-paper-light border border-cream-dark rounded-xl p-8">
        <h2 className="text-2xl font-serif text-charcoal mb-6">Brand Identity</h2>

        <div className="space-y-6">
          {/* Brand Name */}
          <div className="space-y-2">
            <Label htmlFor="brand-name" className="text-neutral-600">
              Brand Name
            </Label>
            <Input
              id="brand-name"
              value={guidelines.brand_name}
              onChange={(e) => setGuidelines({ ...guidelines, brand_name: e.target.value })}
              className="bg-paper-light border-cream-dark"
            />
          </div>

          {/* Brand Voice & Tone */}
          <div className="space-y-2">
            <Label htmlFor="brand-voice" className="text-neutral-600">
              Brand Voice & Tone
            </Label>
            <Textarea
              id="brand-voice"
              value={guidelines.brand_voice}
              onChange={(e) => {
                const target = e.target;
                const cursorPosition = target.selectionStart;
                const value = target.value;
                setGuidelines({ ...guidelines, brand_voice: value });
                requestAnimationFrame(() => {
                  if (target) {
                    target.setSelectionRange(cursorPosition, cursorPosition);
                  }
                });
              }}
              placeholder="Describe your brand's voice and tone..."
              className="min-h-[100px] bg-paper border-cream-dark resize-none"
            />
            <p className="text-xs text-neutral-500">
              This guides the AI in generating on-brand content
            </p>
          </div>

          {/* Forbidden Phrases */}
          <div className="space-y-2">
            <Label htmlFor="forbidden-phrases" className="text-neutral-600">
              Forbidden Phrases
            </Label>
            <Textarea
              id="forbidden-phrases"
              value={guidelines.forbidden_phrases}
              onChange={(e) => {
                const target = e.target;
                const cursorPosition = target.selectionStart;
                const value = target.value;
                setGuidelines({ ...guidelines, forbidden_phrases: value });
                requestAnimationFrame(() => {
                  if (target) {
                    target.setSelectionRange(cursorPosition, cursorPosition);
                  }
                });
              }}
              placeholder="List phrases to avoid (comma-separated)..."
              className="min-h-[100px] bg-paper border-cream-dark resize-none"
            />
            <p className="text-xs text-neutral-500">
              The AI will avoid using these phrases in generated content
            </p>
          </div>

          {/* Brand Story */}
          <div className="space-y-2">
            <Label htmlFor="brand-story" className="text-neutral-600">
              Brand Story
            </Label>
            <Textarea
              id="brand-story"
              value={guidelines.brand_story}
              onChange={(e) => {
                const target = e.target;
                const cursorPosition = target.selectionStart;
                const value = target.value;
                setGuidelines({ ...guidelines, brand_story: value });
                requestAnimationFrame(() => {
                  if (target) {
                    target.setSelectionRange(cursorPosition, cursorPosition);
                  }
                });
              }}
              placeholder="Tell your brand's story..."
              className="min-h-[150px] bg-paper border-cream-dark resize-none"
            />
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label htmlFor="target-audience" className="text-neutral-600">
              Target Audience
            </Label>
            <Textarea
              id="target-audience"
              value={guidelines.target_audience}
              onChange={(e) => {
                const target = e.target;
                const cursorPosition = target.selectionStart;
                const value = target.value;
                setGuidelines({ ...guidelines, target_audience: value });
                requestAnimationFrame(() => {
                  if (target) {
                    target.setSelectionRange(cursorPosition, cursorPosition);
                  }
                });
              }}
              placeholder="Describe your ideal customer..."
              className="min-h-[100px] bg-paper border-cream-dark resize-none"
            />
          </div>
        </div>

        {/* Save Button Footer */}
        <div className="mt-8 pt-6 border-t border-cream-dark flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-brass hover:bg-brass-light text-charcoal"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
