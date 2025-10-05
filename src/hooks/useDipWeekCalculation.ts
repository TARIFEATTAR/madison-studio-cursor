import { useState, useEffect } from "react";
import { startOfWeek, differenceInWeeks } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export const useDipWeekCalculation = (date: Date) => {
  const [dipWeekInfo, setDipWeekInfo] = useState<{
    week_number: number;
    pillar: string;
    visual_world: string;
    core_lexicon: string[];
    start_date: string;
    end_date: string;
  } | null>(null);

  useEffect(() => {
    const fetchDipWeek = async () => {
      // Get the start of the week for the given date
      const weekStart = startOfWeek(date);

      // Try to find the DIP week in the database
      const { data, error } = await supabase
        .from("dip_week_calendar")
        .select("*")
        .lte("start_date", weekStart.toISOString().split("T")[0])
        .gte("end_date", weekStart.toISOString().split("T")[0])
        .maybeSingle();

      if (data) {
        setDipWeekInfo(data);
      } else {
        // Calculate week number based on a reference date (e.g., start of year)
        const yearStart = new Date(date.getFullYear(), 0, 1);
        const weekNumber = differenceInWeeks(weekStart, startOfWeek(yearStart)) + 1;
        
        // Calculate DIP week (1-4 rotation)
        const dipWeek = ((weekNumber - 1) % 4) + 1;
        
        // Default pillar mapping
        const pillarMap: Record<number, string> = {
          1: "Identity",
          2: "Memory", 
          3: "Remembrance",
          4: "Cadence",
        };

        const worldMap: Record<number, string> = {
          1: "Silk Road",
          2: "Maritime",
          3: "Imperial",
          4: "Royal Court",
        };

        setDipWeekInfo({
          week_number: dipWeek,
          pillar: pillarMap[dipWeek],
          visual_world: worldMap[dipWeek],
          core_lexicon: [],
          start_date: weekStart.toISOString().split("T")[0],
          end_date: new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        });
      }
    };

    fetchDipWeek();
  }, [date]);

  return dipWeekInfo;
};
