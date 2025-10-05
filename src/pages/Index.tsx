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
    <div className="min-h-screen bg-gradient-to-b from-card to-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto codex-spacing fade-enter">
            <h1 className="text-foreground mb-4">
              Welcome to Scriptorium
            </h1>
            <p className="text-large text-muted-foreground mb-12 leading-relaxed">
              Your brand intelligence platform for crafting and managing content
            </p>
          </div>
        </div>
      </section>

      {/* Dashboard Cards */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-enter">
            <Link to="/library" className="group">
              <div className="card-luxury h-full transition-all duration-300 hover:shadow-level-3 hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Library</h3>
                <p className="text-regular text-muted-foreground leading-relaxed">
                  Browse and manage your content library
                </p>
              </div>
            </Link>

            <Link to="/forge" className="group">
              <div className="card-luxury h-full transition-all duration-300 hover:shadow-level-3 hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Sparkles className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Composer</h3>
                <p className="text-regular text-muted-foreground leading-relaxed">
                  Generate new content with AI assistance
                </p>
              </div>
            </Link>

            <Link to="/repurpose" className="group">
              <div className="card-luxury h-full transition-all duration-300 hover:shadow-level-3 hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Repeat className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Amplify</h3>
                <p className="text-regular text-muted-foreground leading-relaxed">
                  Repurpose content for different platforms
                </p>
              </div>
            </Link>

            <Link to="/archive" className="group">
              <div className="card-luxury h-full transition-all duration-300 hover:shadow-level-3 hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Archive className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Portfolio</h3>
                <p className="text-regular text-muted-foreground leading-relaxed">
                  View your archived content portfolio
                </p>
              </div>
            </Link>

            <Link to="/calendar" className="group">
              <div className="card-luxury h-full transition-all duration-300 hover:shadow-level-3 hover:-translate-y-1">
                <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary/15 transition-colors">
                  <Calendar className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-3">Planner</h3>
                <p className="text-regular text-muted-foreground leading-relaxed">
                  Schedule and plan your content calendar
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
