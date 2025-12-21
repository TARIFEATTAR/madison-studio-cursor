import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

import { logger } from "@/lib/logger";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    logger.debug("[AuthProvider] Initializing auth context");

    // Function to check and accept pending invitations
    const checkPendingInvitations = async (userId: string, userEmail: string) => {
      try {
        // Check for pending invitations and accept them
        const { data: invitations, error } = await supabase
          .from("team_invitations")
          .select("id, organization_id, role")
          .eq("email", userEmail.toLowerCase())
          .is("accepted_at", null)
          .gt("expires_at", new Date().toISOString());

        if (error) {
          logger.error("[AuthProvider] Error checking invitations:", error);
          return;
        }

        if (invitations && invitations.length > 0) {
          logger.debug("[AuthProvider] Found pending invitations:", invitations.length);

          for (const invitation of invitations) {
            // Add user to organization
            const { error: memberError } = await supabase
              .from("organization_members")
              .upsert({
                organization_id: invitation.organization_id,
                user_id: userId,
                role: invitation.role,
              }, {
                onConflict: "organization_id,user_id",
                ignoreDuplicates: true,
              });

            if (memberError) {
              logger.error("[AuthProvider] Error adding member:", memberError);
              continue;
            }

            // Mark invitation as accepted
            const { error: updateError } = await supabase
              .from("team_invitations")
              .update({ accepted_at: new Date().toISOString() })
              .eq("id", invitation.id);

            if (updateError) {
              logger.error("[AuthProvider] Error updating invitation:", updateError);
            } else {
              logger.debug("[AuthProvider] Accepted invitation:", invitation.id);
            }
          }
        }
      } catch (err) {
        logger.error("[AuthProvider] Exception checking invitations:", err);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        logger.debug("[AuthProvider] Auth state changed", { event, hasUser: !!session?.user });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Check for pending invitations on SIGNED_IN event
        if (event === "SIGNED_IN" && session?.user) {
          const userEmail = session.user.email;
          if (userEmail) {
            // Use setTimeout to avoid blocking the auth flow
            setTimeout(() => {
              checkPendingInvitations(session.user.id, userEmail);
            }, 500);
          }
        }
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

          // Also check invitations on initial session load
          if (session?.user?.email) {
            setTimeout(() => {
              checkPendingInvitations(session.user.id, session.user.email!);
            }, 500);
          }
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
