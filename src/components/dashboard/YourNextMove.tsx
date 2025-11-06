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
    <Card className="p-6 bg-gradient-to-br from-parchment-white to-warm-gray/5 border-2 border-brass shadow-md hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-brass/5 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-full bg-brass/10">
            <MapPin className="w-6 h-6 text-brass flex-shrink-0" />
          </div>
          <div className="flex-1">
            <h2 className="font-serif text-2xl font-light text-ink-black mb-1">
              YOUR NEXT MOVE
            </h2>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Personalized for you</span>
            </div>
          </div>
        </div>

        <p className="text-base md:text-lg text-charcoal leading-relaxed mb-6 min-h-[3rem]">
          {insight.message}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6 p-3 rounded-lg bg-white/50 border border-brass/10">
          <div className="text-center">
            <div className="text-lg font-semibold text-ink-black">24</div>
            <div className="text-xs text-muted-foreground">This Week</div>
          </div>
          <div className="text-center border-x border-border/50">
            <div className="text-lg font-semibold text-ink-black">156</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">+12%</div>
            <div className="text-xs text-muted-foreground">vs Last</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={insight.primaryAction.handler}
            variant="brass"
            className="text-base h-12 shadow-sm"
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
      </div>
    </Card>
  );
}
