import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DerivativeTypeFolderProps {
  icon: LucideIcon;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
  colorClass: string;
}

export function DerivativeTypeFolder({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
  colorClass,
}: DerivativeTypeFolderProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        "border border-border/20",
        "hover:border-border/40 hover:bg-card/50",
        isActive && "bg-card border-primary/30 shadow-level-1",
        !isActive && "bg-background/50"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
          colorClass,
          isActive && "shadow-sm"
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 text-left">
        <p className={cn(
          "text-sm font-medium transition-colors",
          isActive ? "text-foreground" : "text-muted-foreground"
        )}>
          {label}
        </p>
      </div>
      
      <div className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium transition-all",
        isActive 
          ? "bg-primary/10 text-primary border border-primary/20" 
          : "bg-muted text-muted-foreground"
      )}>
        {count}
      </div>
    </button>
  );
}
