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
        let errorMessage = "Failed to connect to Think Mode";
        try {
          const errorData = await response.text();
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.error || errorMessage;
        } catch {
          // If response isn't JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits depleted. Please add credits to continue.");
        }
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      // Robust text extraction - tries multiple formats to handle any valid response structure
      const extractTextFromChunk = (chunk: any): string => {
        if (!chunk || typeof chunk !== 'object') return "";

        // Strategy 1: OpenAI SSE format (primary format from geminiClient conversion)
        const openAIText = chunk?.choices?.[0]?.delta?.content;
        if (openAIText && typeof openAIText === 'string' && openAIText.trim()) {
          return openAIText;
        }

        // Strategy 2: Direct OpenAI content (fallback)
        const openAIContent = chunk?.choices?.[0]?.message?.content;
        if (openAIContent && typeof openAIContent === 'string' && openAIContent.trim()) {
          return openAIContent;
        }

        // Strategy 3: Gemini native format (candidates)
        const candidate = chunk?.candidates?.[0];
        if (candidate?.content?.parts?.length) {
          const parts = candidate.content.parts
            .map((part: any) => {
              if (typeof part?.text === 'string') return part.text;
              if (typeof part === 'string') return part;
              return "";
            })
            .filter((text: string) => text.trim());
          if (parts.length > 0) return parts.join("");
        }

        // Strategy 4: Message content parts
        const messageParts = chunk?.message?.content?.parts;
        if (Array.isArray(messageParts) && messageParts.length > 0) {
          const parts = messageParts
            .map((part: any) => {
              if (typeof part?.text === 'string') return part.text;
              if (typeof part === 'string') return part;
              return "";
            })
            .filter((text: string) => text.trim());
          if (parts.length > 0) return parts.join("");
        }

        // Strategy 5: Direct text field
        if (typeof chunk?.text === 'string' && chunk.text.trim()) {
          return chunk.text;
        }

        // Strategy 6: Content field
        if (typeof chunk?.content === 'string' && chunk.content.trim()) {
          return chunk.content;
        }

        // Strategy 7: Deep search for any text field
        const deepSearch = (obj: any, depth = 0): string => {
          if (depth > 3) return ""; // Prevent infinite recursion
          if (typeof obj === 'string' && obj.trim()) return obj;
          if (typeof obj !== 'object' || obj === null) return "";
          
          for (const key in obj) {
            if (key === 'text' || key === 'content') {
              const value = obj[key];
              if (typeof value === 'string' && value.trim()) return value;
            }
            if (typeof obj[key] === 'object') {
              const found = deepSearch(obj[key], depth + 1);
              if (found) return found;
            }
          }
          return "";
        };

        const deepFound = deepSearch(chunk);
        if (deepFound) return deepFound;

        return "";
      };

      if (!reader) {
        throw new Error("No response body reader available");
      }

      // Initialize assistant message
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      
      let buffer = "";
      let hasReceivedContent = false;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log("Stream ended. Total content length:", assistantContent.length);
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });
        
        // Process complete lines
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          // Handle CRLF
          if (line.endsWith("\r")) line = line.slice(0, -1);
          
          // Skip empty lines and SSE comments
          if (line.trim() === "" || line.startsWith(":")) continue;
          
          // Must start with "data:"
          if (!line.startsWith("data:")) {
            console.warn("Unexpected SSE line format:", line.substring(0, 50));
            continue;
          }
          
          const jsonStr = line.slice(5).trim();
          if (jsonStr === "[DONE]") {
            console.log("Received [DONE] marker");
            break;
          }
          
          try {
            const parsed = JSON.parse(jsonStr);
            console.log("Parsed chunk:", parsed);
            
            const content = extractTextFromChunk(parsed);
            if (content) {
              hasReceivedContent = true;
              assistantContent += content;
              console.log("Extracted content:", content.substring(0, 50));
              
              // Update the last message (assistant message)
              setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                  updated[lastIndex] = { ...updated[lastIndex], content: assistantContent };
                } else {
                  updated.push({ role: "assistant", content: assistantContent });
                }
                return updated;
              });
            } else {
              console.log("No content extracted from chunk:", parsed);
            }
          } catch (parseError) {
            // Incomplete JSON - put line back in buffer
            console.warn("JSON parse error, buffering:", parseError);
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }
      
      // Flush remaining buffer
      if (buffer.trim()) {
        console.log("Flushing remaining buffer:", buffer.substring(0, 100));
        const lines = buffer.split("\n");
        for (const raw of lines) {
          if (!raw || raw.startsWith(":") || !raw.startsWith("data:")) continue;
          const jsonStr = raw.slice(5).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = extractTextFromChunk(parsed);
            if (content) {
              assistantContent += content;
              setMessages((prev) => {
                const updated = [...prev];
                const lastIndex = updated.length - 1;
                if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                  updated[lastIndex] = { ...updated[lastIndex], content: assistantContent };
                }
                return updated;
              });
            }
          } catch {}
        }
      }
      
      // Only throw error if we truly got nothing AND the stream completed without errors
      if (!hasReceivedContent && assistantContent.length === 0) {
        console.warn("Think Mode: Stream completed but no content extracted. Raw response may have unexpected format.");
        throw new Error("I ran into an issue generating a response. Please try again in a moment.");
      }
    } catch (error: any) {
      console.error("Think Mode error:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
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
