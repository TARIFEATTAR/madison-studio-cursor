import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { logger } from "@/lib/logger";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug("[AuthProvider] Initializing auth context");

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        logger.debug("[AuthProvider] Auth state changed", { hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Connection timeout - if Supabase doesn't respond in 8 seconds, stop waiting
    const connectionTimeout = setTimeout(() => {
      if (loading) {
        logger.error("[AuthProvider] Connection timeout - Supabase may be unavailable");
        setSession(null);
        setUser(null);
        setLoading(false);
      }
    }, 8000);

    // Check for existing session
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        clearTimeout(connectionTimeout);
        if (error) {
          logger.error("[AuthProvider] getSession error:", error);
          setSession(null);
          setUser(null);
        } else {
          logger.debug("[AuthProvider] getSession resolved", { hasUser: !!session?.user });
          setSession(session);
          setUser(session?.user ?? null);
        }
        setLoading(false);
      })
      .catch((err) => {
        clearTimeout(connectionTimeout);
        logger.error("[AuthProvider] getSession exception:", err);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    return () => {
      clearTimeout(connectionTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = () => {
    // Make this synchronous and bulletproof - redirect MUST happen
    logger.debug("[AuthProvider] Signing out and clearing all data...");
    
    // IMMEDIATELY clear session state to stop components from making API calls
    setSession(null);
    setUser(null);
    
    // Sign out from Supabase (fire and forget - don't wait)
    supabase.auth.signOut().catch(() => {
      // Silently ignore errors - we're redirecting anyway
    });
    
    // Clear all localStorage (wrap in try-catch to ensure we continue)
    try {
      localStorage.clear(); // Simpler and more reliable than looping
    } catch (err) {
      // Ignore errors - we're redirecting anyway
    }
    
    // CRITICAL: Force immediate redirect - this MUST execute
    // Use both replace and href as fallback, and ensure it's synchronous
    try {
      if (window.location.pathname === '/auth') {
        // If already on auth page, reload to clear any lingering React state
        window.location.reload();
      } else {
        window.location.replace('/auth');
      }
      
      // Fallback in case replace doesn't work immediately
      setTimeout(() => {
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth';
        }
      }, 100);
    } catch (err) {
      // Last resort: try href
      try {
        window.location.href = '/auth';
      } catch (finalErr) {
        // If all else fails, reload the page
        window.location.reload();
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
}
