import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowLeft, ArrowRight, Lightbulb, Bookmark, SkipForward } from "lucide-react";
import { useCollections } from "@/hooks/useCollections";
import { getCollectionIcon } from "@/utils/collectionIcons";

interface PromptWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (promptData: WizardData) => void;
}

export interface WizardData {
  purpose: string;
  contentType: string;
  collection: string;
  tone: string;
  keyElements: string;
  constraints: string;
}

const CONTENT_TYPES = [
  { value: "blog", label: "📝 Blog Post", icon: "📝" },
  { value: "email", label: "📧 Email", icon: "📧" },
  { value: "social", label: "📱 Social Media", icon: "📱" },
  { value: "product", label: "🏷️ Product Description", icon: "🏷️" },
  { value: "visual", label: "🎨 Visual Asset", icon: "🎨" },
];

const TONES = [
  { value: "sophisticated", label: "Sophisticated & Elegant" },
  { value: "warm", label: "Warm & Personal" },
  { value: "professional", label: "Professional & Authoritative" },
  { value: "playful", label: "Playful & Creative" },
  { value: "intimate", label: "Intimate & Authentic" },
  { value: "educational", label: "Educational & Informative" },
];

export function PromptWizard({ open, onOpenChange, onComplete }: PromptWizardProps) {
  const { collections, loading: collectionsLoading } = useCollections();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    purpose: "",
    contentType: "",
    collection: "",
    tone: "",
    keyElements: "",
    constraints: "",
  });

  const totalSteps = 6;
  const progress = (step / totalSteps) * 100;

  // Get smart tone default based on content type
  const getToneDefault = (contentType: string) => {
    const toneMap: Record<string, string> = {
      blog: "educational",
      email: "warm",
      social: "playful",
      product: "sophisticated",
      visual: "sophisticated",
    };
    return toneMap[contentType] || "";
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.purpose.trim().length > 0;
      case 2:
        return data.contentType.length > 0;
      case 3:
        return true; // Collection is optional (can skip)
      case 4:
        return data.tone.length > 0;
      case 5:
        return data.keyElements.trim().length > 0;
      case 6:
        return true; // Constraints are optional
      default:
        return false;
    }
  };

  const handleSkipCollection = () => {
    // Auto-assign default collection
    const defaultCollection = collections?.[0]?.name || "cadence";
    setData({ ...data, collection: defaultCollection });
    setStep(4); // Skip to tone step
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete(data);
      onOpenChange(false);
      // Reset wizard
      setStep(1);
      setData({
        purpose: "",
        contentType: "",
        collection: "",
        tone: "",
        keyElements: "",
        constraints: "",
      });
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-gradient-to-br from-[hsl(var(--saffron-gold))] to-[hsl(var(--brass-accent))]">
              <Sparkles className="w-5 h-5 text-[hsl(var(--soft-ivory))]" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-serif">Prompt Builder Wizard</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Step {step} of {totalSteps}
              </p>
            </div>
          </div>
          <Progress value={progress} className="h-2 mt-4" />
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Step 1: Purpose */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-serif">What's the purpose of this prompt?</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Be specific! The more detail you provide, the better your prompt will be.
                </p>
              </div>
              <Textarea
                value={data.purpose}
                onChange={(e) => setData({ ...data, purpose: e.target.value })}
                placeholder="Example: I want to create product launch announcements for new fragrances that highlight craftsmanship and sustainability..."
                className="min-h-[150px] font-serif"
              />
              <div className="flex items-start gap-2 p-3 bg-[hsl(var(--stone-beige)/0.3)] rounded-lg">
                <Lightbulb className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  💡 Tip: Use placeholders like <code className="px-1 py-0.5 bg-background rounded text-xs">&#123;&#123;PRODUCT_NAME&#125;&#125;</code> to make your prompt reusable.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Content Type */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-serif">What type of content will this generate?</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CONTENT_TYPES.map((type) => (
                  <Card
                    key={type.value}
                    className={`p-4 cursor-pointer transition-all ${
                      data.contentType === type.value
                        ? "border-[hsl(var(--saffron-gold))] bg-[hsl(var(--saffron-gold)/0.1)]"
                        : "hover:border-[hsl(var(--stone-beige))]"
                    }`}
                    onClick={() => {
                      setData({ ...data, contentType: type.value, tone: getToneDefault(type.value) });
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <span className="font-medium">{type.label.replace(/^.+ /, "")}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Collection (Optional) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-serif">Which collection should this belong to?</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize your prompts by brand collection. You can change this later.
                </p>
              </div>
              {collectionsLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading collections...</div>
              ) : collections && collections.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {collections.map((collection) => {
                    const Icon = getCollectionIcon(collection.name);
                    return (
                      <Card
                        key={collection.id}
                        className={`p-4 cursor-pointer transition-all ${
                          data.collection === collection.name
                            ? "border-[hsl(var(--saffron-gold))] bg-[hsl(var(--saffron-gold)/0.1)]"
                            : "hover:border-[hsl(var(--stone-beige))]"
                        }`}
                        onClick={() => setData({ ...data, collection: collection.name })}
                      >
                        <div className="flex items-start gap-3">
                          {Icon && <Icon className="w-5 h-5 mt-0.5 text-[hsl(var(--saffron-gold))]" />}
                          <div className="flex-1">
                            <div className="font-medium capitalize">{collection.name.replace("_", " ")}</div>
                            {collection.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {collection.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No collections found. Create one in Settings first.</p>
                </div>
              )}
              <div className="flex items-start gap-2 p-3 bg-[hsl(var(--stone-beige)/0.3)] rounded-lg">
                <Lightbulb className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  💡 Not sure? Skip for now and organize later from your library.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleSkipCollection}
                className="w-full gap-2"
              >
                <SkipForward className="w-4 h-4" />
                Skip for now
              </Button>
            </div>
          )}

          {/* Step 4: Tone */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-serif">What tone should the content have?</Label>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TONES.map((tone) => (
                  <Card
                    key={tone.value}
                    className={`p-4 cursor-pointer transition-all ${
                      data.tone === tone.value
                        ? "border-[hsl(var(--saffron-gold))] bg-[hsl(var(--saffron-gold)/0.1)]"
                        : "hover:border-[hsl(var(--stone-beige))]"
                    }`}
                    onClick={() => setData({ ...data, tone: tone.value })}
                  >
                    <span className="font-medium">{tone.label}</span>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Key Elements */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-serif">What key elements should always be included?</Label>
              </div>
              <Textarea
                value={data.keyElements}
                onChange={(e) => setData({ ...data, keyElements: e.target.value })}
                placeholder="Example: Product name, key ingredients, sustainability message, call-to-action, brand story..."
                className="min-h-[150px] font-serif"
              />
              <div className="flex items-start gap-2 p-3 bg-[hsl(var(--stone-beige)/0.3)] rounded-lg">
                <Lightbulb className="w-5 h-5 text-[hsl(var(--saffron-gold))] flex-shrink-0 mt-0.5" />
                <p className="text-sm">
                  💡 Tip: Think about what makes your content unique and what you never want to forget.
                </p>
              </div>
            </div>
          )}

          {/* Step 6: Constraints */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-serif">Any constraints or guidelines?</Label>
                <p className="text-sm text-muted-foreground mt-1">Optional but helpful</p>
              </div>
              <Textarea
                value={data.constraints}
                onChange={(e) => setData({ ...data, constraints: e.target.value })}
                placeholder="Example: Keep under 200 words, avoid clichés, include emojis for social media, always mention sustainability..."
                className="min-h-[150px] font-serif"
              />
              <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <Bookmark className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  🎉 Almost done! We'll save this as a reusable template. You can customize it for each piece of content.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {step === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="gap-2"
          >
            {step === totalSteps ? (
              <>
                <Bookmark className="w-4 h-4" />
                Save & Use Template
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
