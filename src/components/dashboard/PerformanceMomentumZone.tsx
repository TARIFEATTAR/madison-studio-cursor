import { TrendingUp, Award, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceMomentumZone() {
  const { data: stats, isLoading } = useDashboardStats();
  const { brandHealth, isLoading: brandHealthLoading } = useBrandHealth();

  const weeklyData = [
    { label: "Created", value: stats?.piecesCreatedThisWeek || 0, max: 10, change: "+15%" },
    { label: "Published", value: stats?.piecesPublished || 0, max: 8, change: "+8%" },
    { label: "Scheduled", value: stats?.piecesScheduled || 0, max: 12, change: "+22%" },
  ];

  // Pull from brand health API
  const onBrandScore = stats?.onBrandScore || 100;
  const brandScore = brandHealth?.completeness_score || 94;
  
  // Calculate quality metrics from brand health data
  const qualityMetrics = [
    { label: "Tone", value: onBrandScore },
    { label: "Visual", value: Math.round(brandScore * 0.95) },
    { label: "Consistency", value: Math.round(brandScore * 1.02) },
    { label: "Message", value: Math.round(onBrandScore * 0.94) },
  ];

  const integrations = [
    { name: "Shopify", status: "connected", color: "#95BF47" },
    { name: "Klaviyo", status: "syncing", color: "#F5C16C" },
    { name: "Meta", status: "connected", color: "#1877F2" },
    { name: "Google Drive", status: "action", color: "#E67E73" },
  ];

  if (isLoading || brandHealthLoading) {
    return (
      <>
        <Skeleton className="col-span-1 md:col-span-4 h-[180px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-4 h-[180px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-4 h-[180px] rounded-xl" />
      </>
    );
  }

  return (
    <>
      {/* Weekly Stats */}
      <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl min-h-[180px]">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Weekly Stats</h3>
        <div className="space-y-4">
          {weeklyData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#1C150D]">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#1C150D]">{item.value}</span>
                  <span className="text-xs text-[#A3C98D] font-medium">{item.change}</span>
                </div>
              </div>
              <Progress value={(item.value / item.max) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Content Quality */}
      <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl min-h-[180px]">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Content Quality</h3>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl md:text-4xl font-semibold text-[#1C150D]">{onBrandScore}</span>
          <span className="text-sm text-[#1C150D]/40">Average Score</span>
        </div>
        <div className="space-y-3">
          {qualityMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <span className="text-sm text-[#1C150D]">{metric.label}</span>
              <div className="flex-1 mx-3">
                <Progress value={metric.value} className="h-2" />
              </div>
              <span className="text-sm font-medium text-[#1C150D]">{metric.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Momentum / Achievements */}
      <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl min-h-[180px]">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4">Momentum</h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[#1C150D]">Level 8 → 9</span>
              <span className="text-sm font-medium text-[#1C150D]">1,240 / 1,500 XP</span>
            </div>
            <Progress value={(1240 / 1500) * 100} className="h-2" />
          </div>
          <div className="flex gap-3 mt-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#B8956A]/10 flex items-center justify-center">
              <Zap className="w-5 h-5 md:w-6 md:h-6 text-[#B8956A]" />
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#A3C98D]/10 flex items-center justify-center">
              <Award className="w-5 h-5 md:w-6 md:h-6 text-[#A3C98D]" />
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#F5C16C]/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-[#F5C16C]" />
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
