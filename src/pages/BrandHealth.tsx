import { Shield, TrendingUp, AlertCircle, CheckCircle2, Clock, Sparkles, BookOpen } from "lucide-react";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { Button } from "@/components/ui/button";
import { CategoryProgress } from "@/components/brand-health/CategoryProgress";
import { RecommendationCard } from "@/components/brand-health/RecommendationCard";
import { ScoreHistoryChart } from "@/components/brand-health/ScoreHistoryChart";
import { CompletedKnowledgePanel } from "@/components/brand-health/CompletedKnowledgePanel";
import { useNavigate } from "react-router-dom";

export default function BrandHealth() {
  const { brandHealth, isLoading, analyzeBrandHealth, isAnalyzing } = useBrandHealth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vellum-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-charcoal/10 w-1/3 rounded"></div>
            <div className="h-64 bg-charcoal/10 w-full rounded"></div>
            <div className="h-96 bg-charcoal/10 w-full rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!brandHealth) {
    return (
      <div className="min-h-screen bg-vellum-cream">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="bg-parchment-white border border-charcoal/10 p-12 text-center">
            <Shield className="w-16 h-16 text-charcoal/30 mx-auto mb-6" />
            <h1 className="font-serif text-4xl text-ink-black mb-4">Brand Health Analysis</h1>
            <p className="text-charcoal/60 mb-8 max-w-2xl mx-auto">
              Analyze your brand documentation to identify gaps, track improvements, and ensure 
              consistent messaging across all your content.
            </p>
            <Button
              onClick={() => analyzeBrandHealth()}
              disabled={isAnalyzing}
              size="lg"
              className="bg-aged-brass hover:bg-aged-brass/90 text-ink-black px-12"
            >
              {isAnalyzing ? "Analyzing Your Brand..." : "Run First Analysis"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const score = brandHealth.completeness_score;
  const scoreColor = score >= 90 ? "text-emerald-600" : score >= 70 ? "text-aged-brass" : "text-red-600";
  const scoreBgColor = score >= 90 ? "bg-emerald-500" : score >= 70 ? "bg-aged-brass" : "bg-red-500";

  const highPriorityRecs = brandHealth.recommendations.filter(r => r.priority === 'high');
  const mediumPriorityRecs = brandHealth.recommendations.filter(r => r.priority === 'medium');
  const lowPriorityRecs = brandHealth.recommendations.filter(r => r.priority === 'low');

  return (
    <div className="min-h-screen bg-vellum-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Shield className="w-10 h-10 text-charcoal/40" />
              <div>
                <h1 className="font-serif text-5xl text-ink-black">Brand Health</h1>
                <p className="text-sm text-charcoal/60 mt-1 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  Last analyzed {new Date(brandHealth.last_analyzed_at).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Button
                onClick={() => navigate("/")}
                variant="outline"
                className="border-charcoal/20 w-full sm:w-auto"
              >
                Back to Dashboard
              </Button>
              <Button
                onClick={() => analyzeBrandHealth()}
                disabled={isAnalyzing}
                className="bg-aged-brass hover:bg-aged-brass/90 text-ink-black w-full sm:w-auto"
              >
                {isAnalyzing ? "Analyzing..." : "Refresh Analysis"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Score & Quick Stats */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Score */}
            <div className="bg-parchment-white border border-charcoal/10 p-8">
              <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-4">
                Overall Score
              </p>
              <div className="flex items-end gap-3 mb-4">
                <p className={`font-serif text-7xl font-light ${scoreColor} leading-none`}>
                  {score}%
                </p>
                {score >= 90 && (
                  <div className="inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 border border-emerald-200 mb-2">
                    <Sparkles className="w-3 h-3 text-emerald-600" />
                    <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-700">
                      Excellent
                    </span>
                  </div>
                )}
              </div>
              <div className="w-full h-3 bg-charcoal/10 overflow-hidden mb-6">
                <div
                  className={`h-full transition-all ${scoreBgColor}`}
                  style={{ width: `${score}%` }}
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-4 pt-6 border-t border-charcoal/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal/60">Missing Components</span>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <span className="font-serif text-lg text-ink-black">
                      {brandHealth.gap_analysis.missing_components.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal/60">Incomplete Areas</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-aged-brass" />
                    <span className="font-serif text-lg text-ink-black">
                      {brandHealth.gap_analysis.incomplete_areas.length}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal/60">Strengths</span>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-forest-ink" />
                    <span className="font-serif text-lg text-ink-black">
                      {brandHealth.gap_analysis.strengths?.length || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-parchment-white border border-charcoal/10 p-8">
              <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/80 mb-6">
                Category Breakdown
              </p>
              <CategoryProgress gapAnalysis={brandHealth.gap_analysis} />
            </div>

            {/* Score History */}
            <ScoreHistoryChart organizationId={brandHealth.organization_id} />
          </div>

          {/* Right Column - Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            {/* High Priority */}
            {highPriorityRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <h2 className="font-serif text-3xl text-ink-black">Priority Actions</h2>
                    <p className="text-sm text-charcoal/60">Critical gaps affecting content quality</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {highPriorityRecs.map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} priority="high" />
                  ))}
                </div>
              </div>
            )}

            {/* Medium Priority */}
            {mediumPriorityRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-aged-brass" />
                  <div>
                    <h2 className="font-serif text-3xl text-ink-black">
                      {score >= 90 ? "Optimization Opportunities" : "Areas to Improve"}
                    </h2>
                    <p className="text-sm text-charcoal/60">
                      {score >= 90 
                        ? "Optional polish items to consider—your core documentation looks excellent." 
                        : "Enhance your brand consistency"}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  {mediumPriorityRecs.map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} priority="medium" />
                  ))}
                </div>
              </div>
            )}

            {/* Low Priority */}
            {lowPriorityRecs.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 text-forest-ink" />
                  <div>
                    <h2 className="font-serif text-3xl text-ink-black">Quick Wins</h2>
                    <p className="text-sm text-charcoal/60">Easy improvements for polish</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {lowPriorityRecs.map((rec, idx) => (
                    <RecommendationCard key={idx} recommendation={rec} priority="low" />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Brand Knowledge */}
            <CompletedKnowledgePanel organizationId={brandHealth.organization_id} />

            {/* Strengths */}
            {brandHealth.gap_analysis.strengths && brandHealth.gap_analysis.strengths.length > 0 && (
              <div className="bg-forest-ink/5 border border-forest-ink/20 p-8">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-forest-ink" />
                  <h3 className="font-serif text-2xl text-ink-black">Your Strengths</h3>
                </div>
                <ul className="space-y-2">
                  {brandHealth.gap_analysis.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="text-charcoal/80 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-forest-ink flex-shrink-0 mt-0.5" />
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
