import { Shield, AlertCircle, CheckCircle2, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { useNavigate } from "react-router-dom";

export function BrandHealthCard() {
  const { brandHealth, isLoading, analyzeBrandHealth, isAnalyzing } = useBrandHealth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-8">
        <div className="animate-pulse">
          <div className="h-6 bg-charcoal/10 w-48 mb-4"></div>
          <div className="h-20 bg-charcoal/10 w-full"></div>
        </div>
      </div>
    );
  }

  if (!brandHealth) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-8">
        <div className="flex items-start gap-4">
          <Shield className="w-8 h-8 text-charcoal/30 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-serif text-2xl text-ink-black mb-2">Brand Health</h3>
            <p className="text-sm text-charcoal/60 mb-4">
              Analyze your brand documentation to identify gaps and improve content consistency.
            </p>
            <Button
              onClick={() => analyzeBrandHealth()}
              disabled={isAnalyzing}
              className="bg-aged-brass hover:bg-aged-brass/90 text-parchment-white"
            >
              {isAnalyzing ? "Analyzing..." : "Run Brand Health Check"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const score = brandHealth.completeness_score;
  const scoreColor = score >= 90 ? "text-emerald-600" : score >= 70 ? "text-aged-brass" : "text-red-600";
  const highPriorityRecs = brandHealth.recommendations.filter(r => r.priority === 'high');

  return (
    <div className="bg-parchment-white border border-charcoal/10 p-8 hover:border-aged-brass/40 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-8 h-8 text-charcoal/30" />
          <div>
            <h3 className="font-serif text-2xl text-ink-black">Brand Health</h3>
            <p className="text-xs text-charcoal/50">
              Last analyzed {new Date(brandHealth.last_analyzed_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <Button
          onClick={() => analyzeBrandHealth()}
          disabled={isAnalyzing}
          variant="outline"
          size="sm"
          className="text-xs"
        >
          {isAnalyzing ? "Analyzing..." : "Refresh"}
        </Button>
      </div>

      {/* Score */}
      <div className="mb-6">
        <div className="flex items-end gap-3 mb-2">
          <p className={`font-serif text-6xl font-light ${scoreColor} leading-none`}>
            {score}%
          </p>
          {score >= 90 && (
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 border border-emerald-200 mb-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-700">Excellent</span>
            </div>
          )}
        </div>
        <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/80">
          Brand Completeness
        </p>
        <div className="w-full h-2 bg-charcoal/10 mt-2 overflow-hidden">
          <div
            className={`h-full transition-all ${score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-aged-brass' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      {/* Priority Recommendations */}
      {highPriorityRecs.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/80">
              Priority Actions ({highPriorityRecs.length})
            </p>
          </div>
          <div className="space-y-2">
            {highPriorityRecs.slice(0, 2).map((rec, idx) => (
              <div key={idx} className="bg-warm-cream/30 border border-charcoal/10 p-3">
                <p className="text-sm font-medium text-ink-black mb-1">{rec.title}</p>
                <p className="text-xs text-charcoal/60">{rec.description}</p>
                {rec.affected_items_count > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    Affects {rec.affected_items_count} {rec.affected_items_count === 1 ? 'item' : 'items'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-1">
            Missing
          </p>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-lg font-serif text-ink-black">
              {brandHealth.gap_analysis.missing_components.length}
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-1">
            Incomplete
          </p>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-aged-brass" />
            <span className="text-lg font-serif text-ink-black">
              {brandHealth.gap_analysis.incomplete_areas.length}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => navigate("/brand-health")}
        className="w-full bg-ink-black hover:bg-ink-black/90 text-parchment-white"
      >
        View Full Analysis & Fix Issues
      </Button>
    </div>
  );
}