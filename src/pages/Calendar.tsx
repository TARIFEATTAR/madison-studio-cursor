import { useState, useEffect } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { ScheduleModal } from "@/components/calendar/ScheduleModal";
import { GoogleCalendarConnect } from "@/components/calendar/GoogleCalendarConnect";
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDipWeekCalculation } from "@/hooks/useDipWeekCalculation";
import { toast } from "@/hooks/use-toast";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [scheduledItems, setScheduledItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const dipWeekInfo = useDipWeekCalculation(currentDate);

  useEffect(() => {
    fetchScheduledContent();
  }, [currentDate]);

  const fetchScheduledContent = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("scheduled_content")
        .select("*")
        .order("scheduled_date", { ascending: true });

      if (error) throw error;
      setScheduledItems(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading schedule",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedItem(null);
    setScheduleModalOpen(true);
  };

  const handleItemClick = (item: any) => {
    setSelectedItem(item);
    setSelectedDate(undefined);
    setScheduleModalOpen(true);
  };

  const handleNewSchedule = () => {
    setSelectedDate(new Date());
    setSelectedItem(null);
    setScheduleModalOpen(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    const { draggableId, destination } = result;

    if (!destination) return;

    const itemId = draggableId;
    const newDate = new Date(destination.droppableId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Find the item being moved
      const item = scheduledItems.find(i => i.id === itemId);
      if (!item) return;

      // Update the database
      const { error } = await supabase
        .from("scheduled_content")
        .update({ scheduled_date: format(newDate, "yyyy-MM-dd") })
        .eq("id", itemId);

      if (error) throw error;

      // Check if Google Calendar sync is enabled
      const { data: syncSettings } = await supabase
        .from('google_calendar_sync')
        .select('sync_enabled')
        .eq('user_id', user.id)
        .maybeSingle();

      // Sync to Google Calendar if enabled
      if (syncSettings?.sync_enabled && item.google_event_id) {
        await supabase.functions.invoke('sync-to-google-calendar', {
          body: {
            operation: 'update',
            scheduledContentId: itemId,
            eventData: {
              title: item.title,
              date: format(newDate, 'yyyy-MM-dd'),
              time: item.scheduled_time || undefined,
              notes: item.notes || undefined,
              platform: item.platform || undefined,
            },
            googleEventId: item.google_event_id,
          },
        });

        toast({
          title: "Moved",
          description: "Event moved and synced to Google Calendar",
        });
      } else {
        toast({
          title: "Moved",
          description: "Event moved successfully",
        });
      }

      // Refresh the calendar
      fetchScheduledContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-[1920px] mx-auto">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        <div className="mt-6 fade-enter space-y-6">
          <GoogleCalendarConnect />
          
          <Button onClick={handleNewSchedule} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Content
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
            {/* Calendar Section */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading calendar...</div>
                </div>
              ) : (
                <div className="fade-enter">
                  {viewMode === "month" ? (
                    <MonthView
                      currentDate={currentDate}
                      scheduledItems={scheduledItems}
                      onDayClick={handleDayClick}
                      onItemClick={handleItemClick}
                    />
                  ) : (
                    <WeekView
                      currentDate={currentDate}
                      scheduledItems={scheduledItems}
                      dipWeekInfo={dipWeekInfo}
                      onItemClick={handleItemClick}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Sidebar Section */}
            <div className="lg:sticky lg:top-24 h-fit max-h-[calc(100vh-7rem)] overflow-hidden">
              <CalendarSidebar />
            </div>
          </div>
        </DragDropContext>

        <ScheduleModal
          open={scheduleModalOpen}
          onOpenChange={setScheduleModalOpen}
          selectedDate={selectedDate}
          itemToEdit={selectedItem}
          onSuccess={fetchScheduledContent}
        />
      </div>
    </div>
  );
};

export default Calendar;
