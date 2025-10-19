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
    <div className="space-y-4">
      {/* Pipeline visualization */}
      <div className="flex items-center gap-2">
        {stages.map((stage, index) => {
          const percentage = totalContent > 0 ? (stage.count / totalContent) * 100 : 0;
          return (
            <div key={stage.label} className="flex items-center flex-1">
              <div className="flex-1">
                <div className="h-12 md:h-10 lg:h-8 bg-vellum-cream border border-charcoal/10 overflow-hidden">
                  <div 
                    className={`h-full ${stage.bgColor} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs lg:text-[10px] text-charcoal/60 mt-1 text-center">
                  {stage.label}
                </p>
              </div>
              {index < stages.length - 1 && (
                <ArrowRight className="w-4 h-4 text-charcoal/20 mx-2 md:mx-1" />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage details */}
      <div className="grid grid-cols-3 gap-4 md:gap-3">
        {stages.map((stage) => {
          const Icon = stage.icon;
          return (
            <button
              key={stage.label}
              onClick={() => navigate(stage.route)}
              className="text-left p-5 md:p-4 border border-charcoal/10 hover:border-aged-brass/40 transition-all bg-parchment-white hover:bg-vellum-cream/30 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-12 h-12 md:w-10 md:h-10 lg:w-8 lg:h-8 ${stage.bgColor} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-6 h-6 md:w-5 md:h-5 lg:w-4 lg:h-4 ${stage.color}`} />
                </div>
                <span className="text-xl md:text-2xl lg:text-xl font-serif font-medium text-ink-black">
                  {stage.count}
                </span>
              </div>
              <p className="text-sm md:text-xs font-semibold text-charcoal mb-1">{stage.label}</p>
              <p className="text-xs text-charcoal/60">{stage.description}</p>
              <div className="mt-2 text-xs text-aged-brass opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                {stage.action} <ArrowRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick insight */}
      {totalContent === 0 ? (
        <div className="p-4 bg-vellum-cream/50 border border-charcoal/10">
          <p className="text-xs text-charcoal/70 text-center">
            No content in pipeline yet. Start creating to see your workflow!
          </p>
        </div>
      ) : (
        <div className="p-4 bg-aged-brass/5 border border-aged-brass/20">
          <p className="text-xs text-aged-brass font-medium leading-relaxed">
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
