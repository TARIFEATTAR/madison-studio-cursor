import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Tag, FileText, Send, Loader2, Copy, CopyCheck } from "lucide-react";
import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/useUserProfile";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type MadisonAssistantHandle = {
  generateDescription: () => void;
  suggestTags: () => void;
  optimizeTitle: () => void;
  copyLastAsText: () => void;
  copyLastAsHTML: () => void;
};

interface MadisonAssistantPanelProps {
  platform: string;
  formData: any;
  onUpdateField: (updates: any) => void;
  organizationId?: string;
  productId?: string;
}

export const MadisonAssistantPanel = forwardRef<MadisonAssistantHandle, MadisonAssistantPanelProps>(function MadisonAssistantPanel({ 
  platform, 
  formData, 
  onUpdateField,
  organizationId,
  productId 
}: MadisonAssistantPanelProps, ref) {
  const { toast } = useToast();
  const { userName } = useUserProfile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (userName && messages.length === 0) {
      const platformName = platform === 'etsy' ? 'Etsy' : platform === 'shopify' ? 'Shopify' : 'TikTok Shop';
      const greeting = `Hi ${userName}! I'm Madison, your editorial assistant. I can help you create a ${platformName}-optimized listing that maintains your brand voice while maximizing discoverability.

I see you're creating a listing for ${productId ? "a product from your catalog" : "a new product"}. I can help you craft compelling copy that tells your product's story.

What would you like me to help with?`;
      
      setMessages([{
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      }]);
    }
  }, [userName, platform, productId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getLastAssistant = () => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant") return messages[i];
    }
    return undefined;
  };

  const escapeHtml = (s: string) => s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const toHtmlFromText = (text: string) => {
    const lines = text.split("\n");
    let html = "";
    let inList = false;
    let paragraph = "";

    const flushParagraph = () => {
      if (paragraph.trim()) {
        html += `<p>${escapeHtml(paragraph.trim())}</p>`;
        paragraph = "";
      }
    };

    for (const raw of lines) {
      const line = raw.replace(/\t/g, " ").trimEnd();
      if (line.trim().startsWith("- ")) {
        flushParagraph();
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${escapeHtml(line.trim().slice(2))}</li>`;
      } else if (line.trim() === "") {
        flushParagraph();
        if (inList) { html += "</ul>"; inList = false; }
      } else {
        if (inList) { html += "</ul>"; inList = false; }
        paragraph += (paragraph ? " " : "") + line;
      }
    }

    flushParagraph();
    if (inList) html += "</ul>";
    return html;
  };


  const handleSend = async (actionType?: string, customPrompt?: string) => {
    const userPrompt = customPrompt || input.trim();
    if (!userPrompt || isGenerating) return;

    const userMessage: Message = {
      role: "user",
      content: userPrompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsGenerating(true);

    try {
      // Get user session and access token
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;

      if (!accessToken) {
        toast({
          title: "Authentication required",
          description: "Please sign in to use Madison.",
          variant: "destructive",
        });
        setIsGenerating(false);
        return;
      }

      const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-assistant`;
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content
          })),
          platform,
          organizationId,
          formData,
          productId,
          actionType,
          userName: userName || undefined,
        }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Authentication error",
            description: "Your session may have expired. Please refresh the page.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please try again in a moment.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Credits depleted",
            description: "Please add funds to your workspace.",
            variant: "destructive",
          });
          setIsGenerating(false);
          return;
        }
        throw new Error('Failed to get response');
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";
      
      // Add placeholder assistant message
      const assistantMessageIndex = messages.length + 1;
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        timestamp: new Date()
      }]);

      if (reader) {
        let buffer = "";
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  assistantContent += content;
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[assistantMessageIndex] = {
                      role: "assistant",
                      content: assistantContent,
                      timestamp: new Date()
                    };
                    return updated;
                  });
                }
              } catch (e) {
                // Ignore parse errors
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Communication error",
        description: "Unable to reach Madison. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const platformDesc = platform === 'etsy' ? 'artisan-focused Etsy' : platform === 'shopify' ? 'professional Shopify' : 'viral TikTok Shop';
    const maxTags = platform === 'etsy' ? '13' : platform === 'shopify' ? '250 characters of' : '10';
    
    const prompts: Record<string, string> = {
      description: `Generate a compelling ${platformDesc} description for this product that matches our brand voice.`,
      tags: `Suggest SEO-optimized tags for this product listing (max ${maxTags} tags).`,
      title: `Create an optimized title for this product that balances keywords with brand voice.`
    };
    
    handleSend(action, prompts[action]);
  };

  const copyLastAsText = async () => {
    const last = getLastAssistant();
    if (!last) return;
    await navigator.clipboard.writeText(last.content);
    toast({ title: "Copied", description: "Assistant text copied." });
  };

  const copyLastAsHTML = async () => {
    const last = getLastAssistant();
    if (!last) return;
    const html = toHtmlFromText(last.content);
    try {
      const ClipboardItemAny: any = (window as any).ClipboardItem;
      if (navigator.clipboard && ClipboardItemAny) {
        await navigator.clipboard.write([
          new ClipboardItemAny({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([last.content], { type: 'text/plain' })
          })
        ]);
      } else {
        await navigator.clipboard.writeText(html);
      }
      toast({ title: "Copied", description: "HTML copied for Shopify." });
    } catch {
      await navigator.clipboard.writeText(html);
      toast({ title: "Copied", description: "HTML copied for Shopify." });
    }
  };

  useImperativeHandle(ref, () => ({
    generateDescription: () => handleQuickAction('description'),
    suggestTags: () => handleQuickAction('tags'),
    optimizeTitle: () => handleQuickAction('title'),
    copyLastAsText,
    copyLastAsHTML,
  }));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="border-aged-brass/20 sticky top-6 h-[calc(100vh-8rem)]">
      <CardHeader className="border-b border-aged-brass/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-aged-brass flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-ink-black">Madison</h3>
            <p className="text-xs text-charcoal/60">Your Editorial Assistant</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col h-[calc(100%-5rem)]">
        {/* Quick Actions */}
        <div className="p-4 border-b border-aged-brass/10">
          <p className="text-xs font-medium text-charcoal/70 mb-3 uppercase tracking-wide">Quick Actions</p>
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start text-aged-brass border-aged-brass/30 hover:bg-aged-brass/10"
              onClick={() => handleQuickAction("description")}
              disabled={isGenerating}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Description
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleQuickAction("tags")}
              disabled={isGenerating}
            >
              <Tag className="w-4 h-4 mr-2" />
              Suggest Tags
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={() => handleQuickAction("title")}
              disabled={isGenerating}
            >
              <FileText className="w-4 h-4 mr-2" />
              Optimize Title
            </Button>
          </div>
        </div>

        {/* Chat Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-serif text-sm font-bold ${
                    message.role === "assistant" ? "bg-aged-brass text-white" : "bg-charcoal/10 text-ink-black"
                  }`}>
                    {message.role === "assistant" ? "M" : "U"}
                  </div>
                  <span className="text-xs text-charcoal/60">
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className={`rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user" ? "bg-charcoal/5" : "bg-aged-brass/5 border border-aged-brass/10"
                }`}>
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
                {message.role === "assistant" && index === messages.length - 1 && !isGenerating && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyLastAsText}
                      className="flex-1 h-8 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy as Text
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyLastAsHTML}
                      className="flex-1 h-8 text-xs"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy as HTML
                    </Button>
                  </div>
                )}
              </div>
            ))}
            {isGenerating && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-aged-brass flex items-center justify-center">
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                </div>
                <span className="text-xs text-charcoal/60">Madison is thinking...</span>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t border-aged-brass/10">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Madison for help..."
              className="min-h-[52px] max-h-[120px] resize-none flex-1"
              disabled={isGenerating}
            />
            <Button 
              size="icon"
              className="bg-aged-brass hover:bg-aged-brass/90 shrink-0 h-[52px] w-[52px]"
              onClick={() => handleSend()}
              disabled={!input.trim() || isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <p className="text-xs mt-2 text-charcoal/50">Press Enter to send • Shift + Enter for new line</p>
        </div>
      </CardContent>
    </Card>
  );
});
