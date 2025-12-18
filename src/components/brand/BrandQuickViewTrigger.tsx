/**
 * Brand Quick View Trigger
 * 
 * A button that opens the Brand Quick View Panel.
 * Can be placed in navigation, dashboard, or anywhere in the app.
 * 
 * Shows a mini preview of brand colors as indicator dots.
 */

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandQuickViewPanel } from "./BrandQuickViewPanel";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { Palette, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface BrandQuickViewTriggerProps {
  variant?: "default" | "minimal" | "icon-only";
  className?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function BrandQuickViewTrigger({
  variant = "default",
  className,
}: BrandQuickViewTriggerProps) {
  const [open, setOpen] = React.useState(false);
  const { quickView, hasBrandDNA, isLoading } = useBrandDNA();

  const colors = quickView?.colors;

  // Render different variants
  if (variant === "icon-only") {
    return (
      <>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className={cn("relative", className)}
              >
                <Palette className="h-5 w-5" />
                {hasBrandDNA && colors?.primary && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background"
                    style={{ backgroundColor: colors.primary }}
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Brand DNA</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <BrandQuickViewPanel open={open} onOpenChange={setOpen} />
      </>
    );
  }

  if (variant === "minimal") {
    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg transition-colors",
            "hover:bg-accent/50 text-sm",
            className
          )}
        >
          {hasBrandDNA && colors?.primary ? (
            <ColorDots
              primary={colors.primary}
              secondary={colors.secondary}
              accent={colors.accent}
            />
          ) : (
            <Palette className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="text-muted-foreground">Brand</span>
        </button>

        <BrandQuickViewPanel open={open} onOpenChange={setOpen} />
      </>
    );
  }

  // Default variant
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn("gap-2", className)}
        disabled={isLoading}
      >
        {hasBrandDNA && colors?.primary ? (
          <ColorDots
            primary={colors.primary}
            secondary={colors.secondary}
            accent={colors.accent}
          />
        ) : (
          <Palette className="h-4 w-4" />
        )}
        <span>Brand DNA</span>
        {hasBrandDNA && (
          <Sparkles className="h-3 w-3 text-primary" />
        )}
      </Button>

      <BrandQuickViewPanel open={open} onOpenChange={setOpen} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function ColorDots({
  primary,
  secondary,
  accent,
}: {
  primary?: string;
  secondary?: string;
  accent?: string;
}) {
  const colors = [primary, secondary, accent].filter(Boolean) as string[];

  return (
    <div className="flex -space-x-1">
      {colors.slice(0, 3).map((color, i) => (
        <span
          key={i}
          className="w-4 h-4 rounded-full border-2 border-background shadow-level-1"
          style={{ backgroundColor: color, zIndex: 3 - i }}
        />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default BrandQuickViewTrigger;
















