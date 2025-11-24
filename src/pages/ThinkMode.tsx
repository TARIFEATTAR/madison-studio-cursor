import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Send, Target, Zap, BarChart, RefreshCcw, Users, Flag, Info, ArrowRight, BrainCircuit } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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

  const ACCESSIBILITY_INSTRUCTIONS = `
CRITICAL FORMATTING FOR ACCESSIBILITY:
1. Structure with clear, BOLD HEADINGS.
2. Use clear spacing and formatting (no emojis).
3. Keep paragraphs short and digestible (max 3 lines).
4. Use bullet points for all lists.
5. End with "Choose Your Next Step" and provide 2-3 distinct paths.
6. Format the options EXACTLY like this at the end:
<<ACTION: Action Label | The prompt for the user to send next>>

Example:
<<ACTION: Audit Assets | Help me audit my hidden assets>>
<<ACTION: Create Offer | Help me create a risk-reversed offer>>
`;

  const strategicOptions = [
    { 
      label: "Cash Injection", 
      icon: Zap,
      prompt: "Using principles of leverage and asset reactivation, outline a strategy for a quick cash injection. Focus on the Strategy of Preeminence and risk reversal.",
      framework: "Asset Reactivation Strategy",
      description: "Focuses on uncovering hidden assets, reactivating past clients, and risk-reversed offers."
    },
    { 
      label: "7-Day Turnaround", 
      icon: RefreshCcw,
      prompt: "Create a 7-day emergency turnaround plan focusing on radical simplification and execution. Identify open loops and the single highest-leverage action.",
      framework: "Rapid Execution Protocol",
      description: "Rapidly clearing 'open loops' and focusing all energy on the single highest-leverage action."
    },
    { 
      label: "Product Launch", 
      icon: Target,
      prompt: "Map out a campaign sequence that builds anticipation and scarcity. Include the 'Sideways Sales Letter' structure.",
      framework: "Strategic Launch Sequence",
      description: "The 'Sideways Sales Letter' sequence: Pre-Pre-Launch → Pre-Launch Content → Open Cart."
    },
    { 
      label: "Growth Strategy", 
      icon: BarChart,
      prompt: "Applying classic management principles, help me diagnose growth bottlenecks and identify the 'right things' to focus on. Distinguish between efficiency and effectiveness.",
      framework: "Executive Effectiveness",
      description: "Distinguishing between efficiency and effectiveness to scale sustainable growth."
    },
    { 
      label: "Customer Retention", 
      icon: Users,
      prompt: "Design a post-purchase experience that turns customers into advocates. Map out the emotional phases of the customer journey.",
      framework: "The First 100 Days Model",
      description: "Choreographing the customer journey to eliminate buyer's remorse and foster loyalty."
    },
    { 
      label: "Brand Positioning", 
      icon: Flag,
      prompt: "Help me find my brand's 'only-ness' and radical differentiation. Identify where the market zigs so we can zag.",
      framework: "Radical Differentiation",
      description: "Finding the whitespace in the market. When everyone zigs, your brand should zag."
    },
    { 
      label: "Strategic Brainstorming", 
      icon: BrainCircuit,
      prompt: "I need to brainstorm a strategic issue. Guide me through a strategic analysis of my situation.",
      framework: "Open Strategic Analysis",
      description: "Free-form strategic brainstorming to diagnose issues and find solutions."
    }
  ];

  const handleSubmit = async (overrideContent?: string) => {
    const contentToSubmit = overrideContent || idea;
    if (!contentToSubmit.trim() || isLoading) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMessage: Message = {
      role: "user",
      content: contentToSubmit.trim(),
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
          messages: [
            ...messages, 
            // Send user message with hidden instructions appended
            { 
              ...userMessage, 
              content: userMessage.content + "\n\n" + ACCESSIBILITY_INSTRUCTIONS 
            }
          ],
          userName: userName || undefined,
          mode: 'strategic'
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
          className="w-full max-w-4xl text-center pt-16 space-y-3 relative"
        >
          <p className="think-mode-heading text-4xl sm:text-5xl text-parchment-white">
            Strategic Planning Session
          </p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-sm sm:text-base text-parchment-white/60">
              Select a strategic focus or start a new conversation.
            </p>
            
            {/* Strategy Guide Sheet Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="inline-flex items-center gap-1 text-xs text-aged-brass hover:text-brass-glow transition-colors border border-aged-brass/20 rounded-full px-2 py-0.5 hover:bg-aged-brass/10">
                  <Info className="w-3 h-3" />
                  <span>Strategy Guide</span>
                </button>
              </SheetTrigger>
              <SheetContent className="bg-ink-black border-aged-brass/20 text-parchment-white sm:max-w-md overflow-y-auto">
                <SheetHeader className="mb-6">
                  <SheetTitle className="text-2xl font-serif text-aged-brass">Strategic Frameworks</SheetTitle>
                  <SheetDescription className="text-parchment-white/60">
                    Our AI models are trained on these specific methodologies to give you expert-level guidance.
                  </SheetDescription>
                </SheetHeader>
                <div className="space-y-6">
                  {strategicOptions.map((option) => (
                    <div key={option.label} className="space-y-2 border-b border-white/5 pb-4 last:border-0">
                      <div className="flex items-center gap-2 text-aged-brass">
                        <option.icon className="w-4 h-4" />
                        <h3 className="font-semibold">{option.label}</h3>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/40 mb-1">The Framework</p>
                        <p className="text-sm font-medium text-parchment-white/90">{option.framework}</p>
                      </div>
                      <p className="text-sm text-parchment-white/60 leading-relaxed">
                        {option.description}
                      </p>
                    </div>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </motion.div>

        <div className="w-full max-w-3xl mt-8 space-y-6 flex-1 flex flex-col">
          {isEmpty && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {strategicOptions.map((option, index) => (
                <motion.div
                  key={option.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <Button
                    variant="outline"
                    className="w-full h-auto px-4 py-4 flex flex-col items-center justify-center gap-2 bg-white/5 border-white/10 hover:bg-white/10 hover:border-aged-brass transition-all text-parchment-white group"
                    onClick={() => handleSubmit(option.prompt)}
                  >
                    <option.icon className="w-6 h-6 text-aged-brass group-hover:text-brass-glow transition-colors mb-1" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-center leading-tight">{option.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          <ScrollArea className={cn("flex-1", isEmpty ? "hidden" : "flex")} ref={scrollRef}>
            <div className="space-y-8 w-full pb-4">
              {messages.map((message, index) => {
                // Only parse actions for assistant messages
                const isAssistant = message.role === "assistant";
                const actionRegex = /<<ACTION:\s*(.*?)\s*\|\s*(.*?)>>/g;
                const actions: { label: string; prompt: string }[] = [];
                
                // Ensure message.content is always a string before processing
                const contentToProcess = message.content || "";
                
                let cleanContent = contentToProcess;
                
                if (isAssistant) {
                  cleanContent = contentToProcess.replace(actionRegex, (match, label, prompt) => {
                    actions.push({ label: label.trim(), prompt: prompt.trim() });
                    return ""; 
                  }).trim();
                }

                return (
                  <motion.div
                    key={`${message.role}-${index}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-[0.65rem] uppercase tracking-[0.35em] text-aged-brass/60">
                      {message.role === "user" ? userName || "You" : "Madison"}
                    </p>
                    <div className="think-mode-body text-[1rem] leading-relaxed text-parchment-white/90 prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-white/10 prose-pre:text-parchment-white prose-code:text-aged-brass prose-headings:text-parchment-white prose-strong:text-parchment-white prose-a:text-aged-brass hover:prose-a:text-brass-glow">
                      {isAssistant ? (
                        <ReactMarkdown 
                          remarkPlugins={[remarkGfm]}
                          components={{
                            p: ({node, ...props}) => <p className="mb-4 last:mb-0" {...props} />,
                            a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" {...props} />,
                          }}
                        >
                          {cleanContent}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{cleanContent}</p>
                      )}
                    </div>

                    {/* Render Action Buttons if present (Assistant only) */}
                    {actions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4 pt-2 border-t border-white/10">
                        {actions.map((action, i) => (
                          <Button
                            key={i}
                            variant="secondary"
                            size="sm"
                            onClick={() => handleSubmit(action.prompt)}
                            className="bg-white/5 hover:bg-aged-brass/20 text-parchment-white border border-white/10 hover:border-aged-brass transition-all text-xs h-auto py-2 px-3"
                          >
                            {action.label}
                            <ArrowRight className="w-3 h-3 ml-2 opacity-50" />
                          </Button>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}

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
            onClick={() => handleSubmit()}
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
