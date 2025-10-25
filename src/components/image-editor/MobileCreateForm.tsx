import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Camera, Image, Sparkles, Upload, X, Wand2, Type, Palette } from "lucide-react";
import MobileAspectRatioSelector from "./MobileAspectRatioSelector";

const CREATION_OPTIONS = [
  {
    id: "product-white",
    label: "Product on White",
    icon: Camera,
    prompt: "A clean studio product shot on a pure white background, soft shadow, high-resolution lighting.",
    gradient: "from-slate-500 to-slate-700"
  },
  {
    id: "lifestyle",
    label: "Lifestyle Scene",
    icon: Image,
    prompt: "A lifestyle product photo placed in a cozy real-world environment that matches the brand mood.",
    gradient: "from-amber-500 to-orange-600"
  },
  {
    id: "flat-lay",
    label: "Flat Lay",
    icon: Palette,
    prompt: "Flat lay product photography from directly above on a clean surface with organized styling.",
    gradient: "from-pink-500 to-rose-600"
  },
  {
    id: "influencer",
    label: "Influencer Shot",
    icon: Sparkles,
    prompt: "Authentic influencer-style product photo with natural lighting and casual, relatable composition.",
    gradient: "from-purple-500 to-indigo-600"
  },
  {
    id: "custom",
    label: "Custom Prompt",
    icon: Type,
    prompt: "",
    gradient: "from-teal-500 to-cyan-600"
  },
  {
    id: "magic",
    label: "AI Enhanced",
    icon: Wand2,
    prompt: "Professionally styled product image with cinematic lighting and premium aesthetic.",
    gradient: "from-yellow-500 to-amber-600"
  }
];

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
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [modalPrompt, setModalPrompt] = useState("");

  const handleCardClick = (option: typeof CREATION_OPTIONS[0]) => {
    setSelectedOption(option.id);
    setModalPrompt(option.prompt);
    onPromptChange(option.prompt);
    onShotTypeSelect({ label: option.label, prompt: option.prompt });
  };

  const handleModalClose = () => {
    setSelectedOption(null);
  };

  const handleGenerateFromModal = () => {
    onPromptChange(modalPrompt);
    onGenerate();
    handleModalClose();
  };

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

  const selectedOptionData = CREATION_OPTIONS.find(opt => opt.id === selectedOption);

  return (
    <>
      {/* Card Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="grid grid-cols-2 gap-3">
          {CREATION_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.id}
                onClick={() => handleCardClick(option)}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-200 border-2",
                  "bg-studio-card border-studio-border hover:border-aged-brass/50",
                  "active:scale-95 h-36"
                )}
              >
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-br opacity-10",
                  option.gradient
                )} />
                
                <div className="relative h-full p-4 flex flex-col items-center justify-center text-center gap-2">
                  <div className={cn(
                    "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center",
                    option.gradient
                  )}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-studio-text-primary">
                    {option.label}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {imagesCount > 0 && (
          <p className="text-center text-xs text-studio-text-muted mt-4">
            {imagesCount} of {maxImages} images created
          </p>
        )}
      </div>

      {/* Full Screen Creation Modal */}
      <Dialog open={!!selectedOption} onOpenChange={() => handleModalClose()}>
        <DialogContent className="fixed inset-0 z-50 bg-studio-charcoal border-none rounded-none p-0 max-w-none h-screen flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-studio-border bg-studio-card/50">
            <div className="flex items-center gap-2">
              {selectedOptionData && (
                <>
                  <div className={cn(
                    "w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center",
                    selectedOptionData.gradient
                  )}>
                    <selectedOptionData.icon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-base font-semibold text-aged-brass">
                    {selectedOptionData.label}
                  </h2>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleModalClose}
              className="text-studio-text-secondary"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-studio-text-secondary uppercase tracking-wide">
                Describe Your Image
              </label>
              <Textarea
                value={modalPrompt}
                onChange={(e) => setModalPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                rows={4}
                className="w-full bg-studio-card border-studio-border text-studio-text-primary placeholder:text-studio-text-muted resize-none"
                disabled={isGenerating}
              />
            </div>

            {/* Reference Image Upload */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-studio-text-secondary uppercase tracking-wide">
                Reference Image (Optional)
              </label>
              {referenceImage ? (
                <div className="relative rounded-lg overflow-hidden border border-studio-border">
                  <img
                    src={referenceImage.url}
                    alt="Reference"
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={onReferenceRemove}
                    className="absolute top-2 right-2 h-8 w-8 bg-black/60 hover:bg-black/80 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
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
                    "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all",
                    "border-studio-border bg-studio-card hover:border-aged-brass/50"
                  )}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Upload className="w-8 h-8 text-studio-text-muted" />
                      <span className="text-sm text-studio-text-muted">Tap to upload</span>
                    </div>
                  </div>
                </label>
              )}
            </div>

            {/* Aspect Ratio */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-studio-text-secondary uppercase tracking-wide">
                Image Size
              </label>
              <MobileAspectRatioSelector
                value={aspectRatio}
                onChange={onAspectRatioChange}
                marketplace={marketplace}
              />
            </div>
          </div>

          {/* Modal Footer - Generate Button */}
          <div className="border-t border-studio-border bg-studio-card/50 p-4">
            <Button
              onClick={handleGenerateFromModal}
              disabled={!modalPrompt.trim() || isGenerating || imagesCount >= maxImages}
              size="lg"
              className="w-full h-12 bg-aged-brass hover:bg-aged-brass/90 text-aged-paper font-semibold"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
