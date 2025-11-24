import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DEFAULT_IMAGE_CATEGORY_KEY,
  imageCategories,
  type ImageCategoryDefinition,
} from "@/data/imageCategories";

interface MobileShotTypeSelectorProps {
  onSelect: (shotType: ImageCategoryDefinition) => void;
  className?: string;
}

export default function MobileShotTypeSelector({
  onSelect,
  className,
}: MobileShotTypeSelectorProps) {
  const [selected, setSelected] = useState(DEFAULT_IMAGE_CATEGORY_KEY);

  const handleSelect = (shotType: ImageCategoryDefinition) => {
    setSelected(shotType.key);
    onSelect(shotType);
  };

  return (
    <div className={cn("flex gap-2 overflow-x-auto scrollbar-hide pb-2", className)}>
      {imageCategories.map((shotType) => (
        <Button
          key={shotType.key}
          variant="outline"
          size="sm"
          onClick={() => handleSelect(shotType)}
          className={cn(
            "shrink-0 whitespace-nowrap transition-all",
            selected === shotType.key
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
