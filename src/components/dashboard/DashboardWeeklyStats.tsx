import { TrendingUp, CheckCircle, Target, Calendar, ArrowUp, ArrowDown, Minus, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  // Weekly goals
  const creationGoal = 10;
  const publishGoal = 5;
  const scheduleGoal = 7;
  
  const createdProgress = Math.min(((stats?.piecesCreatedThisWeek || 0) / creationGoal) * 100, 100);
  const publishedProgress = Math.min(((stats?.piecesPublished || 0) / publishGoal) * 100, 100);
  const scheduledProgress = Math.min(((stats?.piecesScheduled || 0) / scheduleGoal) * 100, 100);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-aged-brass";
    return "text-charcoal";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 95) return { text: "Excellent", color: "bg-emerald-500/10 text-emerald-700 border-emerald-200" };
    if (score >= 85) return { text: "Great", color: "bg-aged-brass/10 text-aged-brass border-aged-brass/20" };
    if (score >= 75) return { text: "Good", color: "bg-charcoal/10 text-charcoal border-charcoal/20" };
    return { text: "Needs Work", color: "bg-warm-gray/10 text-warm-gray border-warm-gray/20" };
  };

  const scoreBadge = getScoreBadge(stats?.onBrandScore || 0);

  return (
    <div className="space-y-6">
      {/* Created This Week */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-charcoal" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-black">Pieces Created</p>
              <p className="text-xs text-charcoal/60">
                {stats?.piecesCreatedThisWeek || 0} of {creationGoal} weekly goal
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif font-medium text-ink-black">
              {stats?.piecesCreatedThisWeek || 0}
            </p>
            {(stats?.piecesCreatedThisWeek || 0) >= creationGoal && (
              <Badge className="mt-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" />
                Goal Met!
              </Badge>
            )}
          </div>
        </div>
        <Progress value={createdProgress} className="h-2" />
      </div>

      {/* Published */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-charcoal" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-black">Pieces Published</p>
              <p className="text-xs text-charcoal/60">
                {(stats?.piecesPublished || 0) === 0 
                  ? "Ready to publish?" 
                  : `${stats?.piecesPublished} of ${publishGoal} weekly goal`
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif font-medium text-ink-black">
              {stats?.piecesPublished || 0}
            </p>
            {(stats?.piecesPublished || 0) >= publishGoal && (
              <Badge className="mt-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" />
                Goal Met!
              </Badge>
            )}
          </div>
        </div>
        <Progress value={publishedProgress} className="h-2" />
      </div>

      {/* On-Brand Score */}
      <div className="p-4 bg-vellum-cream/50 border border-charcoal/10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-parchment-white border border-charcoal/10 flex items-center justify-center shrink-0">
              <Target className="w-5 h-5 text-charcoal" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-black">On-Brand Score</p>
              <p className="text-xs text-charcoal/60">Quality & consistency rating</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-2xl font-serif font-medium ${getScoreColor(stats?.onBrandScore || 0)}`}>
              {stats?.onBrandScore || 0}%
            </p>
            <Badge variant="outline" className={`mt-1 ${scoreBadge.color} text-[10px]`}>
              {scoreBadge.text}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-charcoal/60 italic">
          {stats?.onBrandScore >= 95 && "Your content perfectly matches your brand voice! 🎯"}
          {stats?.onBrandScore >= 85 && stats?.onBrandScore < 95 && "Strong brand consistency across your content."}
          {stats?.onBrandScore >= 75 && stats?.onBrandScore < 85 && "Good quality. Consider reviewing brand guidelines."}
          {stats?.onBrandScore < 75 && "Use Madison's guidance to improve brand alignment."}
        </p>
      </div>

      {/* Scheduled */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-vellum-cream border border-charcoal/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-charcoal" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink-black">Pieces Scheduled</p>
              <p className="text-xs text-charcoal/60">
                {(stats?.piecesScheduled || 0) === 0 
                  ? "Plan your editorial calendar" 
                  : `${stats?.piecesScheduled} of ${scheduleGoal} weekly goal`
                }
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-serif font-medium text-ink-black">
              {stats?.piecesScheduled || 0}
            </p>
            {(stats?.piecesScheduled || 0) >= scheduleGoal && (
              <Badge className="mt-1 bg-emerald-500/10 text-emerald-700 border-emerald-200 text-[10px]">
                <Sparkles className="w-3 h-3 mr-1" />
                Goal Met!
              </Badge>
            )}
          </div>
        </div>
        <Progress value={scheduledProgress} className="h-2" />
      </div>
    </div>
  );
}
