import { LayoutGrid, LayoutList, Rows3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ViewMode = "gallery" | "comfortable" | "list";

interface ViewDensityToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewDensityToggle({ viewMode, onChange }: ViewDensityToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/40">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("gallery")}
        className={cn(
          "px-3 transition-all duration-200",
          viewMode === "gallery" && "bg-primary text-primary-foreground"
        )}
        title="Gallery view"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("comfortable")}
        className={cn(
          "px-3 transition-all duration-200",
          viewMode === "comfortable" && "bg-primary text-primary-foreground"
        )}
        title="Comfortable view"
      >
        <Rows3 className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange("list")}
        className={cn(
          "px-3 transition-all duration-200",
          viewMode === "list" && "bg-primary text-primary-foreground"
        )}
        title="List view"
      >
        <LayoutList className="w-4 h-4" />
      </Button>
    </div>
  );
}
