import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[useAuth] Initializing auth hook");
    // Safety timeout to avoid getting stuck on a blank loading screen
    const safetyTimeout = setTimeout(() => {
      console.warn("[useAuth] Safety timeout reached. Proceeding without session.");
      setSession(null);
      setUser(null);
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
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error("[useAuth] getSession error:", error);
          setSession(null);
          setUser(null);
        } else {
          console.log("[useAuth] getSession resolved", { hasUser: !!session?.user });
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
        clearTimeout(safetyTimeout);
      })
      .catch((err) => {
        console.error("[useAuth] getSession exception:", err);
        setSession(null);
        setUser(null);
        setLoading(false);
        clearTimeout(safetyTimeout);
      });

    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimeout);
    };
  }, []);

  const signOut = async () => {
    console.log("[useAuth] Signing out and clearing all data...");
    
    // Sign out from Supabase
    await supabase.auth.signOut();
    
    // Clear all localStorage data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) keysToRemove.push(key);
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log("[useAuth] Cleared all localStorage and session data");
    
    // Reload to reset app state
    window.location.href = '/';
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
}
