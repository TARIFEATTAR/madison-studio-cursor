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
        .select("organization_id, organizations(name)")
        .eq("user_id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data && data.organizations) {
            setOrganizationName((data.organizations as any).name);
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
            onClick={() => navigate("/onboarding")} 
            className="bg-ink-black hover:bg-charcoal text-parchment-white"
          >
            Continue Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vellum-cream">
      <div className="max-w-6xl mx-auto px-8 py-10">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <h1 className="font-serif text-4xl font-medium text-ink-black">
              Welcome back, {organizationName || "Creator"}
            </h1>
            {stats && stats.streakDays > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 bg-parchment-white rounded-lg border border-warm-gray/20">
                <span className="text-2xl">🔥</span>
                <span className="font-medium text-sm text-charcoal">
                  {stats.streakDays}-day streak!
                </span>
              </div>
            )}
          </div>
          <p className="text-warm-gray text-base">
            Your editorial command center
          </p>
        </div>

        {/* Priority Action - HERO ELEMENT */}
        {showPriorityCard && priorityAction && (
          <div className="bg-gradient-to-br from-brass to-brass-glow rounded-xl p-8 shadow-lg mb-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Calendar className="w-8 h-8 text-ink-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-black/70">
                    Priority Action
                  </span>
                  <span className="px-2 py-1 bg-white/20 rounded-full text-xs font-medium text-ink-black">
                    {priorityAction.estimatedTime}
                  </span>
                </div>
                <h2 className="font-serif text-[32px] font-medium text-ink-black mb-3 leading-tight tracking-tight">
                  {priorityAction.title}
                </h2>
                <p className="text-base text-ink-black/80 mb-6 leading-relaxed">
                  {priorityAction.description}
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={() => navigate(priorityAction.actionRoute)}
                    className="px-6 py-3 bg-ink-black hover:bg-charcoal text-parchment-white font-medium rounded-lg transition-all"
                  >
                    {priorityAction.actionLabel} →
                  </Button>
                  <Button 
                    onClick={() => setShowPriorityCard(false)}
                    variant="ghost"
                    className="px-6 py-3 bg-white/20 hover:bg-white/30 text-ink-black font-medium rounded-lg transition-all"
                  >
                    Not Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editorial Director - Subtle Support */}
        {showEditorialBanner && (
          <div className="bg-parchment-white border-l-4 border-brass p-6 rounded-lg mb-8 shadow-sm relative">
            <button
              onClick={() => setShowEditorialBanner(false)}
              className="absolute top-4 right-4 text-warm-gray hover:text-charcoal transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-brass/15 rounded-lg flex items-center justify-center flex-shrink-0">
                <PenTool className="w-6 h-6 text-brass" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-brass mb-1">
                  Editorial Director
                </div>
                <p className="text-sm text-charcoal leading-relaxed">
                  Welcome! I'll guide you through your content journey and help you make the most of your work.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          
          <button 
            onClick={() => navigate('/create')}
            className="bg-parchment-white border-2 border-transparent hover:border-brass p-6 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(184,149,106,0.1)] group"
          >
            <PenTool className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-base font-medium text-charcoal">Create Content</div>
          </button>

          <button 
            onClick={() => navigate('/schedule')}
            className="bg-parchment-white border-2 border-transparent hover:border-brass p-6 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(184,149,106,0.1)] group"
          >
            <Calendar className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-base font-medium text-charcoal">View Calendar</div>
          </button>

          <button 
            onClick={() => navigate('/library')}
            className="bg-parchment-white border-2 border-transparent hover:border-brass p-6 rounded-xl transition-all hover:shadow-[0_4px_12px_rgba(184,149,106,0.1)] group"
          >
            <FileText className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <div className="text-base font-medium text-charcoal">Browse Library</div>
          </button>

        </div>

        {/* Content Bank */}
        <div className="bg-parchment-white border border-warm-gray/20 rounded-xl p-6">
          
          {/* Header - Cleaner */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-warm-gray/20">
            <div className="flex items-center gap-3">
              <Archive className="w-5 h-5 text-brass" />
              <h3 className="font-serif text-xl font-medium text-ink-black">Content Bank</h3>
            </div>
            <button 
              onClick={() => navigate('/library')}
              className="text-sm text-brass hover:text-brass-glow font-medium transition-colors"
            >
              View All →
            </button>
          </div>

          {/* Content Summary */}
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-vellum-cream rounded-lg">
                <p className="text-2xl font-serif font-semibold text-ink-black">
                  {stats?.totalContent || 0}
                </p>
                <p className="text-xs text-warm-gray mt-1">Total Pieces</p>
              </div>
              <div className="text-center p-4 bg-vellum-cream rounded-lg">
                <p className="text-2xl font-serif font-semibold text-ink-black">
                  {stats?.piecesCreatedThisWeek || 0}
                </p>
                <p className="text-xs text-warm-gray mt-1">This Week</p>
              </div>
              <div className="text-center p-4 bg-vellum-cream rounded-lg">
                <p className="text-2xl font-serif font-semibold text-ink-black">
                  {stats?.piecesScheduled || 0}
                </p>
                <p className="text-xs text-warm-gray mt-1">Scheduled</p>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/library')}
              className="w-full py-3 text-sm text-brass hover:text-brass-glow font-medium transition-colors"
            >
              View All Content →
            </button>
          </div>
        </div>

        {/* Recent Activity & Insights */}
        <div className="bg-white rounded-xl border border-warm-gray/20 p-8 shadow-level-1">
          <h2 className="text-2xl font-serif text-ink-black mb-6">
            Recent Activity & Insights
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Recent Content - 60% width (3 cols) */}
            <div className="lg:col-span-3">
              <DashboardRecentActivity />
            </div>
            
            {/* Weekly Stats - 40% width (2 cols) */}
            <div className="lg:col-span-2">
              <DashboardWeeklyStats />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
