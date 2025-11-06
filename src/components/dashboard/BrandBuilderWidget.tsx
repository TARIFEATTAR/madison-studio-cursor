import { Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { useBrandHealth } from "@/hooks/useBrandHealth";

export function BrandBuilderWidget() {
  const navigate = useNavigate();
  const { brandHealth, isLoading } = useBrandHealth();

  if (isLoading) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-6 animate-pulse">
        <div className="h-4 bg-charcoal/10 w-32 mb-3"></div>
        <div className="h-10 bg-charcoal/10 w-full"></div>
      </div>
    );
  }

  const score = brandHealth?.completeness_score || 40;

  // Only show if score is below 85%
  if (score >= 85) return null;

  const essentials = [
    { key: "target_audience", label: "Target Audience" },
    { key: "brand_voice", label: "Brand Voice" },
    { key: "mission", label: "Mission" },
    { key: "usp", label: "USP" },
    { key: "key_messages", label: "Key Messages" },
  ];

  // Estimate how many are complete based on score
  // 40% base + 9% per field = 85% max
  const estimatedComplete = Math.floor((score - 40) / 9);

  return (
    <div className="bg-gradient-to-br from-brass/10 to-antique-gold/10 border-2 border-brass/30 p-6 hover:border-brass/50 transition-all">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-brass flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-parchment-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-xl text-ink-black mb-1">
            Complete Your Brand in 10 Minutes
          </h3>
          <p className="text-sm text-charcoal/70">
            Madison needs 5 key pieces to create quality content. You're {estimatedComplete} of 5
            complete!
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-charcoal/60">
            Brand Health Score
          </span>
          <span className="text-lg font-serif text-brass">{score}%</span>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      <div className="grid grid-cols-5 gap-2 mb-4">
        {essentials.map((item, index) => (
          <div
            key={item.key}
            className={`h-2 rounded-full transition-all ${
              index < estimatedComplete ? "bg-brass" : "bg-charcoal/10"
            }`}
            title={item.label}
          />
        ))}
      </div>

      <Button
        onClick={() => navigate("/brand-builder")}
        variant="brass"
        className="w-full"
      >
        Complete Essential 5
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}
