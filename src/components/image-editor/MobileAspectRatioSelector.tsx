import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Square, RectangleVertical, Smartphone } from "lucide-react";

const MOBILE_ASPECT_RATIOS = [
  { value: "1:1", label: "Square", icon: Square },
  { value: "5:4", label: "Portrait", icon: RectangleVertical },
  { value: "9:16", label: "Vertical", icon: Smartphone },
];

interface MobileAspectRatioSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function MobileAspectRatioSelector({ value, onChange, className }: MobileAspectRatioSelectorProps) {
  return (
    <div className={cn("flex justify-center gap-2", className)}>
      {MOBILE_ASPECT_RATIOS.map((ratio) => {
        const Icon = ratio.icon;
        return (
          <Button
            key={ratio.value}
            variant="outline"
            size="sm"
            onClick={() => onChange(ratio.value)}
            className={cn(
              "flex flex-col items-center gap-1 h-auto py-2 px-4 transition-all",
              value === ratio.value
                ? "border-2 border-aged-brass bg-aged-brass/10 text-aged-brass"
                : "border border-studio-border bg-studio-charcoal text-studio-text-secondary hover:bg-studio-card hover:text-studio-text-primary"
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{ratio.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
