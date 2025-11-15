import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

interface AgentPreferences {
  id?: string;
  organization_id: string;
  competitive_intelligence_enabled: boolean;
  scan_frequency: string;
  last_scan_at?: string;
}

interface Competitor {
  id?: string;
  organization_id: string;
  competitor_name: string;
  competitor_url: string;
  is_active: boolean;
}

interface CompetitiveInsight {
  id: string;
  organization_id: string;
  competitor_name: string;
  insight_type: string;
  finding: string;
  discovered_at: string;
  is_read: boolean;
}

export function useCompetitiveIntelligence(organizationId: string | null) {
  const [preferences, setPreferences] = useState<AgentPreferences | null>(null);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<CompetitiveInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (organizationId) {
      loadData();
    }
  }, [organizationId]);

  const loadData = async () => {
    if (!organizationId) return;

    try {
      setLoading(true);

      // Load preferences
      const { data: prefData, error: prefError } = await supabase
        .from('agent_preferences')
        .select('*')
        .eq('organization_id', organizationId)
        .maybeSingle();

      if (prefError) throw prefError;
      
      if (prefData) {
        setPreferences(prefData as AgentPreferences);
        
        // Load competitors if enabled
        if (prefData.competitive_intelligence_enabled) {
          const { data: compData, error: compError } = await supabase
            .from('competitor_watchlist')
            .select('*')
            .eq('organization_id', organizationId)
            .order('created_at', { ascending: false });

          if (compError) throw compError;
          setCompetitors(compData as Competitor[] || []);

          // Load insights
          const { data: insightData, error: insightError } = await supabase
            .from('competitive_insights')
            .select('*')
            .eq('organization_id', organizationId)
            .order('discovered_at', { ascending: false })
            .limit(20);

          if (insightError) throw insightError;
          setInsights(insightData as CompetitiveInsight[] || []);
        }
      }
    } catch (error: any) {
      logger.error('Error loading competitive intelligence data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleCompetitiveIntelligence = async (enabled: boolean) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('agent_preferences')
        .upsert({
          organization_id: organizationId,
          competitive_intelligence_enabled: enabled,
        }, { onConflict: 'organization_id' });

      if (error) throw error;
      
      await loadData();
      
      toast({
        title: enabled ? "Competitive Intelligence Enabled" : "Competitive Intelligence Disabled",
        description: enabled 
          ? "AI agent will now monitor your competitors" 
          : "AI agent monitoring has been disabled",
      });
    } catch (error: any) {
      logger.error('Error toggling competitive intelligence:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addCompetitor = async (name: string, url: string) => {
    if (!organizationId) return;

    try {
      const { error } = await supabase
        .from('competitor_watchlist')
        .insert({
          organization_id: organizationId,
          competitor_name: name,
          competitor_url: url,
          is_active: true
        });

      if (error) throw error;
      
      await loadData();
      
      toast({
        title: "Competitor Added",
        description: `Now monitoring ${name}`,
      });
    } catch (error: any) {
      logger.error('Error adding competitor:', error);
      toast({
        title: "Error adding competitor",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const removeCompetitor = async (competitorId: string) => {
    try {
      const { error } = await supabase
        .from('competitor_watchlist')
        .delete()
        .eq('id', competitorId);

      if (error) throw error;
      
      await loadData();
      
      toast({
        title: "Competitor Removed",
        description: "Competitor has been removed from watchlist",
      });
    } catch (error: any) {
      logger.error('Error removing competitor:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const markInsightAsRead = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('competitive_insights')
        .update({ is_read: true })
        .eq('id', insightId);

      if (error) throw error;
      
      setInsights(prev => 
        prev.map(insight => 
          insight.id === insightId 
            ? { ...insight, is_read: true } 
            : insight
        )
      );
    } catch (error: any) {
      logger.error('Error marking insight as read:', error);
    }
  };

  return {
    preferences,
    competitors,
    insights,
    loading,
    toggleCompetitiveIntelligence,
    addCompetitor,
    removeCompetitor,
    markInsightAsRead,
    refreshData: loadData
  };
}
