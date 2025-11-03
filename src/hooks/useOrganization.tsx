import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

interface Organization {
  id: string;
  name: string;
  industry?: string;
  settings?: any;
  brand_config?: any;
}

interface OrganizationMembership {
  organization_id: string;
  role: string;
}

export function useOrganization() {
  const { user } = useAuthContext();

  const { data: membership, isLoading: membershipLoading } = useQuery({
    queryKey: ["organization-membership", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("organization_members")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as OrganizationMembership | null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const { data: organization, isLoading: orgLoading } = useQuery({
    queryKey: ["organization", membership?.organization_id],
    queryFn: async () => {
      if (!membership?.organization_id) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("id, name, settings, brand_config")
        .eq("id", membership.organization_id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!membership?.organization_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  return {
    organizationId: membership?.organization_id ?? null,
    organization: organization ?? null,
    role: membership?.role ?? null,
    isLoading: membershipLoading || orgLoading,
  };
}
