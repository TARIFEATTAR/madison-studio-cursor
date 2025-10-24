import { SaveStatus } from "@/hooks/useAutoSave";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AutosaveIndicatorProps {
  saveStatus: SaveStatus;
  lastSavedAt?: Date;
  className?: string;
}

export function AutosaveIndicator({ saveStatus, lastSavedAt, className = "" }: AutosaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (saveStatus === "saved" && lastSavedAt) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 text-xs text-[#6B6560] ${className}`}>
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span>Saved at {formatTime(lastSavedAt)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Auto-saves every 2 seconds</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (saveStatus === "saving") {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-[#6B6560] ${className}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (saveStatus === "unsaved") {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-[#A8A39E] ${className}`}>
        <AlertCircle className="h-3.5 w-3.5" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  return null;
}
