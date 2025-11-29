import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { YourProgressCard } from "@/components/dashboard/YourProgressCard";
import { YourNextMoveCard } from "@/components/dashboard/YourNextMoveCard";
import { ContentPipelineCard } from "@/components/dashboard/ContentPipelineCard";
import { ThisWeekCard } from "@/components/dashboard/ThisWeekCard";
import { PerformanceMomentumZone } from "@/components/dashboard/PerformanceMomentumZone";
import { LivingReportCard } from "@/components/dashboard/LivingReportCard";
import { DraftNudge } from "@/components/dashboard/DraftNudge";
import { PostOnboardingGuide } from "@/components/onboarding/PostOnboardingGuide";
import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";
import { usePostOnboardingGuide } from "@/hooks/usePostOnboardingGuide";
import { logger } from "@/lib/logger";

import MadisonPanel from "@/components/image-editor/MadisonPanel";
import { BottomNavigation } from "@/components/layout/BottomNavigation";

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { organizationId } = useOrganization();
  const { data: stats, isLoading: statsLoading, error, isError } = useDashboardStats();
  const [showFallback, setShowFallback] = useState(false);
  const [madisonPanelOpen, setMadisonPanelOpen] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const { showGuide, dismissGuide } = usePostOnboardingGuide();

  // Check if we should show the getting started checklist
  useEffect(() => {
    if (!user) return;
    const checklistDismissed = localStorage.getItem(`checklist_dismissed_${user.id}`);
    const checklistProgress = localStorage.getItem(`checklist_progress_${user.id}`);

    // Show checklist if not dismissed and user has some activity (not brand new)
    if (!checklistDismissed && stats && stats.totalContent < 10) {
      setShowChecklist(true);
    }
  }, [user, stats]);

  // Safety timeout - show fallback after 3 seconds of loading
  useEffect(() => {
    if (statsLoading) {
      const timeout = setTimeout(() => {
        logger.debug("Dashboard loading timeout - showing fallback");
        setShowFallback(true);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [statsLoading]);

  // Log errors for debugging
  useEffect(() => {
    if (isError) {
      logger.error("Dashboard stats error:", error);
    }
  }, [isError, error]);

  // Show fallback if loading too long or error occurred
  if ((statsLoading && showFallback) || isError) {
    return (
      <div className="min-h-screen bg-vellum-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          {statsLoading && !isError && <Loader2 className="w-8 h-8 animate-spin text-brass mx-auto" />}
          <div className="text-charcoal text-sm">
            {isError ? "Welcome! Let's get started." : "Setting up your workspace…"}
          </div>
          <Button
            onClick={() => navigate("/create")}
            className="bg-ink-black hover:bg-charcoal text-parchment-white"
          >
            Start Creating
          </Button>
        </div>
      </div>
    );
  }

  // Show brief initial spinner
  if (statsLoading) {
    return (
      <div className="min-h-screen bg-vellum-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFA] flex flex-col">
      {/* Top Bar with Madison Button - Desktop Only */}
      <div className="hidden md:flex h-16 border-b border-[#E0E0E0] px-8 items-center justify-between bg-white">
        <h1 className="text-xl font-semibold text-[#1C150D]">Dashboard</h1>
        <Button
          size="sm"
          onClick={() => setMadisonPanelOpen(true)}
          className="bg-brand-brass hover:bg-[#A3865A] text-white flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Ask Madison
        </Button>
      </div>

      {/* Mobile Header - Simplified */}
      <div className="md:hidden h-14 border-b border-[#E0E0E0] px-4 flex items-center justify-between bg-white">
        <h1 className="text-lg font-semibold text-[#1C150D]">Dashboard</h1>
        <Button
          size="sm"
          onClick={() => setMadisonPanelOpen(true)}
          className="bg-brand-brass hover:bg-[#A3865A] text-white px-3 py-2"
        >
          <Sparkles className="w-4 h-4" />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-4 md:px-8 py-4 md:py-6 pb-24 md:pb-6 main-content">
        <div className="max-w-[1600px] mx-auto space-y-3 md:space-y-4 animate-fade-in">
          {/* Row 1: Brand Health, Your Progress, Living Brand Report */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <BrandHealthCard />
            <YourProgressCard />
            <LivingReportCard />
          </div>

          {/* Row 2: Your Next Move, Content Pipeline, and Getting Started */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            {/* Left Column: Next Move + Content Pipeline */}
            <div className={showChecklist ? "col-span-1 md:col-span-6 space-y-3 md:space-y-4" : "col-span-1 md:col-span-12 space-y-3 md:space-y-4"}>
              <YourNextMoveCard />
              <ContentPipelineCard />
            </div>

            {/* Right Column: Getting Started */}
          {showChecklist && (
              <div className="col-span-1 md:col-span-6">
                <GettingStartedChecklist
                  onDismiss={() => setShowChecklist(false)}
                  compact={false}
                />
              </div>
            )}
          </div>

          {/* Draft Nudge - Full Width (if needed) */}
          {stats && stats.totalDrafts >= 10 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
              <DraftNudge draftCount={stats.totalDrafts} />
            </div>
          )}

          {/* Row 4: This Week - Full Width */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <ThisWeekCard />
          </div>

          {/* Row 5: Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
            <PerformanceMomentumZone />
          </div>
        </div>
      </div>

      {/* Madison AI Assistant Panel */}
      <MadisonPanel
        isOpen={madisonPanelOpen}
        onToggle={() => setMadisonPanelOpen(!madisonPanelOpen)}
        sessionCount={0}
        maxImages={10}
      />

      {/* Mobile Navigation */}
      <BottomNavigation />

      {/* Post-Onboarding Guide */}
      {showGuide && <PostOnboardingGuide onDismiss={dismissGuide} userName={user?.email?.split("@")[0]} />}
    </div>
  );
}
