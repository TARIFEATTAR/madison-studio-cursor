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
          const name = data.full_name?.split(' ')[0] || 
                      data.email?.split('@')[0] || 
                      "there";
          setUserName(name);
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
