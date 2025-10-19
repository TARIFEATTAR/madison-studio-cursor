import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, BookOpen, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CompletedKnowledgePanelProps {
  organizationId: string;
}

const KNOWLEDGE_TYPE_LABELS: Record<string, string> = {
  core_identity: "Core Identity",
  voice_tone: "Voice & Tone",
  target_audience: "Target Audience",
  visual_identity: "Visual Identity",
  messaging: "Messaging Guidelines",
  general: "General Brand Knowledge"
};

export function CompletedKnowledgePanel({ organizationId }: CompletedKnowledgePanelProps) {
  const { data: brandKnowledge, isLoading } = useQuery({
    queryKey: ["brand-knowledge", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_knowledge")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return null;
  }

  if (!brandKnowledge || brandKnowledge.length === 0) {
    return null;
  }

  return (
    <div className="bg-forest-ink/5 border border-forest-ink/20 p-8 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-forest-ink" />
          <h3 className="font-serif text-2xl text-ink-black">Completed Brand Knowledge</h3>
        </div>
        <Link to="/settings">
          <Button 
            variant="outline" 
            size="sm"
            className="border-forest-ink/30 text-forest-ink hover:bg-forest-ink/10"
          >
            View in Settings
            <ExternalLink className="w-3 h-3 ml-2" />
          </Button>
        </Link>
      </div>

      <p className="text-sm text-charcoal/60 mb-4">
        These brand knowledge components have been added to your profile and are now being used to generate on-brand content.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {brandKnowledge.map((knowledge) => (
          <div
            key={knowledge.id}
            className="bg-parchment-white border border-forest-ink/20 p-4 flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 text-forest-ink flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ink-black">
                {KNOWLEDGE_TYPE_LABELS[knowledge.knowledge_type] || knowledge.knowledge_type}
              </p>
              <p className="text-xs text-charcoal/60 mt-1">
                Added {new Date(knowledge.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
