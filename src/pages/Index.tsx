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
import { OnboardingDocumentUpload } from "@/components/onboarding/OnboardingDocumentUpload";
import { OnboardingCompleteModal } from "@/components/onboarding/OnboardingCompleteModal";
import { CompleteBrandBanner } from "@/components/onboarding/CompleteBrandBanner";
import { BrandKnowledgeCenter } from "@/components/onboarding/BrandKnowledgeCenter";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useOnboarding } from "@/hooks/useOnboarding";
import { DailyBriefBanner } from "@/components/dashboard/DailyBriefBanner";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  console.log("[Index] Rendering Index page...");
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  console.log("[Index] Auth state - user:", !!user, "loading:", loading);
  
  const {
    showWelcome,
    showDocumentUpload,
    showForgeGuide,
    showCompleteModal,
    showBanner,
    currentOrganizationId,
    isLoading: onboardingLoading,
    onboardingStep,
    completeWelcome,
    completeDocumentUpload,
    skipDocumentUpload,
    completeFirstGeneration,
    closeCompleteModal,
    dismissBanner,
  } = useOnboarding();

  // Redirect to Forge if user is in first_generation_pending state
  useEffect(() => {
    if (user && onboardingStep === "first_generation_pending") {
      navigate("/forge?onboarding=true");
    }
  }, [user, onboardingStep, navigate]);
  
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
      {/* Onboarding Modals */}
      <WelcomeModal 
        open={showWelcome} 
        onComplete={completeWelcome}
        onSkip={() => {
          if (user) {
            localStorage.setItem(`onboarding_step_${user.id}`, 'completed');
            localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
            window.location.reload();
          }
        }}
      />
      
      {currentOrganizationId && (
        <OnboardingDocumentUpload
          open={showDocumentUpload}
          organizationId={currentOrganizationId}
          onComplete={completeDocumentUpload}
          onSkip={skipDocumentUpload}
        />
      )}

      <OnboardingCompleteModal
        open={showCompleteModal}
        onClose={closeCompleteModal}
      />

      <div className="min-h-screen py-8 px-6 md:px-12 paper-overlay">
        <div className="max-w-7xl mx-auto codex-spacing">
          <DailyBriefBanner />
          
          {/* Editorial Masthead */}
          <div className="fade-enter mb-12">
            <div className="brass-divider mb-8"></div>
            <div className="max-w-3xl">
              <h1 className="text-foreground mb-3 font-serif tracking-wide">The Command Center</h1>
              <p className="text-muted-foreground text-lg font-serif leading-relaxed">
                Direct your brand narrative from a single desk. Commission content, manage your portfolio, and orchestrate multi-channel campaigns with precision and authority.
              </p>
            </div>
          </div>

          {/* Dashboard Cards */}
          <section className="fade-enter">
            {showBanner && <CompleteBrandBanner onDismiss={dismissBanner} />}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/library" className="group">
                    <div className="card-editorial h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="bg-brass/10 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                          <BookOpen className="w-8 h-8 text-brass" />
                        </div>
                        <h3 className="font-serif text-3xl font-bold text-foreground">The Archives</h3>
                      </div>
                      <p className="text-regular text-muted-foreground leading-relaxed font-serif">
                        Review your published works and editorial history. Every commission, every draft, catalogued with precision.
                      </p>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Access your complete content library</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/forge" className="group">
                    <div className="card-editorial h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="bg-brass/10 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                          <Sparkles className="w-8 h-8 text-brass" />
                        </div>
                        <h3 className="font-serif text-3xl font-bold text-foreground">The Editorial Desk</h3>
                      </div>
                      <p className="text-regular text-muted-foreground leading-relaxed font-serif">
                        Commission precision copy for any touchpoint. Single assets or foundational manuscripts ready for deployment.
                      </p>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Generate brand-aligned content with AI</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/repurpose" className="group">
                    <div className="card-editorial h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="bg-brass/10 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                          <Repeat className="w-8 h-8 text-brass" />
                        </div>
                        <h3 className="font-serif text-3xl font-bold text-foreground">The Syndicate</h3>
                      </div>
                      <p className="text-regular text-muted-foreground leading-relaxed font-serif">
                        Repurpose content across channels with strategic precision. One narrative, infinite adaptations.
                      </p>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Multi-channel content deployment</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/archive" className="group">
                    <div className="card-editorial h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="bg-brass/10 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                          <Archive className="w-8 h-8 text-brass" />
                        </div>
                        <h3 className="font-serif text-3xl font-bold text-foreground">The Vault</h3>
                      </div>
                      <p className="text-regular text-muted-foreground leading-relaxed font-serif">
                        Your complete anthology of archived campaigns. A permanent record of your brand's published legacy.
                      </p>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Archive of completed works</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/calendar" className="group">
                    <div className="card-editorial h-full">
                      <div className="flex items-center gap-4 mb-5">
                        <div className="bg-brass/10 w-16 h-16 rounded-lg flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                          <Calendar className="w-8 h-8 text-brass" />
                        </div>
                        <h3 className="font-serif text-3xl font-bold text-foreground">The Editorial Calendar</h3>
                      </div>
                      <p className="text-regular text-muted-foreground leading-relaxed font-serif">
                        Orchestrate publication schedules and deadlines. Command your content strategy with temporal precision.
                      </p>
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Schedule and orchestrate campaigns</p>
                </TooltipContent>
              </Tooltip>
            </div>

            {/* Brand Knowledge Center */}
            {currentOrganizationId && (
              <div className="mt-16" id="brand-knowledge-center">
                <div className="brass-divider mb-8"></div>
                <BrandKnowledgeCenter organizationId={currentOrganizationId} />
              </div>
            )}
          </section>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
