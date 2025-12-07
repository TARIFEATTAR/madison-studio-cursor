import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Camera, Sun, Globe, X, Info, SlidersHorizontal, Maximize2, Cpu, Sparkles, Zap } from "lucide-react";
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

// Aspect ratio options
const ASPECT_RATIO_OPTIONS = [
  { value: "1:1", label: "Square (1:1)", description: "Instagram, Product" },
  { value: "4:3", label: "Classic (4:3)", description: "Traditional photo" },
  { value: "3:4", label: "Portrait (3:4)", description: "Mobile, Pinterest" },
  { value: "16:9", label: "Wide (16:9)", description: "YouTube, Desktop" },
  { value: "9:16", label: "Story (9:16)", description: "Reels, TikTok" },
  { value: "21:9", label: "Cinematic (21:9)", description: "Film, Banner" },
];

// AI Provider options
const AI_PROVIDER_OPTIONS = [
  { value: "auto", label: "Auto (Smart Select)", description: "Best for your plan" },
  { value: "gemini", label: "Gemini 2.0 Flash", description: "Fast, reliable" },
  { value: "freepik-mystic", label: "Freepik Mystic", description: "Studio+ only" },
  { value: "freepik-flux", label: "Freepik Flux", description: "Studio+ only" },
];

// Resolution/Quality options
const RESOLUTION_OPTIONS = [
  { value: "standard", label: "Standard", description: "1024×1024" },
  { value: "high", label: "High", description: "2048×2048" },
  { value: "4k", label: "4K Ultra", description: "4096×4096 (Signature)" },
];

export interface ProModeSettings {
  camera?: string;
  lighting?: string;
  environment?: string;
  aspectRatio?: string;
  aiProvider?: string;
  resolution?: string;
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

  const handleAspectRatioChange = (value: string) => {
    onChange({ ...settings, aspectRatio: value === "1:1" ? undefined : value });
  };

  const handleAiProviderChange = (value: string) => {
    onChange({ ...settings, aiProvider: value === "auto" ? undefined : value });
  };

  const handleResolutionChange = (value: string) => {
    onChange({ ...settings, resolution: value === "standard" ? undefined : value });
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
                  <SelectContent className="bg-[#1a1816] border-[var(--darkroom-border)] z-50">
                    <SelectItem value="none" className="text-[#a09080] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]">
                      None
                    </SelectItem>
                    {cameraOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-[#f5f0e6] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]">
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
                  <SelectContent className="bg-[#1a1816] border-[var(--darkroom-border)] z-50">
                    <SelectItem value="none" className="text-[#a09080] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]">
                      None
                    </SelectItem>
                    {lightingOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-[#f5f0e6] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]">
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
                  <SelectContent className="bg-[#1a1816] border-[var(--darkroom-border)] z-50">
                    <SelectItem value="none" className="text-[#a09080] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]">
                      None
                    </SelectItem>
                    {environmentOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-[#f5f0e6] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="pro-settings__hint">
                  For image backgrounds, upload a Background Scene
                </p>
              </div>

              {/* Aspect Ratio */}
              <div className="pro-settings__control">
                <label className="pro-settings__control-label">
                  <Maximize2 className="w-3.5 h-3.5" />
                  Aspect Ratio
                </label>
                <Select
                  value={settings.aspectRatio || "1:1"}
                  onValueChange={handleAspectRatioChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                    <SelectValue placeholder="Select aspect ratio..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1816] border-[var(--darkroom-border)] z-50">
                    {ASPECT_RATIO_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-[#f5f0e6] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]"
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="text-[#a09080] text-xs ml-2">{option.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Divider for AI Settings */}
              <div className="pro-settings__divider">
                <span className="pro-settings__divider-text">AI Model Settings</span>
              </div>

              {/* AI Provider */}
              <div className="pro-settings__control">
                <div className="flex items-center justify-between">
                  <label className="pro-settings__control-label">
                    <Cpu className="w-3.5 h-3.5" />
                    AI Provider
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-[var(--darkroom-text-dim)] cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[220px]">
                        <p className="text-xs">
                          Freepik models require Studio or Signature plan. 
                          Auto will select the best available for your tier.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={settings.aiProvider || "auto"}
                  onValueChange={handleAiProviderChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                    <SelectValue placeholder="Select AI provider..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1816] border-[var(--darkroom-border)] z-50">
                    {AI_PROVIDER_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-[#f5f0e6] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]"
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="text-[#a09080] text-xs ml-2">{option.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Resolution/Quality */}
              <div className="pro-settings__control">
                <div className="flex items-center justify-between">
                  <label className="pro-settings__control-label">
                    <Sparkles className="w-3.5 h-3.5" />
                    Resolution
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-3 h-3 text-[var(--darkroom-text-dim)] cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]">
                        <p className="text-xs">
                          Higher resolution uses more credits. 
                          4K requires Signature plan.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={settings.resolution || "standard"}
                  onValueChange={handleResolutionChange}
                  disabled={disabled}
                >
                  <SelectTrigger className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
                    <SelectValue placeholder="Select resolution..." />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1816] border-[var(--darkroom-border)] z-50">
                    {RESOLUTION_OPTIONS.map((option) => (
                      <SelectItem 
                        key={option.value} 
                        value={option.value} 
                        className="text-[#f5f0e6] focus:bg-[#2a2520] focus:text-[#f5f0e6] data-[highlighted]:bg-[#2a2520] data-[highlighted]:text-[#f5f0e6]"
                      >
                        <span className="flex items-center justify-between w-full">
                          <span>{option.label}</span>
                          <span className="text-[#a09080] text-xs ml-2">{option.description}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
