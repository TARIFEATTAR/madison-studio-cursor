import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isSameDay, isToday } from "date-fns";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";
import { useMemo } from "react";

interface ScheduledItem {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string | null;
  status: string;
  google_event_id: string | null;
  notes: string | null;
}

interface MonthViewProps {
  currentDate: Date;
  scheduledItems: ScheduledItem[];
  onDayClick: (date: Date) => void;
  onItemClick: (item: ScheduledItem) => void;
  isDragging?: boolean;
  isMobile?: boolean;
}

export const MonthView = ({ currentDate, scheduledItems, onDayClick, onItemClick, isDragging, isMobile = false }: MonthViewProps) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Memoize items by day to avoid recalculating on every render
  const itemsByDay = useMemo(() => {
    const map = new Map<string, ScheduledItem[]>();
    scheduledItems.forEach(item => {
      const dayId = item.scheduled_date;
      if (!map.has(dayId)) {
        map.set(dayId, []);
      }
      map.get(dayId)!.push(item);
    });
    return map;
  }, [scheduledItems]);

  const getItemsForDay = (dayId: string) => {
    return itemsByDay.get(dayId) || [];
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
      <div className={cn("grid grid-cols-7", isMobile ? "[&>*]:min-h-[80px]" : "[&>*]:min-h-[160px]")}>
        {days.map((day, idx) => {
          const dayId = format(day, "yyyy-MM-dd");
          const dayItems = getItemsForDay(dayId);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isDayToday = isToday(day);

          return isMobile ? (
            // Mobile: Simple view with dots
            <div
              key={dayId}
              onClick={() => onDayClick(day)}
              className={cn(
                "h-full p-2 border-b border-r border-border/20 transition-all cursor-pointer",
                !isCurrentMonth && "bg-muted/20",
                isDayToday && "bg-accent/30 ring-1 ring-primary/40",
                "hover:bg-accent/30 active:bg-accent"
              )}
            >
              <div className={cn(
                "text-lg font-medium mb-1",
                !isCurrentMonth && "text-muted-foreground/50",
                isDayToday && "text-primary font-bold"
              )}>
                {format(day, "d")}
              </div>
              <div className="flex gap-1 flex-wrap">
                {dayItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="w-2 h-2 rounded-full bg-primary"
                  />
                ))}
                {dayItems.length > 3 && (
                  <div className="text-[10px] text-muted-foreground">
                    +{dayItems.length - 3}
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Desktop: Full drag-drop functionality
            <Droppable key={dayId} droppableId={dayId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  onClick={() => !isDragging && onDayClick(day)}
                  className={cn(
                    "h-full p-3 border-b border-r border-border/20 transition-all",
                    !isDragging && "cursor-pointer hover:bg-accent/30",
                    !isCurrentMonth && "bg-muted/20",
                    isDayToday && "bg-accent/30 ring-1 ring-primary/40",
                    snapshot.isDraggingOver && "bg-primary/10 ring-2 ring-primary shadow-lg"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-3",
                    !isCurrentMonth && "text-muted-foreground/50",
                    isDayToday && "text-primary font-bold"
                  )}>
                    {format(day, "d")}
                  </div>

                  <div className="space-y-1.5 min-h-[80px]">
                    {dayItems.slice(0, 3).map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={(e) => {
                              e.stopPropagation();
                              onItemClick(item);
                            }}
                            className={cn(
                              "text-xs p-2 rounded bg-primary/10 hover:bg-primary/20 transition-all truncate group cursor-grab active:cursor-grabbing select-none",
                              snapshot.isDragging && "shadow-2xl ring-2 ring-primary opacity-90 scale-105"
                            )}
                          >
                            <div className="flex items-center gap-1.5">
                              <GripVertical className="w-3 h-3 text-muted-foreground/70 flex-shrink-0" />
                              {item.scheduled_time && (
                                <span className="text-[10px] text-muted-foreground">
                                  {format(new Date(`2000-01-01T${item.scheduled_time}`), "h:mm a")}
                                </span>
                              )}
                              <span className="truncate font-medium">{item.title}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-xs text-muted-foreground pl-1.5">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </div>
  );
};
