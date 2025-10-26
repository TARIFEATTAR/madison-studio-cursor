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
      <>
        <Skeleton className="col-span-8 h-[240px] rounded-xl" />
        <Skeleton className="col-span-4 h-[240px] rounded-xl" />
      </>
    );
  }

  return (
    <>
      {/* Content Pipeline */}
      <Card className="col-span-8 p-6 bg-white border border-[#E0E0E0] overflow-hidden rounded-xl">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-5">Content Pipeline</h3>
        <div className="grid grid-cols-4 gap-4 h-[calc(100%-2.5rem)]">
          {pipelineStages.map((stage) => (
            <div
              key={stage.id}
              onClick={() => navigate('/library')}
              className="flex flex-col p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg hover:-translate-y-1 cursor-pointer bg-white"
              style={{
                borderColor: stage.color,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded" style={{ backgroundColor: `${stage.color}20` }}>
                  <stage.icon className="w-4 h-4" style={{ color: stage.color }} />
                </div>
                <span className="text-xs font-medium text-[#1C150D]/60">{stage.label}</span>
              </div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-3xl font-semibold text-[#1C150D]">{stage.count}</span>
                <span className="text-sm text-[#1C150D]/40">/ {stage.total}</span>
              </div>
              <Progress
                value={(stage.count / stage.total) * 100}
                className="h-2 mb-3"
                style={{
                  backgroundColor: `${stage.color}15`,
                }}
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/library');
                }}
                className="text-xs text-[#1C150D]/60 hover:text-[#1C150D] mt-auto"
              >
                View Items →
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* This Week Calendar */}
      <Card className="col-span-4 p-6 bg-white border border-[#E0E0E0] overflow-hidden rounded-xl">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-5">This Week</h3>
        <div className="grid grid-cols-7 gap-3">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors cursor-pointer group border border-transparent hover:border-[#E0E0E0]"
            >
              <span className="text-xs font-medium text-[#1C150D]/40 mb-1">{day.day}</span>
              <span className="text-xl font-semibold text-[#1C150D] mb-3">{day.date}</span>
              <div className="flex gap-1 flex-wrap justify-center min-h-[16px]">
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
    </>
  );
}
