import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Sparkles } from "lucide-react";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isHero?: boolean;
  approvalStatus: "pending" | "flagged" | "rejected";
  parentImageId?: string;
  chainDepth: number;
  isChainOrigin: boolean;
  refinementInstruction?: string;
}

interface RefinementPanelProps {
  baseImage: GeneratedImage;
  onRefine: (instruction: string) => void;
  onCancel: () => void;
}

export function RefinementPanel({
  baseImage,
  onRefine,
  onCancel,
}: RefinementPanelProps) {
  const [instruction, setInstruction] = useState("");

  const quickRefinements = [
    { label: "Darker", value: "make it darker and more dramatic" },
    { label: "Lighter", value: "make it lighter and airier" },
    { label: "Add fog", value: "add atmospheric fog in background" },
    { label: "Golden hour", value: "change lighting to warm golden hour" },
    { label: "Close up", value: "zoom in closer on the product" },
    { label: "More blur", value: "increase background blur and bokeh" },
  ];

  return (
    <Card
      className="p-6 border border-aged-brass/30 bg-parchment-white dark:bg-charcoal shadow-level-2"
      data-refinement-panel
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 border border-aged-brass/20 shadow-sm">
          <img
            src={baseImage.imageUrl}
            alt="Base"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-serif font-medium text-ink-black dark:text-parchment-white mb-1">Refining from:</p>
          <p className="text-xs text-charcoal dark:text-stone line-clamp-2 leading-relaxed">
            {baseImage.prompt}
          </p>
          {baseImage.chainDepth > 0 && (
            <Badge variant="secondary" className="mt-2 bg-aged-brass/10 text-aged-brass border-aged-brass/20">
              Chain depth: {baseImage.chainDepth + 1}
            </Badge>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="text-charcoal hover:text-ink-black dark:text-stone dark:hover:text-parchment-white hover:bg-aged-brass/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-sm font-serif font-medium text-ink-black dark:text-parchment-white mb-2 block">Quick Refinements</Label>
          <div className="flex flex-wrap gap-2">
            {quickRefinements.map((ref) => (
              <Button
                key={ref.label}
                variant="outline"
                size="sm"
                onClick={() => setInstruction(ref.value)}
                className="h-8 text-xs bg-vellum-cream dark:bg-charcoal border-stone dark:border-aged-brass/30 text-ink-black dark:text-parchment-white hover:bg-aged-brass/10 hover:border-aged-brass dark:hover:bg-aged-brass/20 transition-colors"
              >
                {ref.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-serif font-medium text-ink-black dark:text-parchment-white mb-2 block">Custom Refinement</Label>
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe what you want to change... (e.g., 'add sunset lighting', 'make background darker', 'zoom in on bottle')"
            rows={3}
            className="mt-2 bg-vellum-cream dark:bg-ink-black border-stone dark:border-aged-brass/30 text-ink-black dark:text-parchment-white placeholder:text-charcoal/60 dark:placeholder:text-stone/60 focus-visible:ring-aged-brass/50 focus-visible:border-aged-brass"
          />
        </div>

        <Button
          onClick={() => onRefine(instruction)}
          className="w-full bg-aged-brass hover:bg-aged-brass/90 text-parchment-white font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!instruction.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Refinement
        </Button>
      </div>
    </Card>
  );
}
