import { cn } from "@/lib/utils";
import { ContentDot } from "./ContentDot";
import type { WeekDay } from "@/hooks/useWeeklySchedule";

interface DayCellProps {
  day: WeekDay;
  onClick?: () => void;
}

export function DayCell({ day, onClick }: DayCellProps) {
  const hasContent = day.scheduledContent.length > 0;
  const visibleContent = day.scheduledContent.slice(0, 3);
  const overflow = day.scheduledContent.length > 3 ? day.scheduledContent.length - 3 : 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center p-3 rounded-lg transition-all min-w-[90px]",
        "hover:bg-warm-gray/10 border",
        day.isToday ? "border-brass border-2 bg-brass/5" : "border-charcoal/10",
        !hasContent && "opacity-70"
      )}
    >
      <div className="text-center mb-2">
        <div className={cn(
          "text-xs font-medium uppercase tracking-wide mb-1",
          day.isToday ? "text-brass" : "text-charcoal/60"
        )}>
          {day.dayName}
        </div>
        <div className={cn(
          "text-2xl font-serif font-light",
          day.isToday ? "text-brass" : "text-ink-black"
        )}>
          {day.dateNumber}
        </div>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center min-h-[20px]">
        {visibleContent.map((content) => (
          <ContentDot
            key={content.id}
            type={content.content_type}
            time={content.scheduled_time}
          />
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-charcoal/60 font-medium">
            +{overflow}
          </span>
        )}
      </div>

      {!hasContent && (
        <span className="text-[10px] text-charcoal/40 mt-1">Empty</span>
      )}
    </button>
  );
}
