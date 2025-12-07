import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Camera, Sun, Globe, X, Info, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  getCameraOptions,
  getLightingOptions,
  getEnvironmentOptions,
} from "@/utils/promptFormula";

export interface ProModeSettings {
  camera?: string;
  lighting?: string;
  environment?: string;
}

interface ProSettingsProps {
  settings: ProModeSettings;
  onChange: (settings: ProModeSettings) => void;
  disabled?: boolean;
}

export function ProSettings({ settings, onChange, disabled = false }: ProSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const cameraOptions = getCameraOptions();
  const lightingOptions = getLightingOptions();
  const environmentOptions = getEnvironmentOptions();

  const activeCount = Object.values(settings).filter(Boolean).length;

  const handleCameraChange = (value: string) => {
    onChange({ ...settings, camera: value === "none" ? undefined : value });
  };

  const handleLightingChange = (value: string) => {
    onChange({ ...settings, lighting: value === "none" ? undefined : value });
  };

  const handleEnvironmentChange = (value: string) => {
    onChange({ ...settings, environment: value === "none" ? undefined : value });
  };

  const handleClearAll = () => {
    onChange({});
  };

  return (
    <div className="pro-settings">
      {/* Header - Always Visible */}
      <button
        className="pro-settings__header"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={disabled}
      >
        <div className="pro-settings__title">
          <SlidersHorizontal className="w-4 h-4 text-[var(--darkroom-accent)]" />
          <span>Pro Settings</span>
          {activeCount > 0 && (
            <Badge className="pro-settings__badge">{activeCount}</Badge>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-[var(--darkroom-text-muted)]" />
        </motion.div>
      </button>

      {/* Expandable Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pro-settings__content">
              {/* Clear All Button */}
              {activeCount > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="h-7 px-2 text-xs text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)]"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clear all
                  </Button>
                </div>
              )}

              {/* Camera/Lens */}
              <div className="pro-settings__control">
                <label className="pro-settings__control-label">
                  <Camera className="w-3.5 h-3.5" />
                  Camera & Lens
                </label>
                <Select
                  value={settings.camera || "none"}
                  onValueChange={handleCameraChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                    <SelectValue placeholder="Select camera..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)]">
                    <SelectItem value="none" className="text-[var(--darkroom-text-muted)]">
                      None
                    </SelectItem>
                    {cameraOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Lighting */}
              <div className="pro-settings__control">
                <label className="pro-settings__control-label">
                  <Sun className="w-3.5 h-3.5" />
                  Lighting Setup
                </label>
                <Select
                  value={settings.lighting || "none"}
                  onValueChange={handleLightingChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                    <SelectValue placeholder="Select lighting..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)]">
                    <SelectItem value="none" className="text-[var(--darkroom-text-muted)]">
                      None
                    </SelectItem>
                    {lightingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Environment */}
              <div className="pro-settings__control">
                <div className="flex items-center justify-between">
                  <label className="pro-settings__control-label">
                    <Globe className="w-3.5 h-3.5" />
                    Environment
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-[var(--darkroom-text-dim)] cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]">
                        <p className="text-xs">
                          This adds text to your prompt. For actual background
                          images, use the "Background Scene" upload above.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={settings.environment || "none"}
                  onValueChange={handleEnvironmentChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                    <SelectValue placeholder="Select environment..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)]">
                    <SelectItem value="none" className="text-[var(--darkroom-text-muted)]">
                      None
                    </SelectItem>
                    {environmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="pro-settings__hint">
                  For image backgrounds, upload a Background Scene
                </p>
              </div>

              {/* Summary */}
              {activeCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-3 border-t border-[var(--darkroom-border)]"
                >
                  <p className="text-xs text-[var(--darkroom-text-muted)]">
                    Your prompt will be enhanced with professional photography specifications.
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
