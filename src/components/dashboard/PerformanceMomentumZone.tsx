import { TrendingUp, Award, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function PerformanceMomentumZone() {
  const { data: stats, isLoading } = useDashboardStats();

  const weeklyData = [
    { label: "Created", value: stats?.piecesCreatedThisWeek || 0, max: 10, change: "+15%" },
    { label: "Published", value: stats?.piecesPublished || 0, max: 8, change: "+8%" },
    { label: "Scheduled", value: stats?.piecesScheduled || 0, max: 12, change: "+22%" },
  ];

  const qualityMetrics = [
    { label: "Tone", value: 95 },
    { label: "Visual", value: 92 },
    { label: "Consistency", value: 98 },
    { label: "Message", value: 94 },
  ];

  const integrations = [
    { name: "Shopify", status: "connected", color: "#95BF47" },
    { name: "Klaviyo", status: "syncing", color: "#F5C16C" },
    { name: "Meta", status: "connected", color: "#1877F2" },
    { name: "Google Drive", status: "action", color: "#E67E73" },
  ];

  if (isLoading) {
    return (
      <div className="h-full grid grid-cols-4 gap-4">
        <Skeleton className="col-span-1 h-full rounded-lg" />
        <Skeleton className="col-span-1 h-full rounded-lg" />
        <Skeleton className="col-span-1 h-full rounded-lg" />
        <Skeleton className="col-span-1 h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="h-full grid grid-cols-4 gap-4">
      {/* Weekly Stats */}
      <Card className="p-4 bg-white border border-[#E7E1D4]">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#B8956A]" />
          <h3 className="text-sm font-semibold text-[#1C150D]">Weekly Stats</h3>
        </div>
        <div className="space-y-3">
          {weeklyData.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#1C150D]/60">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1C150D]">{item.value}</span>
                  <span className="text-xs text-[#A3C98D]">{item.change}</span>
                </div>
              </div>
              <Progress value={(item.value / item.max) * 100} className="h-1.5" />
            </div>
          ))}
        </div>
      </Card>

      {/* Content Quality */}
      <Card className="p-4 bg-white border border-[#E7E1D4]">
        <h3 className="text-sm font-semibold text-[#1C150D] mb-3">Content Quality</h3>
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-serif font-semibold text-[#1C150D]">95</span>
          <span className="text-xs text-[#1C150D]/60">Average Score</span>
        </div>
        <div className="space-y-2">
          {qualityMetrics.map((metric) => (
            <div key={metric.label} className="flex items-center justify-between">
              <span className="text-xs text-[#1C150D]/60">{metric.label}</span>
              <div className="flex-1 mx-2">
                <Progress value={metric.value} className="h-1" />
              </div>
              <span className="text-xs font-medium text-[#1C150D]">{metric.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Momentum / Achievements */}
      <Card className="p-4 bg-white border border-[#E7E1D4]">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-4 h-4 text-[#B8956A]" />
          <h3 className="text-sm font-semibold text-[#1C150D]">Momentum</h3>
        </div>
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-[#1C150D]/60">Level 8 → 9</span>
              <span className="text-xs font-medium text-[#1C150D]">1,240 / 1,500 XP</span>
            </div>
            <Progress value={(1240 / 1500) * 100} className="h-2" />
          </div>
          <div className="flex gap-2 mt-3">
            <div className="w-10 h-10 rounded-full bg-[#B8956A]/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#B8956A]" />
            </div>
            <div className="w-10 h-10 rounded-full bg-[#A3C98D]/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-[#A3C98D]" />
            </div>
            <div className="w-10 h-10 rounded-full bg-[#F5C16C]/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#F5C16C]" />
            </div>
          </div>
        </div>
      </Card>

      {/* Integrations Dock */}
      <Card className="p-4 bg-white border border-[#E7E1D4]">
        <h3 className="text-sm font-semibold text-[#1C150D] mb-3">Integrations</h3>
        <div className="space-y-2">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="flex items-center justify-between p-2 rounded hover:bg-[#FFFCF5] transition-colors cursor-pointer"
            >
              <span className="text-xs font-medium text-[#1C150D]">{integration.name}</span>
              <div className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: integration.color }}
                />
                <span className="text-xs text-[#1C150D]/60 capitalize">
                  {integration.status === "connected" && "✓"}
                  {integration.status === "syncing" && "⚙"}
                  {integration.status === "action" && "⚠"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
