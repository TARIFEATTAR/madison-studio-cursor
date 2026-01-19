import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { useOrganization } from "./useOrganization";

// Team role types - functional/departmental roles
export type TeamRole =
  | "founder"
  | "creative"
  | "compliance"
  | "marketing"
  | "operations"
  | "finance"
  | "general";

// Section access levels
export type AccessLevel = "full" | "view" | "hidden";

// Role capabilities interface
export interface RoleCapabilities {
  teamRole: TeamRole;
  sections: {
    info: AccessLevel;
    media: AccessLevel;
    formulation: AccessLevel;
    ingredients: AccessLevel;
    compliance: AccessLevel;
    packaging: AccessLevel;
    marketing: AccessLevel;
    analytics: AccessLevel;
  };
  defaultExpandedSections: string[];
  dashboardWidgets: string[];
  priorityFocus: string;
}

// Default capabilities for fallback
const DEFAULT_CAPABILITIES: RoleCapabilities = {
  teamRole: "general",
  sections: {
    info: "view",
    media: "view",
    formulation: "view",
    ingredients: "view",
    compliance: "view",
    packaging: "view",
    marketing: "view",
    analytics: "view",
  },
  defaultExpandedSections: ["info"],
  dashboardWidgets: ["recent_activity", "quick_links"],
  priorityFocus: "general",
};

// Capabilities mapping when database isn't available yet
const ROLE_CAPABILITIES_FALLBACK: Record<TeamRole, RoleCapabilities> = {
  founder: {
    teamRole: "founder",
    sections: {
      info: "full",
      media: "full",
      formulation: "full",
      ingredients: "full",
      compliance: "full",
      packaging: "full",
      marketing: "full",
      analytics: "full",
    },
    defaultExpandedSections: ["info", "analytics"],
    dashboardWidgets: ["pipeline_overview", "brand_health", "revenue_metrics", "team_activity"],
    priorityFocus: "business_growth",
  },
  creative: {
    teamRole: "creative",
    sections: {
      info: "view",
      media: "full",
      formulation: "view",
      ingredients: "view",
      compliance: "hidden",
      packaging: "view",
      marketing: "full",
      analytics: "view",
    },
    defaultExpandedSections: ["media", "marketing"],
    dashboardWidgets: ["content_queue", "review_needed", "asset_library", "inspiration"],
    priorityFocus: "content_creation",
  },
  compliance: {
    teamRole: "compliance",
    sections: {
      info: "view",
      media: "view",
      formulation: "full",
      ingredients: "full",
      compliance: "full",
      packaging: "full",
      marketing: "hidden",
      analytics: "view",
    },
    defaultExpandedSections: ["ingredients", "compliance", "packaging"],
    dashboardWidgets: ["sds_status", "expiring_certs", "allergen_alerts", "regulatory_updates"],
    priorityFocus: "regulatory_compliance",
  },
  marketing: {
    teamRole: "marketing",
    sections: {
      info: "view",
      media: "full",
      formulation: "hidden",
      ingredients: "view",
      compliance: "hidden",
      packaging: "view",
      marketing: "full",
      analytics: "full",
    },
    defaultExpandedSections: ["marketing", "analytics"],
    dashboardWidgets: ["scheduled_posts", "platform_sync", "campaign_performance", "audience_growth"],
    priorityFocus: "marketing_campaigns",
  },
  operations: {
    teamRole: "operations",
    sections: {
      info: "view",
      media: "view",
      formulation: "view",
      ingredients: "view",
      compliance: "view",
      packaging: "full",
      marketing: "hidden",
      analytics: "view",
    },
    defaultExpandedSections: ["packaging", "info"],
    dashboardWidgets: ["inventory_status", "supplier_orders", "production_schedule", "shipping"],
    priorityFocus: "operations",
  },
  finance: {
    teamRole: "finance",
    sections: {
      info: "view",
      media: "hidden",
      formulation: "view",
      ingredients: "view",
      compliance: "view",
      packaging: "view",
      marketing: "hidden",
      analytics: "full",
    },
    defaultExpandedSections: ["info", "analytics"],
    dashboardWidgets: ["revenue_metrics", "cost_analysis", "margin_tracking", "billing"],
    priorityFocus: "financial_health",
  },
  general: DEFAULT_CAPABILITIES,
};

// Role display names and colors
export const TEAM_ROLE_CONFIG: Record<TeamRole, { label: string; color: string; icon: string }> = {
  founder: { label: "Founder", color: "bg-primary text-primary-foreground", icon: "Crown" },
  creative: { label: "Creative", color: "bg-purple-100 text-purple-800", icon: "Palette" },
  compliance: { label: "Compliance", color: "bg-blue-100 text-blue-800", icon: "Shield" },
  marketing: { label: "Marketing", color: "bg-green-100 text-green-800", icon: "Megaphone" },
  operations: { label: "Operations", color: "bg-orange-100 text-orange-800", icon: "Settings" },
  finance: { label: "Finance", color: "bg-yellow-100 text-yellow-800", icon: "DollarSign" },
  general: { label: "Team Member", color: "bg-muted text-muted-foreground", icon: "User" },
};

/**
 * Hook to get user's team role and capabilities
 */
export function useUserRole() {
  const { user } = useAuthContext();
  const { organizationId, role: permissionRole } = useOrganization();

  // Fetch team role from organization_members
  const { data: teamRoleData, isLoading: roleLoading } = useQuery({
    queryKey: ["team-role", organizationId, user?.id],
    queryFn: async () => {
      if (!organizationId || !user?.id) return null;

      const { data, error } = await supabase
        .from("organization_members")
        .select("team_role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .maybeSingle();

      // If team_role column doesn't exist yet, return null gracefully
      if (error) {
        if (error.code === "42703") {
          // Column doesn't exist - migration not applied
          return null;
        }
        console.warn("Error fetching team role:", error);
        return null;
      }

      return data?.team_role as TeamRole | null;
    },
    enabled: !!organizationId && !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });

  // Determine effective team role
  // Owners default to founder, others default to general
  const effectiveRole: TeamRole = teamRoleData ||
    (permissionRole === "owner" ? "founder" : "general");

  // Get capabilities (use fallback for now, can enhance with DB fetch later)
  const capabilities = ROLE_CAPABILITIES_FALLBACK[effectiveRole] || DEFAULT_CAPABILITIES;

  // DEBUG: Log role information to help diagnose permission issues
  console.log("[useUserRole] Role check:", {
    permissionRole,
    teamRoleData,
    effectiveRole,
    isLoading: roleLoading,
    organizationId,
    userId: user?.id,
  });

  // Owners always get full access regardless of team role
  const isOwnerOrFounder = permissionRole === "owner" || effectiveRole === "founder";

  // Helper functions
  const canEdit = (section: keyof RoleCapabilities["sections"]): boolean => {
    // Owners always have edit access
    if (isOwnerOrFounder) return true;
    return capabilities.sections[section] === "full";
  };

  const canView = (section: keyof RoleCapabilities["sections"]): boolean => {
    // Owners always have view access
    if (isOwnerOrFounder) return true;
    return capabilities.sections[section] !== "hidden";
  };

  const isHidden = (section: keyof RoleCapabilities["sections"]): boolean => {
    // Nothing is hidden from owners
    if (isOwnerOrFounder) return false;
    return capabilities.sections[section] === "hidden";
  };

  const getAccessLevel = (section: keyof RoleCapabilities["sections"]): AccessLevel => {
    // Owners always have full access
    if (isOwnerOrFounder) return "full";
    return capabilities.sections[section];
  };

  return {
    // Role info
    teamRole: effectiveRole,
    permissionRole,
    roleConfig: TEAM_ROLE_CONFIG[effectiveRole],

    // Capabilities
    capabilities,

    // Helper functions
    canEdit,
    canView,
    isHidden,
    getAccessLevel,

    // Loading state
    isLoading: roleLoading,

    // Is founder/owner (full access)
    isFounder: effectiveRole === "founder",
    isOwner: permissionRole === "owner",
    hasFullAccess: isOwnerOrFounder,
  };
}

/**
 * Hook to get capabilities for a specific role (useful for admin settings)
 */
export function useRoleCapabilities(role: TeamRole) {
  return ROLE_CAPABILITIES_FALLBACK[role] || DEFAULT_CAPABILITIES;
}
