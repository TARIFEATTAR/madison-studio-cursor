import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { logger } from "@/lib/logger";

const Index = () => {
  logger.debug("[Index] Rendering Index page...");

  const { user, loading } = useAuth();
  const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

  logger.debug("[Index] Auth state - user:", !!user, "loading:", loading);

  useEffect(() => {
    if (!loading && !user && !isLocalhost) {
      logger.debug("[Index] User not authenticated - redirecting to marketing site");
      window.location.replace("https://madisonstudio.io");
    }
  }, [loading, user, isLocalhost]);

  if (loading) {
    logger.debug("[Index] Showing loading state");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl font-serif">Loading MADISON...</div>
      </div>
    );
  }

  if (user) {
    logger.debug("[Index] User authenticated - redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  if (isLocalhost) {
    logger.debug("[Index] User not authenticated on localhost - redirecting to /auth");
    return <Navigate to="/auth" replace />;
  }

  // Non-localhost unauthenticated users get redirected to the marketing site.
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-xl font-serif">Loading MADISON...</div>
    </div>
  );
};

export default Index;
