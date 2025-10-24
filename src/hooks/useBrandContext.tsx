import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface BrandContext {
  brandName: string | null;
  loading: boolean;
  error: Error | null;
}

export function useBrandContext(organizationId: string | null): BrandContext {
  const [brandName, setBrandName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    const fetchBrandContext = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("organizations")
          .select("brand_config")
          .eq("id", organizationId)
          .single();

        if (fetchError) throw fetchError;

        const brandConfig = data?.brand_config as any;
        const name = brandConfig?.brandName || null;
        
        setBrandName(name);
      } catch (err) {
        console.error("Error fetching brand context:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrandContext();
  }, [organizationId]);

  return { brandName, loading, error };
}
