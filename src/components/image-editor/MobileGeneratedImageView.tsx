import { Button } from "@/components/ui/button";
import { Download, Share2, X, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MobileAspectRatioSelector from "./MobileAspectRatioSelector";
import type { ImageCategoryDefinition } from "@/data/imageCategories";

interface MobileGeneratedImageViewProps {
  imageUrl: string;
  prompt: string;
  aspectRatio: string;
  onSave: () => void;
  onClose: () => void;
  onRegenerate: (prompt: string) => void;
  onPromptChange: (prompt: string) => void;
  onAspectRatioChange: (ratio: string) => void;
  onShotTypeSelect: (shotType: ImageCategoryDefinition) => void;
  isGenerating: boolean;
  isSaving?: boolean;
}

export default function MobileGeneratedImageView({
  imageUrl,
  prompt,
  aspectRatio,
  onSave,
  onClose,
  onRegenerate,
  onPromptChange,
  onAspectRatioChange,
  onShotTypeSelect,
  isGenerating,
  isSaving = false,
}: MobileGeneratedImageViewProps) {
  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const file = new File([blob], "image.png", { type: "image/png" });
        await navigator.share({
          files: [file],
          title: "Generated Image",
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-studio-charcoal flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 pt-safe border-b border-studio-border">
        <Button variant="ghost" size="icon" onClick={onClose} type="button" disabled={isGenerating || isSaving}>
          <X className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={onSave}
          size="lg"
          type="button"
          disabled={isGenerating || isSaving}
          className="bg-aged-brass hover:bg-aged-brass/90 text-aged-paper px-6 font-semibold disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Image"
          )}
        </Button>

        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleShare} type="button" disabled={isGenerating || isSaving}>
            <Share2 className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleDownload} type="button" disabled={isGenerating || isSaving}>
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Image Display */}
      <div className="flex-1 flex items-center justify-center p-4 pb-20 overflow-hidden">
        <img
          src={imageUrl}
          alt="Generated"
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Bottom Controls */}
      <div className="border-t border-studio-border bg-studio-charcoal pb-safe">
        {/* Thumbnail */}
        <div className="px-4 py-3">
          <div className="relative inline-block">
            <img
              src={imageUrl}
              alt="Thumbnail"
              className="w-24 h-24 object-cover rounded-lg border-2 border-aged-brass"
            />
          </div>
        </div>

        {/* Quick Options */}
        <div className="px-4 pb-3 space-y-2">
          <div className="flex gap-2 text-xs">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 bg-aged-brass/10 text-aged-brass border-aged-brass/30 font-medium"
            >
              <span className="w-5 h-5 flex items-center justify-center text-lg">G</span>
              <span>Imagen Nano Banana</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5 bg-aged-brass/10 text-aged-brass border-aged-brass/30 font-medium"
            >
              <span className="w-5 h-5 flex items-center justify-center">⌗</span>
              <span>{aspectRatio}</span>
            </Button>
          </div>
        </div>

        {/* Regenerate Section */}
        <div className="px-4 pb-4 space-y-3">
          <Label className="text-xs text-studio-text-secondary">
            Edit prompt to generate new variation
          </Label>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder="Modify and regenerate..."
            rows={2}
            className="w-full bg-studio-card border-studio-border text-studio-text-primary text-sm"
            disabled={isGenerating}
          />
          
          <div className="flex gap-2">
            <Button
              onClick={() => onRegenerate(prompt)}
              disabled={isGenerating}
              type="button"
              className="flex-1 bg-aged-brass hover:bg-aged-brass/90 text-aged-paper font-semibold"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
