import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DashboardTopBar } from "@/components/dashboard/DashboardTopBar";
import { CompactYourNextMove } from "@/components/dashboard/CompactYourNextMove";
import { CompactContentPipeline } from "@/components/dashboard/CompactContentPipeline";
import { ThisWeekContent } from "@/components/dashboard/ThisWeekContent";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
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
      {/* Tier 1: Top Status Bar (sticky) */}
      <DashboardTopBar />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 space-y-4">
        {/* Tier 2: Primary Focus (60/40 split) */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-4">
          <CompactYourNextMove />
          <CompactContentPipeline />
        </div>

        {/* Tier 3: This Week Content */}
        <ThisWeekContent />
      </div>
    </div>
  );
}
