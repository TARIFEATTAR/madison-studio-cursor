import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2, Download, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const OVERLAY_OPTIONS = [
  { value: 25, label: "25% Light", description: "Subtle overlay" },
  { value: 50, label: "50% Medium", description: "Balanced" },
  { value: 75, label: "75% Dark", description: "Strong contrast" },
  { value: 100, label: "100% Full", description: "Maximum opacity" },
];

export default function AddTextToImage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [selectedImage, setSelectedImage] = useState<{ url: string; file?: File } | null>(null);
  const [textInstruction, setTextInstruction] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedImage({ url, file });
    setGeneratedImage(null);
    toast.success("Image uploaded");
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    if (!textInstruction.trim()) {
      toast.error("Please enter text instructions");
      return;
    }

    if (!user) {
      toast.error("Please log in to continue");
      return;
    }

    setIsGenerating(true);

    try {
      // Build enhanced prompt with overlay instruction
      const overlayInstruction = overlayOpacity < 100 
        ? `with a ${overlayOpacity}% opacity dark overlay behind the text for better readability`
        : "with a solid background overlay for the text";

      const fullPrompt = `${textInstruction.trim()} ${overlayInstruction}. Maintain the original image composition and quality.`;

      console.log("Generating image with text:", {
        instruction: textInstruction,
        overlay: overlayOpacity,
        fullPrompt
      });

      const { data, error } = await supabase.functions.invoke("add-text-to-image", {
        body: {
          imageUrl: selectedImage.url,
          textInstruction: fullPrompt,
          userId: user.id,
        },
      });

      if (error) throw error;
      if (!data?.imageUrl) throw new Error("No image URL returned");

      setGeneratedImage(data.imageUrl);
      toast.success("Text added successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      toast.error(error.message || "Failed to add text to image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;

    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `text-overlay-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-serif font-semibold">Add Text to Image</h1>
            <p className="text-sm text-muted-foreground">Add custom text overlays to your images</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-6xl py-8 px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Controls */}
          <div className="space-y-6">
            {/* Image Upload */}
            <Card className="p-6">
              <Label className="text-base font-semibold mb-4 block">Select Image</Label>
              
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedImage.url}
                      alt="Selected"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedImage(null)}
                    className="w-full"
                  >
                    Change Image
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-12 w-12" />
                    <span className="text-sm font-medium">Click to upload image</span>
                    <span className="text-xs">PNG, JPG, WEBP up to 10MB</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </Card>

            {/* Text Instruction */}
            <Card className="p-6">
              <Label htmlFor="text-instruction" className="text-base font-semibold mb-4 block">
                Text Instructions
              </Label>
              <Textarea
                id="text-instruction"
                placeholder="Example: Add 'SALE 50% OFF' in bold red text at the top center"
                value={textInstruction}
                onChange={(e) => setTextInstruction(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Describe what text to add and where (color, position, style, etc.)
              </p>
            </Card>

            {/* Overlay Opacity */}
            <Card className="p-6">
              <Label className="text-base font-semibold mb-4 block">Background Overlay</Label>
              <div className="grid grid-cols-2 gap-3">
                {OVERLAY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOverlayOpacity(option.value)}
                    className={cn(
                      "flex flex-col items-start p-4 rounded-lg border-2 transition-all",
                      overlayOpacity === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </button>
                ))}
              </div>
            </Card>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!selectedImage || !textInstruction.trim() || isGenerating}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Add Text to Image
                </>
              )}
            </Button>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <Card className="p-6">
              <Label className="text-base font-semibold mb-4 block">Preview</Label>
              
              {generatedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-muted border">
                    <img
                      src={generatedImage}
                      alt="Generated with text"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 rounded-lg border-2 border-dashed bg-muted/20">
                  <ImageIcon className="h-12 w-12 text-muted-foreground/50 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    {isGenerating ? "Generating..." : "Your result will appear here"}
                  </p>
                </div>
              )}
            </Card>

            {/* Tips */}
            <Card className="p-6 bg-muted/50">
              <h3 className="font-semibold mb-3">Tips for Best Results</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Be specific about text placement (top, center, bottom)</li>
                <li>• Mention color, font style (bold, italic), and size</li>
                <li>• Use overlay opacity for better text readability</li>
                <li>• Higher opacity = stronger contrast for light text</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
