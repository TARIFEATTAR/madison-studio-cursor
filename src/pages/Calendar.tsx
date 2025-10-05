import { useState, useEffect } from "react";
import { addMonths, subMonths } from "date-fns";
import { CalendarHeader } from "@/components/calendar/CalendarHeader";
import { MonthView } from "@/components/calendar/MonthView";
import { WeekView } from "@/components/calendar/WeekView";
import { ScheduleModal } from "@/components/calendar/ScheduleModal";
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
      <div className="max-w-7xl mx-auto space-y-6">
        <CalendarHeader
          currentDate={currentDate}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onPreviousMonth={handlePreviousMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        <div className="fade-enter">
          <Button onClick={handleNewSchedule} className="gap-2">
            <Plus className="w-4 h-4" />
            Schedule Content
          </Button>
        </div>

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
