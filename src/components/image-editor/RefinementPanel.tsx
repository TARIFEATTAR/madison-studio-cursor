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
      className="p-4 border-2 border-amber-500 bg-amber-50/50 dark:bg-amber-950/20"
      data-refinement-panel
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 border-2 border-amber-500">
          <img
            src={baseImage.imageUrl}
            alt="Base"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Refining from:</p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {baseImage.prompt}
          </p>
          {baseImage.chainDepth > 0 && (
            <Badge variant="secondary" className="mt-1">
              Chain depth: {baseImage.chainDepth + 1}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-sm font-medium">Quick Refinements</Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {quickRefinements.map((ref) => (
              <Button
                key={ref.label}
                variant="outline"
                size="sm"
                onClick={() => setInstruction(ref.value)}
                className="h-8 text-xs"
              >
                {ref.label}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium">Custom Refinement</Label>
          <Textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="Describe what you want to change... (e.g., 'add sunset lighting', 'make background darker', 'zoom in on bottle')"
            rows={3}
            className="mt-2"
          />
        </div>

        <Button
          onClick={() => onRefine(instruction)}
          className="w-full"
          disabled={!instruction.trim()}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate Refinement
        </Button>
      </div>
    </Card>
  );
}
