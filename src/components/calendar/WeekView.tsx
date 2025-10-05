import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { GripVertical } from "lucide-react";

interface ScheduledItem {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string | null;
  pillar: string | null;
  status: string;
  dip_week: number | null;
  google_event_id: string | null;
  notes: string | null;
}

interface WeekViewProps {
  currentDate: Date;
  scheduledItems: ScheduledItem[];
  dipWeekInfo: {
    week_number: number;
    pillar: string;
    visual_world: string;
    core_lexicon: string[];
  } | null;
  onItemClick: (item: ScheduledItem) => void;
}

export const WeekView = ({ currentDate, scheduledItems, dipWeekInfo, onItemClick }: WeekViewProps) => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const getItemsForDay = (date: Date) => {
    return scheduledItems
      .filter(item => {
        // Parse date string as local date to avoid timezone shifts
        const [year, month, day] = item.scheduled_date.split('-').map(Number);
        const itemDate = new Date(year, month - 1, day);
        return isSameDay(itemDate, date);
      })
      .sort((a, b) => {
        if (!a.scheduled_time) return 1;
        if (!b.scheduled_time) return -1;
        return a.scheduled_time.localeCompare(b.scheduled_time);
      });
  };

  return (
    <div className="space-y-8">
      {/* DIP Week Info */}
      {dipWeekInfo && (
        <div className="card-matte p-8 rounded-lg border border-border/40">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30 mb-3">
                Week {dipWeekInfo.week_number}
              </Badge>
              <h2 className="text-2xl mb-1">{dipWeekInfo.pillar}</h2>
              <p className="text-muted-foreground italic">{dipWeekInfo.visual_world}</p>
            </div>
            {dipWeekInfo.core_lexicon && dipWeekInfo.core_lexicon.length > 0 && (
              <div className="flex flex-wrap gap-2 max-w-md">
                {dipWeekInfo.core_lexicon.slice(0, 5).map(term => (
                  <Badge key={term} variant="outline" className="text-xs">
                    {term}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Week Grid */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, idx) => {
          const dayItems = getItemsForDay(day);
          const isDayToday = isToday(day);
          const dayId = format(day, "yyyy-MM-dd");

          return (
            <Droppable key={dayId} droppableId={dayId}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={cn(
                    "rounded-lg border border-border/40 overflow-hidden transition-all",
                    isDayToday && "ring-2 ring-primary/50",
                    snapshot.isDraggingOver && "ring-2 ring-primary bg-primary/10 shadow-lg"
                  )}
                >
                  {/* Day header */}
                  <div className={cn(
                    "p-3 border-b border-border/40",
                    isDayToday ? "bg-primary/10" : "bg-muted/20"
                  )}>
                    <div className="text-xs text-muted-foreground">
                      {format(day, "EEE")}
                    </div>
                    <div className={cn(
                      "text-lg font-medium",
                      isDayToday && "text-primary"
                    )}>
                      {format(day, "d")}
                    </div>
                  </div>

                  {/* Day items */}
                  <div className="p-3 space-y-2 min-h-[240px]">
                    {dayItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => onItemClick(item)}
                            className={cn(
                              "p-3 rounded-md bg-card hover:bg-accent/50 border border-border/40 cursor-grab active:cursor-grabbing transition-all group select-none",
                              snapshot.isDragging && "shadow-2xl ring-2 ring-primary opacity-90 scale-105"
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <GripVertical className="w-4 h-4 text-muted-foreground/70 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                {item.scheduled_time && (
                                  <div className="text-xs font-medium text-muted-foreground mb-1">
                                    {format(new Date(`2000-01-01T${item.scheduled_time}`), "h:mm a")}
                                  </div>
                                )}
                                <div className="text-sm font-medium mb-1 line-clamp-2">
                                  {item.title}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {item.platform && (
                                    <Badge variant="outline" className="text-[10px] py-0">
                                      {item.platform}
                                    </Badge>
                                  )}
                                  {item.pillar && (
                                    <Badge variant="outline" className="text-[10px] py-0">
                                      {item.pillar}
                                    </Badge>
                                  )}
                                </div>
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
