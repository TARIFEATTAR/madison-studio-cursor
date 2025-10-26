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
            <button
              key={stage.id}
              onClick={() => navigate('/library')}
              className="group flex flex-col items-center justify-center p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                background: `linear-gradient(to bottom right, ${stage.color}20, ${stage.color}10)`,
              }}
            >
              <div 
                className="w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: stage.color }}
              >
                <stage.icon className="w-7 h-7 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#1C150D] mb-1">
                {stage.count}
              </div>
              <div className="text-xs font-medium text-[#1C150D]/70 text-center">
                {stage.label}
              </div>
            </button>
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
