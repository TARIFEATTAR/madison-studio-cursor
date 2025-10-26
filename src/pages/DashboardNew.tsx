import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { BrandPulseBar } from "@/components/dashboard/BrandPulseBar";
import { ContentFlowZone } from "@/components/dashboard/ContentFlowZone";
import { PerformanceMomentumZone } from "@/components/dashboard/PerformanceMomentumZone";
import MadisonFloatingButton from "@/components/image-editor/MadisonFloatingButton";
import MadisonPanel from "@/components/image-editor/MadisonPanel";

export default function DashboardNew() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const [longLoad, setLongLoad] = useState(false);
  const [madisonPanelOpen, setMadisonPanelOpen] = useState(false);

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
    <div className="h-screen overflow-hidden bg-[#FFFCF5] flex flex-col">
      {/* ZONE 1: Brand Pulse Bar - 180px */}
      <div className="h-[180px] border-b border-[#E7E1D4] px-6 py-4">
        <BrandPulseBar />
      </div>

      {/* ZONE 2: Content Flow - 380px */}
      <div className="h-[380px] border-b border-[#E7E1D4] px-6 py-4 overflow-hidden">
        <ContentFlowZone />
      </div>

      {/* ZONE 3: Performance & Momentum - 300px */}
      <div className="flex-1 px-6 py-4 overflow-hidden">
        <PerformanceMomentumZone />
      </div>

      {/* Madison AI Assistant - Floating */}
      <MadisonFloatingButton onClick={() => setMadisonPanelOpen(true)} />
      <MadisonPanel 
        isOpen={madisonPanelOpen} 
        onToggle={() => setMadisonPanelOpen(!madisonPanelOpen)}
        sessionCount={0}
        maxImages={10}
      />
    </div>
  );
}
