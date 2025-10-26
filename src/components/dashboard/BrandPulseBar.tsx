import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PenLine, Calendar, Library, Flame, Shield } from "lucide-react";
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
      <div className="h-full flex gap-4">
        <Skeleton className="flex-1 h-full rounded-lg" />
        <Skeleton className="flex-1 h-full rounded-lg" />
        <Skeleton className="w-[280px] h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4">
      {/* Brand Health Card */}
      <Card 
        className="flex-1 p-4 bg-white border border-[#E7E1D4] cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => navigate("/brand-health")}
      >
        <div className="flex items-center gap-4 h-full">
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#E7E1D4"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="#B8956A"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(brandScore / 100) * 251.2} 251.2`}
                className="transition-all duration-500"
                style={{ filter: "drop-shadow(0 0 8px rgba(184, 149, 106, 0.4))" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-serif font-semibold text-[#1C150D]">{brandScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[#1C150D] mb-1">Brand Health</h3>
            <p className={`text-xs ${getBrandHealthColor(brandScore)} mb-2`}>
              {brandScore >= 90 ? "Excellent" : brandScore >= 70 ? "Good" : "Needs Attention"}
            </p>
            <div className="flex gap-3 text-xs text-[#1C150D]/60">
              <span>Voice +4%</span>
              <span>·</span>
              <span>Cadence Stable</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Your Next Move Card */}
      <Card className="flex-1 p-4 bg-white border border-[#E7E1D4]">
        <div className="flex flex-col h-full justify-between">
          <div>
            <h3 className="text-sm font-semibold text-[#1C150D] mb-2">Your Next Move</h3>
            <p className="text-sm text-[#1C150D]/80 leading-relaxed">
              {nextMoveMessages[nextMoveIndex]}
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#B8956A] hover:bg-[#A3865A] text-white mt-3"
            onClick={() => navigate("/create")}
          >
            Take Action
          </Button>
        </div>
      </Card>

      {/* Quick Actions + Streak */}
      <Card className="w-[280px] p-4 bg-white border border-[#E7E1D4]">
        <div className="flex flex-col h-full justify-between">
          <div className="flex gap-2 mb-3">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-[#B8956A] text-[#B8956A] hover:bg-[#B8956A]/10"
              onClick={() => navigate("/create")}
            >
              <PenLine className="w-4 h-4 mr-1" />
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-[#B8956A] text-[#B8956A] hover:bg-[#B8956A]/10"
              onClick={() => navigate("/calendar")}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Schedule
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-[#B8956A] text-[#B8956A] hover:bg-[#B8956A]/10"
              onClick={() => navigate("/library")}
            >
              <Library className="w-4 h-4 mr-1" />
              Library
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-[#E67E73]" />
                <span className="text-xs font-medium text-[#1C150D]">{currentStreak} Day Streak</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#A3C98D]" />
                <span className="text-xs font-medium text-[#1C150D]">{onBrandScore}%</span>
              </div>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                <div
                  key={day}
                  className={`w-6 h-6 rounded-full border-2 ${
                    day < currentStreak
                      ? "bg-[#B8956A] border-[#B8956A]"
                      : "bg-transparent border-[#E7E1D4]"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[#1C150D]/60 text-center">Day 3 – Consistency Bonus</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
