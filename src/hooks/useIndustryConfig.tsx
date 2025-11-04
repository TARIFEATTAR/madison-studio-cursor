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
          .maybeSingle();

        if (error) {
          console.error("Error loading industry config:", error);
          setLoading(false);
          return;
        }

        const config = (data?.brand_config as any)?.industry_config || {
          id: (data?.brand_config as any)?.industry,
          name: null
        };
        if (config?.id) {
          setIndustryConfig(config);
          console.log("✅ Industry config loaded:", config);
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
  // Check localStorage first for instant initial render
  const cachedOrgId = typeof window !== 'undefined' ? localStorage.getItem('current_org_id') : null;
  const [orgId, setOrgId] = useState<string | null>(cachedOrgId);
  const [loading, setLoading] = useState(!cachedOrgId); // Only loading if no cache

  useEffect(() => {
    const loadOrganizationId = async () => {
      if (!user?.id) {
        console.log("⚠️ No user ID found");
        setLoading(false);
        return;
      }

      console.log("🔍 Looking for org for user:", user.id);

      try {
        const { data, error } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (error) {
          console.error("❌ Error loading organization ID:", error);
          setLoading(false);
          return;
        }

        if (data?.organization_id) {
          console.log("✅ Found organization:", data.organization_id);
          setOrgId(data.organization_id);
          localStorage.setItem('current_org_id', data.organization_id);
        } else {
          console.log("⚠️ No organization found for user");
          // Clear cache if no org found
          localStorage.removeItem('current_org_id');
          setOrgId(null);
        }
      } catch (error) {
        console.error("❌ Error loading organization ID:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrganizationId();
  }, [user?.id]); // Only run when user changes

  return { orgId, loading };
}

export function useIsEcommerceOrg() {
  const { orgId, loading: orgLoading } = useCurrentOrganizationId();
  const { industryConfig, loading: configLoading } = useIndustryConfig(orgId);

  // If still loading org, return loading true
  if (orgLoading) {
    console.log("⏳ Still loading organization...");
    return { isEcommerce: false, loading: true };
  }

  // If no org found, user is not e-commerce
  if (!orgId) {
    console.log("⚠️ No organization ID - not e-commerce");
    return { isEcommerce: false, loading: false };
  }

  // If still loading config, return loading true
  if (configLoading) {
    console.log("⏳ Still loading config...");
    return { isEcommerce: false, loading: true };
  }

  const isEcomm = isEcommerceIndustry(industryConfig?.id);
  console.log("🎯 Final e-commerce check:", { 
    industryId: industryConfig?.id, 
    isEcommerce: isEcomm 
  });

  // Finally check if e-commerce
  return {
    isEcommerce: isEcomm,
    loading: false
  };
}

export const isFragranceIndustry = (industryId: string | undefined) => 
  industryId === "fragrance";
