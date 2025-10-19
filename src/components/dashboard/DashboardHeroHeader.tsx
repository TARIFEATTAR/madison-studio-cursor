import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardContextPanel } from "./DashboardContextPanel";
import madisonInsignia from "@/assets/madison-insignia.png";

interface DashboardHeroHeaderProps {
  organizationName: string;
  streakDays?: number;
  showMadisonBanner?: boolean;
  onDismissMadison?: () => void;
}

export function DashboardHeroHeader({ organizationName, streakDays, showMadisonBanner = true, onDismissMadison }: DashboardHeroHeaderProps) {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("Good Morning");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 17) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    const date = new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    setCurrentDate(date);
  }, []);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-[#FAF8F3] to-[#F0EDE5] border-b border-charcoal/10 mb-8 md:mb-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-16">
        <div className="flex items-start justify-between gap-4 md:gap-8">
          {/* Left: Editorial Masthead */}
          <div className="flex-1">
            <div className="mb-2 md:mb-3">
              <p className="text-xs uppercase tracking-[0.2em] text-charcoal/60 font-sans mb-2">
                {currentDate}
              </p>
              <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl font-light text-ink-black tracking-tight leading-[0.95] mb-1 md:mb-2">
                {greeting},
              </h1>
              <h2 className="font-serif text-3xl md:text-5xl lg:text-6xl font-medium text-ink-black tracking-tight leading-[0.95]">
                {organizationName || "Your Brand"}
              </h2>
            </div>
            
            <div className="w-16 md:w-24 h-[1px] bg-aged-brass my-4 md:my-6" />
            
            <p className="font-serif text-lg md:text-xl text-charcoal/70 italic font-light max-w-xl mb-4">
              Your Editorial Studio
            </p>

            {/* Madison Banner - Compact, inside hero */}
            {showMadisonBanner && (
              <div className="max-w-md">
                <div className="bg-gradient-to-r from-aged-brass/5 to-warm-cream/20 border border-aged-brass/20 px-4 py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <img 
                      src={madisonInsignia} 
                      alt="Madison" 
                      className="w-7 h-7 object-contain opacity-80 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-serif text-sm text-ink-black">
                        Madison, Your Editorial Director
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button 
                      onClick={() => navigate("/meet-madison")}
                      variant="ghost"
                      size="sm"
                      className="text-charcoal/70 hover:text-aged-brass text-xs h-auto py-1 px-2"
                    >
                      Learn More
                    </Button>
                    <button
                      onClick={onDismissMadison}
                      className="p-1 text-charcoal/40 hover:text-charcoal/80 transition-colors"
                      aria-label="Dismiss"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Editorial Context Panel - Hidden on mobile */}
          <div className="hidden lg:block">
            <DashboardContextPanel />
          </div>
        </div>
      </div>

      {/* Bottom brass line accent */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-aged-brass to-transparent opacity-40" />
    </div>
  );
}
