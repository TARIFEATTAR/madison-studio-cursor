import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useGamificationData, useUpdateGamification } from "./useGoals";
import { useEffect } from "react";

interface DailyActivity {
  date: string;
  hasActivity: boolean;
  goalsMetCount: number;
}

export function useStreakCalculation() {
  const { user } = useAuth();
  const { data: gamificationData } = useGamificationData();
  const updateGamification = useUpdateGamification();

  const streakQuery = useQuery({
    queryKey: ["streak-calculation", user?.id],
    queryFn: async (): Promise<{
      currentStreak: number;
      longestStreak: number;
      gracePeriodActive: boolean;
      dailyActivity: DailyActivity[];
    }> => {
      if (!user) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          gracePeriodActive: false,
          dailyActivity: [],
        };
      }

      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!orgMember) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          gracePeriodActive: false,
          dailyActivity: [],
        };
      }

      const organizationId = orgMember.organization_id;

      // Get last 30 days of activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);

      // Fetch all content created in last 30 days
      const { data: masterContent } = await supabase
        .from("master_content")
        .select("created_at, status")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { data: outputs } = await supabase
        .from("outputs")
        .select("created_at")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { data: derivatives } = await supabase
        .from("derivative_assets")
        .select("created_at")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
        .gte("created_at", thirtyDaysAgo.toISOString());

      const { data: scheduled } = await supabase
        .from("scheduled_content")
        .select("created_at")
        .eq("organization_id", organizationId)
        .gte("created_at", thirtyDaysAgo.toISOString());

      // Build daily activity map
      const dailyActivityMap: Record<string, DailyActivity> = {};
      
      const processActivity = (items: any[], type: 'creation' | 'publishing' | 'scheduling') => {
        items?.forEach(item => {
          const date = new Date(item.created_at);
          date.setHours(0, 0, 0, 0);
          const dateKey = date.toISOString().split('T')[0];
          
          if (!dailyActivityMap[dateKey]) {
            dailyActivityMap[dateKey] = {
              date: dateKey,
              hasActivity: false,
              goalsMetCount: 0,
            };
          }
          
          dailyActivityMap[dateKey].hasActivity = true;
        });
      };

      processActivity(masterContent || [], 'creation');
      processActivity(outputs || [], 'creation');
      processActivity(derivatives || [], 'creation');
      processActivity(scheduled || [], 'scheduling');

      // Calculate current streak
      let currentStreak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Generate last 7 days (Mon-Sun order)
      const last7Days: DailyActivity[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        
        last7Days.push(
          dailyActivityMap[dateKey] || {
            date: dateKey,
            hasActivity: false,
            goalsMetCount: 0,
          }
        );
      }
      
      const dailyActivity = last7Days;
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let checkDate = new Date(today);
      
      // Check if vacation mode is active
      const vacationMode = gamificationData?.streak.vacation_mode;
      const isOnVacation = vacationMode?.active && 
        vacationMode.start_date && 
        vacationMode.end_date &&
        new Date() >= new Date(vacationMode.start_date) &&
        new Date() <= new Date(vacationMode.end_date);

      if (isOnVacation) {
        // Preserve current streak during vacation
        currentStreak = gamificationData?.streak.current || 0;
      } else {
        // Normal streak calculation
        while (checkDate >= thirtyDaysAgo) {
          const dateKey = checkDate.toISOString().split('T')[0];
          const activity = dailyActivityMap[dateKey];
          
          if (activity?.hasActivity) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Check if grace period is active (missed yesterday but within 48 hours)
      const lastActivityDate = gamificationData?.streak.last_activity_date;
      const gracePeriodActive = lastActivityDate
        ? isWithinGracePeriod(new Date(lastActivityDate))
        : false;

      const longestStreak = Math.max(
        currentStreak,
        gamificationData?.streak.longest || 0
      );

      return {
        currentStreak,
        longestStreak,
        gracePeriodActive,
        dailyActivity, // Already filtered to last 7 days
      };
    },
    enabled: !!user && !!gamificationData,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Auto-update streak when it changes
  useEffect(() => {
    if (streakQuery.data && gamificationData) {
      const needsUpdate =
        streakQuery.data.currentStreak !== gamificationData.streak.current ||
        streakQuery.data.longestStreak !== gamificationData.streak.longest;

      if (needsUpdate) {
        updateGamification.mutate({
          streak: {
            ...gamificationData.streak,
            current: streakQuery.data.currentStreak,
            longest: streakQuery.data.longestStreak,
            last_activity_date: new Date().toISOString(),
          },
        });
      }
    }
  }, [streakQuery.data, gamificationData]);

  return streakQuery;
}

function isWithinGracePeriod(lastActivity: Date): boolean {
  const now = new Date();
  const hoursSinceActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60);
  return hoursSinceActivity <= 48;
}
