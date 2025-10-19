import { Edit3, CheckCircle2, Rocket, ArrowRight } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useNavigate } from "react-router-dom";

interface PipelineStage {
  label: string;
  count: number;
  icon: any;
  color: string;
  bgColor: string;
  action: string;
  route: string;
  description: string;
}

export function ContentPipeline() {
  const { data: stats } = useDashboardStats();
  const navigate = useNavigate();

  // Calculate pipeline counts
  const draftCount = (stats?.piecesCreatedThisWeek || 0) - (stats?.piecesPublished || 0);
  const publishedCount = stats?.piecesPublished || 0;
  const scheduledCount = stats?.piecesScheduled || 0;

  const stages: PipelineStage[] = [
    {
      label: "Drafts",
      count: draftCount,
      icon: Edit3,
      color: "text-charcoal",
      bgColor: "bg-charcoal/10",
      action: "Review & Refine",
      route: "/library",
      description: draftCount === 0 ? "All caught up!" : "Ready for review"
    },
    {
      label: "Scheduled",
      count: scheduledCount,
      icon: CheckCircle2,
      color: "text-aged-brass",
      bgColor: "bg-aged-brass/10",
      action: "View Calendar",
      route: "/schedule",
      description: scheduledCount === 0 ? "Plan ahead" : "Queued to publish"
    },
    {
      label: "Published",
      count: publishedCount,
      icon: Rocket,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
      action: "View Published",
      route: "/library?status=published",
      description: publishedCount === 0 ? "Start publishing" : "Live content"
    }
  ];

  const totalContent = draftCount + scheduledCount + publishedCount;

  return (
    <div className="space-y-3">
      {/* Pipeline visualization */}
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => {
          const percentage = totalContent > 0 ? (stage.count / totalContent) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center flex-1">
              <div className="flex-1">
                <div className="h-6 bg-vellum-cream border border-charcoal/10 overflow-hidden">
                  <div 
                    className={`h-full ${stage.bgColor} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-[10px] text-charcoal/60 mt-1 text-center">
                  {stage.label}
                </p>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-3 h-3 text-charcoal/20 mx-1.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage details */}
      <div className="grid grid-cols-3 gap-2">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <button
              key={stage.label}
              onClick={() => navigate(stage.route)}
              className="text-left p-3 border border-charcoal/10 hover:border-aged-brass/40 transition-all bg-parchment-white hover:bg-vellum-cream/30 group"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className={`w-7 h-7 ${stage.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-3.5 h-3.5 ${stage.color}`} />
                </div>
                <span className="text-lg font-serif font-medium text-ink-black">
                  {stage.count}
                </span>
              </div>
              <p className="text-xs font-semibold text-charcoal mb-0.5">{stage.label}</p>
              <p className="text-[10px] text-charcoal/60 leading-tight mb-2">{stage.description}</p>
              <div className="pt-2 border-t border-charcoal/10">
                <div className="text-[10px] uppercase tracking-wider text-aged-brass font-medium flex items-center gap-1 group-hover:gap-1.5 transition-all">
                  {stage.action} <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick insight */}
      {totalContent === 0 ? (
        <div className="p-3 bg-vellum-cream/50 border border-charcoal/10">
          <p className="text-[10px] text-charcoal/70 text-center">
            No content in pipeline yet. Start creating!
          </p>
        </div>
      ) : (
        <div className="p-3 bg-aged-brass/5 border border-aged-brass/20">
          <p className="text-[10px] text-aged-brass font-medium leading-relaxed">
            <strong>Pro tip:</strong> {
              draftCount > scheduledCount 
                ? "You have drafts ready! Schedule them to maintain consistency."
                : scheduledCount > publishedCount
                  ? "Great planning! Your scheduled content will publish automatically."
                  : "You're publishing regularly! Keep up the momentum."
            }
          </p>
        </div>
      )}
    </div>
  );
}
