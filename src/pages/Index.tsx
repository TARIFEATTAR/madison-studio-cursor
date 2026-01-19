import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logger } from "@/lib/logger";

const Index = () => {
  logger.debug("[Index] Rendering Index page...");

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const hasRedirected = useRef(false);
  
  logger.debug("[Index] Auth state - user:", !!user, "loading:", loading);

  useEffect(() => {
    // Prevent multiple redirects and wait for auth to settle
    if (loading || hasRedirected.current || isRedirecting) return;

    // If user is authenticated, App.tsx will handle routing via RootRoute
    // Just show loading state while the parent re-renders
    if (user) {
      logger.debug("[Index] User authenticated - App.tsx will handle routing");
      return;
    }

    // Debounce: wait a bit to ensure auth state is truly settled
    const debounceTimer = setTimeout(() => {
      if (hasRedirected.current) return;
      
      // Redirect unauthenticated users
      hasRedirected.current = true;
      setIsRedirecting(true);
      
      // Don't redirect on localhost - go to auth instead
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logger.debug("[Index] User not authenticated on localhost - redirecting to /auth");
        navigate("/auth", { replace: true });
        return;
      }
      
      logger.debug("[Index] User not authenticated - redirecting to marketing site");
      window.location.href = "https://madisonstudio.io";
    }, 200); // Small debounce to let auth state settle

    return () => clearTimeout(debounceTimer);
  }, [loading, user, navigate, isRedirecting]);

  // Always show loading state - either auth is loading or we're waiting for redirect
  logger.debug("[Index] Showing loading state");
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-foreground text-xl font-serif">Loading MADISON...</div>
    </div>
  );
};

export default Index;
