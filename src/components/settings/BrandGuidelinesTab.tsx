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
import { BrandKnowledgeStatus } from "./BrandKnowledgeStatus";
import { BrandKnowledgeDebugPanel } from "./BrandKnowledgeDebugPanel";
import { FileText } from "lucide-react";
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


  return (
    <div className="space-y-8">
      {/* 1. Industry & Core Settings */}
      <IndustrySelector />

      <Separator className="my-8" />

      {/* 2. Brand Knowledge Center - Primary Action (Upload) */}
      {currentOrganizationId && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-serif text-charcoal">Brand Knowledge Center</h2>
            <p className="text-sm text-muted-foreground">
              Upload your brand guidelines, style guides, and product documents. Madison analyzes these to learn your unique voice and style.
            </p>
          </div>
          <BrandKnowledgeCenter organizationId={currentOrganizationId} />
        </div>
      )}

      {/* 3. Advanced Knowledge Inspector - Secondary Action (Deep Dive) */}
      {currentOrganizationId && (
        <>
          <Separator className="my-8" />
          <BrandKnowledgeManager />
        </>
      )}

      {/* 4. Developer Tools (Bottom) */}
      {currentOrganizationId && (
        <>
          <Separator className="my-8" />
          <BrandKnowledgeDebugPanel organizationId={currentOrganizationId} />
        </>
      )}
    </div>
  );
}
