import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { IndustryConfig } from "./usePromptGeneration";

export function useIndustryConfig(organizationId: string | null) {
  const [industryConfig, setIndustryConfig] = useState<IndustryConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadIndustryConfig = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("organizations")
          .select("brand_config")
          .eq("id", organizationId)
          .single();

        if (error) throw error;

        const config = (data?.brand_config as any)?.industry_config;
        if (config) {
          setIndustryConfig(config);
        }
      } catch (error) {
        console.error("Error loading industry config:", error);
      } finally {
        setLoading(false);
      }
    };

    loadIndustryConfig();
  }, [organizationId]);

  return { industryConfig, loading };
}

export const isFragranceIndustry = (industryId: string | undefined) => 
  industryId === "fragrance";
