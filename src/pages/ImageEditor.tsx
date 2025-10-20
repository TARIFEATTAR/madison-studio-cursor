import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoalSelector } from "@/components/image-editor/GoalSelector";
import { ExportOptions } from "@/components/image-editor/ExportOptions";

type GeneratedImage = {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
};

export default function ImageEditor() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  
  const [goalType, setGoalType] = useState<string>("etsy-listing");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [outputFormat, setOutputFormat] = useState<"png" | "jpeg" | "webp">("png");
  
  const [userPrompt, setUserPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Current main image being refined
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  
  // Gallery of completed/previous iterations
  const [imageGallery, setImageGallery] = useState<GeneratedImage[]>([]);

  const handleGenerate = async () => {
    if (!userPrompt.trim() || !user || !orgId) {
      toast.error("Please enter a prompt to generate an image");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          goalType,
          aspectRatio,
          outputFormat,
          prompt: userPrompt,
          organizationId: orgId,
          userId: user.id,
          selectedTemplate: null,
          userRefinements: currentImage ? userPrompt : null
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: GeneratedImage = {
          id: data.id || crypto.randomUUID(),
          imageUrl: data.imageUrl,
          prompt: userPrompt,
          timestamp: Date.now(),
        };
        
        setCurrentImage(newImage);
        
        toast.success(currentImage ? "✨ Image refined!" : "✨ Image generated!");
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMoveToGallery = () => {
    if (currentImage) {
      setImageGallery((prev) => [currentImage, ...prev].slice(0, 5)); // Keep max 5
      setCurrentImage(null);
      setUserPrompt("");
      
      toast.success("Image saved to gallery. Ready for next generation!");
    }
  };

  const handleSelectFromGallery = (image: GeneratedImage) => {
    // Move current to gallery if exists
    if (currentImage) {
      setImageGallery((prev) => [currentImage, ...prev.filter(img => img.id !== image.id)].slice(0, 5));
    }
    
    // Make selected image the current one
    setCurrentImage(image);
    setUserPrompt(image.prompt);
  };

  const handleDownload = (imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `madison-image-${Date.now()}.${outputFormat}`;
    link.click();
  };

  const quickRefinements = [
    "More dramatic lighting",
    "Different angle",
    "Clean white background",
    "Add soft shadows",
    "Closer product shot"
  ];

  return (
    <div className="min-h-screen bg-vellum-cream">
      <div className="max-w-[1800px] mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="font-serif text-3xl text-ink-black">Madison Image Studio</h1>
            </div>
            <p className="text-charcoal/70 text-sm">E-commerce product photography with AI</p>
          </div>
        </div>

        {/* Main Layout: Gallery + Main Image + Chat */}
        <div className="flex gap-6">
          {/* Left Sidebar - Thumbnail Gallery */}
          <div className="w-32 flex-shrink-0 space-y-3">
            <p className="text-xs font-semibold text-charcoal/60 mb-3 tracking-wide">PREVIOUS</p>
            {imageGallery.map((image, index) => (
              <button
                key={image.id}
                onClick={() => handleSelectFromGallery(image)}
                className={`w-full aspect-square rounded border-2 transition-all overflow-hidden hover:scale-105 ${
                  currentImage?.id === image.id
                    ? "border-brass shadow-md ring-2 ring-brass/20"
                    : "border-charcoal/20 hover:border-brass/50"
                }`}
              >
                <img
                  src={image.imageUrl}
                  alt={`Generation ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
            
            {/* Empty slots */}
            {Array.from({ length: Math.max(0, 5 - imageGallery.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="w-full aspect-square rounded border-2 border-dashed border-charcoal/10 bg-white/50"
              />
            ))}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Top Controls */}
            <Card className="p-6 bg-parchment-white border-charcoal/10 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm font-medium text-ink-black mb-3">Image Goal</p>
                  <GoalSelector
                    selectedGoal={goalType}
                    onSelectGoal={setGoalType}
                  />
                </div>
                
                <div>
                  <p className="text-sm font-medium text-ink-black mb-3">Export Settings</p>
                  <ExportOptions
                    aspectRatio={aspectRatio}
                    outputFormat={outputFormat}
                    onAspectRatioChange={setAspectRatio}
                    onOutputFormatChange={(value) => setOutputFormat(value as "png" | "jpeg" | "webp")}
                  />
                </div>

                <div>
                  <p className="text-sm font-medium text-ink-black mb-3">Actions</p>
                  {currentImage && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(currentImage.imageUrl)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button
                        onClick={handleMoveToGallery}
                        size="sm"
                        className="flex-1 bg-brass hover:bg-brass/90 text-white"
                      >
                        Next →
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Main Image Display */}
            <Card className="flex-1 p-8 bg-white border-charcoal/10 shadow-sm min-h-[500px] flex items-center justify-center">
              {isGenerating ? (
                <div className="text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-brass animate-spin mx-auto" />
                  <p className="text-charcoal/70">Generating your image...</p>
                  <p className="text-xs text-charcoal/40">This may take 15-30 seconds</p>
                </div>
              ) : currentImage ? (
                <div className="w-full max-w-3xl">
                  <img
                    src={currentImage.imageUrl}
                    alt="Generated product"
                    className="w-full h-auto rounded shadow-lg"
                  />
                  <div className="mt-4 p-3 bg-vellum-cream/50 rounded">
                    <p className="text-xs text-charcoal/60 font-medium mb-1">PROMPT</p>
                    <p className="text-sm text-charcoal/70 italic">"{currentImage.prompt}"</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <Sparkles className="w-16 h-16 text-brass/30 mx-auto" />
                  <p className="text-lg text-charcoal/70 font-medium">Start a new generation</p>
                  <p className="text-sm text-charcoal/50">Describe the product image you want below</p>
                </div>
              )}
            </Card>

            {/* Chat-Style Refinement Input */}
            <Card className="p-6 bg-parchment-white border-charcoal/10 shadow-sm">
              <div className="space-y-4">
                <Textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  placeholder={currentImage 
                    ? "Describe how to refine this image... (e.g., 'make the lighting warmer' or 'add a soft shadow')" 
                    : "Describe the product image you want to create... (e.g., 'luxury candle on marble surface with soft natural light')"
                  }
                  rows={3}
                  className="resize-none bg-white border-charcoal/20 focus:border-brass"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleGenerate();
                    }
                  }}
                />
                
                <div className="flex justify-between items-center">
                  <div className="flex flex-wrap gap-2">
                    {quickRefinements.map((refinement) => (
                      <button
                        key={refinement}
                        onClick={() => setUserPrompt(refinement)}
                        className="px-3 py-1 text-xs rounded-full bg-brass/10 text-brass hover:bg-brass/20 transition-colors"
                      >
                        {refinement}
                      </button>
                    ))}
                  </div>
                  
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !userPrompt.trim()}
                    className="bg-brass hover:bg-brass/90 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        {currentImage ? "Refine" : "Generate"}
                      </>
                    )}
                  </Button>
                </div>
                
                <p className="text-xs text-charcoal/40 text-right">
                  Press ⌘+Enter to generate
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
