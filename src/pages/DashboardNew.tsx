import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { YourNextMove } from "@/components/dashboard/YourNextMove";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ThisWeekContent } from "@/components/dashboard/ThisWeekContent";
import { ContentPipeline } from "@/components/dashboard/ContentPipeline";
import { BrandHealthCard } from "@/components/dashboard/BrandHealthCard";
import { ContentQuality } from "@/components/dashboard/ContentQuality";
import { ThisWeekMomentum } from "@/components/dashboard/ThisWeekMomentum";
import { DashboardEditorialTimeline } from "@/components/dashboard/DashboardEditorialTimeline";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useBrandHealth } from "@/hooks/useBrandHealth";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { brandHealth } = useBrandHealth();
  const [longLoad, setLongLoad] = useState(false);

  // Safety timeout for long loads
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLongLoad(true);
    }, 2500);
    return () => clearTimeout(timeout);
  }, []);

  // Show spinner initially
  if (statsLoading && !longLoad) {
    return (
      <div className="min-h-screen bg-vellum-cream flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brass" />
      </div>
    );
  }

  // Show fallback if loading too long
  if (statsLoading && longLoad) {
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
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">
        {/* Hero Row: Your Next Move + Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
          <YourNextMove />
          <QuickActions />
        </div>

        {/* This Week's Content */}
        <ThisWeekContent />

        {/* Content Pipeline + Brand Health/Quality */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ContentPipeline />
          {brandHealth?.completeness_score === 100 ? (
            <ContentQuality />
          ) : (
            <BrandHealthCard />
          )}
        </div>

        {/* This Week's Momentum (Collapsible) */}
        <ThisWeekMomentum />

        {/* Recent Activity */}
        <div className="bg-parchment-white border border-charcoal/10 p-6">
          <div className="mb-6 pb-4 border-b border-charcoal/10">
            <h3 className="font-serif text-xl font-light text-ink-black mb-1">
              Recent Activity
            </h3>
            <p className="text-xs text-charcoal/60 italic">
              Your editorial timeline
            </p>
          </div>
          <DashboardEditorialTimeline />
        </div>
      </div>
    </div>
  );
}
