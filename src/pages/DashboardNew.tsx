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
        {/* Editorial Director Banner - Minimal style */}
        {showEditorialBanner && (
          <div className="mb-12">
            <div className="bg-parchment-white border border-charcoal/10 p-4 md:p-6 lg:p-8 relative overflow-hidden">
              <button
                onClick={() => setShowEditorialBanner(false)}
                className="absolute top-3 right-3 md:top-4 md:right-4 lg:top-6 lg:right-6 text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 lg:gap-8">
                <div className="flex-shrink-0">
                  <img 
                    src={madisonInsignia} 
                    alt="Madison" 
                    className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain opacity-90"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-serif text-xl md:text-2xl font-medium text-ink-black mb-2 md:mb-3">
                    Madison, Editorial Director
                  </h3>
                  <p className="text-charcoal/70 mb-4 md:mb-6 leading-relaxed font-light text-sm md:text-base">
                    Your AI editorial director brings Tarife Attar's voice to every piece—
                    from product descriptions to email campaigns. Let her guide your content creation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <Button 
                      onClick={() => navigate("/create")}
                      className="bg-ink-black hover:bg-charcoal text-parchment-white px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-6 text-sm uppercase tracking-wider border-0"
                    >
                      Create Content
                    </Button>
                    <Button 
                      onClick={() => navigate("/meet-madison")}
                      variant="outline"
                      className="border-charcoal/20 text-charcoal hover:bg-vellum-cream px-4 py-3 md:px-6 md:py-4 lg:px-8 lg:py-6 text-sm uppercase tracking-wider"
                    >
                      Meet Madison
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Priority Action Card - Clean lines */}
        {showPriorityCard && priorityAction && (
          <div className="mb-12">
            <div className="bg-parchment-white border border-charcoal/10 p-8 relative">
              <button
                onClick={() => setShowPriorityCard(false)}
                className="absolute top-6 right-6 text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-aged-brass/10 border border-aged-brass/20 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-aged-brass" />
                </div>
                
                <div className="flex-1 w-full">
                  <h3 className="font-serif text-xl font-medium text-ink-black mb-2">
                    {priorityAction.title}
                  </h3>
                  <p className="text-charcoal/70 text-sm mb-4 font-light">
                    {priorityAction.description}
                  </p>
                  <Button 
                    onClick={() => navigate(priorityAction.actionRoute)}
                    className="bg-ink-black hover:bg-charcoal text-parchment-white border-0 uppercase tracking-wider text-xs w-full sm:w-auto"
                  >
                    {priorityAction.actionLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Brand Health & Editorial Timeline - Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Brand Health Card */}
          <BrandHealthCard />

          {/* Editorial Timeline */}
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
