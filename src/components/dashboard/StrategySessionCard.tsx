// ═══════════════════════════════════════════════════════════════════════════════
// STRATEGY SESSION CARD - Dashboard Widget
// Expert guidance CTA for Think Mode
// ═══════════════════════════════════════════════════════════════════════════════

import { useNavigate } from "react-router-dom";
import { Compass, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface StrategySessionCardProps {
  className?: string;
  compact?: boolean;
}

export function StrategySessionCard({ className, compact = false }: StrategySessionCardProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <Card
        className={cn(
          "group cursor-pointer overflow-hidden transition-all duration-300 h-full flex flex-col",
          "bg-gradient-to-br from-[hsl(38,33%,97%)] to-[hsl(38,33%,94%)]",
          "border-[hsl(38,33%,56%)]/20 hover:border-[hsl(38,33%,56%)]/40",
          "hover:shadow-[0_4px_20px_rgba(184,149,106,0.15)]",
          className
        )}
        onClick={() => navigate("/think-mode")}
      >
        <CardContent className="p-3 flex-1 flex items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[hsl(38,33%,56%)]/10 group-hover:bg-[hsl(38,33%,56%)]/20 transition-colors flex-shrink-0">
              <Compass className="w-4 h-4 text-[hsl(38,33%,56%)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-[#1C150D]">
                Strategy Session
              </h3>
            </div>
            <ArrowRight className="w-4 h-4 text-[hsl(38,33%,56%)] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "group cursor-pointer overflow-hidden transition-all duration-300 h-full flex flex-col",
        "bg-gradient-to-br from-[hsl(38,33%,97%)] via-white to-[hsl(38,33%,96%)]",
        "border-[hsl(38,33%,56%)]/20 hover:border-[hsl(38,33%,56%)]/40",
        "hover:shadow-[0_8px_30px_rgba(184,149,106,0.15)]",
        className
      )}
      onClick={() => navigate("/think-mode")}
    >
      <CardContent className="p-6 flex-1 flex flex-col">
        {/* Decorative background pattern */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
          <Compass className="w-full h-full text-[hsl(38,33%,56%)]" />
        </div>

        <div className="relative space-y-4">
          {/* Icon + Badge */}
          <div className="flex items-start justify-between">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(38,33%,56%)]/20 to-[hsl(38,33%,56%)]/10 group-hover:from-[hsl(38,33%,56%)]/30 group-hover:to-[hsl(38,33%,56%)]/15 transition-all duration-300 shadow-sm">
              <Compass className="w-6 h-6 text-[hsl(38,33%,56%)]" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] font-medium tracking-wider uppercase text-[hsl(38,33%,56%)] bg-[hsl(38,33%,56%)]/10 px-2 py-1 rounded-full">
              Expert Guidance
            </span>
          </div>

          {/* Content */}
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#1C150D] mb-1">
              Strategy Session
            </h3>
            <p className="text-sm text-[#1C150D]/60 leading-relaxed">
              Get personalized guidance from Madison on your brand strategy, content approach, and creative direction.
            </p>
          </div>

          {/* CTA */}
          <Button
            variant="outline"
            className="w-full group/btn border-[hsl(38,33%,56%)]/30 hover:border-[hsl(38,33%,56%)] hover:bg-[hsl(38,33%,56%)]/5 text-[#1C150D]"
          >
            <Sparkles className="w-4 h-4 mr-2 text-[hsl(38,33%,56%)]" />
            Start Session
            <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default StrategySessionCard;

