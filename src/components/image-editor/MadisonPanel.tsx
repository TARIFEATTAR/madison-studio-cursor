import { useState, useEffect, useRef } from "react";
import { X, Sparkles, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";

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
  isMobile?: boolean;
}

export default function MadisonPanel({
  sessionCount,
  maxImages,
  isOpen,
  onToggle,
  onSendMessage,
  initialMessages = [],
  isMobile = false
}: MadisonPanelProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
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

  const { currentOrganizationId } = useOnboarding();

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: inputValue.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      // Allow external hook-in, but always ensure we reply
      if (onSendMessage) {
        try { await onSendMessage(messageToSend); } catch {}
      }

      // Build short conversation context
      const conversation = messages
        .map(m => `${m.role === 'user' ? 'User' : 'Madison'}: ${m.content}`)
        .join("\n\n");

      const prompt = `${conversation}\n\nUser: ${messageToSend}\n\nMadison:`;

      const { data, error } = await supabase.functions.invoke("generate-with-claude", {
        body: {
          prompt,
          organizationId: currentOrganizationId,
          mode: "consult",
        },
      });

      if (error) throw error;

      const content: string = data?.generatedContent || "Let's refine this. Tell me the key product, surface, angle, and lighting you want.";

      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "madison",
        content,
        timestamp: Date.now(),
      }]);
    } catch (err: any) {
      console.error("Madison chat error:", err);
      toast({
        title: "Assistant error",
        description: err?.message || "Unable to reach Madison right now.",
        variant: "destructive",
      });
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: "madison",
        content: "I'm having trouble connecting. Please try again in a moment.",
        timestamp: Date.now(),
      }]);
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

  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessageId(messageId);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  // Mobile: Bottom Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onToggle}>
        <SheetContent 
          side="bottom" 
          className="h-[100dvh] max-h-[100dvh] bg-zinc-950 border-zinc-800 p-0 z-[1001]"
        >
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b border-zinc-800 px-4 py-3 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-aged-brass" />
                  <SheetTitle className="text-aged-brass">Madison</SheetTitle>
                  <span className="text-xs text-zinc-500 font-medium">
                    Session {sessionCount}/{maxImages}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className="text-zinc-400 hover:text-aged-paper h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </SheetHeader>

          <ScrollArea className="flex-1 px-4 py-3 pb-20">
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Sparkles className="w-10 h-10 text-aged-brass/40 mb-3" />
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
                    {msg.role === "madison" ? (
                      <div className="relative max-w-[85%] group">
                        <div className="bg-zinc-900 text-studio-text-primary border border-zinc-800 font-serif rounded-lg px-3 py-2 text-sm">
                          {msg.content}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopyMessage(msg.content, msg.id)}
                          className="absolute -top-2 -right-2 h-6 w-6 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-full opacity-100 transition-opacity"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="w-3 h-3 text-green-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="max-w-[85%] bg-aged-brass/10 text-studio-text-primary border border-aged-brass/30 rounded-lg px-3 py-2 text-sm">
                        {msg.content}
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="shrink-0 flex items-end gap-2 border-t border-zinc-800 px-4 py-3 pb-20 bg-zinc-950">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Madison for feedback…"
              className="flex-1 min-h-[44px] max-h-[100px] resize-none bg-zinc-900 border-zinc-700 text-studio-text-primary placeholder:text-studio-text-muted"
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
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Side Panel (Light Mode)
  return (
    <div
      className={cn(
        "fixed top-0 right-0 h-full z-[1001]",
        "bg-[#FFFCF5]/95 backdrop-blur-sm border-l border-[#E7E1D4]",
        "shadow-[-4px_0_24px_rgba(0,0,0,0.1)]",
        "transition-all duration-300 ease-out",
        "w-full md:w-[360px] lg:w-[300px] xl:w-[360px]",
        isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-[#E7E1D4] bg-white">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#B8956A]" />
          <span className="font-semibold text-[#B8956A] text-sm">Madison</span>
          <span className="text-xs text-[#1C150D]/60 font-medium">
            Session {sessionCount}/{maxImages}
          </span>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="h-8 w-8 text-[#1C150D]/60 hover:text-[#1C150D] hover:bg-[#E7E1D4]/50"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Chat Body */}
      <ScrollArea className="h-[calc(100vh-48px-80px)] px-4 py-3">
        <div className="space-y-4 pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <Sparkles className="w-12 h-12 text-[#B8956A]/40 mb-4" />
              <p className="text-[#1C150D]/80 text-sm">
                Madison is ready to assist with your dashboard insights.
              </p>
              <p className="text-[#1C150D]/60 text-xs mt-2">
                Ask for feedback, guidance, or strategic suggestions.
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
                {msg.role === "madison" ? (
                  <div className="relative max-w-[85%] group">
                    <div className="bg-white text-[#1C150D] border border-[#E7E1D4] font-serif rounded-lg px-3 py-2 text-sm">
                      {msg.content}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyMessage(msg.content, msg.id)}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-[#E7E1D4] hover:bg-[#D9D2C2] text-[#1C150D] rounded-full md:opacity-0 md:group-hover:opacity-100 opacity-100 transition-opacity"
                    >
                      {copiedMessageId === msg.id ? (
                        <Check className="w-3 h-3 text-[#A3C98D]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="max-w-[85%] bg-[#B8956A]/10 text-[#1C150D] border border-[#B8956A]/30 rounded-lg px-3 py-2 text-sm">
                    {msg.content}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end gap-2 px-4 py-3 border-t border-[#E7E1D4] bg-white">
        <Textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Madison for feedback…"
          className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-[#FFFCF5] border-[#E7E1D4] text-[#1C150D] placeholder:text-[#1C150D]/60 focus-visible:ring-[#B8956A]/50"
          disabled={isSending}
        />
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim() || isSending}
          size="icon"
          className="h-[44px] w-[44px] shrink-0 bg-[#B8956A] hover:bg-[#A3865A] text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
