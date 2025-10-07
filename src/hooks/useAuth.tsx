import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Safety timeout to avoid getting stuck on a blank loading screen
    const safetyTimeout = setTimeout(() => {
      console.warn("[useAuth] Safety timeout reached. Proceeding without session.");
      setLoading(false);
    }, 3000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        console.log("[useAuth] Auth state changed", { hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        clearTimeout(safetyTimeout);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[useAuth] getSession resolved", { hasUser: !!session?.user });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      clearTimeout(safetyTimeout);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
}
