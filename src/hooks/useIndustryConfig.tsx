import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { IndustryConfig } from "./usePromptGeneration";
import { isEcommerceIndustry } from "@/config/industryTemplates";
import { useAuth } from "./useAuth";
import { logger } from "@/lib/logger";

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
          logger.error("Error loading industry config:", error);
          setLoading(false);
          return;
        }

        const config = (data?.brand_config as any)?.industry_config || {
          id: (data?.brand_config as any)?.industry,
          name: null
        };
        if (config?.id) {
          setIndustryConfig(config);
          logger.debug("✅ Industry config loaded:", config);
        }
      } catch (error) {
        logger.error("Error loading industry config:", error);
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
        logger.debug("⚠️ No user ID found");
        setLoading(false);
        return;
      }

      logger.debug("🔍 Looking for org for user:", user.id);

      try {
        // Step 1: Check organization_members
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (memberError && memberError.code !== 'PGRST116') {
          logger.error("❌ Error checking organization_members:", memberError);
        }

        if (memberData?.organization_id) {
          logger.debug("✅ Found organization via membership:", memberData.organization_id);
          setOrgId(memberData.organization_id);
          localStorage.setItem('current_org_id', memberData.organization_id);
          setLoading(false);
          return;
        }

        // Step 2: Fallback - check if user created an organization
        logger.debug("🔍 No membership found, checking organizations created by user...");
        const { data: orgData, error: orgError } = await supabase
          .from("organizations")
          .select("id")
          .eq("created_by", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (orgError && orgError.code !== 'PGRST116') {
          logger.error("❌ Error checking organizations:", orgError);
        }

        if (orgData?.id) {
          logger.debug("✅ Found organization via created_by:", orgData.id);
          
          // Auto-create the missing membership entry
          const { error: upsertError } = await supabase
            .from("organization_members")
            .upsert({
              organization_id: orgData.id,
              user_id: user.id,
              role: "owner",
            }, {
              onConflict: "organization_id,user_id",
              ignoreDuplicates: true
            });

          if (upsertError) {
            logger.warn("⚠️ Could not auto-create membership:", upsertError);
          } else {
            logger.debug("✅ Auto-created missing organization membership");
          }

          setOrgId(orgData.id);
          localStorage.setItem('current_org_id', orgData.id);
          setLoading(false);
          return;
        }

        // Step 3: No organization exists - user needs onboarding
        logger.debug("⚠️ No organization found for user - needs onboarding");
        localStorage.removeItem('current_org_id');
        setOrgId(null);
      } catch (error) {
        logger.error("❌ Error loading organization ID:", error);
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
    logger.debug("⏳ Still loading organization...");
    return { isEcommerce: false, loading: true };
  }

  // If no org found, user is not e-commerce
  if (!orgId) {
    logger.debug("⚠️ No organization ID - not e-commerce");
    return { isEcommerce: false, loading: false };
  }

  // If still loading config, return loading true
  if (configLoading) {
    logger.debug("⏳ Still loading config...");
    return { isEcommerce: false, loading: true };
  }

  const isEcomm = isEcommerceIndustry(industryConfig?.id);
  logger.debug("🎯 Final e-commerce check:", { 
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
