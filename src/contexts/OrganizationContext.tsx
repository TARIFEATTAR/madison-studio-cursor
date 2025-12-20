// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZATION CONTEXT
// Shared organization state to avoid multiple useOnboarding calls
// ═══════════════════════════════════════════════════════════════════════════════

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface OrganizationContextValue {
  organizationId: string | null;
  isLoading: boolean;
  error: Error | null;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      setOrganizationId(null);
      setIsLoading(false);
      hasFetchedRef.current = false;
      return;
    }

    // Only fetch once per user session
    if (hasFetchedRef.current) {
      return;
    }

    const fetchOrganization = async () => {
      try {
        hasFetchedRef.current = true;
        setIsLoading(true);

        // Try to get from organization_members first (faster, includes invited users)
        const { data: memberData, error: memberError } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(1)
          .single();

        if (memberData?.organization_id) {
          setOrganizationId(memberData.organization_id);
          setIsLoading(false);
          return;
        }

        // Fallback: check if user owns an organization
        if (memberError) {
          const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .select("id")
            .eq("created_by", user.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

          if (orgData?.id) {
            setOrganizationId(orgData.id);
          } else if (orgError && orgError.code !== "PGRST116") {
            console.error("Error fetching organization:", orgError);
            setError(new Error(orgError.message));
          }
        }
      } catch (err) {
        console.error("Error in OrganizationProvider:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [user]);

  return (
    <OrganizationContext.Provider value={{ organizationId, isLoading, error }}>
      {children}
    </OrganizationContext.Provider>
  );
}

/**
 * Hook to get the current organization ID.
 * This is a lightweight alternative to useOnboarding when you only need the org ID.
 */
export function useOrganizationId() {
  const context = useContext(OrganizationContext);
  
  if (!context) {
    throw new Error("useOrganizationId must be used within OrganizationProvider");
  }
  
  return context;
}
