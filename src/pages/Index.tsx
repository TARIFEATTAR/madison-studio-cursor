import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const Index = () => {
  logger.debug("[Index] Rendering Index page...");

  const { user, loading } = useAuth();
  logger.debug("[Index] Auth state - user:", !!user, "loading:", loading);

  useEffect(() => {
    if (loading) return;

    // Redirect unauthenticated users to the marketing site (production only)
    if (!user) {
      // Don't redirect on localhost - go to auth instead
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logger.debug("[Index] User not authenticated on localhost - redirecting to /auth");
        window.location.href = "/auth";
        return;
      }
      logger.debug("[Index] User not authenticated - redirecting to marketing site");
      window.location.href = "https://madisonstudio.io";
      return;
    }
  }, [loading, user]);

  if (loading) {
    logger.debug("[Index] Showing loading state");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading MADISON...</div>
      </div>
    );
  }

  // Authenticated users will be handled by App.tsx routing
  return null;
};

export default Index;
