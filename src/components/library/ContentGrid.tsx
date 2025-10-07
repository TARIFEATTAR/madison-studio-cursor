import { ViewMode } from "./ViewDensityToggle";
import { cn } from "@/lib/utils";

interface ContentGridProps {
  viewMode: ViewMode;
  children: React.ReactNode;
}

export function ContentGrid({ viewMode, children }: ContentGridProps) {
  return (
    <div
      className={cn(
        "grid gap-6 transition-all duration-300",
        viewMode === "gallery" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        viewMode === "comfortable" && "grid-cols-1 md:grid-cols-2 gap-4",
        viewMode === "list" && "grid-cols-1 gap-3"
      )}
    >
      {children}
    </div>
  );
}
