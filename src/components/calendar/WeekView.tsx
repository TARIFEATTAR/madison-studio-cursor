import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GripVertical, Calendar } from "lucide-react";
import { useMemo } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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

interface WeekViewProps {
  currentDate: Date;
  scheduledItems: ScheduledItem[];
  onItemClick: (item: ScheduledItem) => void;
}

export const WeekView = ({ currentDate, scheduledItems, onItemClick }: WeekViewProps) => {
  const isMobile = useIsMobile();
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

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
    // Sort items by time for each day
    map.forEach((items) => {
      items.sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return a.scheduled_time.localeCompare(b.scheduled_time);
      });
    });
    return map;
  }, [scheduledItems]);

  const getItemsForDay = (dayId: string) => {
    return itemsByDay.get(dayId) || [];
  };

  // Mobile: Vertical list of days
  if (isMobile) {
    return (
      <div className="space-y-4">
        {days.map((day) => {
          const dayId = format(day, "yyyy-MM-dd");
          const dayItems = getItemsForDay(dayId);
          const isDayToday = isToday(day);

          return (
            <Droppable key={dayId} droppableId={dayId}>
              {(provided, snapshot) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "p-4 transition-all",
                    isDayToday && "ring-2 ring-primary/40 border-primary/30 bg-accent/30",
                    snapshot.isDraggingOver && "bg-primary/10 ring-2 ring-primary border-primary"
                  )}
                >
                  {/* Day Header */}
                  <div className="flex items-baseline gap-3 mb-4 pb-3 border-b border-border/20">
                    <div className={cn(
                      "text-3xl font-bold",
                      isDayToday && "text-primary"
                    )}>
                      {format(day, "d")}
                    </div>
                    <div className={cn(
                      "text-lg uppercase tracking-wide",
                      isDayToday ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {format(day, "EEEE")}
                    </div>
                  </div>

                  {/* Items */}
                  {dayItems.length > 0 ? (
                    <div className="space-y-2">
                      {dayItems.map((item, index) => (
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
                                "p-4 rounded-md transition-all cursor-grab active:cursor-grabbing",
                                "bg-card hover:bg-accent/50 border border-border/40 hover:border-border/60",
                                snapshot.isDragging && "shadow-2xl ring-2 ring-primary opacity-90 scale-105 cursor-grabbing"
                              )}
                            >
                              <div className="flex items-start gap-3">
                                <GripVertical className="w-5 h-5 text-muted-foreground/70 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  {item.scheduled_time && (
                                    <div className="text-sm text-muted-foreground mb-2 flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5" />
                                      {format(new Date(`2000-01-01T${item.scheduled_time}`), "h:mm a")}
                                    </div>
                                  )}
                                  <div className="font-medium text-base leading-snug mb-2">
                                    {item.title}
                                  </div>
                                  {item.platform && (
                                    <Badge variant="secondary" className="text-xs">
                                      {item.platform}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground/60 text-sm">
                      No items scheduled
                    </div>
                  )}
                </Card>
              )}
            </Droppable>
          );
        })}
      </div>
    );
  }

  // Desktop: 7-column grid
  return (
    <div className="space-y-8">
      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, idx) => {
          const dayId = format(day, "yyyy-MM-dd");
          const dayItems = getItemsForDay(dayId);
          const isDayToday = isToday(day);

          return (
            <Droppable key={dayId} droppableId={dayId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "min-h-[250px] p-4 rounded-lg border-2 transition-all",
                    isDayToday && "bg-accent/30 ring-2 ring-primary/40 border-primary/30",
                    !isDayToday && "border-border/20 hover:border-border/40",
                    snapshot.isDraggingOver && "bg-primary/10 ring-2 ring-primary shadow-lg border-primary"
                  )}
                >
                  {/* Day Header */}
                  <div className={cn(
                    "text-center mb-4 pb-3 border-b",
                    isDayToday && "border-primary/30",
                    !isDayToday && "border-border/20"
                  )}>
                    <div className={cn(
                      "text-xs uppercase tracking-wide mb-1",
                      isDayToday && "text-primary font-semibold",
                      !isDayToday && "text-muted-foreground"
                    )}>
                      {format(day, "EEE")}
                    </div>
                    <div className={cn(
                      "text-2xl font-semibold",
                      isDayToday && "text-primary",
                      !isDayToday && "text-foreground"
                    )}>
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {dayItems.map((item, index) => (
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
                              "p-3 rounded-md transition-all cursor-grab active:cursor-grabbing group",
                              "bg-card hover:bg-accent/50 border border-border/40 hover:border-border/60",
                              snapshot.isDragging && "shadow-2xl ring-2 ring-primary opacity-90 scale-105 cursor-grabbing"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground/70 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                {item.scheduled_time && (
                                  <div className="text-xs text-muted-foreground mb-1">
                                    {format(new Date(`2000-01-01T${item.scheduled_time}`), "h:mm a")}
                                  </div>
                                )}
                                <div className="font-medium text-sm leading-snug line-clamp-2">
                                  {item.title}
                                </div>
                                {item.platform && (
                                  <Badge variant="secondary" className="mt-1.5 text-xs">
                                    {item.platform}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
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