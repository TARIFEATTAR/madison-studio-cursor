import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MOBILE_SHOT_TYPES = [
  { 
    label: "Product on White", 
    prompt: "A clean studio product shot on a pure white background, soft shadow, high-resolution lighting." 
  },
  { 
    label: "Lifestyle Scene", 
    prompt: "A lifestyle product photo placed in a cozy real-world environment that matches the brand mood." 
  },
  { 
    label: "Flat Lay", 
    prompt: "Flat lay product photography from directly above on a clean surface with organized styling." 
  },
  { 
    label: "Influencer Shot", 
    prompt: "Authentic influencer-style product photo with natural lighting and casual, relatable composition." 
  },
];

interface MobileShotTypeSelectorProps {
  onSelect: (shotType: { label: string; prompt: string }) => void;
  className?: string;
}

export default function MobileShotTypeSelector({ onSelect, className }: MobileShotTypeSelectorProps) {
  const [selected, setSelected] = useState(MOBILE_SHOT_TYPES[0].label);

  const handleSelect = (shotType: typeof MOBILE_SHOT_TYPES[0]) => {
    setSelected(shotType.label);
    onSelect(shotType);
  };

  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide pb-2", className)}>
      {MOBILE_SHOT_TYPES.map((shotType) => (
        <Button
          key={shotType.label}
          variant="outline"
          size="sm"
          onClick={() => handleSelect(shotType)}
          className={cn(
            "shrink-0 whitespace-nowrap transition-all",
            selected === shotType.label
              ? "border-2 border-aged-brass bg-aged-brass/10 text-aged-brass"
              : "border border-studio-border bg-studio-charcoal text-studio-text-secondary hover:bg-studio-card hover:text-studio-text-primary"
          )}
        >
          {shotType.label}
        </Button>
      ))}
    </div>
  );
}
