import { TrendingUp, CheckCircle, Target, Calendar, Sparkles, Settings } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface DashboardStats {
  piecesCreatedThisWeek: number;
  piecesPublished: number;
  onBrandScore: number;
  piecesScheduled: number;
  streakDays: number;
}

interface DashboardEditorialStatsProps {
  stats?: DashboardStats;
}

export function DashboardEditorialStats({ stats }: DashboardEditorialStatsProps) {
  const navigate = useNavigate();
  const { data: goals, isLoading } = useGoals();
  
  const creationGoal = goals?.weekly_creation || 10;
  const publishGoal = goals?.weekly_publishing || 5;
  const scheduleGoal = goals?.weekly_scheduling || 7;

  const statCards = [
    {
      value: stats?.piecesCreatedThisWeek || 0,
      label: "This Week's Output",
      sublabel: `of ${creationGoal} pieces`,
      icon: TrendingUp,
      microCopy: stats?.piecesCreatedThisWeek >= creationGoal ? "Exceptional work!" : "Keep creating",
      goalMet: stats?.piecesCreatedThisWeek >= creationGoal,
    },
    {
      value: stats?.piecesPublished || 0,
      label: "Published Pieces",
      sublabel: `of ${publishGoal} this week`,
      icon: CheckCircle,
      microCopy: stats?.piecesPublished >= publishGoal ? "On target!" : "Ready to publish?",
      goalMet: stats?.piecesPublished >= publishGoal,
    },
    {
      value: `${stats?.onBrandScore || 0}%`,
      label: "On-Brand Score",
      sublabel: "Quality rating",
      icon: Target,
      microCopy: stats?.onBrandScore >= 90 ? "Perfectly on-brand" : "Maintain consistency",
      isScore: true,
      scoreColor: stats?.onBrandScore >= 90 ? "text-emerald-600" : stats?.onBrandScore >= 75 ? "text-aged-brass" : "text-charcoal",
    },
    {
      value: stats?.piecesScheduled || 0,
      label: "Pieces Scheduled",
      sublabel: `of ${scheduleGoal} planned`,
      icon: Calendar,
      microCopy: stats?.piecesScheduled >= scheduleGoal ? "Calendar optimized!" : "Plan ahead",
      goalMet: stats?.piecesScheduled >= scheduleGoal,
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header with title */}
      <div>
        <h2 className="font-serif text-xl md:text-2xl font-light text-ink-black mb-1">
          Editorial Goals
        </h2>
        <p className="text-xs text-charcoal/60 italic">
          Your weekly progress
        </p>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, index) => (
        <div
          key={index}
          className="group relative bg-parchment-white border border-charcoal/10 p-4 hover:border-aged-brass/40 transition-all hover:shadow-md"
        >
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-10 h-10 border-t border-r border-aged-brass/0 group-hover:border-aged-brass/40 transition-all" />
          
          {/* Icon as decorative element */}
          <div className="mb-3">
            <card.icon className="w-5 h-5 text-charcoal/30 group-hover:text-aged-brass transition-colors" />
          </div>

          {/* Large serif number */}
          <div className="mb-2">
            <p className={`font-serif text-3xl md:text-4xl font-light ${card.isScore ? card.scoreColor : 'text-ink-black'} leading-none mb-1.5`}>
              {card.value}
            </p>
            {card.goalMet && (
              <div className="inline-flex items-center gap-0.5 bg-emerald-500/10 px-1.5 py-0.5 border border-emerald-200">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                <span className="text-[9px] font-sans uppercase tracking-wider text-emerald-700">Goal Met</span>
              </div>
            )}
          </div>

          {/* Label and sublabel */}
          <div className="mb-2">
            <p className="text-[10px] uppercase tracking-[0.15em] font-sans text-charcoal/80 mb-0.5">
              {card.label}
            </p>
            <p className="text-[10px] text-charcoal/50 font-light">
              {card.sublabel}
            </p>
          </div>

          {/* Brass accent line */}
          <div className="w-10 h-[1px] bg-aged-brass/30 mb-1.5 group-hover:w-16 transition-all" />

          {/* Editorial micro-copy */}
          <p className="text-[10px] italic text-charcoal/60 font-serif">
            {card.microCopy}
          </p>
          </div>
        ))}
      </div>
    </div>
  );
}
