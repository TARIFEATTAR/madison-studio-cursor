import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, isToday } from "date-fns";
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
  dip_week: number | null;
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
      .filter(item => isSameDay(new Date(item.scheduled_date), date))
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

          return (
            <div
              key={idx}
              className={cn(
                "rounded-lg border border-border/40 overflow-hidden",
                isDayToday && "ring-2 ring-primary/50"
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
              <div className="p-2 space-y-2 min-h-[200px]">
                {dayItems.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onItemClick(item)}
                    className="p-3 rounded-md bg-card hover:bg-accent/50 border border-border/40 cursor-pointer transition-colors"
                  >
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
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
