import { useState, useRef, useEffect } from "react";
import { Send, X, FileText, Loader2, Copy, Check } from "lucide-react";
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
      content: "Your content is ready. I'm here to help you refine it. What would you like to improve?",
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

  // Don't auto-populate - let user initiate the conversation
  useEffect(() => {
    // Removed auto-population to match new UX
  }, []);

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
    <div className="h-full flex flex-col max-w-full overflow-hidden" style={{ backgroundColor: "#FFFCF5" }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#E5E0D8" }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#B8956A" }}
          >
            <FileText className="w-5 h-5" style={{ color: "#FFFFFF" }} />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold" style={{ color: "#1A1816" }}>
              Editorial Director
            </h3>
            <p className="text-xs" style={{ color: "#6B6560" }}>Strategic Counsel</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              {/* Timestamp */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#B8956A" }}
                >
                  <FileText className="w-3 h-3" style={{ color: "#FFFFFF" }} />
                </div>
                <span className="text-xs" style={{ color: "#6B6560" }}>
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                  })}
                </span>
              </div>
              
              {/* Message Content */}
              <div
                className="rounded-lg px-4 py-3 text-sm leading-relaxed"
                style={{
                  backgroundColor: message.role === "user" ? "#E8DCC8" : "#F5EFE3",
                  color: "#1A1816"
                }}
              >
                <p className="whitespace-pre-wrap select-text">{message.content}</p>
              </div>
              
              {/* Copy Critique Button for assistant messages */}
              {message.role === "assistant" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(message.content, index)}
                  className="text-xs h-8 gap-1"
                  style={{ color: "#6B6560" }}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Critique
                    </>
                  )}
                </Button>
              )}
            </div>
          ))}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "#B8956A" }}
                >
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#FFFFFF" }} />
                </div>
                <span className="text-xs" style={{ color: "#6B6560" }}>Thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div 
        className="border-t p-3 sm:p-4 flex-shrink-0"
        style={{ borderColor: "#E5E0D8" }}
      >
        <div className="flex gap-1.5 sm:gap-2 items-end max-w-full">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for feedback or suggestions..."
            className="min-h-[52px] sm:min-h-[60px] max-h-[160px] resize-none border flex-1 min-w-0"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#D4CFC8",
              color: "#1A1816"
            }}
            disabled={isGenerating}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] flex-shrink-0 bg-gradient-to-r from-aged-brass to-antique-gold hover:opacity-90"
            style={{ color: "#1A1816" }}
          >
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
        <p className="text-xs mt-2 text-center px-1 break-words" style={{ color: "#A8A39E" }}>
          Press Enter to send • Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
