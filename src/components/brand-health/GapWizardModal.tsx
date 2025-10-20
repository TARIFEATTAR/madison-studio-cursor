import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface GapWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: {
    title: string;
    description: string;
    fix_type?: string;
  };
}

export function GapWizardModal({ isOpen, onClose, recommendation }: GapWizardModalProps) {
  const { user } = useAuth();
  const { brandHealth } = useBrandHealth();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSources, setAiSources] = useState<string[]>([]);
  
  // Form state based on fix_type
  const [formData, setFormData] = useState({
    mission: "",
    vision: "",
    values: "",
    personality: "",
    voiceGuidelines: "",
    toneSpectrum: "",
    contentTemplate: "",
  });

  const getKnowledgeType = () => {
    // Priority 1: Use fix_type if provided
    if (recommendation.fix_type) return recommendation.fix_type;
    
    // Priority 2: Keyword mapping
    const text = (recommendation.title + " " + recommendation.description).toLowerCase();
    
    // Target audience keywords
    if (text.match(/\b(audience|icp|persona|buyer|customer|demographic|profile|segment|target)\b/)) {
      return "target_audience";
    }
    
    // Voice and tone keywords
    if (text.match(/\b(voice|tone|style guide|tone spectrum|writing style)\b/)) {
      return "voice_tone";
    }
    
    // Core identity keywords
    if (text.match(/\b(mission|vision|values|identity|personality|core)\b/)) {
      return "core_identity";
    }
    
    // Content guidelines keywords
    if (text.match(/\b(content type|guidelines|format rules|blog|reels|shorts|tiktok|caption|post template|content format)\b/)) {
      return "content_guidelines";
    }
    
    // Collections transparency keywords
    if (text.match(/\b(collection transparency|transparency statement|collection description)\b/)) {
      return "collections_transparency";
    }
    
    // Default fallback
    return "general";
  };

  const handleAIGenerate = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsGenerating(true);
    setAiSources([]);

    const timeoutId = setTimeout(() => {
      setIsGenerating(false);
      toast.error("Request timed out. Madison took too long to respond. Please try again.");
    }, 45000);

    try {
      const { data, error } = await supabase.functions.invoke('suggest-brand-knowledge', {
        body: {
          knowledge_type: getKnowledgeType(),
          recommendation: {
            title: recommendation.title,
            description: recommendation.description,
          }
        }
      });

      clearTimeout(timeoutId);

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      const { suggestions } = data;

      if (!suggestions) {
        throw new Error("No suggestions returned");
      }

      // Update form data with AI suggestions
      if (suggestions.mission) setFormData(prev => ({ ...prev, mission: suggestions.mission }));
      if (suggestions.vision) setFormData(prev => ({ ...prev, vision: suggestions.vision }));
      if (suggestions.values) setFormData(prev => ({ ...prev, values: suggestions.values }));
      if (suggestions.personality) setFormData(prev => ({ ...prev, personality: suggestions.personality }));
      if (suggestions.voice_guidelines) setFormData(prev => ({ ...prev, voiceGuidelines: suggestions.voice_guidelines }));
      if (suggestions.tone_spectrum) setFormData(prev => ({ ...prev, toneSpectrum: suggestions.tone_spectrum }));
      if (suggestions.content) setFormData(prev => ({ ...prev, contentTemplate: suggestions.content }));

      // Store sources for display
      if (suggestions.sources) {
        setAiSources(suggestions.sources);
      }

      toast.success("Madison has generated suggestions based on your existing content!");
    } catch (error) {
      clearTimeout(timeoutId);
      console.error("Error generating:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate suggestions. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You must be logged in");
      return;
    }

    setIsSaving(true);
    try {
      // Get organization ID
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) {
        throw new Error("Organization not found");
      }

      // Prepare content based on fix type
      const content: any = {};
      const knowledgeType = getKnowledgeType();

      if (knowledgeType === "core_identity") {
        content.mission = formData.mission;
        content.vision = formData.vision;
        content.values = formData.values;
        content.personality = formData.personality;
      } else if (knowledgeType === "voice_tone") {
        content.voice_guidelines = formData.voiceGuidelines;
        content.tone_spectrum = formData.toneSpectrum;
      } else {
        // Generic content for all other knowledge types (target_audience, general, etc.)
        content.description = formData.contentTemplate;
      }

      // Validate we have content to save
      const hasContent = Object.values(content).some((v: any) =>
        typeof v === 'string' ? v.trim().length > 0 : v && typeof v === 'object' ? Object.keys(v).length > 0 : false
      );
      if (!hasContent) {
        toast.error("Please add content before saving.");
        setIsSaving(false);
        return;
      }

      // If this recommendation is about collection transparency, update collections directly
      if (knowledgeType === "collections_transparency") {
        const statement = (formData.contentTemplate || "").trim();
        const { error: updateTransparencyError } = await supabase
          .from("brand_collections")
          .update({ transparency_statement: statement })
          .eq("organization_id", orgMember.organization_id)
          .is("transparency_statement", null);
        if (updateTransparencyError) throw updateTransparencyError;
      }

      // Deactivate existing active entries for this knowledge type and compute next version
      const { data: existing, error: existingError } = await supabase
        .from("brand_knowledge")
        .select("id, version")
        .eq("organization_id", orgMember.organization_id)
        .eq("knowledge_type", knowledgeType)
        .eq("is_active", true);
      if (existingError) throw existingError;

      let newVersion = 1;
      if (existing && existing.length > 0) {
        newVersion = Math.max(...existing.map((e: any) => (e.version ?? 1))) + 1;
        const { error: deactivateError } = await supabase
          .from("brand_knowledge")
          .update({ is_active: false })
          .in("id", existing.map((e: any) => e.id));
        if (deactivateError) throw deactivateError;
      }

      // Insert brand knowledge as the latest active version
      const { error } = await supabase
        .from("brand_knowledge")
        .insert({
          organization_id: orgMember.organization_id,
          knowledge_type: knowledgeType,
          content: content,
          version: newVersion,
          is_active: true,
        });

      if (error) throw error;

      toast.success("Brand knowledge saved! Recalculating health score...");
      
      // Trigger brand health re-analysis
      setIsSaving(false);
      setIsAnalyzing(true);
      
      try {
        const { data: analysisData, error: analysisError } = await supabase.functions.invoke('analyze-brand-health', {
          body: { organizationId: orgMember.organization_id }
        });

        if (analysisError) {
          console.error("Analysis error:", analysisError);
          toast.error("Failed to recalculate brand health score");
        } else {
          const newScore = analysisData?.healthAnalysis?.completeness_score;
          const oldScore = brandHealth?.completeness_score || 0;
          
          if (newScore !== undefined) {
            const improvement = newScore - oldScore;
            if (improvement > 0) {
              toast.success(`✨ Score improved by ${improvement}%! New score: ${newScore}%`, {
                duration: 5000,
              });
            } else {
              toast.success(`Brand health updated! Score: ${newScore}%`);
            }
          } else {
            toast.success("Brand health analysis complete!");
          }
        }
      } catch (analysisError) {
        console.error("Error during analysis:", analysisError);
        toast.error("Failed to recalculate brand health score");
      }

      // Invalidate queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: ["brand-health", user.id] });
      queryClient.refetchQueries({ queryKey: ["brand-health", user.id] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats", user.id] });
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save brand knowledge");
    } finally {
      setIsSaving(false);
      setIsAnalyzing(false);
    }
  };

  const renderFormFields = () => {
    const knowledgeType = getKnowledgeType();

    if (knowledgeType === "core_identity") {
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="mission" className="text-ink-black">Mission Statement</Label>
            <Textarea
              id="mission"
              value={formData.mission}
              onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
              placeholder="What is your brand's purpose and reason for existing?"
              className="mt-2 min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="vision" className="text-ink-black">Vision Statement</Label>
            <Textarea
              id="vision"
              value={formData.vision}
              onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
              placeholder="What future are you working towards?"
              className="mt-2 min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="values" className="text-ink-black">Core Values</Label>
            <Textarea
              id="values"
              value={formData.values}
              onChange={(e) => setFormData({ ...formData, values: e.target.value })}
              placeholder="What principles guide your brand decisions?"
              className="mt-2 min-h-[100px]"
            />
          </div>
          <div>
            <Label htmlFor="personality" className="text-ink-black">Brand Personality</Label>
            <Textarea
              id="personality"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
              placeholder="If your brand were a person, how would you describe them?"
              className="mt-2 min-h-[100px]"
            />
          </div>
        </div>
      );
    }

    if (knowledgeType === "voice_tone") {
      return (
        <div className="space-y-6">
          <div>
            <Label htmlFor="voiceGuidelines" className="text-ink-black">Voice Guidelines</Label>
            <Textarea
              id="voiceGuidelines"
              value={formData.voiceGuidelines}
              onChange={(e) => setFormData({ ...formData, voiceGuidelines: e.target.value })}
              placeholder="Describe your brand's consistent voice characteristics..."
              className="mt-2 min-h-[120px]"
            />
          </div>
          <div>
            <Label htmlFor="toneSpectrum" className="text-ink-black">Tone Spectrum</Label>
            <Textarea
              id="toneSpectrum"
              value={formData.toneSpectrum}
              onChange={(e) => setFormData({ ...formData, toneSpectrum: e.target.value })}
              placeholder="How does tone vary across different contexts? (e.g., educational, promotional, support)"
              className="mt-2 min-h-[120px]"
            />
          </div>
        </div>
      );
    }

    return (
      <div>
        <Label htmlFor="content" className="text-ink-black">Content</Label>
        <Textarea
          id="content"
          value={formData.contentTemplate}
          onChange={(e) => setFormData({ ...formData, contentTemplate: e.target.value })}
          placeholder="Add your brand guidelines..."
          className="mt-2 min-h-[200px]"
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-parchment-white">
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-ink-black">
            {recommendation.title}
          </DialogTitle>
          <p className="text-sm text-charcoal/70 mt-2">{recommendation.description}</p>
        </DialogHeader>

        <div className="mt-6">
          <div className="bg-aged-brass/10 border border-aged-brass/20 p-4 mb-6">
            <p className="text-sm text-charcoal/80">
              Fill in the fields below to add this information to your brand knowledge base. 
              This will improve your brand consistency score and help generate better content.
            </p>
          </div>

          {aiSources.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 mb-6 rounded">
              <p className="text-sm font-medium text-green-900 mb-2">
                Madison's suggestions based on:
              </p>
              <ul className="text-xs text-green-800 space-y-1">
                {aiSources.map((source, idx) => (
                  <li key={idx}>• {source}</li>
                ))}
              </ul>
            </div>
          )}

          {renderFormFields()}

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-charcoal/10">
            <Button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              variant="outline"
              className="border-aged-brass/40 text-aged-brass hover:bg-aged-brass/10"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ask Madison
                </>
              )}
            </Button>
            <div className="flex-1" />
            <Button
              onClick={onClose}
              variant="outline"
              className="border-charcoal/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || isAnalyzing}
              className="bg-aged-brass hover:bg-aged-brass/90 text-ink-black"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating Score...
                </>
              ) : (
                "Save & Apply"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
