import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, FileText, PenTool, X, Send, Loader2 } from "lucide-react";
import penNibIcon from "@/assets/pen-nib-icon-new.png";
import { createRoot } from "react-dom/client";
import ScriptoraLoadingAnimation from "@/components/forge/ScriptoraLoadingAnimation";
import { TransitionLoader } from "@/components/forge/TransitionLoader";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { NameContentDialog } from "@/components/forge/NameContentDialog";

export default function ForgeNew() {
  const navigate = useNavigate();
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();

  
  // Form state
  const [product, setProduct] = useState("");
  const [format, setFormat] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("tarife-native");
  const [additionalContext, setAdditionalContext] = useState("");
  
  // Dialog state
  const [thinkModeExpanded, setThinkModeExpanded] = useState(false);
  const [nameDialogOpen, setNameDialogOpen] = useState(false);
  const [thinkModeInput, setThinkModeInput] = useState("");
  const [thinkModeMessages, setThinkModeMessages] = useState<Array<{role: string, content: string}>>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showTransitionLoader, setShowTransitionLoader] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = () => {
    // Validate required fields
    if (!product || !format) {
      return;
    }
    
    // Open name dialog
    setNameDialogOpen(true);
  };

  const handleGenerateContent = async (contentName: string) => {
    const briefData = {
      productId: product,
      deliverableFormat: format,
      targetAudience: audience,
      contentGoal: goal,
      styleOverlay: style,
      additionalContext,
      contentName,
      timestamp: Date.now()
    };
    
    localStorage.setItem('scriptora-content-brief', JSON.stringify(briefData));
    setNameDialogOpen(false);
    setIsGenerating(true);
    
    // Show loading overlay
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'generating-loader';
    document.body.appendChild(loadingDiv);
    
    // Render the loader component immediately
    const loaderRoot = createRoot(loadingDiv);
    loaderRoot.render(<ScriptoraLoadingAnimation />);

    try {
      // Build AI prompt from brief fields
      const promptParts = [
        `Product: ${product}`,
        `Format: ${format}`,
        audience && `Target Audience: ${audience}`,
        goal && `Content Goal: ${goal}`,
        additionalContext && `\nAdditional Direction: ${additionalContext}`
      ].filter(Boolean).join('\n');

      const fullPrompt = `${promptParts}\n\n[EXECUTE THIS BRIEF IMMEDIATELY. OUTPUT ONLY THE FINAL COPY. NO QUESTIONS OR ANALYSIS.]`;

      console.log('Calling AI with organization:', currentOrganizationId);
      
      // Call real AI edge function
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: { 
          prompt: fullPrompt,
          organizationId: currentOrganizationId,
          mode: "generate",
          styleOverlay: style.toUpperCase().replace(/-/g, '_')
        }
      });

      if (error) throw error;

      const generatedContent = data?.generatedContent || "Error: No content generated";
      
      console.log('AI generated content, length:', generatedContent.length);
      
      // Save to database
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!currentOrganizationId) {
        throw new Error("No organization found. Please complete onboarding first.");
      }

      // Backup to localStorage immediately
      localStorage.setItem('draft-content-backup', JSON.stringify({
        title: contentName,
        content: generatedContent,
        format,
        timestamp: Date.now()
      }));

      // Remove generating loader
      loaderRoot.unmount();
      const generatingLoader = document.getElementById('generating-loader');
      if (generatingLoader) {
        generatingLoader.remove();
      }

      // Show transition loader
      setShowTransitionLoader(true);

      // Start database save (non-blocking)
      const savePromise = supabase
        .from('master_content')
        .insert({
          title: contentName,
          full_content: generatedContent,
          content_type: format,
          created_by: user.id,
          organization_id: currentOrganizationId,
          status: 'draft'
        })
        .select()
        .single();

      // Handle save in background
      savePromise.then(({ data, error }) => {
        if (error) {
          console.error('Save failed:', error);
          toast({
            title: "Content saved locally",
            description: "We'll retry saving to your library shortly.",
          });
        } else {
          // Silent success - user is already in editor
          localStorage.removeItem('draft-content-backup');
        }
      });

      // Navigate immediately (slight delay for transition to show)
      setTimeout(() => {
        navigate("/editor", {
          state: { 
            contentId: null, // Will be populated when save completes
            content: generatedContent,
            contentType: format,
            productName: product,
            contentName: contentName
          }
        });
      }, 100);

    } catch (error) {
      console.error("Error generating content:", error);
      
      // Show error toast
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive"
      });
      
      // Remove loading overlay
      loaderRoot.unmount();
      const loader = document.getElementById('generating-loader');
      if (loader) loader.remove();
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    // Clear form or navigate back
    navigate("/dashboard");
  };

  const handleThinkModeSend = async () => {
    if (!thinkModeInput.trim() || isThinking) return;
    
    const userMessage = { role: 'user', content: thinkModeInput };
    setThinkModeMessages(prev => [...prev, userMessage]);
    setThinkModeInput("");
    setIsThinking(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/think-mode-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ 
            messages: [...thinkModeMessages, userMessage]
          })
        }
      );

      if (!response.ok) {
        if (response.status === 429 || response.status === 402) {
          const error = await response.json();
          toast({
            title: "AI Unavailable",
            description: error.error,
            variant: "destructive"
          });
          setIsThinking(false);
          return;
        }
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');
      
      const decoder = new TextDecoder();
      let aiMessage = "";
      let aiMessageIndex = -1;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));
        
        for (const line of lines) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              aiMessage += content;
              
              setThinkModeMessages(prev => {
                const updated = [...prev];
                
                if (aiMessageIndex === -1) {
                  updated.push({ role: 'assistant', content: aiMessage });
                  aiMessageIndex = updated.length - 1;
                } else {
                  updated[aiMessageIndex].content = aiMessage;
                }
                
                return updated;
              });
            }
          } catch (parseError) {
            console.error('Error parsing SSE:', parseError);
          }
        }
      }
    } catch (error) {
      console.error('Think Mode error:', error);
      toast({
        title: "Chat error",
        description: "Failed to connect to AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-vellum-cream">
      <div className={`max-w-5xl mx-auto px-6 py-10 transition-opacity duration-300 ${isGenerating ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          {/* Think Mode - Inline Expandable */}
          {!thinkModeExpanded ? (
            <div
              onClick={() => setThinkModeExpanded(true)}
              className="mb-8 rounded-xl cursor-pointer transition-all hover:opacity-90 bg-parchment-white border-2 border-dashed border-brass"
            >
              <div className="p-6 flex items-center gap-4">
                <Lightbulb className="w-6 h-6 text-brass" />
                <div>
                  <h3 className="font-semibold text-lg text-ink-black">
                    Not sure where to start? Ask Madison
                  </h3>
                  <p className="text-sm text-warm-gray">
                    Brainstorm with your Editorial Director before filling out the brief. No pressure, just ideas.
                  </p>
                </div>
              </div>
            </div>
        ) : (
          <div className="mb-8 rounded-xl overflow-hidden border border-warm-gray/20">
            {/* Header */}
            <div className="p-4 flex items-center justify-between bg-gradient-to-r from-brass to-brass-glow">
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5 text-white" />
                <h3 className="font-semibold text-white">Think Mode with Madison</h3>
              </div>
              <button
                onClick={() => setThinkModeExpanded(false)}
                className="hover:opacity-80 transition-opacity"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 bg-parchment-white">
              <div className="text-center max-w-2xl mx-auto mb-6">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-brass/10">
                  <Lightbulb className="w-8 h-8 text-brass" />
                </div>
                <h4 className="text-2xl font-serif mb-3 text-ink-black">
                  Madison's here to help
                </h4>
                <p className="text-base text-warm-gray">
                  Share your ideas, questions, or creative direction. Your Editorial Director will help you explore and refine them.
                </p>
              </div>

              {/* Example Prompts */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("I need a blog post about seasonal fragrance trends")}
                  className="text-sm border-warm-gray/20 text-warm-gray hover:border-brass hover:text-brass"
                >
                  "I need a blog post about seasonal fragrance trends"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("Help me describe our new product launch")}
                  className="text-sm border-warm-gray/20 text-warm-gray hover:border-brass hover:text-brass"
                >
                  "Help me describe our new product launch"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("What's the best way to tell our brand story?")}
                  className="text-sm border-warm-gray/20 text-warm-gray hover:border-brass hover:text-brass"
                >
                  "What's the best way to tell our brand story?"
                </Button>
              </div>

              {/* Input Area Wrapper */}
              {thinkModeMessages.length > 0 && (
                <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
                  {thinkModeMessages.map((msg, index) => (
                    <div 
                      key={index} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div 
                        className={`max-w-[80%] p-4 rounded-lg ${
                          msg.role === 'user' 
                            ? 'bg-warm-gray/10 text-ink-black' 
                            : 'bg-brass/10 text-ink-black'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isThinking && (
                    <div className="flex justify-start">
                      <div className="bg-brass/10 p-4 rounded-lg">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-brass rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <span className="w-2 h-2 bg-brass rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {thinkModeMessages.length > 0 && (
                <Button
                  onClick={() => {
                    setThinkModeExpanded(false);
                    toast({
                      title: "Fill out the brief below",
                      description: "Use the form to finalize your content request"
                    });
                  }}
                  variant="outline"
                  className="w-full mb-4 border-brass text-brass hover:bg-brass/10"
                >
                  Ready to Fill Out the Brief
                </Button>
              )}

              {/* Input Area */}
              <div className="relative">
                <Textarea
                  value={thinkModeInput}
                  onChange={(e) => setThinkModeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleThinkModeSend();
                    }
                  }}
                  placeholder="Type your thoughts here..."
                  className="min-h-[120px] pr-12 bg-vellum-cream border-warm-gray/20 text-ink-black resize-none"
                />
                <Button
                  onClick={handleThinkModeSend}
                  disabled={!thinkModeInput.trim() || isThinking}
                  className="absolute bottom-3 right-3 bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-white"
                  size="icon"
                >
                  {isThinking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-warm-gray/70 mt-2">
                Press Enter to send • Shift + Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={penNibIcon} 
                alt="Pen nib icon" 
                className="w-16 h-16 object-contain"
              />
              <div>
                <h1 className="text-4xl font-serif font-medium text-ink-black">
                  Create Content
                </h1>
                <p className="text-lg mt-1 text-warm-gray">
                  Quick brief to generate your content
                </p>
              </div>
            </div>
            <p className="text-base text-warm-gray">
              Choose your product and format. Add optional details for more targeted content. Our AI will handle the rest.
            </p>
          </div>

          {/* Form Container */}
          <div className="p-8 rounded-xl border border-warm-gray/20 space-y-6 bg-parchment-white">
            {/* Product - Required */}
            <div>
              <Label htmlFor="product" className="text-base mb-2 text-ink-black">
                Product <span className="text-brass">*</span>
              </Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger
                  id="product"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="noir-invites">Noir—Invites</SelectItem>
                  <SelectItem value="lumiere-captures">Lumière—Captures</SelectItem>
                  <SelectItem value="jardin-secret">Jardin Secret</SelectItem>
                  <SelectItem value="ombre-delicat">Ombre—Délicat</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Deliverable Format - Required */}
            <div>
              <Label htmlFor="format" className="text-base mb-2 text-ink-black">
                Deliverable Format <span className="text-brass">*</span>
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger
                  id="format"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder="Select format..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blog-post">Blog Post</SelectItem>
                  <SelectItem value="email">Email Newsletter</SelectItem>
                  <SelectItem value="story">Product Story</SelectItem>
                  <SelectItem value="social">Social Media Post</SelectItem>
                  <SelectItem value="description">Product Description</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Audience - Optional */}
            <div>
              <Label htmlFor="audience" className="text-base mb-2 text-ink-black">
                Target Audience
              </Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger
                  id="audience"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder="Select audience..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="luxury">Luxury Consumers</SelectItem>
                  <SelectItem value="wellness">Wellness Enthusiasts</SelectItem>
                  <SelectItem value="gifts">Gift Shoppers</SelectItem>
                  <SelectItem value="connoisseurs">Fragrance Connoisseurs</SelectItem>
                  <SelectItem value="new">New Customers</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs italic mt-2 text-warm-gray/70">
                Who is this content for? Helps AI tailor message and tone
              </p>
            </div>

            {/* Content Goal - Optional */}
            <div>
              <Label htmlFor="goal" className="text-base mb-2 text-ink-black">
                Content Goal
              </Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger
                  id="goal"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue placeholder="Select goal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Drive Sales</SelectItem>
                  <SelectItem value="awareness">Build Awareness</SelectItem>
                  <SelectItem value="educate">Educate Audience</SelectItem>
                  <SelectItem value="nurture">Nurture Relationships</SelectItem>
                  <SelectItem value="launch">Launch Product</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs italic mt-2 text-warm-gray/70">
                What should this content achieve? Guides AI on CTA and focus
              </p>
            </div>

            {/* Style Overlay - Optional */}
            <div>
              <Label htmlFor="style" className="text-base mb-2 text-ink-black">
                Style Overlay
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger
                  id="style"
                  className="mt-2 bg-parchment-white border-warm-gray/20"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tarife-native">Tarife—Brand (Default)</SelectItem>
                  <SelectItem value="poetic">Poetic & Evocative</SelectItem>
                  <SelectItem value="direct">Direct & Practical</SelectItem>
                  <SelectItem value="story">Storytelling & Narrative</SelectItem>
                  <SelectItem value="minimal">Minimal & Modern</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs italic mt-2 text-warm-gray/70">
                Choose the writing style that best fits your content needs
              </p>
            </div>

            {/* Additional Editorial Direction - Optional */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="context" className="text-base text-ink-black">
                  Additional Editorial Direction
                </Label>
                <span className="text-xs text-warm-gray/70">
                  {additionalContext.length} / 1000 characters
                </span>
              </div>
              <Textarea
                id="context"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Provide specific requirements or creative mandates..."
                className="mt-2 min-h-[120px] bg-vellum-cream border-warm-gray/20 text-ink-black"
                maxLength={1000}
              />
              <p className="text-xs italic mt-2 text-warm-gray/70">
                Any specific themes, angles, seasonal notes, or key messages to include (max 1000 characters)
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 flex items-center justify-between border-t border-warm-gray/20">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-warm-gray hover:text-charcoal"
            >
              Cancel
            </Button>

            <div className="text-right">
              <Button
                onClick={handleSubmit}
                disabled={!product || !format}
                className="gap-2 px-8 bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-ink-black font-semibold disabled:from-warm-gray/20 disabled:to-warm-gray/20 disabled:text-warm-gray disabled:cursor-not-allowed transition-all"
              >
                <PenTool className="w-5 h-5" />
                <span className="text-base">Create Content</span>
              </Button>
              <p className="text-xs mt-2 text-warm-gray/70">
                {!product || !format ? (
                  <span className="text-brass">Select product and format to continue</span>
                ) : (
                  "Headlines and subjects will be AI-generated. You'll refine in the editor."
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs and Loaders */}
      {showTransitionLoader && <TransitionLoader onComplete={() => setShowTransitionLoader(false)} />}
      <NameContentDialog
        open={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
        onConfirm={handleGenerateContent}
      />
    </div>
  );
}
