import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DayCell } from "./DayCell";
import { useWeeklySchedule } from "@/hooks/useWeeklySchedule";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export function ThisWeekContent() {
  const [weekOffset, setWeekOffset] = useState(0);
  const { data: weekDays, isLoading } = useWeeklySchedule(weekOffset);
  const navigate = useNavigate();

  const previousWeek = () => setWeekOffset((prev) => prev - 1);
  const nextWeek = () => setWeekOffset((prev) => prev + 1);

  if (isLoading) {
    return (
      <Card className="p-6 bg-parchment-white border border-charcoal/10">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex gap-3">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </Card>
    );
  }

  const hasScheduledContent = weekDays?.some((day) => day.scheduledContent.length > 0);

  return (
    <Card className="p-4 bg-parchment-white border border-charcoal/5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-charcoal/5">
        <div>
          <h3 className="font-serif text-lg font-light text-ink-black mb-1">
            THIS WEEK'S CONTENT
          </h3>
          <p className="text-xs text-charcoal/60 italic">
            {weekOffset === 0 ? "Current week" : weekOffset > 0 ? `${weekOffset} week${weekOffset > 1 ? 's' : ''} ahead` : `${Math.abs(weekOffset)} week${Math.abs(weekOffset) > 1 ? 's' : ''} ago`}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate("/schedule")}
          className="text-charcoal hover:text-ink-black text-sm"
        >
          View Calendar
        </Button>
      </div>

      {!hasScheduledContent && weekOffset === 0 ? (
        <div className="text-center py-6 space-y-3">
          <p className="text-charcoal/60 text-sm">No content scheduled this week.</p>
          <Button
            onClick={() => navigate("/schedule")}
            className="bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-ink-black text-sm h-9"
          >
            Schedule Your Week
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={previousWeek}
            className="flex-shrink-0 hover:bg-warm-gray/10 h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 py-2">
            {weekDays?.map((day) => (
              <DayCell
                key={day.dateString}
                day={day}
                onClick={() => navigate("/schedule")}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={nextWeek}
            className="flex-shrink-0 hover:bg-warm-gray/10 h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}
