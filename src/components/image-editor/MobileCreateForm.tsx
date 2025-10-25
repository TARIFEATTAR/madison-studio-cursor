import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Upload, X, Loader2 } from "lucide-react";
import MobileAspectRatioSelector from "./MobileAspectRatioSelector";
import MobileShotTypeSelector from "./MobileShotTypeSelector";
import { cn } from "@/lib/utils";

interface MobileCreateFormProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
  onShotTypeSelect: (shotType: { label: string; prompt: string }) => void;
  referenceImage: { file: File; url: string } | null;
  onReferenceUpload: (file: File, url: string) => void;
  onReferenceRemove: () => void;
  onGenerate: () => void;
  isGenerating: boolean;
  marketplace?: string;
  imagesCount: number;
  maxImages: number;
}

export default function MobileCreateForm({
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  onShotTypeSelect,
  referenceImage,
  onReferenceUpload,
  onReferenceRemove,
  onGenerate,
  isGenerating,
  marketplace,
  imagesCount,
  maxImages,
}: MobileCreateFormProps) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        onReferenceUpload(file, url);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex-1 flex flex-col px-4 py-4 space-y-3 overflow-y-auto">
      {/* Main Prompt Card */}
      <Card className="bg-studio-card border-studio-border p-4 space-y-3">
        <Textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe your image..."
          rows={3}
          className="w-full bg-studio-charcoal border-studio-border text-studio-text-primary placeholder:text-studio-text-muted resize-none text-sm"
          disabled={isGenerating}
        />

        {/* Reference Image Upload - Compact */}
        {referenceImage ? (
          <div className="relative rounded-lg overflow-hidden border border-studio-border">
            <img
              src={referenceImage.url}
              alt="Reference"
              className="w-full h-32 object-cover"
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={onReferenceRemove}
              className="absolute top-2 right-2 h-7 w-7 bg-black/60 hover:bg-black/80 text-white"
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
              <p className="text-white text-xs font-medium">Reference Image</p>
            </div>
          </div>
        ) : (
          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isGenerating}
            />
            <div className={cn(
              "border-2 border-dashed rounded-lg p-4 cursor-pointer transition-all",
              "border-studio-border bg-studio-charcoal/50 hover:border-aged-brass/50 hover:bg-studio-charcoal"
            )}>
              <div className="flex items-center justify-center gap-2">
                <Upload className="w-4 h-4 text-studio-text-muted" />
                <span className="text-sm text-studio-text-muted">Add reference image</span>
              </div>
            </div>
          </label>
        )}
      </Card>

      {/* Shot Type Card */}
      <Card className="bg-studio-card border-studio-border p-4 space-y-2">
        <h3 className="text-xs font-medium text-studio-text-secondary uppercase tracking-wide">Shot Type</h3>
        <MobileShotTypeSelector onSelect={onShotTypeSelect} />
      </Card>

      {/* Aspect Ratio Card */}
      <Card className="bg-studio-card border-studio-border p-4 space-y-2">
        <h3 className="text-xs font-medium text-studio-text-secondary uppercase tracking-wide">Image Size</h3>
        <MobileAspectRatioSelector
          value={aspectRatio}
          onChange={onAspectRatioChange}
          marketplace={marketplace}
        />
      </Card>

      {/* Generate Button - Sticky at bottom */}
      <div className="sticky bottom-0 pt-2 pb-safe">
        <Button
          onClick={onGenerate}
          disabled={!prompt.trim() || isGenerating || imagesCount >= maxImages}
          size="lg"
          className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Image
            </>
          )}
        </Button>
        
        {imagesCount > 0 && (
          <p className="text-center text-xs text-studio-text-muted mt-2">
            {imagesCount} of {maxImages} images created
          </p>
        )}
      </div>
    </div>
  );
}
