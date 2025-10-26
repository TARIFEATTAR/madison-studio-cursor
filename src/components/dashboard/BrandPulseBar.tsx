import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Calendar, Library, Flame, Shield, Sparkles } from "lucide-react";
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
        <Skeleton className="col-span-3 h-[140px] rounded-xl" />
        <Skeleton className="col-span-5 h-[140px] rounded-xl" />
        <Skeleton className="col-span-4 h-[140px] rounded-xl" />
      </>
    );
  }

  return (
    <>
      {/* Brand Health Card */}
      <Card 
        className="col-span-3 p-6 bg-white border border-[#E0E0E0] cursor-pointer hover:shadow-lg transition-all hover:-translate-y-0.5 rounded-xl"
        onClick={() => navigate("/brand-health")}
      >
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Brand Health</h3>
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 transform -rotate-90">
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#F0F0F0"
                  strokeWidth="6"
                  fill="none"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="36"
                  stroke="#B8956A"
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={`${(brandScore / 100) * 226.2} 226.2`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-semibold text-[#1C150D]">{brandScore}</span>
              </div>
            </div>
            <div>
              <p className={`text-lg font-semibold mb-1 ${getBrandHealthColor(brandScore)}`}>
                {brandScore >= 90 ? "Excellent" : brandScore >= 70 ? "Good" : "Needs Attention"}
              </p>
              <div className="flex gap-3 text-xs text-[#1C150D]/60">
                <span>Voice +4%</span>
                <span>·</span>
                <span>Cadence Stable</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Your Next Move Card */}
      <Card className="col-span-5 p-6 bg-white border border-[#E0E0E0] rounded-xl">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-sm font-medium text-[#1C150D]/60 mb-3">Your Next Move</h3>
            <p className="text-base text-[#1C150D] leading-relaxed">
              {nextMoveMessages[nextMoveIndex]}
            </p>
          </div>
          <Button
            size="default"
            className="bg-[#B8956A] hover:bg-[#A3865A] text-white mt-4 w-fit"
            onClick={() => navigate("/create")}
          >
            Take Action
          </Button>
        </div>
      </Card>

      {/* Quick Actions + Streak */}
      <Card className="col-span-4 p-6 bg-white border border-[#E0E0E0] rounded-xl">
        <div className="flex flex-col h-full">
          <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <button
              onClick={() => navigate("/create")}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <PenLine className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-[#1C150D] text-center">Create</span>
            </button>

            <button
              onClick={() => navigate("/calendar")}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-[#1C150D] text-center">Schedule</span>
            </button>

            <button
              onClick={() => navigate("/library")}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/50 hover:from-emerald-100 hover:to-emerald-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-md group"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <Library className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-medium text-[#1C150D] text-center">Library</span>
            </button>
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#E67E73]" />
                <span className="font-medium text-[#1C150D]">{currentStreak} Day Streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#A3C98D]" />
                <span className="font-medium text-[#1C150D]">{onBrandScore}%</span>
              </div>
            </div>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <div
                  key={day}
                  className={`flex-1 h-1.5 rounded-full ${
                    day < currentStreak ? "bg-[#B8956A]" : "bg-[#E0E0E0]"
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
