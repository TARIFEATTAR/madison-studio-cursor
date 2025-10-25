import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "madison";
  content: string;
  timestamp: number;
}

interface MadisonPanelProps {
  sessionCount: number;
  maxImages: number;
  isOpen: boolean;
  onToggle: () => void;
  onSendMessage?: (message: string) => Promise<void>;
  initialMessages?: Message[];
}

export default function MadisonPanel({
  sessionCount,
  maxImages,
  isOpen,
  onToggle,
  onSendMessage,
  initialMessages = []
}: MadisonPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Esc to close
      if (e.key === 'Escape' && isOpen) {
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen, onToggle]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      if (onSendMessage) {
        await onSendMessage(inputValue.trim());
      } else {
        // Default mock response
        setTimeout(() => {
          const madisonMessage: Message = {
            id: crypto.randomUUID(),
            role: "madison",
            content: "I'm here to help with your image generation. What would you like to refine?",
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, madisonMessage]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full z-50",
        "bg-zinc-950/95 backdrop-blur-sm border-l border-zinc-800",
        "shadow-[-4px_0_24px_rgba(0,0,0,0.4)]",
        "transition-all duration-300 ease-out",
        "w-full md:w-[360px] lg:w-[300px] xl:w-[360px]",
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-zinc-800 bg-zinc-950">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-aged-brass" />
          <span className="font-semibold text-aged-brass text-sm">Madison</span>
          <span className="text-xs text-zinc-500 font-medium">
            Session {sessionCount}/{maxImages}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-zinc-400 hover:text-aged-paper hover:bg-zinc-800/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Body */}
      <ScrollArea className="h-[calc(100vh-48px-80px)] px-4 py-3">
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="w-12 h-12 text-aged-brass/40 mb-4" />
              <p className="text-zinc-400 text-sm">
                Madison is ready to assist with your image generation.
              </p>
              <p className="text-zinc-500 text-xs mt-2">
                Ask for feedback, refinements, or creative suggestions.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex w-full",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-lg px-3 py-2 text-sm",
                    msg.role === "madison"
                      ? "bg-zinc-900 text-aged-paper border border-zinc-800 font-serif"
                      : "bg-aged-brass/10 text-aged-paper border border-aged-brass/30"
                  )}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 px-4 py-3 border-t border-zinc-800 bg-zinc-950">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Madison for feedback…"
          className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-zinc-900 border-zinc-700 text-aged-paper placeholder:text-zinc-500 focus-visible:ring-aged-brass/50"
          disabled={isSending}
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          size="icon"
          variant="brass"
          className="h-[44px] w-[44px] shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
