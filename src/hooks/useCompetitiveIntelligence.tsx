import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Competitor {
  id: string;
  competitor_name: string;
  competitor_url: string;
  notes?: string;
  status: string;
  created_at: string;
}

export interface CompetitiveInsight {
  id: string;
  competitor_name: string;
  insight_type: string;
  finding: string;
  source_url?: string;
  discovered_at: string;
  is_read: boolean;
}

export interface AgentPreferences {
  id: string;
  competitive_intelligence_enabled: boolean;
  last_scan_at?: string;
  scan_frequency: string;
}

export function useCompetitiveIntelligence() {
  const { user } = useAuth();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<CompetitiveInsight[]>([]);
  const [preferences, setPreferences] = useState<AgentPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user?.id]);

  const loadData = async () => {
    try {
      // Get organization ID
      const { data: memberData } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user?.id)
        .single();

      if (!memberData?.organization_id) {
        setLoading(false);
        return;
      }

      setOrganizationId(memberData.organization_id);

      // Load preferences
      const { data: prefData } = await supabase
        .from("agent_preferences")
        .select("*")
        .eq("organization_id", memberData.organization_id)
        .maybeSingle();

      setPreferences(prefData);

      // Load competitors if enabled
      if (prefData?.competitive_intelligence_enabled) {
        const { data: competitorData } = await supabase
          .from("competitor_watchlist")
          .select("*")
          .eq("organization_id", memberData.organization_id)
          .eq("status", "active")
          .order("created_at", { ascending: false });

        setCompetitors(competitorData || []);

        // Load insights
        const { data: insightData } = await supabase
          .from("competitive_insights")
          .select("*")
          .eq("organization_id", memberData.organization_id)
          .order("discovered_at", { ascending: false })
          .limit(50);

        setInsights(insightData || []);
      }
    } catch (error) {
      console.error("Error loading competitive intelligence data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAgent = async (enabled: boolean) => {
    if (!organizationId) return;

    try {
      const { data: existing } = await supabase
        .from("agent_preferences")
        .select("id")
        .eq("organization_id", organizationId)
        .maybeSingle();

      if (existing) {
        await supabase
          .from("agent_preferences")
          .update({ competitive_intelligence_enabled: enabled })
          .eq("organization_id", organizationId);
      } else {
        await supabase
          .from("agent_preferences")
          .insert({
            organization_id: organizationId,
            competitive_intelligence_enabled: enabled,
          });
      }

      toast.success(
        enabled
          ? "Competitive intelligence agent enabled"
          : "Competitive intelligence agent disabled"
      );

      await loadData();
    } catch (error) {
      console.error("Error toggling agent:", error);
      toast.error("Failed to update agent settings");
    }
  };

  const addCompetitor = async (name: string, url: string, notes?: string) => {
    if (!organizationId) return;

    try {
      await supabase.from("competitor_watchlist").insert({
        organization_id: organizationId,
        competitor_name: name,
        competitor_url: url,
        notes,
      });

      toast.success("Competitor added");
      await loadData();
    } catch (error) {
      console.error("Error adding competitor:", error);
      toast.error("Failed to add competitor");
    }
  };

  const removeCompetitor = async (id: string) => {
    try {
      await supabase
        .from("competitor_watchlist")
        .update({ status: "inactive" })
        .eq("id", id);

      toast.success("Competitor removed");
      await loadData();
    } catch (error) {
      console.error("Error removing competitor:", error);
      toast.error("Failed to remove competitor");
    }
  };

  const triggerScan = async () => {
    try {
      toast.info("Starting competitor scan...");

      const { error } = await supabase.functions.invoke("competitive-intelligence");

      if (error) throw error;

      toast.success("Competitor scan completed");
      await loadData();
    } catch (error) {
      console.error("Error triggering scan:", error);
      toast.error("Failed to trigger scan");
    }
  };

  const markInsightAsRead = async (id: string) => {
    try {
      await supabase
        .from("competitive_insights")
        .update({ is_read: true })
        .eq("id", id);

      await loadData();
    } catch (error) {
      console.error("Error marking insight as read:", error);
    }
  };

  return {
    competitors,
    insights,
    preferences,
    loading,
    toggleAgent,
    addCompetitor,
    removeCompetitor,
    triggerScan,
    markInsightAsRead,
  };
}
