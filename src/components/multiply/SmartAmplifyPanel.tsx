import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, CheckCircle2, Lightbulb } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface AmplifyRecommendation {
  derivativeType: string;
  confidence: "high" | "medium" | "low";
  reason: string;
  priority: number;
}

interface SmartAmplifyPanelProps {
  recommendations: AmplifyRecommendation[];
  selectedTypes: string[];
  onSelectAll: () => void;
  onToggleType: (typeId: string) => void;
  isLoading?: boolean;
}

export function SmartAmplifyPanel({
  recommendations,
  selectedTypes,
  onSelectAll,
  onToggleType,
  isLoading = false,
}: SmartAmplifyPanelProps) {
  if (isLoading) {
    return (
      <Card className="p-6 mb-6 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <p className="text-sm text-muted-foreground">
            Analyzing your content for best derivative matches...
          </p>
        </div>
      </Card>
    );
  }

  if (!recommendations.length) {
    return null;
  }

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      high: { label: "Highly Recommended", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
      medium: { label: "Recommended", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
      low: { label: "Consider", className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400" },
    };
    const variant = variants[confidence as keyof typeof variants];
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const selectedRecommendations = recommendations.filter(r => 
    selectedTypes.includes(r.derivativeType)
  );
  const allRecommendationsSelected = recommendations.every(r => 
    selectedTypes.includes(r.derivativeType)
  );

  return (
    <Card className="p-6 mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Smart Amplify</h3>
            <p className="text-sm text-muted-foreground">
              AI-powered recommendations for your content
            </p>
          </div>
        </div>
        <Button
          onClick={onSelectAll}
          size="sm"
          variant={allRecommendationsSelected ? "outline" : "default"}
          className="flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          {allRecommendationsSelected ? "Deselect All" : "Select All Recommended"}
        </Button>
      </div>

      <div className="grid gap-3">
        {recommendations.map((rec) => {
          const isSelected = selectedTypes.includes(rec.derivativeType);
          return (
            <TooltipProvider key={rec.derivativeType}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onToggleType(rec.derivativeType)}
                    className={`
                      flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left
                      ${isSelected 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }
                    `}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {isSelected ? (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      ) : (
                        <Lightbulb className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground capitalize">
                          {rec.derivativeType.replace(/_/g, ' ')}
                        </span>
                        {getConfidenceBadge(rec.confidence)}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {rec.reason}
                      </p>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs">
                  <p className="text-sm">{rec.reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {selectedRecommendations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {selectedRecommendations.length}
            </span>{" "}
            of {recommendations.length} recommendations selected
          </p>
        </div>
      )}
    </Card>
  );
}
