import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "@/hooks/use-toast";

export interface ContentGoals {
  weekly_creation: number;
  weekly_publishing: number;
  weekly_scheduling: number;
}

export interface StreakData {
  current: number;
  longest: number;
  last_activity_date: string | null;
  grace_period_used: boolean;
  vacation_mode: {
    active: boolean;
    start_date: string | null;
    end_date: string | null;
  };
}

export interface AccoladeProgress {
  current: number;
  target: number;
  unlocked_at: string | null;
}

export interface GamificationData {
  streak: StreakData;
  accolades: {
    earned: string[];
    progress: Record<string, AccoladeProgress>;
  };
  preferences: {
    show_celebrations: boolean;
    notification_level: 'all' | 'milestones' | 'off';
  };
}

const DEFAULT_GOALS: ContentGoals = {
  weekly_creation: 10,
  weekly_publishing: 5,
  weekly_scheduling: 7,
};

const DEFAULT_STREAK: StreakData = {
  current: 0,
  longest: 0,
  last_activity_date: null,
  grace_period_used: false,
  vacation_mode: {
    active: false,
    start_date: null,
    end_date: null,
  },
};

const DEFAULT_GAMIFICATION: GamificationData = {
  streak: DEFAULT_STREAK,
  accolades: {
    earned: [],
    progress: {},
  },
  preferences: {
    show_celebrations: true,
    notification_level: 'all',
  },
};

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["content-goals", user?.id],
    queryFn: async (): Promise<ContentGoals> => {
      if (!user) return DEFAULT_GOALS;

      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!orgMember) return DEFAULT_GOALS;

      const { data: org } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", orgMember.organization_id)
        .single();

      const settings = org?.settings as any;
      return settings?.content_goals || DEFAULT_GOALS;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useGamificationData() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["gamification-data", user?.id],
    queryFn: async (): Promise<GamificationData> => {
      if (!user) return DEFAULT_GAMIFICATION;

      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!orgMember) return DEFAULT_GAMIFICATION;

      const { data: org } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", orgMember.organization_id)
        .single();

      const settings = org?.settings as any;
      return settings?.gamification || DEFAULT_GAMIFICATION;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpdateGoals() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newGoals: ContentGoals) => {
      if (!user) throw new Error("No user found");

      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      const { data: org } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", orgMember.organization_id)
        .single();

      const currentSettings = (org?.settings as any) || {};

      const { error } = await supabase
        .from("organizations")
        .update({
          settings: {
            ...currentSettings,
            content_goals: newGoals,
          },
        })
        .eq("id", orgMember.organization_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["content-goals"] });
      toast({
        title: "Goals Updated",
        description: "Your editorial targets have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update goals. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateGamification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<GamificationData>) => {
      if (!user) throw new Error("No user found");

      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      const { data: org } = await supabase
        .from("organizations")
        .select("settings")
        .eq("id", orgMember.organization_id)
        .single();

      const currentSettings = (org?.settings as any) || {};
      const currentGamification = currentSettings?.gamification || DEFAULT_GAMIFICATION;

      const { error } = await supabase
        .from("organizations")
        .update({
          settings: {
            ...currentSettings,
            gamification: {
              ...currentGamification,
              ...updates,
            },
          },
        })
        .eq("id", orgMember.organization_id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gamification-data"] });
    },
  });
}
