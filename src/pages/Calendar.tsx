import { useState, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
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
