import { useState, useEffect } from "react";
import { X, PenTool, Calendar, Archive, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";
import { DashboardWeeklyStats } from "@/components/dashboard/DashboardWeeklyStats";
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header Section - Clean editorial style */}
        <div className="mb-8 pb-6 border-b border-charcoal/10">
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-serif text-4xl md:text-5xl font-medium text-ink-black tracking-tight">
              {organizationName || "Your Workspace"}
            </h1>
            {stats && stats.streakDays > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-parchment-white border border-charcoal/10">
                <span className="text-2xl">🔥</span>
                <span className="font-medium text-sm text-charcoal">
                  {stats.streakDays}-day streak
                </span>
              </div>
            )}
          </div>
          <p className="text-charcoal/60 text-lg font-light">
            Your editorial command center
          </p>
        </div>

        {/* Editorial Director Banner - Minimal style */}
        {showEditorialBanner && (
          <div className="mb-8">
            <div className="bg-parchment-white border border-charcoal/10 p-6 relative overflow-hidden">
              <button
                onClick={() => setShowEditorialBanner(false)}
                className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <img 
                    src={madisonInsignia} 
                    alt="Madison" 
                    className="w-48 h-48 object-contain"
                  />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-serif text-xl font-medium text-ink-black mb-2">
                    Madison, Editorial Director
                  </h3>
                  <p className="text-charcoal/70 mb-4 leading-relaxed">
                    Your AI editorial director brings Tarife Attar's voice to every piece—
                    from product descriptions to email campaigns. Let her guide your content creation.
                  </p>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => navigate("/create")}
                      className="bg-ink-black hover:bg-charcoal text-parchment-white px-6 border-0"
                    >
                      Create Content
                    </Button>
                    <Button 
                      onClick={() => navigate("/meet-madison")}
                      variant="outline"
                      className="border-charcoal/20 text-charcoal hover:bg-vellum-cream"
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
          <div className="mb-8">
            <div className="bg-parchment-white border border-charcoal/10 p-6 relative">
              <button
                onClick={() => setShowPriorityCard(false)}
                className="absolute top-4 right-4 text-charcoal/50 hover:text-charcoal transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-aged-brass/10 border border-aged-brass/20 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-aged-brass" />
                </div>
                
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-medium text-ink-black mb-1">
                    {priorityAction.title}
                  </h3>
                  <p className="text-charcoal/70 text-sm mb-3">
                    {priorityAction.description}
                  </p>
                  <Button 
                    onClick={() => navigate(priorityAction.actionRoute)}
                    size="sm"
                    className="bg-ink-black hover:bg-charcoal text-parchment-white border-0"
                  >
                    {priorityAction.actionLabel}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid - Sharp edges */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => navigate("/create")}
            className="group bg-parchment-white border border-charcoal/10 p-6 text-left hover:border-aged-brass/40 transition-all"
          >
            <div className="w-10 h-10 bg-ink-black mb-4 flex items-center justify-center">
              <PenTool className="w-5 h-5 text-parchment-white" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink-black mb-1">
              Create Content
            </h3>
            <p className="text-sm text-charcoal/60">
              Generate new content with Madison
            </p>
          </button>

          <button
            onClick={() => navigate("/schedule")}
            className="group bg-parchment-white border border-charcoal/10 p-6 text-left hover:border-aged-brass/40 transition-all"
          >
            <div className="w-10 h-10 bg-ink-black mb-4 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-parchment-white" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink-black mb-1">
              Schedule
            </h3>
            <p className="text-sm text-charcoal/60">
              Plan your editorial calendar
            </p>
          </button>

          <button
            onClick={() => navigate("/library")}
            className="group bg-parchment-white border border-charcoal/10 p-6 text-left hover:border-aged-brass/40 transition-all"
          >
            <div className="w-10 h-10 bg-ink-black mb-4 flex items-center justify-center">
              <Archive className="w-5 h-5 text-parchment-white" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink-black mb-1">
              Library
            </h3>
            <p className="text-sm text-charcoal/60">
              Browse your content archive
            </p>
          </button>

          <button
            onClick={() => navigate("/templates")}
            className="group bg-parchment-white border border-charcoal/10 p-6 text-left hover:border-aged-brass/40 transition-all"
          >
            <div className="w-10 h-10 bg-ink-black mb-4 flex items-center justify-center">
              <FileText className="w-5 h-5 text-parchment-white" />
            </div>
            <h3 className="font-serif text-lg font-medium text-ink-black mb-1">
              Templates
            </h3>
            <p className="text-sm text-charcoal/60">
              Manage your prompt library
            </p>
          </button>
        </div>

        {/* Weekly Stats & Recent Activity - Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Stats */}
          <div className="bg-parchment-white border border-charcoal/10 p-6">
            <h2 className="font-serif text-xl font-medium text-ink-black mb-6 pb-3 border-b border-charcoal/10">
              This Week
            </h2>
            <DashboardWeeklyStats stats={stats} />
          </div>

          {/* Recent Activity */}
          <div className="bg-parchment-white border border-charcoal/10 p-6">
            <h2 className="font-serif text-xl font-medium text-ink-black mb-6 pb-3 border-b border-charcoal/10">
              Recent Activity
            </h2>
            <DashboardRecentActivity />
          </div>
        </div>

      </div>
    </div>
  );
}
