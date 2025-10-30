import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Loader2, Sparkles, Image as ImageIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileAspectRatioSelector from "@/components/image-editor/MobileAspectRatioSelector";
import { useIsMobile } from "@/hooks/use-mobile";

const OVERLAY_OPTIONS = [
  { value: 0, label: "None", description: "No overlay", icon: "○" },
  { value: 25, label: "Light", description: "Subtle", icon: "◔" },
  { value: 50, label: "Medium", description: "Balanced", icon: "◑" },
  { value: 75, label: "Dark", description: "Strong", icon: "◕" },
];

export default function AddTextToImage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [selectedImage, setSelectedImage] = useState<{ url: string; file?: File } | null>(null);
  const [textInstruction, setTextInstruction] = useState("");
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [aspectRatio, setAspectRatio] = useState("1:1");
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

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#000000]">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#000000] border-b border-[#1a1a1a]">
          <div className="flex h-14 items-center gap-4 px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="shrink-0 text-white hover:bg-[#1a1a1a]"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-white">Add Text to Image</h1>
            </div>
            <div className="text-sm font-medium text-[#C9A66B] bg-[#C9A66B]/10 px-3 py-1 rounded-full">
              {user?.id?.slice(0, 6) || "0"}K
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 py-6 pb-20 bg-[#000000]">
          <Tabs defaultValue="create" className="w-full bg-[#000000]">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#111111] border border-[#2a2a2a] p-1">
              <TabsTrigger 
                value="create" 
                className="data-[state=active]:bg-[#C9A66B] data-[state=active]:text-[#000000] data-[state=inactive]:text-[#666666] rounded"
              >
                Create
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-[#C9A66B] data-[state=active]:text-[#000000] data-[state=inactive]:text-[#666666] rounded"
              >
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6 mt-0 bg-[#000000]">
              {/* Text Input */}
              <div className="space-y-3">
                <Textarea
                  placeholder="Write or describe what text to add to your image..."
                  value={textInstruction}
                  onChange={(e) => setTextInstruction(e.target.value)}
                  rows={6}
                  className="bg-[#1a1a1a] border-[#2a2a2a] text-white placeholder:text-[#666666] resize-none focus:border-[#C9A66B] focus:ring-[#C9A66B]"
                />
                
                {/* Image Upload Button */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-[#A0A0A0] cursor-pointer hover:bg-[#222222] hover:border-[#C9A66B]/50 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedImage ? "Change Image" : "Upload Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Image Preview */}
              {selectedImage && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-[#111111] border border-[#2a2a2a]">
                  <img
                    src={selectedImage.url}
                    alt="Selected"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Option Cards Grid */}
              <div className="grid grid-cols-3 gap-3">
                {/* Tint Overlay Card */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#1a1a1a] hover:border-[#C9A66B]/30 transition-colors">
                  <div className="text-2xl text-[#C9A66B]">{OVERLAY_OPTIONS.find(o => o.value === overlayOpacity)?.icon || "◑"}</div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-white">Tint</div>
                    <div className="text-[10px] text-[#666666]">
                      {OVERLAY_OPTIONS.find(o => o.value === overlayOpacity)?.label}
                    </div>
                  </div>
                </Card>

                {/* Aspect Ratio Card */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-4 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#1a1a1a] hover:border-[#C9A66B]/30 transition-colors">
                  <div className="text-2xl text-[#C9A66B]">⬜</div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-white">Size</div>
                    <div className="text-[10px] text-[#666666]">{aspectRatio}</div>
                  </div>
                </Card>

                {/* Style Card (placeholder for future features) */}
                <Card className="bg-[#111111] border-[#2a2a2a] p-4 flex flex-col items-center gap-2 opacity-40">
                  <div className="text-2xl text-[#666666]">✨</div>
                  <div className="text-center">
                    <div className="text-xs font-medium text-white">Style</div>
                    <div className="text-[10px] text-[#666666]">Default</div>
                  </div>
                </Card>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!selectedImage || !textInstruction.trim() || isGenerating}
                size="lg"
                className="w-full bg-[#C9A66B] hover:bg-[#B8956A] text-[#000000] font-bold rounded-full h-14 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate image
                  </>
                )}
              </Button>

              {/* Generated Image */}
              {generatedImage && (
                <div className="space-y-4">
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-[#111111] border-2 border-[#C9A66B] shadow-lg shadow-[#C9A66B]/20">
                    <img
                      src={generatedImage}
                      alt="Generated with text"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="w-full border-[#C9A66B] bg-transparent text-[#C9A66B] hover:bg-[#C9A66B]/10 hover:border-[#C9A66B] hover:text-[#C9A66B]"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Image
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0 bg-[#000000]">
              {/* Tint Overlay Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Background Overlay</h3>
                <div className="grid grid-cols-2 gap-3">
                  {OVERLAY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setOverlayOpacity(option.value)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                        overlayOpacity === option.value
                          ? "border-[#C9A66B] bg-[#C9A66B]/10 text-[#C9A66B]"
                          : "border-[#2a2a2a] bg-[#111111] text-[#666666] hover:bg-[#1a1a1a] hover:border-[#C9A66B]/30"
                      )}
                    >
                      <span className="text-2xl">{option.icon}</span>
                      <div className="text-left">
                        <div className="font-medium text-sm">{option.label}</div>
                        <div className="text-xs opacity-70">{option.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-white">Aspect Ratio</h3>
                <MobileAspectRatioSelector
                  value={aspectRatio}
                  onChange={setAspectRatio}
                />
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button
                    onClick={() => setAspectRatio("4:5")}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                      aspectRatio === "4:5"
                        ? "border-[#C9A66B] bg-[#C9A66B]/10 text-[#C9A66B]"
                        : "border-[#2a2a2a] bg-[#111111] text-[#666666] hover:bg-[#1a1a1a] hover:border-[#C9A66B]/30"
                    )}
                  >
                    4:5 Portrait
                  </button>
                  <button
                    onClick={() => setAspectRatio("16:9")}
                    className={cn(
                      "px-3 py-2 rounded-lg border text-sm font-medium transition-all",
                      aspectRatio === "16:9"
                        ? "border-[#C9A66B] bg-[#C9A66B]/10 text-[#C9A66B]"
                        : "border-[#2a2a2a] bg-[#111111] text-[#666666] hover:bg-[#1a1a1a] hover:border-[#C9A66B]/30"
                    )}
                  >
                    16:9 Wide
                  </button>
                </div>
              </div>

              {/* Tips */}
              <Card className="p-4 bg-[#111111] border-[#2a2a2a]">
                <h3 className="font-semibold text-sm mb-3 text-white">Tips for Social Posts</h3>
                <ul className="space-y-2 text-xs text-[#666666]">
                  <li>• 1:1 - Perfect for Instagram feed posts</li>
                  <li>• 9:16 - Ideal for Stories and Reels</li>
                  <li>• 4:5 - Great for portrait posts</li>
                  <li>• 16:9 - Best for landscape images</li>
                  <li>• Use overlay for better text readability</li>
                </ul>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    );
  }

  // Desktop Layout
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
              <h3 className="text-base font-semibold mb-4">Select Image</h3>
              
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
              <h3 className="text-base font-semibold mb-4">Text Instructions</h3>
              <Textarea
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

            {/* Overlay & Aspect Ratio */}
            <Card className="p-6">
              <h3 className="text-base font-semibold mb-4">Background Overlay</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {OVERLAY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setOverlayOpacity(option.value)}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
                      overlayOpacity === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <span className="text-2xl">{option.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="text-base font-semibold mb-4">Aspect Ratio</h3>
              <MobileAspectRatioSelector
                value={aspectRatio}
                onChange={setAspectRatio}
              />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <Button
                  variant={aspectRatio === "4:5" ? "default" : "outline"}
                  onClick={() => setAspectRatio("4:5")}
                  size="sm"
                >
                  4:5 Portrait
                </Button>
                <Button
                  variant={aspectRatio === "16:9" ? "default" : "outline"}
                  onClick={() => setAspectRatio("16:9")}
                  size="sm"
                >
                  16:9 Wide
                </Button>
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
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add Text to Image
                </>
              )}
            </Button>
          </div>

          {/* Right Column: Preview */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-base font-semibold mb-4">Preview</h3>
              
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
              <h3 className="font-semibold mb-3">Tips for Social Posts</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• 1:1 - Perfect for Instagram feed posts</li>
                <li>• 9:16 - Ideal for Stories and Reels</li>
                <li>• 4:5 - Great for portrait posts</li>
                <li>• 16:9 - Best for landscape images</li>
                <li>• Use overlay opacity for better text readability</li>
              </ul>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
