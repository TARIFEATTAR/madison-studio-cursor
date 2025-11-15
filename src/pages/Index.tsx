import { useAuth } from "@/hooks/useAuth";
import Landing from "./Landing";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const Index = () => {
  logger.debug("[Index] Rendering Index page...");
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  logger.debug("[Index] Auth state - user:", !!user, "loading:", loading);

  // Safety timeout - force render Landing page if loading takes too long
  useEffect(() => {
    if (loading) {
      const forceRenderTimeout = setTimeout(() => {
        logger.warn("[Index] Loading timeout reached - forcing Landing page render");
        if (!user) {
          navigate('/');
        }
      }, 3000); // Reduced from 5000ms
      return () => clearTimeout(forceRenderTimeout);
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

  // Show landing page for non-authenticated users
  if (!user) {
    logger.debug("[Index] Showing Landing page for unauthenticated user");
    return <Landing />;
  }

  // Authenticated users will be handled by App.tsx routing
  return null;
};

export default Index;
