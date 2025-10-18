import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, Lightbulb, Wand2, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MadisonPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function MadisonPanel({ open, onOpenChange }: MadisonPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const quickActions = [
    {
      icon: Lightbulb,
      label: "Create a new prompt",
      action: () => handleQuickAction("Help me create a new prompt for product launches"),
    },
    {
      icon: Wand2,
      label: "Refine existing prompt",
      action: () => handleQuickAction("How can I improve my email newsletter prompts?"),
    },
    {
      icon: Search,
      label: "Find similar prompts",
      action: () => handleQuickAction("Show me prompts similar to my product descriptions"),
    },
  ];

  const handleQuickAction = (text: string) => {
    handleSend(text);
  };

  const handleSend = (text?: string) => {
    const message = text || input.trim();
    if (!message) return;

    // Add user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const response = getAIResponse(message);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (userMessage: string): string => {
    // Mock AI responses
    if (userMessage.toLowerCase().includes("create")) {
      return "I'd be happy to help you create a new prompt! Let's start by understanding what kind of content you want to generate. Could you tell me:\n\n1. What type of content? (e.g., blog post, email, social media)\n2. What's the main topic or product?\n3. What tone should it have?\n\nOnce I know these details, I can craft a custom prompt for you.";
    }
    if (userMessage.toLowerCase().includes("refine") || userMessage.toLowerCase().includes("improve")) {
      return "Great question! Here are some ways to improve your prompts:\n\nBe more specific about your brand voice\nInclude concrete examples of what you want\nAdd constraints (word count, must-have elements)\nSpecify what to avoid\n\nWould you like me to review a specific prompt and suggest improvements?";
    }
    return "I understand you're looking for help with your prompts. Could you provide more details about what you'd like to do? I can help you:\n\n• Create new prompts from scratch\n• Refine and improve existing ones\n• Find similar prompts in your library\n• Organize your prompt collection\n\nWhat would be most helpful for you right now?";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-[hsl(var(--saffron-gold))] to-[hsl(var(--brass-accent))]">
              <Sparkles className="w-6 h-6 text-[hsl(var(--soft-ivory))]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-serif">Madison</DialogTitle>
              <DialogDescription>Your Creative Assistant</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 pr-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="p-6 rounded-full bg-gradient-to-br from-[hsl(var(--saffron-gold)/0.2)] to-[hsl(var(--brass-accent)/0.2)] mb-6">
                  <Sparkles className="w-12 h-12 text-[hsl(var(--saffron-gold))]" />
                </div>
                <h3 className="text-xl font-serif mb-2">Hi! I'm Madison, your creative assistant.</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                  I can help you create, refine, or customize prompts for both visual and written content.
                </p>

                <div className="w-full space-y-3">
                  <p className="text-sm font-medium">Quick Actions:</p>
                  {quickActions.map((action, index) => (
                    <Card
                      key={index}
                      className="p-4 cursor-pointer transition-all hover:shadow-md hover:border-[hsl(var(--saffron-gold))]"
                      onClick={action.action}
                    >
                      <div className="flex items-center gap-3">
                        <action.icon className="w-5 h-5 text-[hsl(var(--saffron-gold))]" />
                        <span className="text-sm font-medium">{action.label}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--saffron-gold))] to-[hsl(var(--brass-accent))] flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-[hsl(var(--soft-ivory))]" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        message.role === "user"
                          ? "bg-[hsl(var(--saffron-gold))] text-[hsl(var(--soft-ivory))]"
                          : "bg-[hsl(var(--stone-beige)/0.3)]"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(var(--saffron-gold))] to-[hsl(var(--brass-accent))] flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-[hsl(var(--soft-ivory))]" />
                    </div>
                    <div className="bg-[hsl(var(--stone-beige)/0.3)] rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-[hsl(var(--saffron-gold))] rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-[hsl(var(--saffron-gold))] rounded-full animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 bg-[hsl(var(--saffron-gold))] rounded-full animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Madison to help with prompts..."
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="self-end"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
