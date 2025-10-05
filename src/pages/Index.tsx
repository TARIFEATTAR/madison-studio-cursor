import { useAuth } from "@/hooks/useAuth";
import Landing from "./Landing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar, Repeat } from "lucide-react";

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

  // Show dashboard/home for authenticated users
  return (
    <div className="min-h-screen pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-foreground mb-4">Welcome to Scriptorium</h1>
          <p className="text-muted-foreground text-lg">
            Your brand intelligence platform for crafting and managing content
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/library" className="group">
            <div className="card-luxury p-8 h-full">
              <BookOpen className="w-12 h-12 mb-4 text-aged-brass" />
              <h3 className="mb-2">Library</h3>
              <p className="text-muted-foreground">
                Browse and manage your content library
              </p>
            </div>
          </Link>

          <Link to="/forge" className="group">
            <div className="card-luxury p-8 h-full">
              <Sparkles className="w-12 h-12 mb-4 text-aged-brass" />
              <h3 className="mb-2">Composer</h3>
              <p className="text-muted-foreground">
                Generate new content with AI assistance
              </p>
            </div>
          </Link>

          <Link to="/repurpose" className="group">
            <div className="card-luxury p-8 h-full">
              <Repeat className="w-12 h-12 mb-4 text-aged-brass" />
              <h3 className="mb-2">Amplify</h3>
              <p className="text-muted-foreground">
                Repurpose content for different platforms
              </p>
            </div>
          </Link>

          <Link to="/archive" className="group">
            <div className="card-luxury p-8 h-full">
              <Archive className="w-12 h-12 mb-4 text-aged-brass" />
              <h3 className="mb-2">Portfolio</h3>
              <p className="text-muted-foreground">
                View your archived content portfolio
              </p>
            </div>
          </Link>

          <Link to="/calendar" className="group">
            <div className="card-luxury p-8 h-full">
              <Calendar className="w-12 h-12 mb-4 text-aged-brass" />
              <h3 className="mb-2">Planner</h3>
              <p className="text-muted-foreground">
                Schedule and plan your content calendar
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
