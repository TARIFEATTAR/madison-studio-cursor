import { useState, useEffect } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useAuth } from "@/hooks/useAuth";
import { BrandPulseBar } from "@/components/dashboard/BrandPulseBar";
import { ContentFlowZone } from "@/components/dashboard/ContentFlowZone";
import { PerformanceMomentumZone } from "@/components/dashboard/PerformanceMomentumZone";
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
    <div className="h-screen overflow-hidden bg-[#FAFAFA] flex flex-col">
      {/* Top Bar with Madison Button */}
      <div className="h-16 border-b border-[#E0E0E0] px-8 flex items-center justify-between bg-white">
        <h1 className="text-xl font-semibold text-[#1C150D]">Dashboard</h1>
        <Button
          size="sm"
          onClick={() => setMadisonPanelOpen(true)}
          className="bg-[#B8956A] hover:bg-[#A3865A] text-white flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Ask Madison
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="max-w-[1600px] mx-auto space-y-6 animate-fade-in">
          {/* Row 1: Key Metrics */}
          <div className="grid grid-cols-12 gap-6">
            <BrandPulseBar />
          </div>

          {/* Row 2: Content Flow */}
          <div className="grid grid-cols-12 gap-6">
            <ContentFlowZone />
          </div>

          {/* Row 3: Performance Metrics */}
          <div className="grid grid-cols-12 gap-6">
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
    </div>
  );
}
