import { useAuth } from "@/hooks/useAuth";
import Landing from "./Landing";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Archive, Calendar, Repeat, FileText } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { CompleteBrandBanner } from "@/components/onboarding/CompleteBrandBanner";
import { BrandKnowledgeCenter } from "@/components/onboarding/BrandKnowledgeCenter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useOnboarding } from "@/hooks/useOnboarding";
import { DailyBriefBanner } from "@/components/dashboard/DailyBriefBanner";

const Index = () => {
  console.log("[Index] Rendering Index page...");
  
  const { user, loading } = useAuth();
  console.log("[Index] Auth state - user:", !!user, "loading:", loading);
  
  const {
    showWelcome,
    showBanner,
    currentOrganizationId,
    isLoading: onboardingLoading,
    completeWelcome,
    skipWelcome,
    dismissBanner,
  } = useOnboarding();
  
  console.log("[Index] Onboarding state - showWelcome:", showWelcome, "loading:", onboardingLoading);

  if (loading || onboardingLoading) {
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

  console.log("[Index] Showing dashboard for authenticated user");
  
  // Show dashboard/home for authenticated users
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-card to-background p-8">
        <DailyBriefBanner />
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20 relative">
            <div className="text-center max-w-4xl mx-auto codex-spacing fade-enter">
              <h1 className="text-foreground mb-4">
                Welcome to Scriptora
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
            {showBanner && <CompleteBrandBanner onDismiss={dismissBanner} />}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-enter">
            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Access all your saved prompts and content</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Create single assets or master content with AI</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Transform existing content for multiple channels</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Review your completed and archived work</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
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
              </TooltipTrigger>
              <TooltipContent>
                <p>Organize content schedule and sync with Google Calendar</p>
              </TooltipContent>
            </Tooltip>
          </div>

          {/* Brand Knowledge Center */}
          {currentOrganizationId && (
            <div className="mt-12" id="brand-knowledge-center">
              <BrandKnowledgeCenter organizationId={currentOrganizationId} />
            </div>
          )}
        </div>
      </section>
    </div>
    </ErrorBoundary>
  );
};

export default Index;
