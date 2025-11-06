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
      hour12: true
    });
  };

  const formatTimeFull = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  if (saveStatus === "saved" && lastSavedAt) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`flex items-center gap-1.5 text-xs text-[#6B6560] whitespace-nowrap ${className}`}>
              <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
              <span className="hidden lg:inline">Saved at {formatTime(lastSavedAt)}</span>
              <span className="lg:hidden">{formatTime(lastSavedAt)}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p className="text-xs">Auto-saved at {formatTimeFull(lastSavedAt)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (saveStatus === "saving") {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-[#6B6560] whitespace-nowrap ${className}`}>
        <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
        <span className="hidden sm:inline">Saving...</span>
        <span className="sm:hidden">Saving</span>
      </div>
    );
  }

  if (saveStatus === "unsaved") {
    return (
      <div className={`flex items-center gap-1.5 text-xs text-[#A8A39E] whitespace-nowrap ${className}`}>
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="hidden lg:inline">Unsaved changes</span>
        <span className="lg:hidden">Unsaved</span>
      </div>
    );
  }

  return null;
}
