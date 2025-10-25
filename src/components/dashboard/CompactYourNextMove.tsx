import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSmartDashboardInsights } from "@/hooks/useSmartDashboardInsights";
import { Skeleton } from "@/components/ui/skeleton";

export function CompactYourNextMove() {
  const insight = useSmartDashboardInsights();

  if (!insight) {
    return (
      <Card className="p-4 bg-parchment-white border border-charcoal/5 h-[280px]">
        <div className="flex items-center gap-4 h-full">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-3/4" />
          </div>
          <Skeleton className="h-10 w-32 flex-shrink-0" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 bg-parchment-white border border-charcoal/5 hover:shadow-md transition-all duration-150 hover:-translate-y-0.5 h-[280px]">
      <div className="flex items-center gap-4 h-full">
        {/* Icon */}
        <div className="flex-shrink-0">
          <MapPin className="w-10 h-10 text-brass" />
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className="text-base md:text-lg text-charcoal leading-relaxed line-clamp-2">
            {insight.message}
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex-shrink-0">
          <Button
            onClick={insight.primaryAction.handler}
            className="bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-ink-black font-semibold whitespace-nowrap h-10 px-6"
          >
            {insight.primaryAction.label}
          </Button>
        </div>
      </div>
    </Card>
  );
}
