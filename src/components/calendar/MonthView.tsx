import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface ScheduledItem {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string | null;
  pillar: string | null;
  status: string;
}

interface MonthViewProps {
  currentDate: Date;
  scheduledItems: ScheduledItem[];
  onDayClick: (date: Date) => void;
  onItemClick: (item: ScheduledItem) => void;
}

export const MonthView = ({ currentDate, scheduledItems, onDayClick, onItemClick }: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getItemsForDay = (date: Date) => {
    return scheduledItems.filter(item => 
      isSameDay(new Date(item.scheduled_date), date)
    );
  };

  return (
    <div className="bg-card rounded-lg border border-border/40 overflow-hidden h-auto">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/40 bg-muted/30">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 auto-rows-fr">
        {days.map((day, idx) => {
          const dayItems = getItemsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return (
            <div
              key={idx}
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[120px] p-4 border-b border-r border-border/20 cursor-pointer transition-colors",
                "hover:bg-accent/50",
                !isCurrentMonth && "bg-muted/20",
                isDayToday && "bg-accent/30"
              )}
            >
              <div className={cn(
                "text-sm font-medium mb-3",
                !isCurrentMonth && "text-muted-foreground/50",
                isDayToday && "text-primary font-bold"
              )}>
                {format(day, "d")}
              </div>

              <div className="space-y-1.5">
                {dayItems.slice(0, 3).map(item => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemClick(item);
                    }}
                    className="text-xs p-1.5 rounded bg-primary/10 hover:bg-primary/20 transition-colors truncate"
                  >
                    <div className="flex items-center gap-1">
                      {item.scheduled_time && (
                        <span className="text-[10px] text-muted-foreground">
                          {format(new Date(`2000-01-01T${item.scheduled_time}`), "h:mm a")}
                        </span>
                      )}
                      <span className="truncate font-medium">{item.title}</span>
                    </div>
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1.5">
                    +{dayItems.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
