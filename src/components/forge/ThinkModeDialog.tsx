import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface ThinkModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ThinkModeDialog({ open, onOpenChange }: ThinkModeDialogProps) {
  const { toast } = useToast();
  const { userName } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [idea, setIdea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (open && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!idea.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: idea.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIdea("");
    setIsLoading(true);

    const removePendingUserMessage = () => {
      setMessages((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        if (last.role === "user" && last.content === userMessage.content) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    };

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/think-mode-chat`;
      
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Please sign in to use Think Mode.");
      }
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
          body: JSON.stringify({ 
            messages: [...messages, userMessage],
            userName: userName || undefined,
          }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits depleted. Please add credits to continue.");
        }
        throw new Error("Failed to connect to Think Mode");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      const extractTextFromChunk = (chunk: any) => {
        const openAIText = chunk?.choices?.[0]?.delta?.content;
        if (openAIText) return openAIText;

        const candidate = chunk?.candidates?.[0];
        if (candidate?.content?.parts?.length) {
          return candidate.content.parts
            .map((part: any) => part?.text ?? "")
            .join("");
        }

        const messageParts = chunk?.message?.content?.parts;
        if (messageParts?.length) {
          return messageParts.map((part: any) => part?.text ?? "").join("");
        }
        return "";
      };

      if (reader) {
        let buffer = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;
            
            try {
              const parsed = JSON.parse(jsonStr);
              const content = extractTextFromChunk(parsed);
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) => 
                      i === prev.length - 1 ? { ...m, content: assistantContent } : m
                    );
                  }
                  return [...prev, { role: "assistant", content: assistantContent }];
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
          }
        }
        
        // Flush remaining buffer
        if (buffer.trim()) {
          for (let raw of buffer.split("\n")) {
            if (!raw || raw.startsWith(":") || !raw.startsWith("data: ")) continue;
            const jsonStr = raw.slice(6).trim();
            if (jsonStr === "[DONE]") continue;
            try {
              const parsed = JSON.parse(jsonStr);
              const content = extractTextFromChunk(parsed);
              if (content) {
                assistantContent += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) => 
                      i === prev.length - 1 ? { ...m, content: assistantContent } : m
                    );
                  }
                  return [...prev, { role: "assistant", content: assistantContent }];
                });
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      console.error("Think Mode error:", error);
      removePendingUserMessage();
      toast({
        title: "Think Mode Error",
        description: error.message || "Failed to connect to AI",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Think Mode - Deep Brainstorming
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Share your rough ideas, questions, or creative sparks. Let's explore together.
          </p>
        </DialogHeader>

        {messages.length === 0 ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                What's on your mind?
              </label>
              <Textarea
                ref={textareaRef}
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 'I'm thinking about a summer campaign focused on hydration...'"
                className="min-h-[120px]"
                disabled={isLoading}
              />
            </div>

            <div className="bg-muted/50 rounded-sm p-4 space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Example prompts:</p>
              <div className="space-y-1">
                {[
                  "Help me brainstorm content angles for our new product launch",
                  "I need fresh ways to talk about sustainability in luxury",
                  "What if we approached our holiday campaign from a nostalgic angle?",
                ].map((example, i) => (
                  <button
                    key={i}
                    onClick={() => setIdea(example)}
                    className="text-xs text-left w-full hover:text-primary transition-colors"
                    disabled={isLoading}
                  >
                    • {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!idea.trim() || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Start Thinking
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 min-h-0">
            <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
              <div className="space-y-4">
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
                    <div
                      className={cn(
                        "rounded-sm px-4 py-3 max-w-[85%]",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground border border-primary/10"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Loader2 className="w-4 h-4 text-primary animate-spin" />
                    </div>
                    <div className="rounded-sm px-4 py-3 bg-muted text-muted-foreground border border-primary/10">
                      <p className="text-sm italic">Thinking deeply...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="border-t pt-4">
              <div className="flex gap-2">
                <Textarea
                  ref={textareaRef}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Continue the conversation..."
                  className="min-h-[60px] max-h-[120px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!idea.trim() || isLoading}
                  size="icon"
                  className="h-[60px] w-[60px] flex-shrink-0"
                >
                  {isLoading ? (
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
        )}
      </DialogContent>
    </Dialog>
  );
}
