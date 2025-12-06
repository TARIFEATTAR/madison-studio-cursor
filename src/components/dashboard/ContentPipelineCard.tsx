import { useNavigate } from "react-router-dom";
import { FileText, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentPipelineCard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  const pipelineStages = [
    {
      id: "draft",
      label: "Draft",
      icon: FileText,
      count: stats?.totalDrafts || 0,
      color: "#D9D2C2",
      status: "draft",
    },
    {
      id: "scheduled",
      label: "Scheduled",
      icon: CalendarIcon,
      count: stats?.piecesScheduled || 0,
      color: "#F5C16C",
      status: "scheduled",
    },
    {
      id: "published",
      label: "Published",
      icon: CheckCircle2,
      count: stats?.piecesPublished || 0,
      color: "#A3C98D",
      status: "published",
    },
  ];

  const handleStageClick = (status: string) => {
    if (status === "scheduled") {
      navigate("/calendar");
    } else {
      navigate(`/library?status=${status}`);
    }
  };

  if (isLoading) {
    return (
      <Skeleton className="h-[240px] rounded-xl w-full" />
    );
  }

  return (
    <Card className="p-6 bg-white border border-[#E0E0E0] overflow-hidden rounded-xl h-full hover-lift transition-all duration-200">
        <div className="mb-5">
          <h3 className="text-sm font-medium text-[#1C150D]/60">Content Pipeline</h3>
          <p className="text-xs text-[#1C150D]/40 mt-0.5">Master content pieces (blog posts, social posts, etc.)</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {pipelineStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage.status)}
              className="group flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-md touch-manipulation"
              style={{
                background: `linear-gradient(to bottom right, ${stage.color}20, ${stage.color}10)`,
              }}
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110"
                style={{ backgroundColor: stage.color }}
              >
                <stage.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-[#1C150D] mb-1">
                {stage.count}
              </div>
              <div className="text-xs font-medium text-[#1C150D]/70 text-center">
                {stage.label}
              </div>
            </button>
          ))}
        </div>
        
        {/* View Library Link */}
        <div className="mt-5 pt-4 border-t border-[#E0E0E0] text-center">
          <button
            onClick={() => navigate("/library")}
            className="text-xs text-[#B8956A] hover:text-[#A3865A] transition-colors"
          >
            View Full Library →
          </button>
        </div>
      </Card>
  );
}

