import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface BrandHealthData {
  id: string;
  organization_id: string;
  completeness_score: number;
  gap_analysis: any;
  recommendations: any[];
  last_analyzed_at: string;
}

export function useBrandHealth() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: brandHealth, isLoading } = useQuery({
    queryKey: ["brand-health", user?.id],
    queryFn: async (): Promise<BrandHealthData | null> => {
      if (!user) return null;

      // Get user's organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!orgMember) return null;

      // Fetch brand health
      const { data, error } = await supabase
        .from("brand_health")
        .select("*")
        .eq("organization_id", orgMember.organization_id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching brand health:", error);
        return null;
      }

      return data as BrandHealthData;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const analyzeBrandHealth = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Get user's organization
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) throw new Error("Organization not found");

      const { data, error } = await supabase.functions.invoke("analyze-brand-health", {
        body: { organizationId: orgMember.organization_id },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.healthAnalysis;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand-health", user?.id] });
      queryClient.refetchQueries({ queryKey: ["brand-health", user?.id] });
      toast.success("Brand health analysis complete!");
    },
    onError: (error: Error) => {
      console.error("Error analyzing brand health:", error);
      toast.error("Failed to analyze brand health");
    },
  });

  return {
    brandHealth,
    isLoading,
    analyzeBrandHealth: analyzeBrandHealth.mutate,
    isAnalyzing: analyzeBrandHealth.isPending,
  };
}