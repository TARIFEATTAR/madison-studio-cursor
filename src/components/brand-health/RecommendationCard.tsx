import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GapWizardModal } from "./GapWizardModal";

interface Recommendation {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  affected_items_count?: number;
  fix_type?: string;
  template_suggestion?: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  priority: "high" | "medium" | "low";
}

export function RecommendationCard({ recommendation, priority }: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWizard, setShowWizard] = useState(false);

  const priorityConfig = {
    high: {
      icon: AlertTriangle,
      color: "border-red-600/20 bg-red-50/30",
      iconColor: "text-red-600",
      labelColor: "text-red-600",
    },
    medium: {
      icon: Lightbulb,
      color: "border-aged-brass/20 bg-aged-brass/5",
      iconColor: "text-aged-brass",
      labelColor: "text-aged-brass",
    },
    low: {
      icon: Info,
      color: "border-forest-ink/20 bg-forest-ink/5",
      iconColor: "text-forest-ink",
      labelColor: "text-forest-ink",
    },
  };

  const config = priorityConfig[priority];
  const Icon = config.icon;

  return (
    <>
      <div className={`bg-parchment-white border ${config.color} transition-all hover:shadow-level-2`}>
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-start gap-3 flex-1">
              <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
              <div className="flex-1">
                <h3 className="font-serif text-xl text-ink-black mb-1">{recommendation.title}</h3>
                <p className="text-sm text-charcoal/70">{recommendation.description}</p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 hover:bg-charcoal/5 transition-colors flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-charcoal/60" />
              ) : (
                <ChevronDown className="w-4 h-4 text-charcoal/60" />
              )}
            </button>
          </div>

          {recommendation.affected_items_count !== undefined && recommendation.affected_items_count > 0 && (
            <div className={`inline-flex items-center gap-1 px-2 py-1 ${config.color} mb-4`}>
              <span className={`text-xs ${config.labelColor} font-medium`}>
                Affects {recommendation.affected_items_count} {recommendation.affected_items_count === 1 ? 'item' : 'items'}
              </span>
            </div>
          )}

          {isExpanded && (
            <div className="mt-6 pt-6 border-t border-charcoal/10 space-y-4">
              {recommendation.template_suggestion && (
                <div className="bg-vellum-cream/50 p-4 border border-charcoal/10">
                  <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/60 mb-2">
                    Suggested Action
                  </p>
                  <p className="text-sm text-charcoal/80">{recommendation.template_suggestion}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowWizard(true)}
                  className="bg-aged-brass hover:bg-aged-brass/90 text-ink-black"
                >
                  Fix This Issue
                </Button>
                <Button
                  variant="outline"
                  className="border-charcoal/20"
                >
                  Learn More
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <GapWizardModal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        recommendation={recommendation}
      />
    </>
  );
}
