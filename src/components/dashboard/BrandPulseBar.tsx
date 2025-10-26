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
          
          <div className="flex flex-col gap-2 mb-4">
            <Button
              size="sm"
              variant="outline"
              className="justify-start border-[#E0E0E0] text-[#1C150D] hover:bg-[#FAFAFA]"
              onClick={() => navigate("/create")}
            >
              <PenLine className="w-4 h-4 mr-2" />
              Create Content
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start border-[#E0E0E0] text-[#1C150D] hover:bg-[#FAFAFA]"
              onClick={() => navigate("/calendar")}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Post
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="justify-start border-[#E0E0E0] text-[#1C150D] hover:bg-[#FAFAFA]"
              onClick={() => navigate("/library")}
            >
              <Library className="w-4 h-4 mr-2" />
              View Library
            </Button>
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
