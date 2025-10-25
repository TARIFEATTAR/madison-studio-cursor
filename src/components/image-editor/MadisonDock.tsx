import { useState, useEffect, useRef } from "react";
import { ChevronUp, ChevronDown, Sparkles, Send } from "lucide-react";
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

interface MadisonDockProps {
  sessionCount: number;
  maxImages: number;
  onSendMessage?: (message: string) => Promise<void>;
  initialMessages?: Message[];
}

export default function MadisonDock({
  sessionCount,
  maxImages,
  onSendMessage,
  initialMessages = []
}: MadisonDockProps) {
  const [isOpen, setIsOpen] = useState(false);
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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // ⌘M or Ctrl+M to toggle
      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        if (!isOpen) {
          setTimeout(() => textareaRef.current?.focus(), 350);
        }
      }
      // Esc to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [isOpen]);

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
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-zinc-950/95 backdrop-blur-md border-t border-zinc-800",
        "rounded-t-2xl shadow-2xl transition-all duration-[350ms] ease-in-out",
        isOpen ? "translate-y-0" : "translate-y-[calc(100%-48px)]",
        isOpen && "shadow-[0_-8px_24px_rgba(0,0,0,0.4)]"
      )}
      style={{ height: "35vh", minHeight: "300px" }}
    >
      {/* Header - Always Visible */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => textareaRef.current?.focus(), 350);
          }
        }}
        className="flex items-center justify-between w-full h-12 px-6 cursor-pointer hover:bg-zinc-900/50 transition-colors rounded-t-2xl group"
      >
        <div className="flex items-center gap-3">
          <Sparkles 
            className={cn(
              "w-5 h-5 transition-all duration-300",
              isOpen 
                ? "text-aged-brass drop-shadow-[0_0_8px_rgba(184,149,106,0.6)]" 
                : "text-aged-brass/70 group-hover:text-aged-brass"
            )}
          />
          <span className="font-semibold text-aged-brass">Madison</span>
          <span className="text-xs text-zinc-500 font-medium">
            Session {sessionCount}/{maxImages}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {!isOpen && messages.length > 0 && (
            <span className="text-xs text-zinc-500">
              {messages.length} {messages.length === 1 ? 'message' : 'messages'}
            </span>
          )}
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-zinc-400 group-hover:text-aged-paper transition-colors" />
          ) : (
            <ChevronUp className="w-5 h-5 text-zinc-400 group-hover:text-aged-paper transition-colors" />
          )}
        </div>
      </button>

      {/* Body - Visible When Expanded */}
      <div className="flex flex-col h-[calc(100%-48px)]">
        {/* Messages Area */}
        <ScrollArea className="flex-1 px-6 py-4">
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
                      "max-w-[85%] rounded-lg px-4 py-3 text-sm",
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
        <div className="flex items-end gap-2 px-6 py-3 border-t border-zinc-800 bg-zinc-950/50">
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
    </div>
  );
}
