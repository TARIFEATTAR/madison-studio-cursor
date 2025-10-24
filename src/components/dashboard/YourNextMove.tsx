import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSmartDashboardInsights } from "@/hooks/useSmartDashboardInsights";
import { Skeleton } from "@/components/ui/skeleton";

export function YourNextMove() {
  const insight = useSmartDashboardInsights();

  if (!insight) {
    return (
      <Card className="p-6 bg-parchment-white border border-charcoal/10">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-20 w-full mb-6" />
        <div className="flex gap-3">
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-32" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-parchment-white border-2 border-brass shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-8 h-8 text-brass flex-shrink-0 mt-1" />
        <div>
          <h2 className="font-serif text-2xl font-light text-ink-black mb-1">
            YOUR NEXT MOVE
          </h2>
        </div>
      </div>

      <p className="text-base md:text-lg text-charcoal leading-relaxed mb-6 min-h-[3rem]">
        {insight.message}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={insight.primaryAction.handler}
          className="bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-ink-black font-semibold text-base h-12"
        >
          {insight.primaryAction.label}
        </Button>
        <Button
          variant="ghost"
          onClick={insight.secondaryAction.handler}
          className="text-charcoal hover:text-ink-black hover:bg-warm-gray/10 text-base h-12"
        >
          {insight.secondaryAction.label}
        </Button>
      </div>
    </Card>
  );
}
