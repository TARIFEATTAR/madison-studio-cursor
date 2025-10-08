import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface EditorialAssistantPanelProps {
  onClose: () => void;
  initialContent?: string;
}

export function EditorialAssistantPanel({ onClose, initialContent }: EditorialAssistantPanelProps) {
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Let's focus. What strategic challenge are we addressing today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState(initialContent || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Pre-populate with initial content if provided (only once)
  useEffect(() => {
    if (initialContent && messages.length === 1 && !input) {
      setInput(`Can you provide editorial critique on this copy?\n\n${initialContent}`);
    }
  }, []); // Empty dependency array - only run once on mount

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      // Build conversation context for Claude
      const conversationContext = messages
        .map((msg) => `${msg.role === "user" ? "User" : "Editorial Director"}: ${msg.content}`)
        .join("\n\n");

      const prompt = `${conversationContext}\n\nUser: ${userMessage.content}\n\nEditorial Director:`;

      const { data, error } = await supabase.functions.invoke("generate-with-claude", {
        body: {
          prompt,
          organizationId: currentOrganizationId,
          mode: "consult",
        },
      });

      if (error) throw error;

      if (data?.generatedContent) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.generatedContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast({
        title: "Communication error",
        description: "Unable to reach the Editorial Director. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      toast({
        title: "Copied to clipboard",
        description: "Critique copied successfully",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full bg-background border-l-2 border-primary/20 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-6 py-4 border-b border-primary/20 bg-gradient-to-r from-primary/5 to-transparent flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground">Editorial Director</h3>
            <p className="text-xs text-muted-foreground">Strategic Counsel</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-4" ref={scrollRef}>
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="flex flex-col gap-2 max-w-[85%]">
                <div
                  className={cn(
                    "rounded-sm px-4 py-3 text-sm leading-relaxed",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border border-primary/10"
                  )}
                >
                  <p className="whitespace-pre-wrap select-text">{message.content}</p>
                  <span className="text-xs opacity-60 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {message.role === "assistant" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(message.content, index)}
                    className="self-start text-xs hover:bg-primary/10"
                  >
                    {copiedIndex === index ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy Critique
                      </>
                    )}
                  </Button>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-semibold text-primary-foreground">
                    YOU
                  </span>
                </div>
              )}
            </div>
          ))}
          {isGenerating && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
              </div>
              <div className="max-w-[80%] rounded-sm px-4 py-3 bg-muted text-muted-foreground border border-primary/10">
                <p className="text-sm italic">Considering...</p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-primary/20 p-4 bg-gradient-to-t from-primary/5 to-transparent flex-shrink-0">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="State your challenge clearly..."
            className="min-h-[80px] max-h-[160px] resize-none bg-background border-primary/20 focus:border-primary"
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            size="icon"
            className="h-[80px] w-[60px] flex-shrink-0"
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
