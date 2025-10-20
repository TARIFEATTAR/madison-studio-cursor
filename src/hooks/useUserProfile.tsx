import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function useUserProfile() {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, email")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching user profile:", error);
          setUserName(null);
        } else if (data) {
          // Priority: 1. full_name from onboarding, 2. email prefix, 3. fallback
          let rawName = "there";
          
          if (data.full_name && data.full_name.trim()) {
            // Use the first name from full_name if it exists
            rawName = data.full_name.split(' ')[0];
          } else if (data.email) {
            // Fallback to email prefix (before @)
            rawName = data.email.split('@')[0];
          }
          
          // Capitalize first letter only, rest lowercase
          const name = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
          setUserName(name);
          console.log('[useUserProfile] Displaying name:', name, 'from full_name:', data.full_name);
        }
      } catch (error) {
        console.error("Error in useUserProfile:", error);
        setUserName(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { userName, isLoading };
}
