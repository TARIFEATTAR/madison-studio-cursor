import { Target, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function ContentQuality() {
  const navigate = useNavigate();
  const { data: stats } = useDashboardStats();
  
  const onBrandScore = stats?.onBrandScore || 0;

  // Generate AI insight based on score
  const getQualityInsight = () => {
    if (onBrandScore >= 90) {
      return {
        message: "Your content consistently matches your brand voice. Excellent work!",
        action: "View Top Performing Content",
        route: "/library?sort=quality",
      };
    } else if (onBrandScore >= 80) {
      return {
        message: "Your content quality is strong. Keep refining your brand voice.",
        action: "Review Brand Guidelines",
        route: "/settings?tab=brand",
      };
    } else if (onBrandScore >= 70) {
      return {
        message: "Some content could better reflect your brand voice. Let's improve it.",
        action: "Fix Brand Gaps",
        route: "/brand-health",
      };
    } else {
      return {
        message: "Your brand guidelines need attention to improve content quality.",
        action: "Complete Brand Setup",
        route: "/settings?tab=brand",
      };
    }
  };

  const insight = getQualityInsight();

  return (
    <Card className="p-6 bg-parchment-white border border-charcoal/10 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-brass" />
        <h3 className="font-serif text-xl font-light text-ink-black">
          Content Quality
        </h3>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-5xl font-serif font-light text-brass">
            {onBrandScore}%
          </span>
        </div>
        <p className="text-sm text-charcoal/80 font-medium uppercase tracking-wide mb-1">
          ON-BRAND SCORE
        </p>
        <p className="text-xs text-charcoal/60 italic">
          Average across all content
        </p>
      </div>

      <div className="bg-brass/5 border-l-2 border-brass p-4 rounded-r mb-6">
        <div className="flex gap-2 items-start">
          <Lightbulb className="w-4 h-4 text-brass flex-shrink-0 mt-0.5" />
          <p className="text-sm text-charcoal leading-relaxed">
            {insight.message}
          </p>
        </div>
      </div>

      <Button
        onClick={() => navigate(insight.route)}
        className="w-full bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-ink-black font-semibold"
      >
        {insight.action}
      </Button>
    </Card>
  );
}
