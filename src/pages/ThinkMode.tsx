import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import "./thinkmode.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
}

export default function ThinkModePage() {
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
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!idea.trim() || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      role: "user",
      content: idea.trim(),
      timestamp,
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
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        throw new Error("VITE_SUPABASE_URL is not configured");
      }
      
      const CHAT_URL = `${supabaseUrl}/functions/v1/think-mode-chat`;
      console.log('[ThinkMode] Calling chat endpoint:', CHAT_URL);
      
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        throw new Error("Please sign in to use Think Mode.");
      }

      console.log('[ThinkMode] Sending request with', messages.length, 'messages');
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          userName: userName || undefined,
        }),
      });

      // Check content type first to determine how to handle the response
      const contentType = response.headers.get('content-type') || '';
      const isStream = contentType.includes('text/event-stream') || contentType.includes('stream');
      
      console.log('[ThinkMode] Response status:', response.status);
      console.log('[ThinkMode] Response content-type:', contentType);
      console.log('[ThinkMode] Is stream:', isStream);
      
      if (!response.ok) {
        let errorMessage = "Failed to connect to Think Mode";
        try {
          // Clone the response to read the body without consuming it
          const errorData = await response.clone().text();
          if (errorData) {
            try {
              const parsed = JSON.parse(errorData);
              errorMessage = parsed.error || errorMessage;
            } catch {
              // If it's not JSON, use the text as error message
              errorMessage = errorData.substring(0, 200);
            }
          }
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }
        if (response.status === 402) {
          throw new Error("AI credits depleted. Please add credits to continue.");
        }
        if (response.status === 500) {
          // Check if it's an API key error
          if (errorMessage.includes('not configured') || errorMessage.includes('GEMINI_API_KEY')) {
            throw new Error("AI service is not configured. Please contact support.");
          }
        }
        throw new Error(errorMessage || `Failed to connect (Status: ${response.status})`);
      }

      // If response is OK but not a stream, it might be an error in JSON format
      if (!isStream) {
        try {
          const errorData = await response.text();
          console.warn('[ThinkMode] Non-stream response received:', errorData.substring(0, 200));
          const parsed = JSON.parse(errorData);
          
          // Check if this looks like a database query response (wrong endpoint)
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].organization_id) {
            throw new Error('Received database query response instead of chat response. The edge function may not be deployed or the URL is incorrect.');
          }
          
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          
          // If we get here, it's an unexpected response format
          throw new Error(`Unexpected response format: ${JSON.stringify(parsed).substring(0, 100)}`);
        } catch (e) {
          // If parsing fails or no error field, this is unexpected
          if (e instanceof Error && e.message.includes('database query')) {
            throw e; // Re-throw our specific error
          }
          console.warn('Unexpected non-stream response. Content type:', contentType);
          throw new Error('Unexpected response format from server. The edge function may not be deployed correctly.');
        }
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

      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [...prev, { role: "assistant", content: "", timestamp: aiTimestamp }]);

      let buffer = "";
      let hasReceivedContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.trim() === "" || line.startsWith(":")) continue;
          if (!line.startsWith("data:")) continue;

          const jsonStr = line.slice(5).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = extractTextFromChunk(parsed);
            if (content) {
              hasReceivedContent = true;
              assistantContent += content;
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
              // Log when we receive a chunk but extract no text (for debugging)
              console.warn("Think Mode: Received chunk but extracted no text. Full chunk:", JSON.stringify(parsed, null, 2));
            }
          } catch (parseError) {
            console.warn("JSON parse error, buffering:", parseError, "Line:", jsonStr.substring(0, 100));
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      if (buffer.trim()) {
        const lines = buffer.split("\n");
        for (const raw of lines) {
          if (!raw || raw.startsWith(":")) continue;
          if (!raw.startsWith("data:")) continue;
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
          } catch {
            /* ignore */
          }
        }
      }

      // Only show error if we truly got nothing AND the stream completed without errors
      // This means the API call succeeded but returned no content
      if (!hasReceivedContent && assistantContent.length === 0) {
        console.warn("Think Mode: Stream completed but no content extracted. Raw response may have unexpected format.");
        // Remove the empty assistant placeholder
        setMessages((prev) => prev.slice(0, prev.length - 1));
        // Show a generic technical error instead of the user-facing fallback
        toast({
          title: "Response Issue",
          description: "I ran into an issue generating a response. Please try again in a moment.",
          variant: "destructive",
        });
        return;
      }
    } catch (error: any) {
      console.error("Think Mode error (standalone):", error);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="think-mode bg-ink-black min-h-screen flex flex-col text-parchment-white">
      <div className="grow flex flex-col items-center px-4 sm:px-6 pb-48">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl text-center pt-16 space-y-3"
        >
          <p className="think-mode-heading text-4xl sm:text-5xl text-parchment-white">
            What would you like to explore?
          </p>
          <p className="text-sm sm:text-base text-parchment-white/60">
            Share a question, tension, or early idea.
          </p>
        </motion.div>

        <div className="w-full max-w-3xl mt-16 space-y-6 flex-1 flex flex-col">
          <ScrollArea className={cn("flex-1", isEmpty ? "flex" : "")} ref={scrollRef}>
            <div
              className={cn(
                "space-y-8 w-full",
                isEmpty
                  ? "flex flex-col items-center justify-center text-center text-white/65 text-[1.05rem] leading-relaxed"
                  : ""
              )}
            >

              {messages.map((message, index) => (
                <motion.div
                  key={`${message.role}-${index}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <p className="text-[0.65rem] uppercase tracking-[0.35em] text-aged-brass/60">
                    {message.role === "user" ? userName || "You" : "Madison"}
                  </p>
                  <p className="think-mode-body text-[1rem] leading-relaxed text-parchment-white/90">
                    {message.content}
                  </p>
                </motion.div>
              ))}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 text-sm text-aged-brass/70"
                >
                  <motion.span
                    className="inline-block h-2 w-2 rounded-full bg-brass-glow"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                  />
                  Madison is thinking…
                </motion.div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <footer className="think-mode-footer sticky bottom-0 left-0 right-0 bg-ink-black border-t border-aged-brass/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-0 py-6 flex items-center gap-3">
          <Textarea
            ref={textareaRef}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write a thought, question, or hypothesis…"
            className="flex-1 resize-none border-0 bg-transparent text-parchment-white placeholder:text-charcoal/60 focus-visible:ring-0 focus-visible:outline-none text-base"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={handleSubmit}
            disabled={!idea.trim() || isLoading}
            className="rounded-full bg-aged-brass text-parchment-white px-6 py-3 text-sm font-semibold hover:bg-brass-glow transition-colors disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}
