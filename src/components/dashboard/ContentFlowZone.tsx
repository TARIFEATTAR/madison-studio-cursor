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
      status: "draft",
    },
    {
      id: "review",
      label: "Review",
      icon: Eye,
      count: 3,
      total: 10,
      color: "#B4A078",
      status: "review",
    },
    {
      id: "scheduled",
      label: "Scheduled",
      icon: CalendarIcon,
      count: stats?.piecesScheduled || 0,
      total: 10,
      color: "#F5C16C",
      status: "scheduled",
    },
    {
      id: "published",
      label: "Published",
      icon: CheckCircle2,
      count: stats?.piecesPublished || 0,
      total: 20,
      color: "#A3C98D",
      status: "published",
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

  const handleStageClick = (status: string) => {
    navigate(`/library?status=${status}`);
  };

  if (isLoading) {
    return (
      <>
        <Skeleton className="col-span-1 md:col-span-8 h-[240px] rounded-xl" />
        <Skeleton className="col-span-1 md:col-span-4 h-[240px] rounded-xl" />
      </>
    );
  }

  return (
    <>
      {/* Content Pipeline */}
      <Card className="col-span-1 md:col-span-8 p-4 md:p-6 bg-white border border-[#E0E0E0] overflow-hidden rounded-xl min-h-[240px]">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4 md:mb-5">Content Pipeline</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {pipelineStages.map((stage) => (
            <button
              key={stage.id}
              onClick={() => handleStageClick(stage.status)}
              className="group flex flex-col items-center justify-center p-4 md:p-5 rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              style={{
                background: `linear-gradient(to bottom right, ${stage.color}20, ${stage.color}10)`,
              }}
            >
              <div 
                className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center mb-2 md:mb-3 transition-transform group-hover:scale-110"
                style={{ backgroundColor: stage.color }}
              >
                <stage.icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-[#1C150D] mb-1">
                {stage.count}
              </div>
              <div className="text-xs font-medium text-[#1C150D]/70 text-center">
                {stage.label}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* This Week Calendar - Improved Mobile */}
      <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] overflow-hidden rounded-xl min-h-[240px]">
        <h3 className="text-sm font-medium text-[#1C150D]/60 mb-4 md:mb-5">This Week</h3>
        
        {/* Mobile: Horizontal Scroll */}
        <div className="md:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 min-w-max pb-2">
            {weekDays.map((day, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors cursor-pointer border border-transparent hover:border-[#E0E0E0] min-w-[70px]"
              >
                <span className="text-xs font-medium text-[#1C150D]/40 mb-1">{day.day}</span>
                <span className="text-2xl font-semibold text-[#1C150D] mb-3">{day.date}</span>
                <div className="flex gap-1.5 flex-wrap justify-center min-h-[16px]">
                  {day.dots.map((dot, dotIndex) => (
                    <div
                      key={dotIndex}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: dot.color }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden md:grid grid-cols-7 gap-3">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors cursor-pointer border border-transparent hover:border-[#E0E0E0]"
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
