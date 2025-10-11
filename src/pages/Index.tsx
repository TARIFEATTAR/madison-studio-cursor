import { useAuth } from "@/hooks/useAuth";
import Landing from "./Landing";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  console.log("[Index] Rendering Index page...");
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  console.log("[Index] Auth state - user:", !!user, "loading:", loading);

  // Safety timeout - force render Landing page if loading takes too long
  useEffect(() => {
    if (loading) {
      const forceRenderTimeout = setTimeout(() => {
        console.warn("[Index] Loading timeout reached - forcing Landing page render");
        if (!user) {
          window.location.href = '/';
        }
      }, 3000); // Reduced from 5000ms
      return () => clearTimeout(forceRenderTimeout);
    }
  }, [loading, user]);

  if (loading) {
    console.log("[Index] Showing loading state");
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-xl">Loading Scriptora...</div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    console.log("[Index] Showing Landing page for unauthenticated user");
    return <Landing />;
  }

  console.log("[Index] Redirecting authenticated user to dashboard");
  // Authenticated users should be in DashboardNew via App.tsx routing
  // This is a fallback that shouldn't normally be reached
  navigate("/", { replace: true });
  return null;
};

export default Index;
