import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Lightbulb,
  Clock,
  ArrowRight,
  Wand2,
  MessageCircle,
  ChevronDown,
  Copy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
}

// Quick Preset Button
function QuickPreset({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <motion.button
      className="quick-preset"
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
    enhancement: { icon: "✨", label: "Enhancement" },
    variation: { icon: "🔄", label: "Variation" },
    creative: { icon: "💡", label: "Creative" },
  };

  const config = typeConfig[suggestion.type];

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(suggestion.text);
    toast.success("Copied to clipboard");
  };

  return (
    <motion.div
      className="suggestion-card"
      onClick={onUse}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm">{config.icon}</span>
        <span className="text-xs font-medium text-[var(--darkroom-text-muted)]">
          {config.label}
        </span>
      </div>
      <p className="suggestion-card__text">{suggestion.text}</p>
      <div className="suggestion-card__actions">
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-xs text-[var(--darkroom-accent)]"
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
          className="h-7 px-2 text-xs text-[var(--darkroom-text-muted)]"
          onClick={handleCopy}
        >
          <Copy className="w-3 h-3 mr-1" />
          Copy
        </Button>
      </div>
    </motion.div>
  );
}

// History Item
function HistoryEntry({
  item,
  onClick,
}: {
  item: HistoryItem;
  onClick: () => void;
}) {
  const timeAgo = formatTimeAgo(item.timestamp);

  return (
    <motion.button
      className="history-item"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
    >
      <span className="flex-1 truncate">{item.prompt}</span>
      <span className="text-[10px] text-[var(--darkroom-text-dim)] ml-2">
        {timeAgo}
      </span>
    </motion.button>
  );
}

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
}: RightPanelProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");

  // Generate context-aware suggestions
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
    <aside className="right-panel">
      {/* Header */}
      <div className="right-panel__header">
        <div className="right-panel__header-icon">
          <Sparkles className="w-4 h-4" />
        </div>
        <span className="right-panel__header-title">Madison Assistant</span>
      </div>

      {/* Content */}
      <div className="right-panel__content">
        {/* Context Tips */}
        {contextTips.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[var(--darkroom-accent)]" />
              <span className="text-xs font-medium text-[var(--darkroom-text-muted)]">
                Quick Tips
              </span>
            </div>
            <ul className="space-y-2">
              {contextTips.map((tip, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-xs text-[var(--darkroom-text-muted)] pl-4 border-l-2 border-[var(--darkroom-border)] hover:border-[var(--darkroom-accent)] transition-colors"
                >
                  {tip}
                </motion.li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggestions Section */}
        {suggestions.length > 0 && (
          <div className="suggestions-section">
            <div className="suggestions-section__title">
              <Wand2 className="w-4 h-4 text-[var(--darkroom-accent)]" />
              <span>Prompt Suggestions</span>
            </div>
            <AnimatePresence mode="popLayout">
              {suggestions.map((suggestion) => (
                <SuggestionCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onUse={() => onUseSuggestion(suggestion)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Quick Presets */}
        {presets.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-medium text-[var(--darkroom-text-muted)]">
                ✨ Quick Presets
              </span>
            </div>
            <div className="quick-presets">
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
          <div className="session-history">
            <button
              className="w-full flex items-center justify-between mb-3"
              onClick={() => setShowHistory(!showHistory)}
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--darkroom-text-muted)]" />
                <span className="text-sm font-medium text-[var(--darkroom-text)]">
                  Recent Prompts
                </span>
                <Badge
                  variant="outline"
                  className="bg-transparent text-[var(--darkroom-text-muted)] border-[var(--darkroom-border)]"
                >
                  {history.length}
                </Badge>
              </div>
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
                  <div className="space-y-1 max-h-[200px] overflow-y-auto">
                    {history.slice(0, 10).map((item) => (
                      <HistoryEntry
                        key={item.id}
                        item={item}
                        onClick={() => onRestoreFromHistory(item)}
                      />
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
              className="w-full flex items-center justify-between mb-3"
              onClick={() => setShowChat(!showChat)}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[var(--darkroom-accent)]" />
                <span className="text-sm font-medium text-[var(--darkroom-text)]">
                  Ask Madison
                </span>
              </div>
              <motion.div
                animate={{ rotate: showChat ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-[var(--darkroom-text-muted)]" />
              </motion.div>
            </button>

            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
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
      </div>
    </aside>
  );
}
