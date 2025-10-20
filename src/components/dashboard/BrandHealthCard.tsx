import { Shield, AlertCircle, CheckCircle2, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { useNavigate } from "react-router-dom";
import { useBrandColor } from "@/hooks/useBrandColor";
import { GapWizardModal } from "@/components/brand-health/GapWizardModal";
import { useState } from "react";

export function BrandHealthCard() {
  const { brandHealth, isLoading, analyzeBrandHealth, isAnalyzing } = useBrandHealth();
  const navigate = useNavigate();
  const { brandColor } = useBrandColor();
  const [selectedRecommendation, setSelectedRecommendation] = useState<any>(null);

  if (isLoading) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-5">
        <div className="animate-pulse">
          <div className="h-5 bg-charcoal/10 w-40 mb-3"></div>
          <div className="h-16 bg-charcoal/10 w-full"></div>
        </div>
      </div>
    );
  }

  if (!brandHealth) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-6 h-6 text-charcoal/30 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-serif text-xl text-ink-black mb-2">Brand Health</h3>
            <p className="text-xs text-charcoal/70 mb-3 leading-relaxed">
              Brand Health Score measures your documentation completeness to ensure consistent, 
              high-quality content across all platforms.
            </p>
            
            <div className="bg-vellum-cream/50 border border-charcoal/10 p-3 mb-4">
              <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-2">
                Analysis Based On:
              </p>
              <div className="space-y-1.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-aged-brass flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-charcoal/80">Brand Knowledge (mission, voice, values)</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-aged-brass flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-charcoal/80">Products & Collections</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 text-aged-brass flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-charcoal/80">Content created & published</span>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-charcoal/60 mb-3 italic">
              Add brand knowledge and products in Settings for an accurate score.
            </p>
            
            <Button
              onClick={() => analyzeBrandHealth()}
              disabled={isAnalyzing}
              size="sm"
              className="bg-aged-brass hover:bg-aged-brass/90 text-parchment-white w-full"
            >
              {isAnalyzing ? "Analyzing..." : "Run Brand Health Check"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const score = brandHealth.completeness_score;
  const scoreColor = score >= 90 ? "text-emerald-600" : score >= 70 ? "" : "text-red-600";
  const scoreStyle = score >= 70 && score < 90 ? { color: brandColor } : {};
  const highPriorityRecs = brandHealth.recommendations.filter(r => r.priority === 'high');

  return (
    <div className="bg-parchment-white border border-charcoal/10 p-5 hover:border-aged-brass/40 transition-all h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-charcoal/30" />
          <div>
            <h3 className="font-serif text-xl text-ink-black">Brand Health</h3>
            <p className="text-[10px] text-charcoal/50">
              Last analyzed {new Date(brandHealth.last_analyzed_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          onClick={() => analyzeBrandHealth()}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
          className="text-[10px] h-7"
        >
          {isAnalyzing ? "Analyzing..." : "Refresh"}
        </Button>
      </div>

      {/* Score */}
      <div className="mb-4">
        <div className="flex items-end gap-2 mb-1">
          <p 
            className={`font-serif text-5xl font-light ${scoreColor} leading-none`}
            style={scoreStyle}
          >
            {score}%
          </p>
          {score >= 90 && (
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-200 mb-1">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
              <span className="text-[9px] font-sans uppercase tracking-wider text-emerald-700">Excellent</span>
            </div>
          )}
        </div>
        <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-charcoal/80">
          Brand Completeness
        </p>
        <div className="w-full h-1.5 bg-charcoal/10 mt-1.5 overflow-hidden">
          <div
            className={`h-full transition-all ${score >= 90 ? 'bg-emerald-500' : score < 70 ? 'bg-red-500' : ''}`}
            style={{ 
              width: `${score}%`,
              backgroundColor: score >= 70 && score < 90 ? brandColor : undefined
            }}
          />
        </div>
      </div>

      {/* Priority Recommendations */}
      {highPriorityRecs.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-charcoal/80">
              Priority Actions ({highPriorityRecs.length})
            </p>
          </div>
          <div className="space-y-1.5">
            {highPriorityRecs.slice(0, 2).map((rec, idx) => (
              <div key={idx} className="bg-warm-cream/30 border border-charcoal/10 p-2">
                <p className="text-xs font-medium text-ink-black mb-0.5">{rec.title}</p>
                <p className="text-[10px] text-charcoal/60 leading-snug mb-1.5">{rec.description}</p>
                <div className="flex items-center justify-between gap-2">
                  {rec.affected_items_count > 0 && (
                    <p className="text-[10px] text-red-600">
                      Affects {rec.affected_items_count} {rec.affected_items_count === 1 ? 'item' : 'items'}
                    </p>
                  )}
                  <Button
                    onClick={() => setSelectedRecommendation(rec)}
                    size="sm"
                    variant="ghost"
                    className="h-6 text-[10px] text-aged-brass hover:text-aged-brass hover:bg-aged-brass/10 ml-auto px-2"
                  >
                    Fix This
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-0.5">
            Missing
          </p>
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-base font-serif text-ink-black">
              {brandHealth.gap_analysis.missing_components.length}
            </span>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-0.5">
            Incomplete
          </p>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-aged-brass" />
            <span className="text-base font-serif text-ink-black">
              {brandHealth.gap_analysis.incomplete_areas.length}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => navigate("/brand-health")}
        size="sm"
        className="w-full bg-ink-black hover:bg-ink-black/90 text-parchment-white text-xs"
      >
        View Full Analysis & Fix Issues
      </Button>

      {/* Gap Wizard Modal */}
      {selectedRecommendation && (
        <GapWizardModal
          isOpen={!!selectedRecommendation}
          onClose={() => setSelectedRecommendation(null)}
          recommendation={selectedRecommendation}
        />
      )}
    </div>
  );
}