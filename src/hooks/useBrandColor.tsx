import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useBrandColor() {
  const { user } = useAuth();
  const [brandColor, setBrandColor] = useState<string>("#B8956A"); // Default aged-brass
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchBrandColor = async () => {
      try {
        const { data: memberData } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!memberData?.organization_id) {
          setIsLoading(false);
          return;
        }

        const { data: orgData } = await supabase
          .from("organizations")
          .select("brand_config")
          .eq("id", memberData.organization_id)
          .maybeSingle();

        if (orgData?.brand_config) {
          const config = orgData.brand_config as { primaryColor?: string };
          if (config.primaryColor) {
            setBrandColor(config.primaryColor);
          }
        }
      } catch (error) {
        console.error("Error fetching brand color:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandColor();
  }, [user]);

  return { brandColor, isLoading };
}
