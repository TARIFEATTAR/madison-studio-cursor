import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { Skeleton } from "@/components/ui/skeleton";

export function BrandPulseBar() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: streakData, isLoading: streakLoading } = useStreakCalculation();
  const { brandHealth, isLoading: healthLoading } = useBrandHealth();
  const [nextMoveIndex, setNextMoveIndex] = useState(0);

  const nextMoveMessages = [
    "Refine 2 drafts in review & schedule 1 post for tomorrow.",
    "Your brand voice is strong today. Time to amplify.",
    "Schedule content for the week ahead to stay consistent.",
    "Review your pending drafts and polish before publishing.",
  ];

  // Rotate next move messages every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNextMoveIndex((prev) => (prev + 1) % nextMoveMessages.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const brandScore = brandHealth?.completeness_score || 94;
  const onBrandScore = stats?.onBrandScore || 100;
  const currentStreak = streakData?.currentStreak || 0;

  const getBrandHealthColor = (score: number) => {
    if (score >= 90) return "text-[#A3C98D]";
    if (score >= 70) return "text-[#F5C16C]";
    return "text-[#E67E73]";
  };

  if (statsLoading || streakLoading || healthLoading) {
    return (
      <>
        <Skeleton className="col-span-1 md:col-span-3 h-[140px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-5 h-[140px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-4 h-[140px] rounded-xl" />
      </>
    );
  }

  return (
    <>
      {/* Brand Health Card */}
      <button 
        className="col-span-1 md:col-span-3 p-4 md:p-6 bg-white border border-[#E0E0E0] cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 rounded-xl min-h-[180px] md:min-h-[200px] text-left w-full touch-manipulation"
        onClick={() => navigate("/brand-health")}
      >
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Brand Health</h3>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="relative w-16 h-16 md:w-20 md:h-20">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="#F0F0F0"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="50%"
                  cy="50%"
                  r="45%"
                  stroke="var(--aged-brass-hex)"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(brandScore / 100) * 226.2} 226.2`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl md:text-2xl font-semibold text-[#1C150D]">{brandScore}</span>
              </div>
            </div>
            <div>
              <p className={`text-base md:text-lg font-semibold mb-1 ${getBrandHealthColor(brandScore)}`}>
                {brandScore >= 90 ? "Excellent" : brandScore >= 70 ? "Good" : "Needs Attention"}
              </p>
              <div className="hidden md:flex gap-3 text-xs text-[#1C150D]/60">
                <span>Voice +4%</span>
                <span>·</span>
                <span>Cadence Stable</span>
              </div>
            </div>
          </div>
        </div>
      </button>

      {/* Your Next Move Card */}
      <Card className="col-span-1 md:col-span-5 p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl min-h-[180px] md:min-h-[200px]">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#1C150D]/60 mb-3">Your Next Move</h3>
            <p className="text-sm md:text-base text-[#1C150D] leading-relaxed">
              {nextMoveMessages[nextMoveIndex]}
            </p>
          </div>
          <Button
            size="default"
            className="bg-brand-brass hover:bg-[#A3865A] text-white mt-4 w-full md:w-fit min-h-[44px] touch-manipulation"
            onClick={() => navigate("/create")}
          >
            Take Action
          </Button>
        </div>
      </Card>

      {/* Streak Tracker - Mobile Optimized */}
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
    </>
  );
}
