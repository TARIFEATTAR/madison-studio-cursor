import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  Clock,
  ArrowRight,
  Wand2,
  MessageCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Palette,
  History,
  Zap,
  RefreshCw,
  X,
  SlidersHorizontal,
  Cpu,
  Camera,
  Sun,
  Globe,
  Maximize2,
  Info,
  Aperture,
} from "lucide-react";
import { 
  LEDIndicator, 
  ModeDialButton, 
  FirmwarePresetButton,
  type LEDState 
} from "./LEDIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ProModeSettings } from "./ProSettings";
import {
  getCameraOptions,
  getLightingOptions,
  getEnvironmentOptions,
} from "@/utils/promptFormula";
import {
  COMMON_ASPECT_RATIOS,
  VISUAL_SQUADS,
  type VisualSquad,
} from "@/config/imageSettings";

interface Suggestion {
  id: string;
  text: string;
  type: "enhancement" | "variation" | "creative";
}

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
}

// AI Model options
const AI_MODEL_OPTIONS = [
  { value: "auto", label: "Auto", description: "AI picks what's best", badge: "SUGGESTED", group: "auto" },
  { value: "gemini-3-pro-image", label: "Gemini 3.0 Pro", description: "Google's latest", badge: "BEST", group: "gemini" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", description: "Fast & reliable", badge: "FREE", group: "gemini" },
  { value: "freepik-seedream-4", label: "Seedream 4", description: "4K capable", badge: "4K", group: "freepik" },
  { value: "freepik-flux-pro", label: "Flux Pro v1.1", description: "Premium", badge: "NEW", group: "freepik" },
  { value: "freepik-hyperflux", label: "Hyperflux", description: "Ultra-fast", badge: "FAST", group: "freepik" },
  { value: "freepik-flux", label: "Flux Dev", description: "Community favorite", badge: "POPULAR", group: "freepik" },
  { value: "freepik-mystic", label: "Mystic", description: "2K resolution", badge: null, group: "freepik" },
];

const RESOLUTION_OPTIONS = [
  { value: "standard", label: "Standard", description: "1K (1024px)" },
  { value: "high", label: "High", description: "2K (2048px)" },
  { value: "4k", label: "4K Ultra", description: "4K (4096px)", badge: "Signature" },
];

// Use centralized aspect ratios from imageSettings.ts
const ASPECT_RATIO_OPTIONS = COMMON_ASPECT_RATIOS;

type RightPanelTab = "madison" | "settings";

interface RightPanelProps {
  // Suggestions based on context
  suggestions: Suggestion[];
  onUseSuggestion: (suggestion: Suggestion) => void;

  // Quick presets
  presets: string[];
  onApplyPreset: (preset: string) => void;

  // Session history
  history: HistoryItem[];
  onRestoreFromHistory: (item: HistoryItem) => void;

  // Madison chat (optional)
  onSendMessage?: (message: string) => void;
  chatMessages?: { role: "user" | "assistant"; content: string }[];

  // Context info
  hasProduct: boolean;
  hasBackground: boolean;
  hasStyle: boolean;
  proSettingsCount: number;
  
  // Pro Settings (NEW)
  proSettings?: ProModeSettings;
  onProSettingsChange?: (settings: ProModeSettings) => void;
  isGenerating?: boolean;
}

// Quick Preset Button
function QuickPreset({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      className="preset-button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {label}
    </motion.button>
  );
}

// Suggestion Card
function SuggestionCard({
  suggestion,
  onUse,
}: {
  suggestion: Suggestion;
  onUse: () => void;
}) {
  const typeConfig = {
    enhancement: { icon: Zap, label: "Enhancement" },
    variation: { icon: RefreshCw, label: "Variation" },
    creative: { icon: Lightbulb, label: "Creative" },
  };

  const config = typeConfig[suggestion.type];
  const IconComponent = config.icon;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(suggestion.text);
    toast.success("Copied to clipboard");
  };

  return (
    <motion.div
      className="suggestion-card"
      onClick={onUse}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <IconComponent className="w-3.5 h-3.5 text-[var(--darkroom-accent)]" />
        <span className="text-xs font-medium text-[var(--darkroom-text-muted)]">
          {config.label}
        </span>
      </div>
      <p className="suggestion-card__text">{suggestion.text}</p>
      <div className="suggestion-card__actions">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-[var(--darkroom-accent)] hover:bg-[var(--darkroom-accent)]/10"
          onClick={(e) => {
            e.stopPropagation();
            onUse();
          }}
        >
          <ArrowRight className="w-3 h-3 mr-1" />
          Use this
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)]"
          onClick={handleCopy}
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
      </div>
    </motion.div>
  );
}

// Style References Section - Lens/Filter Treatment
// Treated like adding a lens or filter to the camera
// Minimal affordance, subtle focus glow, no "dropzone UI clichés"
function StyleReferencesSection({ onApplyStyle }: { onApplyStyle: (style: string) => void }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [styleImages, setStyleImages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            setStyleImages(prev => [...prev.slice(-3), ev.target!.result as string]);
            toast.success("Style filter attached");
          }
        };
        reader.readAsDataURL(file);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setStyleImages(prev => prev.filter((_, i) => i !== index));
    toast.success("Style filter removed");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setStyleImages(prev => [...prev.slice(-3), ev.target!.result as string]);
              toast.success("Style filter attached");
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  return (
    <div className="camera-panel mb-3">
      <button
        className="w-full flex items-center justify-between p-3 border-b border-white/5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <LEDIndicator state={styleImages.length > 0 ? "ready" : "off"} size="sm" />
          <Palette className="w-3.5 h-3.5 text-[var(--darkroom-accent)]" />
          <span className="text-[10px] font-medium text-[var(--darkroom-text-muted)] uppercase tracking-wider">Style Filter</span>
          {styleImages.length > 0 && (
            <Badge
              variant="outline"
              className="ml-1 bg-transparent text-[var(--led-ready)] border-[var(--led-ready)]/30 text-[9px] px-1.5 py-0"
            >
              {styleImages.length} attached
            </Badge>
          )}
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-[var(--darkroom-text-muted)]" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-3">
              {/* Style Image Grid - Lens filter appearance */}
              {styleImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {styleImages.map((img, idx) => (
                    <div key={idx} className="style-image-thumb group">
                      <img src={img} alt={`Style filter ${idx + 1}`} />
                      <button
                        onClick={() => removeImage(idx)}
                        className="style-image-remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Zone - Lens mount feel */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <div
                className={cn(
                  "style-reference-zone",
                  isDragging && "style-reference-zone--dragging",
                  styleImages.length > 0 && "style-reference-zone--active"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="style-upload-mount">
                  <Palette className="style-upload-mount__icon" />
                  <span className="style-upload-mount__text">
                    {styleImages.length > 0 
                      ? "Attach another filter" 
                      : "Attach style reference"}
                  </span>
                  <span className="style-upload-mount__subtext">
                    Influences lighting & composition
                  </span>
                </div>
              </div>

              {/* Quick Style Presets */}
              {styleImages.length === 0 && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <span className="text-[9px] text-[var(--darkroom-text-dim)] uppercase tracking-wider block mb-2">Quick Filters</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["Minimalist", "Editorial", "Rustic", "Luxe"].map(style => (
                      <button
                        key={style}
                        onClick={(e) => {
                          e.stopPropagation();
                          onApplyStyle(`${style} style`);
                        }}
                        className="px-2.5 py-1.5 rounded text-[10px] bg-[var(--camera-body)] border border-white/5 hover:border-white/15 text-[var(--darkroom-text-muted)] transition-all hover:text-[var(--darkroom-text)]"
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Format time ago helper
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function RightPanel({
  suggestions,
  onUseSuggestion,
  presets,
  onApplyPreset,
  history,
  onRestoreFromHistory,
  onSendMessage,
  chatMessages,
  hasProduct,
  hasBackground,
  hasStyle,
  proSettingsCount,
  proSettings,
  onProSettingsChange,
  isGenerating = false,
}: RightPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [activeTab, setActiveTab] = useState<RightPanelTab>("madison");
  
  // Get photography options
  const cameraOptions = getCameraOptions();
  const lightingOptions = getLightingOptions();
  const environmentOptions = getEnvironmentOptions();
  
  // Handle settings change
  const handleSettingChange = (key: keyof ProModeSettings, value: string | undefined) => {
    if (onProSettingsChange && proSettings) {
      onProSettingsChange({ ...proSettings, [key]: value });
    }
  };

  // Generate context-aware tips
  const contextTips = [];
  if (!hasProduct) {
    contextTips.push("Upload a product image for enhancement suggestions");
  }
  if (hasProduct && !hasBackground) {
    contextTips.push("Try adding a background scene for composition");
  }
  if (hasProduct && hasBackground && !hasStyle) {
    contextTips.push("Add a style reference for matching lighting");
  }
  if (proSettingsCount === 0) {
    contextTips.push("Enable Pro Settings for camera & lighting control");
  }

  const handleSendChat = () => {
    if (chatInput.trim() && onSendMessage) {
      onSendMessage(chatInput.trim());
      setChatInput("");
    }
  };

  return (
    <>
      {/* Collapsed Toggle Button */}
      <AnimatePresence>
        {isCollapsed && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="madison-drawer-toggle madison-drawer-toggle--collapsed"
            onClick={() => setIsCollapsed(false)}
            title="Open Madison Assistant"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="madison-drawer-toggle__label">Madison</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Drawer Panel */}
      <motion.aside 
        className={cn("right-panel", isCollapsed && "right-panel--collapsed")}
        initial={false}
        animate={{ 
          width: isCollapsed ? 0 : "auto",
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Header with Tabs - Glossy Camera Top Plate Style */}
        <div className="relative px-2 py-2 border-b border-[var(--darkroom-border)] bg-[var(--camera-body)] overflow-hidden">
          {/* Glossy highlight */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.06] via-transparent to-black/20 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="relative flex items-center gap-1">
            {/* Tab Buttons - Firmware style */}
            <div className="flex-1 flex gap-1 p-1 rounded-lg bg-black/30 border border-white/5">
              <button
                onClick={() => setActiveTab("madison")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[12px] font-mono uppercase tracking-wider transition-all duration-200",
                  activeTab === "madison"
                    ? "bg-[var(--camera-body)] text-[var(--darkroom-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)] border border-[var(--darkroom-accent)]/30"
                    : "text-[var(--darkroom-text-dim)] hover:text-[var(--darkroom-text-muted)] hover:bg-white/5"
                )}
              >
                <Wand2 className="w-3 h-3" />
                Madison
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-[12px] font-mono uppercase tracking-wider transition-all duration-200",
                  activeTab === "settings"
                    ? "bg-[var(--camera-body)] text-[var(--darkroom-accent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.3)] border border-[var(--darkroom-accent)]/30"
                    : "text-[var(--darkroom-text-dim)] hover:text-[var(--darkroom-text-muted)] hover:bg-white/5"
                )}
              >
                <SlidersHorizontal className="w-3 h-3" />
                Settings
              </button>
            </div>
            
            {/* Collapse button */}
            <button 
              className="w-8 h-8 flex items-center justify-center rounded-md bg-black/30 border border-white/5 text-[var(--darkroom-text-dim)] hover:text-[var(--darkroom-text)] hover:bg-white/5 transition-colors"
              onClick={() => setIsCollapsed(true)}
              title="Collapse panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      {/* Content */}
      <div className="right-panel__content">
        
        {/* === SETTINGS TAB - Compact Camera Body Aesthetic === */}
        {activeTab === "settings" && proSettings && onProSettingsChange && (
          <div className="space-y-3">
            {/* Compact Status Bar */}
            <div className="flex items-center justify-between px-1 py-2 border-b border-white/5">
              <div className="flex items-center gap-2">
                <LEDIndicator 
                  state={isGenerating ? "processing" : Object.values(proSettings).filter(Boolean).length > 0 ? "ready" : "off"} 
                  size="md"
                />
                <span className="text-[10px] font-mono text-[var(--darkroom-text-muted)] uppercase tracking-[0.1em]">
                  {isGenerating ? "Processing" : `${Object.values(proSettings).filter(Boolean).length} settings active`}
                </span>
              </div>
              <button
                onClick={() => onProSettingsChange({
                  aiProvider: "auto",
                  resolution: "standard",
                  aspectRatio: "1:1",
                  camera: undefined,
                  lighting: undefined,
                  environment: undefined,
                  characterId: undefined,
                })}
                className="text-[9px] text-[var(--darkroom-text-dim)] hover:text-[var(--led-error)] font-mono uppercase tracking-wider flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-2.5 h-2.5" />
                Reset All
              </button>
            </div>

            {/* AI Model - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator 
                  state={proSettings.aiProvider && proSettings.aiProvider !== "auto" ? "active" : "ready"} 
                  size="sm"
                />
                <Cpu className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">AI Model</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-2.5 h-2.5 text-[var(--darkroom-text-dim)] cursor-help ml-auto" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                      <p className="text-xs">Choose the AI model for generation.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={proSettings.aiProvider || "auto"}
                onValueChange={(v) => handleSettingChange("aiProvider", v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-8 bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text)] text-[11px] font-mono rounded-md">
                  <SelectValue placeholder="Select model..." />
                </SelectTrigger>
                <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] max-h-[280px]">
                  {AI_MODEL_OPTIONS.map((option, idx) => {
                    const prevOption = idx > 0 ? AI_MODEL_OPTIONS[idx - 1] : null;
                    const showGroupHeader = !prevOption || prevOption.group !== option.group;
                    const groupLabels: Record<string, string> = {
                      "gemini": "Google Gemini",
                      "freepik": "Freepik Models",
                    };
                    
                    return (
                      <div key={option.value}>
                        {showGroupHeader && option.group !== "auto" && (
                          <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-[var(--darkroom-text-dim)] font-medium border-t border-[var(--darkroom-border)] mt-1 first:mt-0 first:border-t-0">
                            {groupLabels[option.group] || option.group}
                          </div>
                        )}
                        <SelectItem value={option.value} className="text-[var(--darkroom-text)]">
                          <span className="flex items-center gap-2">
                            <span>{option.label}</span>
                            {option.badge && (
                              <span className={cn(
                                "text-[8px] px-1.5 py-0.5 rounded font-medium",
                                option.badge === "BEST" && "bg-purple-500/20 text-purple-400",
                                option.badge === "FREE" && "bg-emerald-500/20 text-emerald-400",
                                option.badge === "SUGGESTED" && "bg-[var(--led-ready)]/20 text-[var(--led-ready)]",
                                option.badge === "NEW" && "bg-emerald-500/20 text-emerald-400",
                                option.badge === "FAST" && "bg-cyan-500/20 text-cyan-400",
                                option.badge === "4K" && "bg-amber-500/20 text-amber-400",
                                option.badge === "POPULAR" && "bg-blue-500/20 text-blue-400"
                              )}>
                                {option.badge}
                              </span>
                            )}
                          </span>
                        </SelectItem>
                      </div>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Resolution - Compact Exposure Meter Style */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator 
                  state={proSettings.resolution && proSettings.resolution !== "standard" ? "active" : "off"} 
                  size="sm"
                />
                <Maximize2 className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Resolution</span>
              </div>
              <div className="flex gap-1 p-1 rounded-lg bg-black/30 border border-white/5">
                  {RESOLUTION_OPTIONS.map((option, idx) => {
                    const isSelected = proSettings.resolution === option.value || 
                      (!proSettings.resolution && option.value === "standard");
                    const isLit = RESOLUTION_OPTIONS.findIndex(o => 
                      o.value === (proSettings.resolution || "standard")
                    ) >= idx;
                    
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleSettingChange("resolution", option.value)}
                        disabled={isGenerating}
                        className={cn(
                          "flex-1 py-2 px-1 rounded transition-all text-center",
                          isSelected 
                            ? "bg-[var(--led-ready)]/20" 
                            : "bg-transparent hover:bg-white/5"
                        )}
                      >
                        <div className={cn(
                          "h-2 rounded-sm mb-1.5 mx-auto transition-all",
                          isLit 
                            ? "bg-[var(--led-ready)] shadow-[0_0_8px_var(--led-ready)]" 
                            : "bg-[var(--led-off)]"
                        )} style={{ width: "80%" }} />
                        <span className={cn(
                          "text-[12px] font-mono uppercase tracking-wider block",
                          isSelected ? "text-[var(--led-ready)]" : "text-[var(--darkroom-text-dim)]"
                        )}>
                          {option.label}
                        </span>
                        {option.badge && (
                          <span className="text-[8px] text-purple-400 block">{option.badge}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
            </div>

            {/* Aspect Ratio - Compact Grid */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator 
                  state={proSettings.aspectRatio && proSettings.aspectRatio !== "1:1" ? "active" : "off"} 
                  size="sm"
                />
                <Aperture className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Aspect Ratio</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {ASPECT_RATIO_OPTIONS.map((option) => {
                  const isSelected = proSettings.aspectRatio === option.value ||
                    (!proSettings.aspectRatio && option.value === "1:1");
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleSettingChange("aspectRatio", option.value)}
                      disabled={isGenerating}
                      className={cn(
                        "px-1.5 py-1.5 rounded-md text-center transition-all border",
                        isSelected
                          ? "bg-[var(--led-ready)]/10 border-[var(--led-ready)]/30 text-[var(--led-ready)]"
                          : "bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text-muted)] hover:border-white/10"
                      )}
                    >
                      <span className="text-[10px] font-medium block">{option.label}</span>
                      <span className={cn(
                        "text-[10px] font-mono block",
                        isSelected ? "text-[var(--led-ready)]/70" : "opacity-50"
                      )}>{option.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Camera / Lighting / Environment - Compact Dropdowns */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator 
                  state={proSettings.camera || proSettings.lighting || proSettings.environment ? "active" : "off"} 
                  size="sm"
                />
                <Camera className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Camera</span>
              </div>
              <Select
                value={proSettings.camera || "none"}
                onValueChange={(v) => handleSettingChange("camera", v === "none" ? undefined : v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-8 bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text)] text-[11px] rounded-md">
                  <SelectValue placeholder="No camera style" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] max-h-[200px]">
                  <SelectItem value="none" className="text-[var(--darkroom-text)]">No camera style</SelectItem>
                  {cameraOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[var(--darkroom-text)]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator state={proSettings.lighting ? "active" : "off"} size="sm" />
                <Sun className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Lighting</span>
              </div>
              <Select
                value={proSettings.lighting || "none"}
                onValueChange={(v) => handleSettingChange("lighting", v === "none" ? undefined : v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-8 bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text)] text-[11px] rounded-md">
                  <SelectValue placeholder="No lighting style" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] max-h-[200px]">
                  <SelectItem value="none" className="text-[var(--darkroom-text)]">No lighting style</SelectItem>
                  {lightingOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[var(--darkroom-text)]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator state={proSettings.environment ? "active" : "off"} size="sm" />
                <Globe className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Environment</span>
              </div>
              <Select
                value={proSettings.environment || "none"}
                onValueChange={(v) => handleSettingChange("environment", v === "none" ? undefined : v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-8 bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text)] text-[11px] rounded-md">
                  <SelectValue placeholder="No environment" />
                </SelectTrigger>
                <SelectContent className="bg-[var(--darkroom-surface)] border-[var(--darkroom-border)] max-h-[200px]">
                  <SelectItem value="none" className="text-[var(--darkroom-text)]">No environment</SelectItem>
                  {environmentOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value} className="text-[var(--darkroom-text)]">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Visual Squad Selector - Compact */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <LEDIndicator state={proSettings.visualSquad ? "active" : "ready"} size="sm" />
                <Palette className="w-3 h-3 text-[var(--darkroom-accent)]" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Visual Style</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleSettingChange("visualSquad", undefined)}
                  disabled={isGenerating}
                  className={cn(
                    "px-1.5 py-1.5 rounded-md text-[10px] transition-all text-center border",
                    !proSettings.visualSquad
                      ? "bg-[var(--led-ready)]/10 border-[var(--led-ready)]/30 text-[var(--led-ready)] font-medium"
                      : "bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text-muted)] hover:border-white/10"
                  )}
                >
                  Auto
                </button>
                {VISUAL_SQUADS.map((squad) => (
                  <button
                    key={squad.value}
                    onClick={() => handleSettingChange("visualSquad", squad.value)}
                    disabled={isGenerating}
                    className={cn(
                      "px-1.5 py-1.5 rounded-md text-[10px] transition-all text-center border",
                      proSettings.visualSquad === squad.value
                        ? "bg-[var(--led-active)]/10 border-[var(--led-active)]/30 text-[var(--led-active)] font-medium"
                        : "bg-[var(--camera-body-deep)] border-white/5 text-[var(--darkroom-text-muted)] hover:border-white/10"
                    )}
                  >
                    {squad.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === MADISON TAB - Compact Layout === */}
        {activeTab === "madison" && (
          <>
        {/* Quick Shot Types - Compact horizontal pills */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <LEDIndicator state="ready" size="sm" />
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Shot Type</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: "Hero", icon: "🎯" },
              { label: "Lifestyle", icon: "🏠" },
              { label: "Detail", icon: "🔍" },
              { label: "Scale", icon: "📏" },
              { label: "Package", icon: "📦" },
            ].map((shot) => (
              <button
                key={shot.label}
                onClick={() => onApplyPreset(shot.label)}
                className="px-2.5 py-1.5 rounded-md text-[12px] font-medium bg-[var(--camera-body-deep)] border border-white/5 text-[var(--darkroom-text-muted)] hover:border-[var(--darkroom-accent)]/50 hover:text-[var(--darkroom-accent)] transition-all flex items-center gap-1"
              >
                <span className="text-[11px]">{shot.icon}</span>
                {shot.label}
              </button>
            ))}
          </div>
        </div>

        {/* Platform Presets - Compact grid */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <LEDIndicator state="off" size="sm" />
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Platform</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: "Etsy", color: "#fb923c" },
              { label: "Amazon", color: "#fbbf24" },
              { label: "Instagram", color: "#f472b6" },
              { label: "TikTok", color: "#22d3ee" },
            ].map((platform) => (
              <button
                key={platform.label}
                onClick={() => onApplyPreset(`Optimize for ${platform.label}`)}
                className="px-2.5 py-2 rounded-md text-[10px] font-semibold bg-[var(--camera-body-deep)] border border-white/5 hover:border-white/10 transition-all text-left"
                style={{ color: platform.color }}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Smart Suggestions - Compact cards */}
        {suggestions.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <LEDIndicator state="active" size="sm" />
              <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Suggestions</span>
            </div>
            <div className="space-y-1.5">
              {suggestions.slice(0, 2).map((suggestion) => (
                <button
                  key={suggestion.id}
                  onClick={() => onUseSuggestion(suggestion)}
                  className="w-full p-2.5 rounded-md text-left text-[12px] leading-relaxed bg-[var(--camera-body-deep)] border border-white/5 text-[var(--darkroom-text-muted)] hover:border-[var(--darkroom-accent)]/30 hover:bg-[var(--darkroom-accent)]/5 transition-all"
                >
                  {suggestion.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Session History - Compact collapsible */}
        {history.length > 0 && (
          <div className="mb-4">
            <button
              className="w-full flex items-center justify-between mb-2"
              onClick={() => setShowHistory(!showHistory)}
            >
              <div className="flex items-center gap-2">
                <LEDIndicator state={showHistory ? "active" : "off"} size="sm" />
                <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">
                  History ({history.length})
                </span>
              </div>
              <motion.div
                animate={{ rotate: showHistory ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-3 h-3 text-[var(--darkroom-text-dim)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1 max-h-[120px] overflow-y-auto">
                    {history.slice(0, 5).map((item) => (
                      <button
                        key={item.id}
                        className="w-full px-2.5 py-1.5 rounded text-[10px] text-left bg-[var(--camera-body-deep)] border border-white/5 text-[var(--darkroom-text-dim)] hover:text-[var(--darkroom-text-muted)] hover:border-white/10 transition-all truncate"
                        onClick={() => onRestoreFromHistory(item)}
                      >
                        {item.prompt}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pro Tips Section - Fills void space */}
        <div className="mt-6 p-3 rounded-lg bg-gradient-to-b from-[var(--camera-body-deep)] to-transparent border border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--darkroom-accent)]" />
            <span className="text-[11px] font-mono uppercase tracking-[0.12em] text-[var(--darkroom-text-dim)]">Pro Tips</span>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-[var(--darkroom-accent)] mt-0.5">›</span>
              <p className="text-[12px] leading-relaxed text-[var(--darkroom-text-dim)]">
                Add a <span className="text-[var(--darkroom-text-muted)]">product image</span> first for best results
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-[var(--darkroom-accent)] mt-0.5">›</span>
              <p className="text-[12px] leading-relaxed text-[var(--darkroom-text-dim)]">
                Describe <span className="text-[var(--darkroom-text-muted)]">mood & setting</span>, not just the product
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[10px] text-[var(--darkroom-accent)] mt-0.5">›</span>
              <p className="text-[12px] leading-relaxed text-[var(--darkroom-text-dim)]">
                Use <span className="text-[var(--darkroom-text-muted)]">Settings</span> tab for aspect ratio & quality
              </p>
            </div>
          </div>
        </div>

        {/* Chat with Madison (optional) */}
        {onSendMessage && (
          <div className="mt-auto pt-4 border-t border-white/5">
            <button
              className="chat-toggle"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Chat with Madison</span>
            </button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden mt-3"
                >
                  {/* Chat Messages */}
                  {chatMessages && chatMessages.length > 0 && (
                    <div className="max-h-[200px] overflow-y-auto mb-3 space-y-2">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className={cn(
                            "text-xs p-2 rounded-md",
                            msg.role === "user"
                              ? "bg-[var(--darkroom-accent)]/20 text-[var(--darkroom-text)] ml-4"
                              : "bg-[var(--darkroom-surface-elevated)] text-[var(--darkroom-text-muted)] mr-4"
                          )}
                        >
                          {msg.content}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Chat Input */}
                  <div className="flex gap-2">
                    <Input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendChat();
                        }
                      }}
                      placeholder="Ask for help..."
                      className="h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendChat}
                      disabled={!chatInput.trim()}
                      className="h-9 px-3 bg-[var(--darkroom-accent)] hover:bg-[var(--darkroom-accent-hover)] text-[var(--darkroom-bg)]"
                    >
                      Send
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
        </>
        )}
      </div>
    </motion.aside>
    </>
  );
}
