import { useState } from "react";
import { Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface BrandAlignmentButtonProps {
  contentId: string;
  contentType: 'master' | 'derivative';
  title: string;
  content: string;
  currentScore?: number;
  lastCheckAt?: string;
}

export function BrandAlignmentButton({
  contentId,
  contentType,
  title,
  content,
  currentScore,
  lastCheckAt,
}: BrandAlignmentButtonProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleAnalyze = async () => {
    if (!user) {
      toast.error("Please log in to analyze content");
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get user's organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) {
        toast.error("Organization not found");
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-brand-consistency", {
        body: {
          contentId,
          contentType,
          content,
          title,
          organizationId: orgMember.organization_id,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error === 'no_brand_knowledge') {
        toast.error(data.message);
        return;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAnalysis(data.analysis);
      setShowResults(true);
      queryClient.invalidateQueries({ queryKey: ["library-content"] });
      toast.success("Brand alignment check complete!");
    } catch (error: any) {
      console.error("Error analyzing content:", error);
      toast.error("Failed to analyze brand alignment");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreColor = 
    (analysis?.score || currentScore || 0) >= 90 
      ? "text-emerald-600" 
      : (analysis?.score || currentScore || 0) >= 70 
        ? "text-aged-brass" 
        : "text-red-600";

  return (
    <>
      <Button
        onClick={handleAnalyze}
        disabled={isAnalyzing}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Target className="w-4 h-4" />
            {currentScore !== undefined ? `Recheck (${currentScore}%)` : "Check Brand Alignment"}
          </>
        )}
      </Button>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Brand Alignment Analysis</DialogTitle>
          </DialogHeader>

          {analysis && (
            <div className="space-y-6">
              {/* Score */}
              <div className="text-center border-b pb-6">
                <p className={`font-serif text-7xl font-light ${scoreColor} mb-2`}>
                  {analysis.score}%
                </p>
                <p className="text-sm text-charcoal/60">{analysis.overall_assessment}</p>
              </div>

              {/* Alignment Breakdown */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">Voice</p>
                  <p className="text-2xl font-serif text-ink-black">{analysis.voice_alignment}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">Tone</p>
                  <p className="text-2xl font-serif text-ink-black">{analysis.tone_alignment}%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">Terminology</p>
                  <p className="text-2xl font-serif text-ink-black">{analysis.terminology_alignment}%</p>
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths?.length > 0 && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-charcoal/80 mb-3">Strengths</h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-charcoal/80">
                        <span className="text-emerald-600 mt-1">✓</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {analysis.weaknesses?.length > 0 && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-charcoal/80 mb-3">Areas to Improve</h4>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((weakness: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-charcoal/80">
                        <span className="text-red-600 mt-1">×</span>
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {analysis.recommendations?.length > 0 && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-charcoal/80 mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-charcoal/80">
                        <span className="text-aged-brass mt-1">→</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}