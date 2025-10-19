import { useState, useEffect } from "react";
import { X, PenTool, Calendar, Archive, FileText, Loader2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardHeroHeader } from "@/components/dashboard/DashboardHeroHeader";
import { DashboardEditorialStats } from "@/components/dashboard/DashboardEditorialStats";
import { DashboardEditorialTimeline } from "@/components/dashboard/DashboardEditorialTimeline";
import { DashboardWorkflowMap } from "@/components/dashboard/DashboardWorkflowMap";
import { ContentPipeline } from "@/components/dashboard/ContentPipeline";
import { UpcomingSchedule } from "@/components/dashboard/UpcomingSchedule";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { EditorialAccolades } from "@/components/dashboard/EditorialAccolades";
import { StreakTracker } from "@/components/dashboard/StreakTracker";
import { DashboardTourModal } from "@/components/dashboard/DashboardTourModal";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePriorityAction } from "@/hooks/usePriorityAction";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import madisonInsignia from "@/assets/madison-insignia.png";

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: priorityAction, isLoading: priorityLoading } = usePriorityAction();
  const [showEditorialBanner, setShowEditorialBanner] = useState(true);
  const [showPriorityCard, setShowPriorityCard] = useState(true);
  const [organizationName, setOrganizationName] = useState<string>("");
  const [longLoad, setLongLoad] = useState(false);

  // Fetch organization name
  useEffect(() => {
    if (user) {
      supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(async ({ data }) => {
          if (data?.organization_id) {
            const { data: org } = await supabase
              .from("organizations")
              .select("name")
              .eq("id", data.organization_id)
              .maybeSingle();
            if (org?.name) {
              setOrganizationName((org as any).name);
            }
          }
        });
    }
  }, [user]);

  // Safety timeout for long loads
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLongLoad(true);
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Show spinner initially
  if ((statsLoading || priorityLoading) && !longLoad) {
    return (
      <div className="min-h-screen bg-vellum-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  // Show fallback if loading too long
  if ((statsLoading || priorityLoading) && longLoad) {
    return (
      <div className="min-h-screen bg-vellum-cream flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-brass mx-auto" />
          <div className="text-charcoal text-sm">Setting up your workspace…</div>
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

  return (
    <div className="min-h-screen bg-vellum-cream">
      {/* Dashboard Tour Modal */}
      <DashboardTourModal />

      {/* Hero Dashboard Header */}
      <DashboardHeroHeader 
        organizationName={organizationName || "Your Workspace"} 
        streakDays={stats?.streakDays}
        showMadisonBanner={showEditorialBanner}
        onDismissMadison={() => setShowEditorialBanner(false)}
      />

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Brand Health Card - Top Priority */}
        <div className="mb-8">
          <BrandHealthCard />
        </div>

        {/* Priority Action Card - Clean lines */}
        {showPriorityCard && priorityAction && (
          <div className="mb-8">
            <div className="bg-parchment-white border border-charcoal/10 p-8 relative">
...
            </div>
          </div>
        )}

        {/* Workflow Map */}
        <div className="mb-12">
          <DashboardWorkflowMap />
        </div>

        {/* Accolades & Streak - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12">
          <EditorialAccolades />
          <StreakTracker />
        </div>

        {/* Editorial Dashboard (merged stats + pipeline) */}
        <div className="mb-12">
          <div className="bg-parchment-white border border-charcoal/10 p-6 md:p-8">
            <DashboardEditorialStats stats={stats} />
            
            {/* Pipeline Section */}
            <div className="mt-12 pt-8 border-t border-charcoal/10">
              <div className="mb-6">
                <h3 className="font-serif text-xl md:text-2xl font-light text-ink-black mb-2">
                  Content Pipeline
                </h3>
                <p className="text-sm text-charcoal/60 italic">
                  From draft to published
                </p>
              </div>
              <ContentPipeline />
            </div>
          </div>
        </div>

        {/* Editorial Timeline - Full width */}
        <div className="mb-12">
          <div className="bg-parchment-white border border-charcoal/10 p-8">
            <div className="mb-8 pb-4 border-b border-charcoal/10">
              <h2 className="font-serif text-2xl font-medium text-ink-black mb-1">
                Recent Activity
              </h2>
              <p className="text-xs text-charcoal/60 italic">
                Your creative timeline
              </p>
            </div>
            <DashboardEditorialTimeline />
          </div>
        </div>

        {/* Upcoming Schedule - Full width on mobile, conditional on desktop */}
        <div className="lg:hidden bg-parchment-white border border-charcoal/10 p-6 md:p-8">
          <div className="mb-6 md:mb-8 pb-4 border-b border-charcoal/10">
            <h2 className="font-serif text-xl md:text-2xl font-medium text-ink-black mb-1">
              Upcoming This Week
            </h2>
            <p className="text-xs text-charcoal/60 italic">
              Your content schedule for the next 7 days
            </p>
          </div>
          <UpcomingSchedule />
        </div>

      </div>
    </div>
  );
}
