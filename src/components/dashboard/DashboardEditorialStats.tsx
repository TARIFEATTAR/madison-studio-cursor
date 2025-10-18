import { TrendingUp, CheckCircle, Target, Calendar, Sparkles } from "lucide-react";

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
  const creationGoal = 10;
  const publishGoal = 5;
  const scheduleGoal = 7;

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="group relative bg-parchment-white border border-charcoal/10 p-8 hover:border-aged-brass/40 transition-all hover:shadow-lg"
        >
          {/* Decorative corner accent */}
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-aged-brass/0 group-hover:border-aged-brass/40 transition-all" />
          
          {/* Icon as decorative element */}
          <div className="mb-6">
            <card.icon className="w-8 h-8 text-charcoal/30 group-hover:text-aged-brass transition-colors" />
          </div>

          {/* Large serif number */}
          <div className="mb-4">
            <p className={`font-serif text-6xl font-light ${card.isScore ? card.scoreColor : 'text-ink-black'} leading-none mb-2`}>
              {card.value}
            </p>
            {card.goalMet && (
              <div className="inline-flex items-center gap-1 bg-emerald-500/10 px-2 py-1 border border-emerald-200">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] font-sans uppercase tracking-wider text-emerald-700">Goal Met</span>
              </div>
            )}
          </div>

          {/* Label and sublabel */}
          <div className="mb-3">
            <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/80 mb-1">
              {card.label}
            </p>
            <p className="text-xs text-charcoal/50 font-light">
              {card.sublabel}
            </p>
          </div>

          {/* Brass accent line */}
          <div className="w-12 h-[1px] bg-aged-brass/30 mb-3 group-hover:w-24 transition-all" />

          {/* Editorial micro-copy */}
          <p className="text-xs italic text-charcoal/60 font-serif">
            {card.microCopy}
          </p>
        </div>
      ))}
    </div>
  );
}
