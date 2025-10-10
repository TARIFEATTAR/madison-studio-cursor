import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lightbulb, FileText, Sparkles, X, Send } from "lucide-react";
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

  const handleGenerateContent = (contentName: string) => {
    // TODO: Call AI to generate content
    const mockContent = `The souk falls quiet for just a moment. Between the calls of merchants and the shuffle of silk scarves against weathered stone, you catch it—that unmistakable breath of night-blooming jasmine drifting from a hidden courtyard.

You've been here before, in dreams perhaps, or in the pages of a book that transported you far from wherever you started this morning. The air carries secrets: rose petals crushed underfoot in Damascus gardens, amber warming in desert sun, the whisper of musk that clings to ancient walls.

This is not just fragrance. This is passage—to places where time slows, where senses sharpen, where memory and imagination converge.

${format === "product" ? "The Product—" + product + "—invites you into this journey." : ""}

${goal === "storytelling" ? "This is a story told in scent, an invitation to wander beyond the familiar." : ""}

Some journeys begin with a single breath.`;

    // Navigate to editor with generated content
    navigate("/editor", {
      state: {
        content: mockContent,
        contentType: format,
        productName: product,
        contentName: contentName
      }
    });
  };

  const handleCancel = () => {
    // Clear form or navigate back
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen pb-20" style={{ backgroundColor: "#F5F1E8" }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Think Mode - Inline Expandable */}
        {!thinkModeExpanded ? (
          <div
            onClick={() => setThinkModeExpanded(true)}
            className="mb-8 rounded-xl cursor-pointer transition-all hover:opacity-90"
            style={{
              backgroundColor: "#F5F1E8",
              border: "2px dashed #B8956A"
            }}
          >
            <div className="p-6 flex items-center gap-4">
              <Lightbulb className="w-6 h-6" style={{ color: "#B8956A" }} />
              <div>
                <h3 className="font-semibold text-lg" style={{ color: "#1A1816" }}>
                  Not sure where to start? Try Think Mode
                </h3>
                <p className="text-sm" style={{ color: "#6B6560" }}>
                  Brainstorm with AI before filling out the brief. No pressure, just ideas.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-xl overflow-hidden border" style={{ borderColor: "#D4CFC8" }}>
            {/* Header */}
            <div
              className="p-4 flex items-center justify-between"
              style={{
                backgroundImage: "linear-gradient(to right, #B8956A, #D4AF85)"
              }}
            >
              <div className="flex items-center gap-3">
                <Lightbulb className="w-5 h-5" style={{ color: "#FFFFFF" }} />
                <h3 className="font-semibold" style={{ color: "#FFFFFF" }}>Think Mode</h3>
              </div>
              <button
                onClick={() => setThinkModeExpanded(false)}
                className="hover:opacity-80 transition-opacity"
              >
                <X className="w-5 h-5" style={{ color: "#FFFFFF" }} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8" style={{ backgroundColor: "#FFFCF5" }}>
              <div className="text-center max-w-2xl mx-auto mb-6">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: "#F5F1E8" }}
                >
                  <Lightbulb className="w-8 h-8" style={{ color: "#B8956A" }} />
                </div>
                <h4 className="text-2xl font-serif mb-3" style={{ color: "#1A1816" }}>
                  What's on your mind?
                </h4>
                <p className="text-base" style={{ color: "#6B6560" }}>
                  Share your ideas, questions, or creative direction. I'll help you explore and refine them.
                </p>
              </div>

              {/* Example Prompts */}
              <div className="flex flex-wrap gap-3 justify-center mb-6">
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("I need a blog post about seasonal fragrance trends")}
                  className="text-sm"
                  style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
                >
                  "I need a blog post about seasonal fragrance trends"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("Help me describe our new product launch")}
                  className="text-sm"
                  style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
                >
                  "Help me describe our new product launch"
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setThinkModeInput("What's the best way to tell our brand story?")}
                  className="text-sm"
                  style={{ borderColor: "#D4CFC8", color: "#6B6560" }}
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
                  className="min-h-[120px] pr-12"
                  style={{
                    backgroundColor: "#F5F1E8",
                    borderColor: "#D4CFC8",
                    color: "#1A1816"
                  }}
                />
                <Button
                  className="absolute bottom-3 right-3"
                  size="icon"
                  style={{
                    backgroundImage: "linear-gradient(to right, #B8956A, #D4AF85)",
                    color: "#FFFFFF"
                  }}
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
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#B8956A" }}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-serif" style={{ color: "#1A1816" }}>
                  Create Content
                </h1>
                <p className="text-lg mt-1" style={{ color: "#6B6560" }}>
                  Quick brief to generate your content
                </p>
              </div>
            </div>
            <p className="text-base" style={{ color: "#6B6560" }}>
              Choose your product and format. Add optional details for more targeted content. Our AI will handle the rest.
            </p>
          </div>

          {/* Form Container */}
          <div
            className="p-8 rounded-xl border space-y-6"
            style={{
              backgroundColor: "#FFFCF5",
              borderColor: "#D4CFC8"
            }}
          >
            {/* Product - Required */}
            <div>
              <Label htmlFor="product" className="text-base mb-2" style={{ color: "#1A1816" }}>
                Product <span style={{ color: "#B8956A" }}>*</span>
              </Label>
              <Select value={product} onValueChange={setProduct}>
                <SelectTrigger
                  id="product"
                  className="mt-2"
                  style={{
                    backgroundColor: "#FFFCF5",
                    borderColor: "#D4CFC8"
                  }}
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
              <Label htmlFor="format" className="text-base mb-2" style={{ color: "#1A1816" }}>
                Deliverable Format <span style={{ color: "#B8956A" }}>*</span>
              </Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger
                  id="format"
                  className="mt-2"
                  style={{
                    backgroundColor: "#FFFCF5",
                    borderColor: "#D4CFC8"
                  }}
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
              <Label htmlFor="audience" className="text-base mb-2" style={{ color: "#1A1816" }}>
                Target Audience
              </Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger
                  id="audience"
                  className="mt-2"
                  style={{
                    backgroundColor: "#FFFCF5",
                    borderColor: "#D4CFC8"
                  }}
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
              <p className="text-xs italic mt-2" style={{ color: "#A8A39E" }}>
                Who is this content for? Helps AI tailor message and tone
              </p>
            </div>

            {/* Content Goal - Optional */}
            <div>
              <Label htmlFor="goal" className="text-base mb-2" style={{ color: "#1A1816" }}>
                Content Goal
              </Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger
                  id="goal"
                  className="mt-2"
                  style={{
                    backgroundColor: "#FFFCF5",
                    borderColor: "#D4CFC8"
                  }}
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
              <p className="text-xs italic mt-2" style={{ color: "#A8A39E" }}>
                What should this content achieve? Guides AI on CTA and focus
              </p>
            </div>

            {/* Style Overlay - Optional */}
            <div>
              <Label htmlFor="style" className="text-base mb-2" style={{ color: "#1A1816" }}>
                Style Overlay
              </Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger
                  id="style"
                  className="mt-2"
                  style={{
                    backgroundColor: "#FFFCF5",
                    borderColor: "#D4CFC8"
                  }}
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
              <p className="text-xs italic mt-2" style={{ color: "#A8A39E" }}>
                Choose the writing style that best fits your content needs
              </p>
            </div>

            {/* Additional Editorial Direction - Optional */}
            <div>
              <Label htmlFor="context" className="text-base mb-2" style={{ color: "#1A1816" }}>
                Additional Editorial Direction
              </Label>
              <Textarea
                id="context"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Provide specific requirements or creative mandates..."
                className="mt-2 min-h-[120px]"
                style={{
                  backgroundColor: "#F5F1E8",
                  borderColor: "#D4CFC8",
                  color: "#1A1816"
                }}
              />
              <p className="text-xs italic mt-2" style={{ color: "#A8A39E" }}>
                Any specific themes, angles, seasonal notes, or key messages to include
              </p>
            </div>
          </div>

          {/* Actions */}
          <div
            className="mt-6 pt-6 flex items-center justify-between"
            style={{ borderTop: "1px solid #D4CFC8" }}
          >
            <Button
              variant="ghost"
              onClick={handleCancel}
              style={{ color: "#6B6560" }}
            >
              Cancel
            </Button>

            <div className="text-right">
              <Button
                onClick={handleSubmit}
                disabled={!product || !format}
                variant="brass"
                className="gap-2 px-8 bg-gradient-to-r from-aged-brass to-antique-gold text-ink-black disabled:opacity-100"
              >
                <Sparkles className="w-5 h-5 text-ink-black" />
                <span className="text-base font-semibold">Create Content</span>
              </Button>
              <p className="text-xs mt-2" style={{ color: "#A8A39E" }}>
                Headlines and subjects will be AI-generated. You'll refine in the editor.
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
