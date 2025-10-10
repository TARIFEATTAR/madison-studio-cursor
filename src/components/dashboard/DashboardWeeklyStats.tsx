import { TrendingUp, CheckCircle, Target, Calendar } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export function DashboardWeeklyStats() {
  const { data: stats } = useDashboardStats();

  const weeklyStats = [
    {
      id: 1,
      label: "Pieces Created",
      value: stats?.piecesCreatedThisWeek?.toString() || "0",
      icon: TrendingUp,
    },
    {
      id: 2,
      label: "Pieces Published",
      value: stats?.piecesPublished?.toString() || "0",
      icon: CheckCircle,
    },
    {
      id: 3,
      label: "On-Brand Score",
      value: `${stats?.onBrandScore || 0}%`,
      icon: Target,
    },
    {
      id: 4,
      label: "Pieces Scheduled",
      value: stats?.piecesScheduled?.toString() || "0",
      icon: Calendar,
    },
  ];

  return (
    <div className="bg-white rounded-lg border-t-4 border-aged-brass shadow-sm p-6">
      <h3 className="text-xl font-serif text-ink-black mb-5">This Week's Stats</h3>
      
      <div className="space-y-4">
        {weeklyStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-aged-brass/10 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-aged-brass" />
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-warm-gray">{stat.label}</p>
              </div>
              
              <p className="text-2xl font-serif font-semibold text-ink-black">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
