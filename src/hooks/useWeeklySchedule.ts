import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { startOfWeek, endOfWeek, addDays } from "date-fns";

export interface ScheduledContentItem {
  id: string;
  title: string;
  content_type: string;
  scheduled_date: string;
  scheduled_time: string | null;
  platform: string | null;
  status: string;
}

export interface WeekDay {
  date: Date;
  dateString: string;
  dayName: string;
  dateNumber: number;
  isToday: boolean;
  scheduledContent: ScheduledContentItem[];
}

export function useWeeklySchedule(weekOffset = 0) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["weekly-schedule", user?.id, weekOffset],
    queryFn: async () => {
      if (!user) throw new Error("No user");

      // Get organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!orgMember?.organization_id) return [];

      // Calculate week boundaries
      const today = new Date();
      const targetWeek = addDays(today, weekOffset * 7);
      const weekStart = startOfWeek(targetWeek, { weekStartsOn: 0 }); // Sunday
      const weekEnd = endOfWeek(targetWeek, { weekStartsOn: 0 });

      // Query scheduled content for the week
      const { data: scheduledContent, error } = await supabase
        .from("scheduled_content")
        .select("*")
        .eq("organization_id", orgMember.organization_id)
        .gte("scheduled_date", weekStart.toISOString().split("T")[0])
        .lte("scheduled_date", weekEnd.toISOString().split("T")[0])
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });

      if (error) throw error;

      // Build week structure
      const weekDays: WeekDay[] = [];
      const todayString = today.toISOString().split("T")[0];

      for (let i = 0; i < 7; i++) {
        const date = addDays(weekStart, i);
        const dateString = date.toISOString().split("T")[0];
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const dateNumber = date.getDate();

        weekDays.push({
          date,
          dateString,
          dayName,
          dateNumber,
          isToday: dateString === todayString,
          scheduledContent: scheduledContent?.filter((item) => item.scheduled_date === dateString) || [],
        });
      }

      return weekDays;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
