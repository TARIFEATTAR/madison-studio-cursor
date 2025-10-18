import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { IndustryConfig } from "./usePromptGeneration";
import { isEcommerceIndustry } from "@/config/industryTemplates";
import { useAuth } from "./useAuth";

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

export function useCurrentOrganizationId() {
  const { user } = useAuth();
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrganizationId = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      // Check localStorage cache first
      const cached = localStorage.getItem('current_org_id');
      if (cached) {
        setOrgId(cached);
      }

      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .single();

        if (error) throw error;

        if (data?.organization_id) {
          setOrgId(data.organization_id);
          localStorage.setItem('current_org_id', data.organization_id);
        }
      } catch (error) {
        console.error("Error loading organization ID:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationId();
  }, [user]);

  return { orgId, loading };
}

export function useIsEcommerceOrg() {
  const { orgId, loading: orgLoading } = useCurrentOrganizationId();
  const { industryConfig, loading: configLoading } = useIndustryConfig(orgId);

  return {
    isEcommerce: isEcommerceIndustry(industryConfig?.id),
    loading: orgLoading || configLoading
  };
}

export const isFragranceIndustry = (industryId: string | undefined) => 
  industryId === "fragrance";
