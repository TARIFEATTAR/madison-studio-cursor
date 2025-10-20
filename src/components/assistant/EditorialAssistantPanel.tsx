import { useState, useRef, useEffect } from "react";
import { Send, X, FileText, Loader2, Copy, Check, Image as ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SessionContext {
  sessionId: string;
  sessionName: string;
  imagesGenerated: number;
  maxImages: number;
  heroImage?: {
    imageUrl: string;
    prompt: string;
  };
  allPrompts: string[];
  aspectRatio: string;
  outputFormat: string;
  isImageStudio: boolean;
}

interface EditorialAssistantPanelProps {
  onClose: () => void;
  initialContent?: string;
  sessionContext?: SessionContext;
}

export function EditorialAssistantPanel({ onClose, initialContent, sessionContext }: EditorialAssistantPanelProps) {
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const { userName } = useUserProfile();
  const STORAGE_KEY = 'madison-image-studio-chat';
  
  // Load persisted messages on mount
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  const [input, setInput] = useState(initialContent || "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Persist messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    if (userName && messages.length === 0) {
      // Different greeting for Image Studio vs other contexts
      if (sessionContext?.isImageStudio) {
        setMessages([{
          role: "assistant",
          content: `Welcome to the Madison Image Studio, ${userName}! Let's create something beautiful together. What should we name this session, or would you like to dive straight into generating your first image?`,
          timestamp: new Date(),
        }]);
      } else {
        setMessages([{
          role: "assistant",
          content: `Hi ${userName}! I'm here to help you refine your content. What would you like to improve?`,
          timestamp: new Date(),
        }]);
      }
    }
  }, [userName, sessionContext]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Images must be under 20MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setUploadedImages((prev) => [...prev, base64]);
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = async () => {
    console.log('[EditorialAssistant] handleSend called, input:', input, 'trimmed:', input.trim(), 'isGenerating:', isGenerating);
    
    if ((!input.trim() && uploadedImages.length === 0) || isGenerating) {
      console.log('[EditorialAssistant] Send blocked - empty input or generating');
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim() || "Please analyze these images",
      timestamp: new Date(),
    };

    console.log('[EditorialAssistant] Sending message:', userMessage.content);
    setMessages((prev) => [...prev, userMessage]);
    const imagesToSend = [...uploadedImages];
    setInput("");
    setUploadedImages([]);
    setIsGenerating(true);

    try {
      // Build studio context if in Image Studio
      const studioContext = sessionContext?.isImageStudio ? `
━━━ MADISON IMAGE STUDIO CONTEXT ━━━
You are Madison, the AI Creative Director assisting in the Image Studio for AI-powered product photography.

Session: "${sessionContext.sessionName || 'New Session'}"
Progress: ${sessionContext.imagesGenerated}/${sessionContext.maxImages} images generated
Export Settings: ${sessionContext.aspectRatio} • ${sessionContext.outputFormat}

${sessionContext.heroImage ? 
  `Current Hero Image: "${sessionContext.heroImage.prompt}"` : 
  'No hero image selected yet'}

${sessionContext.allPrompts.length > 0 ? `
Previous Prompts in This Session:
${sessionContext.allPrompts.map((p, i) => `  ${i + 1}. "${p}"`).join('\n')}
` : ''}

IMPORTANT INSTRUCTIONS:
- Provide creative direction for AI image generation
- Suggest prompt refinements for better compositions
- Give lighting, angle, and styling advice tailored to their brand
- Analyze brand alignment when asked
- DO NOT suggest hiring photographers - the user is using AI generation
- Reference specific images by number when discussing previous generations
- Keep responses conversational and editorial (3-4 sentences max)
- Act like a creative director guiding a photo shoot

Be conversational, encouraging, and editorial in your tone.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
` : '';

      // Build conversation context for Claude
      const conversationContext = messages
        .map((msg) => `${msg.role === "user" ? "User" : "Madison"}: ${msg.content}`)
        .join("\n\n");

      const prompt = `${studioContext}\n\n${conversationContext}\n\nUser: ${userMessage.content}\n\nMadison:`;

      const { data, error } = await supabase.functions.invoke("generate-with-claude", {
        body: {
          prompt,
          organizationId: currentOrganizationId,
          mode: "consult",
          userName: userName || undefined,
          images: imagesToSend.length > 0 ? imagesToSend : undefined,
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
    <div className="h-screen flex flex-col max-w-full" style={{ backgroundColor: "#FFFCF5" }}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: "#E5E0D8" }}
      >
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-serif text-2xl font-bold"
            style={{ 
              backgroundColor: "#B8956A",
              color: "#FFFCF5"
            }}
          >
            M
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold" style={{ color: "#1A1816" }}>
              Madison
            </h3>
            <p className="text-xs" style={{ color: "#6B6560" }}>Editorial Director</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMessages([]);
              localStorage.removeItem(STORAGE_KEY);
              toast({
                title: "Conversation cleared",
                description: "Chat history has been reset",
              });
            }}
            className="text-xs px-2 py-1 rounded hover:bg-[#E5E0D8] transition-colors"
            style={{ color: "#6B6560" }}
          >
            Clear
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-6 py-6" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className="space-y-2">
              {/* Timestamp */}
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center font-serif text-sm font-bold"
                  style={{ 
                    backgroundColor: message.role === "assistant" ? "#B8956A" : "#D4CFC8",
                    color: message.role === "assistant" ? "#FFFCF5" : "#1A1816"
                  }}
                >
                  {message.role === "assistant" ? "M" : "U"}
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
                className="rounded-lg px-4 py-3 text-sm leading-relaxed prose prose-sm max-w-none"
                style={{
                  backgroundColor: message.role === "user" ? "#E8DCC8" : "#F5EFE3",
                  color: "#1A1816"
                }}
              >
                {message.role === "assistant" ? (
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                      strong: ({ children }) => <strong className="font-semibold" style={{ color: "#1A1816" }}>{children}</strong>,
                      em: ({ children }) => <em className="italic">{children}</em>,
                      ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      h1: ({ children }) => <h1 className="text-lg font-serif font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-serif font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-serif font-semibold mb-2 mt-3 first:mt-0">{children}</h3>,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                ) : (
                  <p className="whitespace-pre-wrap select-text">{message.content}</p>
                )}
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
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: "#FFFCF5" }} />
                </div>
                <span className="text-xs" style={{ color: "#6B6560" }}>Madison is thinking...</span>
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
        {/* Image Previews */}
        {uploadedImages.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {uploadedImages.map((img, idx) => (
              <div key={idx} className="relative group">
                <img 
                  src={img} 
                  alt={`Upload ${idx + 1}`}
                  className="w-16 h-16 object-cover rounded border"
                  style={{ borderColor: "#D4CFC8" }}
                />
                <button
                  onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-1.5 sm:gap-2 items-end w-full">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] flex-shrink-0"
            style={{ color: "#6B6560" }}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask for feedback or suggestions..."
            className="min-h-[52px] sm:min-h-[60px] max-h-[160px] resize-none border flex-1"
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#D4CFC8",
              color: "#1A1816"
            }}
            disabled={isGenerating}
          />
          <Button
            type="button"
            onClick={(e) => {
              console.log('[EditorialAssistant] Button clicked', { input, isGenerating, trimmed: input.trim() });
              e.preventDefault();
              handleSend();
            }}
            onTouchStart={(e) => {
              console.log('[EditorialAssistant] Touch start', { input, isGenerating });
              e.currentTarget.click();
            }}
            disabled={(!input.trim() && uploadedImages.length === 0) || isGenerating}
            className="h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] flex-shrink-0 bg-gradient-to-r from-aged-brass to-antique-gold hover:opacity-90 active:opacity-80"
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
