import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import Landing from "./Landing";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-black flex items-center justify-center">
        <div className="text-parchment-white">Loading...</div>
      </div>
    );
  }

  // Show landing page for non-authenticated users
  if (!user) {
    return <Landing />;
  }

  // Redirect authenticated users to library
  return <Navigate to="/library" replace />;
};

export default Index;
