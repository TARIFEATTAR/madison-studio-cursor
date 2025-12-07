import { motion } from "framer-motion";
import { ArrowLeft, Save, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

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

  return (
    <header className="dark-room-header">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-[var(--darkroom-surface-elevated)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <p>Exit Dark Room</p>
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

      {/* Center: Session Info */}
      <div className="dark-room-header__session">
        <span>Session</span>
        <span className="dark-room-header__session-count">{sessionCount}</span>
        {savedCount > 0 && (
          <Badge
            variant="outline"
            className="ml-2 bg-[var(--darkroom-success)]/10 text-[var(--darkroom-success)] border-[var(--darkroom-success)]/30"
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
            className="h-9 px-3 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-[var(--darkroom-surface-elevated)]"
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
                className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-[var(--darkroom-surface-elevated)]"
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
                  className="h-9 w-9 p-0 text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:bg-[var(--darkroom-surface-elevated)]"
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
