import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Sparkles } from "lucide-react";

interface MadisonConfig {
  persona?: string;
  editorial_philosophy?: string;
  writing_influences?: string;
  forbidden_phrases?: string;
  quality_standards?: string;
  voice_spectrum?: string;
}

export function MadisonTrainingTab() {
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const [config, setConfig] = useState<MadisonConfig>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadMadisonConfig();
  }, [currentOrganizationId]);

  const loadMadisonConfig = async () => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", currentOrganizationId)
        .single();

      if (error) throw error;

      const madisonConfig = (data?.settings as any)?.madison_training;
      if (madisonConfig) {
        setConfig(madisonConfig);
      }
    } catch (error) {
      console.error("Error loading Madison config:", error);
    }
  };

  const handleSave = async () => {
    if (!currentOrganizationId) return;

    setIsSaving(true);
    try {
      // Get current settings
      const { data: currentData } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", currentOrganizationId)
        .single();

      const currentSettings = (currentData?.settings as any) || {};

      // Update with Madison training
      const { error } = await supabase
        .from("organizations")
        .update({
          settings: {
            ...currentSettings,
            madison_training: config
          }
        })
        .eq("id", currentOrganizationId);

      if (error) throw error;

      toast({
        title: "Madison's training updated",
        description: "Her personality and guidelines have been saved",
      });
    } catch (error) {
      console.error("Error saving Madison config:", error);
      toast({
        title: "Error saving",
        description: "Failed to update Madison's training",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-3 p-6 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg border border-primary/20">
        <Sparkles className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-lg mb-2">Train Madison's Core Personality</h3>
          <p className="text-sm text-muted-foreground">
            Define Madison's system-level training that applies across all content generation. 
            This shapes her editorial voice, influences, and approach—separate from individual brand guidelines.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="persona" className="text-base font-medium">
            Madison's Persona & Backstory
          </Label>
          <p className="text-sm text-muted-foreground">
            Define her character, experience, and personality traits. This makes her less robotic and more engaging.
          </p>
          <Textarea
            id="persona"
            value={config.persona || ""}
            onChange={(e) => setConfig({ ...config, persona: e.target.value })}
            placeholder="Example: Madison is a seasoned editorial director with 15 years of luxury copywriting experience. She's precise yet warm, sophisticated but never pretentious. She has a slight preference for elegant restraint over flowery prose..."
            className="min-h-32 font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="editorial_philosophy" className="text-base font-medium">
            Editorial Philosophy
          </Label>
          <p className="text-sm text-muted-foreground">
            Her core beliefs about great copywriting and content creation.
          </p>
          <Textarea
            id="editorial_philosophy"
            value={config.editorial_philosophy || ""}
            onChange={(e) => setConfig({ ...config, editorial_philosophy: e.target.value })}
            placeholder="Example: Great copy sells without selling. It evokes desire through sensory details and emotional resonance. Every word must earn its place. Headlines must stop the scroll. Body copy must build anticipation..."
            className="min-h-32 font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="writing_influences" className="text-base font-medium">
            Writing Influences & Style Masters
          </Label>
          <p className="text-sm text-muted-foreground">
            The copywriting legends that shape her approach (J. Peterman, Ogilvy, Halbert, etc.)
          </p>
          <Textarea
            id="writing_influences"
            value={config.writing_influences || ""}
            onChange={(e) => setConfig({ ...config, writing_influences: e.target.value })}
            placeholder="Example: J. Peterman's narrative storytelling, David Ogilvy's research-driven headlines, Gary Halbert's emotional urgency, Claude Hopkins' specificity over abstraction..."
            className="min-h-32 font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="voice_spectrum" className="text-base font-medium">
            Voice Spectrum & Tonal Range
          </Label>
          <p className="text-sm text-muted-foreground">
            Define the range of voices she can adopt and when to use each.
          </p>
          <Textarea
            id="voice_spectrum"
            value={config.voice_spectrum || ""}
            onChange={(e) => setConfig({ ...config, voice_spectrum: e.target.value })}
            placeholder="Example: TARIFE_NATIVE (rich storytelling, sensory), JAY_PETERMAN (narrative adventure), OGILVY (sophisticated persuasion), HYBRID (balanced elegance). Choose based on brand personality and content goal..."
            className="min-h-32 font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="forbidden_phrases" className="text-base font-medium">
            System-Wide Forbidden Phrases
          </Label>
          <p className="text-sm text-muted-foreground">
            Words and phrases Madison should never use across all brands.
          </p>
          <Textarea
            id="forbidden_phrases"
            value={config.forbidden_phrases || ""}
            onChange={(e) => setConfig({ ...config, forbidden_phrases: e.target.value })}
            placeholder="Example: 'game-changer', 'revolutionary', 'cutting-edge', 'leverage', 'synergy', 'innovative solution', clichés, corporate jargon..."
            className="min-h-24 font-mono text-sm"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="quality_standards" className="text-base font-medium">
            Quality Standards & Benchmarks
          </Label>
          <p className="text-sm text-muted-foreground">
            What makes content excellent vs. mediocre in her eyes.
          </p>
          <Textarea
            id="quality_standards"
            value={config.quality_standards || ""}
            onChange={(e) => setConfig({ ...config, quality_standards: e.target.value })}
            placeholder="Example: Every headline must create curiosity or promise benefit. First paragraph must hook within 3 seconds. Sensory details over abstract claims. Active voice preferred. One clear idea per paragraph..."
            className="min-h-32 font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t">
        <Button 
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
        >
          {isSaving ? "Saving..." : "Save Madison's Training"}
        </Button>
      </div>
    </div>
  );
}
