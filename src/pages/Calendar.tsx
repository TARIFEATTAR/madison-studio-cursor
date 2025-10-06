import { useState, useEffect } from "react";
import { addMonths, subMonths, format } from "date-fns";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { ScheduleModal } from "@/components/calendar/ScheduleModal";
import { CalendarSidebar } from "@/components/calendar/CalendarSidebar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useDipWeekCalculation } from "@/hooks/useDipWeekCalculation";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week">("month");
  const [scheduledItems, setScheduledItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);

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
    setIsDragging(false);
    const { draggableId, destination } = result;

    if (!destination) return;

    const itemId = draggableId;
    const newDateStr = destination.droppableId;

    // Find the item being moved
    const item = scheduledItems.find(i => i.id === itemId);
    if (!item) return;

    // Optimistic update - update UI immediately
    setScheduledItems(prev => 
      prev.map(i => i.id === itemId ? { ...i, scheduled_date: newDateStr } : i)
    );

    try {
      // Update database in background
      const { error } = await supabase
        .from("scheduled_content")
        .update({ scheduled_date: newDateStr })
        .eq("id", itemId);

      if (error) throw error;

      // Get user and sync settings in parallel
      const [{ data: { user } }, { data: syncSettings }] = await Promise.all([
        supabase.auth.getUser(),
        supabase
          .from('google_calendar_sync')
          .select('sync_enabled')
          .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
          .maybeSingle()
      ]);

      // Sync to Google Calendar if enabled (fire and forget)
      if (syncSettings?.sync_enabled && item.google_event_id && user) {
        supabase.functions.invoke('sync-to-google-calendar', {
          body: {
            operation: 'update',
            scheduledContentId: itemId,
            eventData: {
              title: item.title,
              date: newDateStr,
              time: item.scheduled_time || undefined,
              notes: item.notes || undefined,
              platform: item.platform || undefined,
            },
            googleEventId: item.google_event_id,
          },
        }).catch(err => console.error('Google sync failed:', err));
      }

      toast({
        title: "Moved",
        description: syncSettings?.sync_enabled ? "Event moved and syncing to Google Calendar" : "Event moved successfully",
      });
    } catch (error: any) {
      // Revert optimistic update on error
      setScheduledItems(prev => 
        prev.map(i => i.id === itemId ? { ...i, scheduled_date: item.scheduled_date } : i)
      );
      
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

        <div className="mt-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={handleNewSchedule} className="gap-2">
                <Plus className="w-4 h-4" />
                Schedule Content
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Add new content to your calendar</p>
            </TooltipContent>
          </Tooltip>
        </div>

        <DragDropContext
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
        >
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-6">
            {/* Calendar Section */}
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-muted-foreground">Loading calendar...</div>
                </div>
              ) : (
                <div>
                  {viewMode === "month" ? (
                    <MonthView
                      currentDate={currentDate}
                      scheduledItems={scheduledItems}
                      onDayClick={handleDayClick}
                      onItemClick={handleItemClick}
                      isDragging={isDragging}
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
