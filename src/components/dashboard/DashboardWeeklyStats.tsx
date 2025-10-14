import { TrendingUp, CheckCircle, Target, Calendar } from "lucide-react";

interface DashboardStats {
  piecesCreatedThisWeek: number;
  piecesPublished: number;
  onBrandScore: number;
  piecesScheduled: number;
  streakDays: number;
}

interface DashboardWeeklyStatsProps {
  stats?: DashboardStats;
}

export function DashboardWeeklyStats({ stats }: DashboardWeeklyStatsProps) {
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
    <div className="space-y-4">
      {weeklyStats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.id} className="flex items-center gap-4">
            <div className="w-10 h-10 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-charcoal" />
            </div>
            
            <div className="flex-1">
              <p className="text-sm text-charcoal/60">{stat.label}</p>
            </div>
            
            <p className="text-2xl font-serif font-medium text-ink-black">
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
