import { useNavigate } from "react-router-dom";
import { Flame, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

function getEndOfWeekDay(): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const daysUntilSunday = 7 - now.getDay();
  const endOfWeek = new Date(now);
  endOfWeek.setDate(now.getDate() + (daysUntilSunday === 7 ? 0 : daysUntilSunday));
  return days[endOfWeek.getDay()];
}

export function SmartMomentumTracker() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  const weeklyGoal = stats?.weeklyGoal ?? 5;
  const createdThisWeek = stats?.piecesCreatedThisWeek ?? 0;
  const weekEndsIn = stats?.weekEndsIn ?? 0;
  
  const progress = Math.min((createdThisWeek / weeklyGoal) * 100, 100);
  const deficit = Math.max(0, weeklyGoal - createdThisWeek);
  const isGoalMet = deficit === 0;

  // Determine urgency level for visual feedback
  const getUrgencyClass = () => {
    if (isGoalMet) return "text-[#A3C98D]"; // Green - goal met
    if (weekEndsIn <= 2 && deficit > 2) return "text-[#E67E73]"; // Red - urgent
    if (weekEndsIn <= 3 && deficit > 0) return "text-[#F5C16C]"; // Yellow - warning
    return "text-[#1C150D]/60"; // Default
  };

  if (isLoading) {
    return (
      <div className="col-span-1 md:col-span-6">
        <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 h-full">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-8 h-8 rounded-full skeleton-shimmer" />
            <Skeleton className="h-4 w-28 skeleton-shimmer" />
          </div>
          <Skeleton className="h-4 w-full mb-2 skeleton-shimmer" />
          <Skeleton className="h-2 w-full mb-4 rounded-full skeleton-shimmer" />
          <Skeleton className="h-4 w-48 mb-4 skeleton-shimmer" />
          <Skeleton className="h-10 w-full rounded-md skeleton-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-1 md:col-span-6">
      <div className="bg-white border border-[#E0E0E0] rounded-xl p-6 h-full hover-lift transition-all duration-200">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#B8956A]/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-[#B8956A]" />
          </div>
          <h3 className="text-sm font-medium text-[#1C150D]/60">Your Momentum</h3>
        </div>

        {/* Goal Progress */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-[#1C150D]">
              Weekly Goal: {weeklyGoal} pieces
            </p>
            <p className="text-sm text-[#1C150D]/60">
              {createdThisWeek} of {weeklyGoal}
            </p>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isGoalMet ? 'bg-[#A3C98D]' : 'bg-[#B8956A]'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Encouragement Text */}
        <div className="mb-4">
          {isGoalMet ? (
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A3C98D]" />
              <p className="text-sm text-[#A3C98D] font-medium">
                Goal achieved! You're on a roll.
              </p>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <TrendingUp className={`w-4 h-4 mt-0.5 ${getUrgencyClass()}`} />
              <p className={`text-sm ${getUrgencyClass()}`}>
                {weekEndsIn === 0 ? (
                  `Create ${deficit} more today to hit your goal`
                ) : weekEndsIn === 1 ? (
                  `Create ${deficit} more by tomorrow to hit your goal`
                ) : (
                  `Create ${deficit} more by ${getEndOfWeekDay()} to hit your goal`
                )}
              </p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate("/create")}
          className={`w-full ${
            isGoalMet 
              ? 'bg-[#A3C98D] hover:bg-[#8FB87A] text-white' 
              : 'bg-[#B8956A] hover:bg-[#A3865A] text-white'
          }`}
        >
          {isGoalMet ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Keep Creating
            </>
          ) : (
            <>
              <Flame className="w-4 h-4 mr-2" />
              Create Now
            </>
          )}
        </Button>

        {/* Weekly Stats Mini */}
        {stats && (
          <div className="mt-4 pt-4 border-t border-[#E0E0E0] flex justify-between text-xs text-[#1C150D]/50">
            <span>{stats.piecesScheduled} scheduled</span>
            <span>{stats.piecesPublished} published</span>
            <span>{stats.streakDays} day streak</span>
          </div>
        )}
      </div>
    </div>
  );
}

