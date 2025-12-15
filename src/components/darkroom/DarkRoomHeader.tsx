import { motion } from "framer-motion";
import { ArrowLeft, Save, Settings, HelpCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { LEDIndicator } from "./LEDIndicator";

interface DarkRoomHeaderProps {
  sessionCount: number;
  savedCount: number;
  isSaving: boolean;
  onSaveAll?: () => void;
  onOpenSettings?: () => void;
}

export function DarkRoomHeader({
  sessionCount,
  savedCount,
  isSaving,
  onSaveAll,
  onOpenSettings,
}: DarkRoomHeaderProps) {
  const navigate = useNavigate();

  // Exit to Create page
  const handleExit = () => {
    navigate("/create");
  };

  // Go back to Create (prevents loop with Light Table)
  const handleBack = () => {
    navigate("/create");
  };

  return (
    <header className="dark-room-header">
      {/* Left: Back + Exit + Title */}
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-white/5 border border-transparent hover:border-[var(--darkroom-border)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Back</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExit}
                className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-white/5 border border-transparent hover:border-[var(--darkroom-border)]"
              >
                <X className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Exit to Create</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <motion.h1
          className="dark-room-header__title"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          Dark Room
        </motion.h1>
      </div>

      {/* Center: Session Info with LED */}
      <div className="dark-room-header__session">
        <LEDIndicator 
          state={sessionCount > 0 ? "ready" : "off"} 
          size="md" 
        />
        <span>Session</span>
        <span className="dark-room-header__session-count">{sessionCount}</span>
        {savedCount > 0 && (
          <Badge
            variant="outline"
            className="ml-2 bg-[var(--led-ready)]/10 text-[var(--led-ready)] border-[var(--led-ready)]/30 font-mono text-[10px] uppercase tracking-wider"
          >
            {savedCount} saved
          </Badge>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {sessionCount > savedCount && onSaveAll && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSaveAll}
            disabled={isSaving}
            className="h-9 px-3 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-accent)] hover:bg-white/5 border border-transparent hover:border-[var(--darkroom-border)] font-mono text-xs uppercase tracking-wider"
          >
            <Save className="w-4 h-4 mr-2" />
            Save All
          </Button>
        )}

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("/docs/dark-room", "_blank")}
                className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-white/5 border border-transparent hover:border-[var(--darkroom-border)]"
              >
                <HelpCircle className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Help & Tips</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {onOpenSettings && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onOpenSettings}
                  className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-white/5 border border-transparent hover:border-[var(--darkroom-border)]"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </header>
  );
}
