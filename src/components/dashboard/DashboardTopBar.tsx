import { Flame, Shield, PenLine, Calendar, Library } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardTopBar() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: streakData, isLoading: streakLoading } = useStreakCalculation();
  const { brandHealth } = useBrandHealth();

  const isLoading = statsLoading || streakLoading;

  if (isLoading) {
    return (
      <div className="sticky top-0 z-50 bg-parchment-white border-b border-charcoal/5 px-4 py-2 h-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }

  const onBrandScore = stats?.onBrandScore || 0;
  const streak = streakData?.currentStreak || 0;
  const brandScore = brandHealth?.completeness_score || 0;

  // Determine brand health color
  const getBrandHealthColor = () => {
    if (brandScore >= 90) return "text-emerald-600";
    if (brandScore >= 70) return "text-brass";
    return "text-red-600";
  };

  return (
    <div className="sticky top-0 z-50 bg-parchment-white border-b border-charcoal/5 px-4 py-2 h-12">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Streak + On-Brand Score */}
        <div className="flex items-center gap-6">
          {/* Streak Counter */}
          <div className="flex items-center gap-2">
            <Flame 
              className={`w-4 h-4 text-brass ${streak > 0 ? 'animate-pulse' : ''}`} 
            />
            <span className="text-sm font-semibold text-ink-black font-serif">
              {streak} day{streak !== 1 ? 's' : ''}
            </span>
          </div>

          {/* On-Brand Score */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-charcoal/60 uppercase tracking-wide">
              On-Brand
            </span>
            <span className="text-sm font-semibold text-ink-black font-serif">
              {onBrandScore}%
            </span>
            <Progress 
              value={onBrandScore} 
              className="w-10 h-1.5" 
            />
          </div>

          {/* Brand Health Shield */}
          <button
            onClick={() => navigate('/brand-health')}
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
            title={`Brand Health: ${brandScore}%`}
          >
            <Shield className={`w-4 h-4 ${getBrandHealthColor()}`} />
            <span className={`text-xs font-semibold ${getBrandHealthColor()}`}>
              {brandScore}%
            </span>
          </button>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/create')}
            className="h-8 w-8 p-0 hover:bg-warm-gray/10"
            title="Create Content"
          >
            <PenLine className="w-4 h-4 text-charcoal" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/schedule')}
            className="h-8 w-8 p-0 hover:bg-warm-gray/10"
            title="Schedule"
          >
            <Calendar className="w-4 h-4 text-charcoal" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/library')}
            className="h-8 w-8 p-0 hover:bg-warm-gray/10"
            title="Library"
          >
            <Library className="w-4 h-4 text-charcoal" />
          </Button>
        </div>
      </div>
    </div>
  );
}
