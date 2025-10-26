import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, Eye, Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { Skeleton } from "@/components/ui/skeleton";

export function ContentFlowZone() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  const pipelineStages = [
    {
      id: "draft",
      label: "Draft",
      icon: FileText,
      count: stats?.totalDrafts || 0,
      total: 10,
      color: "#D9D2C2",
    },
    {
      id: "review",
      label: "Review",
      icon: Eye,
      count: 3,
      total: 10,
      color: "#B4A078",
    },
    {
      id: "scheduled",
      label: "Scheduled",
      icon: CalendarIcon,
      count: stats?.piecesScheduled || 0,
      total: 10,
      color: "#F5C16C",
    },
    {
      id: "published",
      label: "Published",
      icon: CheckCircle2,
      count: stats?.piecesPublished || 0,
      total: 20,
      color: "#A3C98D",
    },
  ];

  const weekDays = [
    { day: "Mon", date: "18", dots: [{ color: "#F5C16C" }, { color: "#A3C98D" }] },
    { day: "Tue", date: "19", dots: [{ color: "#F5C16C" }] },
    { day: "Wed", date: "20", dots: [] },
    { day: "Thu", date: "21", dots: [{ color: "#F5C16C" }] },
    { day: "Fri", date: "22", dots: [{ color: "#F5C16C" }, { color: "#A3C98D" }] },
    { day: "Sat", date: "23", dots: [] },
    { day: "Sun", date: "24", dots: [] },
  ];

  if (isLoading) {
    return (
      <div className="h-full flex gap-4">
        <Skeleton className="flex-[2] h-full rounded-lg" />
        <Skeleton className="flex-1 h-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="h-full flex gap-4">
      {/* Content Pipeline - 8 cols equivalent */}
      <Card className="flex-[2] p-4 bg-white border border-[#E7E1D4] overflow-hidden">
        <h3 className="text-sm font-semibold text-[#1C150D] mb-4">Content Pipeline</h3>
        <div className="grid grid-cols-4 gap-3 h-[calc(100%-2rem)]">
          {pipelineStages.map((stage) => (
            <div
              key={stage.id}
              onClick={() => navigate('/library')}
              className="flex flex-col p-3 rounded-lg border transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer"
              style={{
                backgroundColor: `${stage.color}20`,
                borderColor: stage.color,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
                <span className="text-xs font-medium text-[#1C150D]">{stage.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-2xl font-serif font-semibold text-[#1C150D]">{stage.count}</span>
                <span className="text-xs text-[#1C150D]/60">/ {stage.total}</span>
              </div>
              <Progress
                value={(stage.count / stage.total) * 100}
                className="h-1.5"
                style={{
                  backgroundColor: `${stage.color}30`,
                }}
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/library');
                }}
                className="text-xs text-[#1C150D]/60 hover:text-[#1C150D] mt-auto pt-2"
              >
                View Items →
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* This Week Calendar - 4 cols equivalent */}
      <Card className="flex-1 p-4 bg-white border border-[#E7E1D4] overflow-hidden">
        <h3 className="text-sm font-semibold text-[#1C150D] mb-4">This Week</h3>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-[#FFFCF5] transition-colors cursor-pointer group"
            >
              <span className="text-xs font-medium text-[#1C150D]/60 mb-1">{day.day}</span>
              <span className="text-lg font-serif font-semibold text-[#1C150D] mb-2">{day.date}</span>
              <div className="flex gap-1 flex-wrap justify-center min-h-[24px]">
                {day.dots.map((dot, dotIndex) => (
                  <div
                    key={dotIndex}
                    className="w-2 h-2 rounded-full transition-transform group-hover:scale-125"
                    style={{ backgroundColor: dot.color }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
