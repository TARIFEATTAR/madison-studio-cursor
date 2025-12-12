import { useState } from "react";
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
} from "lucide-react";
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

const ASPECT_RATIO_OPTIONS = [
  { value: "1:1", label: "Square", description: "Instagram, Product" },
  { value: "16:9", label: "Widescreen", description: "YouTube, Desktop" },
  { value: "9:16", label: "Social Story", description: "Reels, TikTok" },
  { value: "4:5", label: "Social Post", description: "Instagram Feed" },
  { value: "2:3", label: "Portrait", description: "Pinterest, Print" },
  { value: "3:2", label: "Standard", description: "Classic photo" },
];

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
        {/* Header with Tabs */}
        <div className="madison-header">
          <div className="flex items-center gap-1 flex-1">
            <button
              onClick={() => setActiveTab("madison")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                activeTab === "madison"
                  ? "bg-[var(--darkroom-accent)]/20 text-[var(--darkroom-accent)]"
                  : "text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)]"
              )}
            >
              <Wand2 className="w-3.5 h-3.5 inline mr-1.5" />
              Madison
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={cn(
                "px-3 py-1.5 text-sm font-medium rounded-md transition-colors",
                activeTab === "settings"
                  ? "bg-[var(--darkroom-accent)]/20 text-[var(--darkroom-accent)]"
                  : "text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)]"
              )}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 inline mr-1.5" />
              Settings
            </button>
          </div>
          <button 
            className="madison-collapse-btn"
            onClick={() => setIsCollapsed(true)}
            title="Collapse panel"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      {/* Content */}
      <div className="right-panel__content">
        
        {/* === SETTINGS TAB === */}
        {activeTab === "settings" && proSettings && onProSettingsChange && (
          <div className="space-y-4">
            {/* Reset Button */}
            <div className="flex items-center justify-between pb-2 border-b border-[var(--darkroom-border)]">
              <span className="text-xs text-[var(--darkroom-text-muted)]">
                {Object.values(proSettings).filter(Boolean).length} settings active
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onProSettingsChange({
                  aiProvider: "auto",
                  resolution: "standard",
                  aspectRatio: "1:1",
                  camera: undefined,
                  lighting: undefined,
                  environment: undefined,
                  characterId: undefined,
                })}
                className="h-7 px-2 text-xs text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-accent)]"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Reset All
              </Button>
            </div>

            {/* AI Model */}
            <div className="panel-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="panel-heading mb-0">
                  <Cpu className="w-4 h-4 text-[var(--darkroom-accent)]" />
                  <span>AI Model</span>
                </h4>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-3.5 h-3.5 text-[var(--darkroom-text-dim)] cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="left" className="max-w-[200px]">
                      <p className="text-xs">Choose the AI model for generation. Gemini 3.0 Pro is recommended.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select
                value={proSettings.aiProvider || "auto"}
                onValueChange={(v) => handleSettingChange("aiProvider", v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
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
                                "text-[9px] px-1.5 py-0.5 rounded font-medium",
                                option.badge === "BEST" && "bg-purple-500/20 text-purple-400",
                                option.badge === "FREE" && "bg-emerald-500/20 text-emerald-400",
                                option.badge === "SUGGESTED" && "bg-[var(--darkroom-accent)]/20 text-[var(--darkroom-accent)]",
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

            {/* Resolution */}
            <div className="panel-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="panel-heading mb-0">
                  <Maximize2 className="w-4 h-4 text-[var(--darkroom-accent)]" />
                  <span>Resolution</span>
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {RESOLUTION_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSettingChange("resolution", option.value)}
                    disabled={isGenerating}
                    className={cn(
                      "px-2 py-2 rounded-md text-xs font-medium transition-all",
                      proSettings.resolution === option.value
                        ? "bg-[var(--darkroom-accent)] text-[var(--darkroom-bg)]"
                        : "bg-[var(--darkroom-surface)] text-[var(--darkroom-text-muted)] hover:bg-[var(--darkroom-surface-elevated)]"
                    )}
                  >
                    {option.label}
                    {option.badge && (
                      <span className="block text-[9px] opacity-60">{option.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio */}
            <div className="panel-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="panel-heading mb-0">
                  <Maximize2 className="w-4 h-4 text-[var(--darkroom-accent)]" />
                  <span>Aspect Ratio</span>
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {ASPECT_RATIO_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSettingChange("aspectRatio", option.value)}
                    disabled={isGenerating}
                    className={cn(
                      "px-2 py-2 rounded-md text-xs font-medium transition-all",
                      proSettings.aspectRatio === option.value
                        ? "bg-[var(--darkroom-accent)] text-[var(--darkroom-bg)]"
                        : "bg-[var(--darkroom-surface)] text-[var(--darkroom-text-muted)] hover:bg-[var(--darkroom-surface-elevated)]"
                    )}
                  >
                    {option.label}
                    <span className="block text-[9px] opacity-60">{option.value}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera */}
            <div className="panel-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="panel-heading mb-0">
                  <Camera className="w-4 h-4 text-[var(--darkroom-accent)]" />
                  <span>Camera</span>
                </h4>
              </div>
              <Select
                value={proSettings.camera || "none"}
                onValueChange={(v) => handleSettingChange("camera", v === "none" ? undefined : v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
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

            {/* Lighting */}
            <div className="panel-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="panel-heading mb-0">
                  <Sun className="w-4 h-4 text-[var(--darkroom-accent)]" />
                  <span>Lighting</span>
                </h4>
              </div>
              <Select
                value={proSettings.lighting || "none"}
                onValueChange={(v) => handleSettingChange("lighting", v === "none" ? undefined : v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
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

            {/* Environment */}
            <div className="panel-section">
              <div className="flex items-center justify-between mb-2">
                <h4 className="panel-heading mb-0">
                  <Globe className="w-4 h-4 text-[var(--darkroom-accent)]" />
                  <span>Environment</span>
                </h4>
              </div>
              <Select
                value={proSettings.environment || "none"}
                onValueChange={(v) => handleSettingChange("environment", v === "none" ? undefined : v)}
                disabled={isGenerating}
              >
                <SelectTrigger className="w-full h-9 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text)] text-sm">
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
          </div>
        )}

        {/* === MADISON TAB === */}
        {activeTab === "madison" && (
          <>
        {/* Context Tips */}
        {contextTips.length > 0 && (
          <div className="panel-section">
            <h4 className="panel-heading">
              <Lightbulb className="w-4 h-4 text-[var(--darkroom-accent)]" />
              <span>Quick Tips</span>
            </h4>
            <ul className="space-y-2">
              {contextTips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-xs text-[var(--darkroom-text-muted)] pl-4 border-l-2 border-[var(--darkroom-border)] hover:border-[var(--darkroom-accent)] transition-colors py-1"
                >
                  {tip}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Smart Suggestions */}
        {suggestions.length > 0 && (
          <div className="panel-section">
            <h4 className="panel-heading">
              <Wand2 className="w-4 h-4 text-[var(--darkroom-accent)]" />
              <span>Suggestions</span>
            </h4>
            <div className="suggestions-list">
              <AnimatePresence mode="popLayout">
                {suggestions.map((suggestion, i) => (
                  <SuggestionCard
                    key={suggestion.id}
                    suggestion={suggestion}
                    onUse={() => onUseSuggestion(suggestion)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Quick Presets */}
        {presets.length > 0 && (
          <div className="panel-section">
            <h4 className="panel-heading">
              <Palette className="w-4 h-4 text-[var(--darkroom-accent)]" />
              <span>Quick Presets</span>
            </h4>
            <div className="presets-grid">
              {presets.map((preset, i) => (
                <QuickPreset
                  key={i}
                  label={preset}
                  onClick={() => onApplyPreset(preset)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Session History */}
        {history.length > 0 && (
          <div className="panel-section">
            <button
              className="w-full flex items-center justify-between mb-3"
              onClick={() => setShowHistory(!showHistory)}
            >
              <h4 className="panel-heading mb-0">
                <History className="w-4 h-4 text-[var(--darkroom-text-muted)]" />
                <span>Recent Prompts</span>
                <Badge
                  variant="outline"
                  className="ml-2 bg-transparent text-[var(--darkroom-text-muted)] border-[var(--darkroom-border)]"
                >
                  {history.length}
                </Badge>
              </h4>
              <motion.div
                animate={{ rotate: showHistory ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-[var(--darkroom-text-muted)]" />
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
                  <div className="history-list max-h-[200px] overflow-y-auto">
                    {history.slice(0, 10).map((item) => (
                      <button
                        key={item.id}
                        className="history-item"
                        onClick={() => onRestoreFromHistory(item)}
                      >
                        <span className="flex-1 truncate">{item.prompt}</span>
                        <span className="text-[10px] text-[var(--darkroom-text-dim)] ml-2">
                          {formatTimeAgo(item.timestamp)}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Chat with Madison (optional) */}
        {onSendMessage && (
          <div className="mt-auto pt-6 border-t border-[var(--darkroom-border)]">
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
