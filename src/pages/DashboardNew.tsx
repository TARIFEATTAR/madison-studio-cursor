import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { useOrganization } from "@/hooks/useOrganization";

// New Dashboard Components (Phase 2)
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { SmartMomentumTracker } from "@/components/dashboard/SmartMomentumTracker";
import { QuickLinksWidget } from "@/components/dashboard/QuickLinksWidget";

// Existing Components (Updated in Phase 1)
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { ContentPipelineCard } from "@/components/dashboard/ContentPipelineCard";
import { ThisWeekCard } from "@/components/dashboard/ThisWeekCard";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";

// Supporting Components
import { GettingStartedChecklist } from "@/components/onboarding/GettingStartedChecklist";
import { DraftNudge } from "@/components/dashboard/DraftNudge";
import { PostOnboardingGuide } from "@/components/onboarding/PostOnboardingGuide";
import { usePostOnboardingGuide } from "@/hooks/usePostOnboardingGuide";
import { logger } from "@/lib/logger";

import MadisonPanel from "@/components/image-editor/MadisonPanel";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { BrandQuickViewTrigger } from "@/components/brand";

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

    // Show checklist if not dismissed and user has less than 5 completed tasks
    if (!checklistDismissed && stats && stats.totalContent < 5) {
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="text-center space-y-4">
          {statsLoading && !isError && <Loader2 className="w-8 h-8 animate-spin text-[#B8956A] mx-auto" />}
          <div className="text-[#1C150D]/60 text-sm">
            {isError ? "Welcome! Let's get started." : "Setting up your workspace…"}
          </div>
          <Button
            onClick={() => navigate("/create")}
            className="bg-[#1C150D] hover:bg-[#2C251D] text-white"
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
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#B8956A]" />
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-[#FAFAFA] flex flex-col">
      {/* Top Bar with Madison Button - Desktop Only */}
      <div className="hidden md:flex h-16 border-b border-[#E0E0E0] px-8 items-center justify-between bg-white">
        <h1 className="text-xl font-semibold text-[#1C150D]">Dashboard</h1>
        <div className="flex items-center gap-3">
          <BrandQuickViewTrigger variant="minimal" />
          <Button
            size="sm"
            onClick={() => setMadisonPanelOpen(true)}
            className="bg-[#B8956A] hover:bg-[#A3865A] text-white flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            Ask Madison
          </Button>
        </div>
      </div>

      {/* Mobile Header - Simplified */}
      <div className="md:hidden h-14 border-b border-[#E0E0E0] px-4 flex items-center justify-between bg-white">
        <h1 className="text-lg font-semibold text-[#1C150D]">Dashboard</h1>
        <div className="flex items-center gap-2">
          <BrandQuickViewTrigger variant="icon-only" />
          <Button
            size="sm"
            onClick={() => setMadisonPanelOpen(true)}
            className="bg-[#B8956A] hover:bg-[#A3865A] text-white px-3 py-2"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-4 md:px-8 py-4 md:py-6 pb-24 md:pb-6 main-content">
        <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6">
          
          {/* 1. HERO SECTION + QUICK LINKS & BRAND HEALTH */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-slide-up stagger-1">
            {/* Hero takes 8 columns on desktop */}
            <div className="col-span-1 md:col-span-8">
              <DashboardHero />
            </div>
            {/* Right column: Quick Links + Brand Health stacked (4 columns) */}
            <div className="col-span-1 md:col-span-4 space-y-4">
              <QuickLinksWidget />
              <BrandHealthCard compact />
            </div>
          </div>

          {/* 2. CONTENT PIPELINE + SMART MOMENTUM TRACKER */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-slide-up stagger-2">
            <div className="col-span-1 md:col-span-6">
              <ContentPipelineCard />
            </div>
            <SmartMomentumTracker />
          </div>

          {/* 3. THIS WEEK'S SCHEDULE */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-slide-up stagger-3">
            <ThisWeekCard />
          </div>

          {/* 5. GETTING STARTED (New users only - <5 content pieces) */}
          {showChecklist && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-slide-up stagger-5">
              <div className="col-span-1 md:col-span-12">
                <GettingStartedChecklist
                  onDismiss={() => setShowChecklist(false)}
                  compact={false}
                />
              </div>
            </div>
          )}

          {/* Draft Nudge - Only show if 10+ drafts */}
          {stats && stats.totalDrafts >= 10 && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 animate-slide-up stagger-5">
              <DraftNudge draftCount={stats.totalDrafts} />
            </div>
          )}

          {/* 6. RECENT ACTIVITY (Collapsed by default, hidden on mobile) */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-12 gap-4 animate-slide-up stagger-6">
            <div className="col-span-1 md:col-span-12">
              <DashboardRecentActivity collapsible={true} defaultExpanded={false} />
            </div>
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
