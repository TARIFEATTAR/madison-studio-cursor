import { Flame, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";
import { Skeleton } from "@/components/ui/skeleton";

export function YourProgressCard() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: streakData, isLoading: streakLoading } = useStreakCalculation();

  const onBrandScore = stats?.onBrandScore || 100;
  const currentStreak = streakData?.currentStreak || 0;

  if (statsLoading || streakLoading) {
    return (
      <Skeleton className="col-span-1 md:col-span-4 h-[140px] rounded-xl" />
    );
  }

  return (
    <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 min-h-[180px] md:min-h-[200px]">
      <div className="flex flex-col h-full">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Your Progress</h3>
        
        <div className="flex items-center justify-around mb-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Flame className="w-5 h-5 md:w-6 md:h-6 text-[#E67E73]" />
              <span className="text-2xl md:text-3xl font-semibold text-[#1C150D]">{currentStreak}</span>
            </div>
            <span className="text-xs font-medium text-[#1C150D]/60">Day Streak</span>
          </div>
          
          <div className="w-px h-12 bg-[#E0E0E0]" />
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-[#A3C98D]" />
              <span className="text-2xl md:text-3xl font-semibold text-[#1C150D]">{onBrandScore}%</span>
            </div>
            <span className="text-xs font-medium text-[#1C150D]/60">On Brand</span>
          </div>
        </div>

        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-xs text-[#1C150D]/60">
            <span>This Week</span>
            <span>{currentStreak}/7 days</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <div
                key={day}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  day < currentStreak ? "bg-brand-brass" : "bg-[#E0E0E0]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

