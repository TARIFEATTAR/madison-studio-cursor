import { format, parseISO, isSameDay } from "date-fns";
import { Calendar, Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScheduledItem {
  id: string;
  title: string;
  scheduled_date: string;
  scheduled_time?: string;
  platform?: string;
  status: string;
  google_event_id?: string;
  notes?: string;
}

interface AgendaViewProps {
  currentDate: Date;
  scheduledItems: ScheduledItem[];
  onItemClick: (item: ScheduledItem) => void;
}

const PLATFORM_COLORS: Record<string, string> = {
  Email: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  Twitter: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  LinkedIn: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  Blog: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

export const AgendaView = ({ currentDate, scheduledItems, onItemClick }: AgendaViewProps) => {
  // Group items by date
  const groupedByDate = scheduledItems.reduce((acc, item) => {
    const date = item.scheduled_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, ScheduledItem[]>);

  // Sort dates
  const sortedDates = Object.keys(groupedByDate).sort();

  if (sortedDates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Calendar className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">No scheduled content</h3>
        <p className="text-base text-muted-foreground text-center">
          Tap the + button to schedule your first piece of content
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {sortedDates.map((dateStr) => {
        const date = parseISO(dateStr);
        const items = groupedByDate[dateStr].sort((a, b) => {
          if (!a.scheduled_time) return 1;
          if (!b.scheduled_time) return -1;
          return a.scheduled_time.localeCompare(b.scheduled_time);
        });

        const isToday = isSameDay(date, new Date());

        return (
          <div key={dateStr} className="space-y-3">
            {/* Date Header */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 pb-2">
              <div className="flex items-center gap-3">
                <div className={`text-2xl font-semibold ${isToday ? 'text-primary' : 'text-foreground'}`}>
                  {format(date, "d")}
                </div>
                <div>
                  <div className={`text-lg font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                    {format(date, "EEEE")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(date, "MMMM yyyy")}
                  </div>
                </div>
                {isToday && (
                  <Badge className="ml-auto">Today</Badge>
                )}
              </div>
            </div>

            {/* Events for this date */}
            <div className="space-y-2">
              {items.map((item) => (
                <Card
                  key={item.id}
                  onClick={() => onItemClick(item)}
                  className="p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98] min-h-[72px]"
                >
                  <div className="flex items-start gap-3">
                    {/* Time indicator */}
                    <div className="flex-shrink-0 w-16 pt-1">
                      {item.scheduled_time ? (
                        <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                          <Clock className="w-4 h-4" />
                          {format(parseISO(`2000-01-01T${item.scheduled_time}`), "h:mm a")}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground">All day</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-medium text-foreground mb-1 line-clamp-2">
                        {item.title}
                      </h4>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {item.platform && (
                          <Badge 
                            variant="secondary" 
                            className={PLATFORM_COLORS[item.platform] || ""}
                          >
                            <MapPin className="w-3 h-3 mr-1" />
                            {item.platform}
                          </Badge>
                        )}
                        {item.google_event_id && (
                          <Badge variant="outline" className="text-xs">
                            Synced
                          </Badge>
                        )}
                      </div>

                      {item.notes && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
