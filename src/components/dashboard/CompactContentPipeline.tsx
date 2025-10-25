import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function CompactContentPipeline() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <Card className="p-4 bg-parchment-white border border-charcoal/5 h-[280px]">
        <div className="space-y-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </Card>
    );
  }

  const drafts = stats?.totalDrafts || 0;
  const scheduled = stats?.piecesScheduled || 0;
  const published = stats?.piecesPublished || 0;
  const total = drafts + scheduled + published || 1; // Avoid division by zero

  const draftsPercentage = Math.round((drafts / total) * 100);
  const scheduledPercentage = Math.round((scheduled / total) * 100);
  const publishedPercentage = Math.round((published / total) * 100);

  const stages = [
    {
      label: "Drafts",
      count: drafts,
      percentage: draftsPercentage,
      color: "bg-brass",
      route: "/library?filter=draft",
    },
    {
      label: "Scheduled",
      count: scheduled,
      percentage: scheduledPercentage,
      color: "bg-blue-600",
      route: "/schedule",
    },
    {
      label: "Published",
      count: published,
      percentage: publishedPercentage,
      color: "bg-emerald-600",
      route: "/library?filter=published",
    },
  ];

  return (
    <Card className="p-4 bg-parchment-white border border-charcoal/5 h-[280px]">
      <div className="space-y-6">
        {stages.map((stage) => (
          <button
            key={stage.label}
            onClick={() => navigate(stage.route)}
            className="w-full text-left group hover:bg-vellum-cream/50 p-3 rounded-md transition-all duration-150 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-charcoal/60 uppercase tracking-wide">
                {stage.label}
              </span>
              <span className="text-2xl font-serif font-light text-ink-black">
                {stage.count}
              </span>
            </div>
            <div className="relative h-2 w-full overflow-hidden rounded-full bg-warm-gray/20">
              <div
                className={`h-full transition-all ${stage.color}`}
                style={{ width: `${stage.percentage}%` }}
              />
            </div>
          </button>
        ))}
      </div>
    </Card>
  );
}
