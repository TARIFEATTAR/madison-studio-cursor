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
      {/* Hero Dashboard Header - Transformation #1 */}
      <DashboardHeroHeader 
        organizationName={organizationName || "Your Workspace"} 
        streakDays={stats?.streakDays}
      />

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Editorial Director Banner - Compact Header */}
        {showEditorialBanner && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-aged-brass/5 to-warm-cream/20 border border-aged-brass/20 px-4 md:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={madisonInsignia} 
                  alt="Madison" 
                  className="w-10 h-10 object-contain opacity-80 flex-shrink-0"
                />
                <div>
                  <p className="font-serif text-base md:text-lg text-ink-black">
                    Madison, Your Editorial Director
                  </p>
                  <p className="text-xs text-charcoal/60 hidden sm:block">
                    AI-powered guidance for content strategy & brand alignment
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => navigate("/meet-madison")}
                  variant="ghost"
                  size="sm"
                  className="text-charcoal/70 hover:text-aged-brass gap-1 text-xs"
                >
                  <span className="hidden sm:inline">Learn More</span>
                  <span className="sm:hidden">Info</span>
                </Button>
                <button
                  onClick={() => setShowEditorialBanner(false)}
                  className="p-1 text-charcoal/40 hover:text-charcoal/80 transition-colors"
                  aria-label="Dismiss banner"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Priority Action Card - Clean lines */}
        {showPriorityCard && priorityAction && (
          <div className="mb-8">
            <div className="bg-parchment-white border border-charcoal/10 p-8 relative">
...
            </div>
          </div>
        )}

        {/* Brand Health Card - Prominent Position */}
        <div className="mb-12">
          <BrandHealthCard />
        </div>

        {/* Workflow Map - Transformation #4 */}
        <div className="mb-12">
          <DashboardWorkflowMap />
        </div>

        {/* Accolades & Streak - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <EditorialAccolades />
          <StreakTracker />
        </div>

        {/* Editorial Stats Grid - Transformation #2 */}
        <div className="mb-12">
          <DashboardEditorialStats stats={stats} />
        </div>

        {/* Content Pipeline - Separate section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="font-serif text-2xl md:text-3xl font-light text-ink-black mb-2">
              Content Pipeline
            </h2>
            <p className="text-sm text-charcoal/60 italic">
              From draft to published
            </p>
          </div>
          <div className="bg-parchment-white border border-charcoal/10 p-4 md:p-6 lg:p-8">
            <ContentPipeline />
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

        {/* Upcoming Schedule - Full width */}
        <div className="bg-parchment-white border border-charcoal/10 p-8">
          <div className="mb-8 pb-4 border-b border-charcoal/10">
            <h2 className="font-serif text-2xl font-medium text-ink-black mb-1">
              Upcoming This Week
            </h2>
            <p className="text-xs text-charcoal/60 italic">
              Your editorial calendar
            </p>
          </div>
          <UpcomingSchedule />
        </div>

      </div>
    </div>
  );
}
