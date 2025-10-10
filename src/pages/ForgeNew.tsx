import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, FileText, PenTool, X, Send } from "lucide-react";
import { createRoot } from "react-dom/client";
import { GeneratingLoader } from "@/components/forge/GeneratingLoader";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
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

  // Render loading overlay when needed
  useEffect(() => {
    const loaderDiv = document.getElementById('generating-loader');
    if (loaderDiv) {
      const root = createRoot(loaderDiv);
      root.render(<GeneratingLoader />);
      return () => root.unmount();
    }
  }, []);
  
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

  const handleSubmit = () => {
    // Validate required fields
    if (!product || !format) {
      return;
    }
    
    // Open name dialog
    setNameDialogOpen(true);
  };

  const handleGenerateContent = async (contentName: string) => {
    // Save brief data to localStorage
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

    // Show loading overlay
    setNameDialogOpen(false);
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'generating-loader';
    document.body.appendChild(loadingDiv);

    // Simulate generation (1.5-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 500));

    // Generate content (mock for now)
    const mockContent = `The souk falls quiet for just a moment. Between the calls of merchants and the shuffle of silk scarves against weathered stone, you catch it—that unmistakable breath of night-blooming jasmine drifting from a hidden courtyard.

You've been here before, in dreams perhaps, or in the pages of a book that transported you far from wherever you started this morning. The air carries secrets: rose petals crushed underfoot in Damascus gardens, amber warming in desert sun, the whisper of musk that clings to ancient walls.

This is not just fragrance. This is passage—to places where time slows, where senses sharpen, where memory and imagination converge.

${format === "product" ? "The Product—" + product + "—invites you into this journey." : ""}

${goal === "storytelling" ? "This is a story told in scent, an invitation to wander beyond the familiar." : ""}

Some journeys begin with a single breath.`;

    // Save to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (!currentOrganizationId) {
        throw new Error("No organization found. Please complete onboarding first.");
      }

      const { data, error } = await supabase
        .from('master_content')
        .insert({
          title: contentName,
          full_content: mockContent,
          content_type: format,
          created_by: user.id,
          organization_id: currentOrganizationId,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      // Remove loading overlay
      const loader = document.getElementById('generating-loader');
      if (loader) loader.remove();

      // Navigate to editor with content ID
      navigate("/editor", {
        state: {
          contentId: data.id,
          content: mockContent,
          contentType: format,
          productName: product,
          contentName: contentName
        }
      });
    } catch (error) {
      console.error("Error saving content:", error);
      // Remove loading overlay
      const loader = document.getElementById('generating-loader');
      if (loader) loader.remove();
      
      // Still navigate but without DB save
      navigate("/editor", {
        state: {
          content: mockContent,
          contentType: format,
          productName: product,
          contentName: contentName
        }
      });
    }
  };

  const handleCancel = () => {
    // Clear form or navigate back
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen pb-20 bg-vellum-cream">
      <div className="max-w-5xl mx-auto px-6 py-10">
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
                  Not sure where to start? Try Think Mode
                </h3>
                <p className="text-sm text-warm-gray">
                  Brainstorm with AI before filling out the brief. No pressure, just ideas.
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
                <h3 className="font-semibold text-white">Think Mode</h3>
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
                  What's on your mind?
                </h4>
                <p className="text-base text-warm-gray">
                  Share your ideas, questions, or creative direction. I'll help you explore and refine them.
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

              {/* Input Area */}
              <div className="relative">
                <Textarea
                  value={thinkModeInput}
                  onChange={(e) => setThinkModeInput(e.target.value)}
                  placeholder="Type your thoughts here..."
                  className="min-h-[120px] pr-12 bg-vellum-cream border-warm-gray/20 text-ink-black"
                />
                <Button
                  className="absolute bottom-3 right-3 bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-white"
                  size="icon"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Form */}
        <div>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-brass">
                <FileText className="w-8 h-8 text-white" />
              </div>
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
              <Label htmlFor="context" className="text-base mb-2 text-ink-black">
                Additional Editorial Direction
              </Label>
              <Textarea
                id="context"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Provide specific requirements or creative mandates..."
                className="mt-2 min-h-[120px] bg-vellum-cream border-warm-gray/20 text-ink-black"
              />
              <p className="text-xs italic mt-2 text-warm-gray/70">
                Any specific themes, angles, seasonal notes, or key messages to include
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

      {/* Dialogs */}
      <NameContentDialog
        open={nameDialogOpen}
        onOpenChange={setNameDialogOpen}
        onConfirm={handleGenerateContent}
      />
    </div>
  );
}
