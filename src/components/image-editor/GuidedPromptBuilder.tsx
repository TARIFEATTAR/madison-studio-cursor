import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, Camera, Palette, Info, Wand2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { 
  SHOT_TYPES, 
  CAMERA_LENS, 
  LIGHTING, 
  ENVIRONMENTS, 
  buildPromptFromComponents,
  buildProductPlacementPrompt,
  type PromptComponents,
  type BrandContext
} from "@/utils/promptFormula";

interface GuidedPromptBuilderProps {
  onPromptGenerated: (prompt: string) => void;
  brandContext?: BrandContext;
  hasReferenceImage?: boolean;
}

const PROMPT_FORMULA_GUIDE = {
  title: "Simple Prompt Formula",
  structure: [
    { label: "Photo type", example: "e-commerce pack shot" },
    { label: "Subject + Action", example: "luxury perfume bottle on sandstone block, static" },
    { label: "Environment", example: "natural sandstone surface with soft shadows" },
    { label: "Color Scheme", example: "warm amber and sand tones with golden accents" },
    { label: "Camera/Lens/Film", example: "Canon R5 50mm f/1.8 sharp focus" },
    { label: "Lighting", example: "soft natural window light from left" },
    { label: "Composition", example: "centered with negative space" },
    { label: "Additional Details", example: "subtle texture details, minimalist aesthetic" }
  ],
  fullExample: "e-commerce pack shot, luxury perfume bottle on sandstone block, static, natural sandstone surface with soft shadows, warm amber and sand tones with golden accents, Canon R5 50mm f/1.8 sharp focus, soft natural window light from left, centered with negative space, subtle texture details, minimalist aesthetic"
};

const QUICK_PRESETS = [
  { id: 'hero', label: 'Hero Shot', icon: Camera, components: { shotType: SHOT_TYPES.PRODUCT.HERO, environment: ENVIRONMENTS.SURFACES.MARBLE, lighting: LIGHTING.STUDIO.THREE_POINT } },
  { id: 'lifestyle', label: 'Lifestyle', icon: Palette, components: { shotType: SHOT_TYPES.PRODUCT.LIFESTYLE, environment: ENVIRONMENTS.SETTINGS.VANITY, lighting: LIGHTING.NATURAL.WINDOW } }
];

export function GuidedPromptBuilder({ onPromptGenerated, brandContext, hasReferenceImage = false }: GuidedPromptBuilderProps) {
  const [components, setComponents] = useState<PromptComponents>({});
  const [customDetails, setCustomDetails] = useState("");
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);
  const [builtPrompt, setBuiltPrompt] = useState<string>("");

  const handlePresetClick = (preset: typeof QUICK_PRESETS[0]) => {
    setComponents(preset.components);
    handleBuildPrompt();
  };

  const handleBuildPrompt = () => {
    const finalComponents = { ...components, additionalDetails: customDetails || undefined };
    let prompt: string;
    if (hasReferenceImage && (components.environment || customDetails)) {
      const sceneDescription = [components.environment, components.lighting, customDetails].filter(Boolean).join(', ');
      prompt = buildProductPlacementPrompt(sceneDescription, brandContext);
    } else {
      prompt = buildPromptFromComponents(finalComponents, brandContext);
    }
    setBuiltPrompt(prompt);
    toast.success("Prompt built!");
  };

  const handleUsePrompt = () => {
    if (!builtPrompt) { toast.error("Build a prompt first"); return; }
    onPromptGenerated(builtPrompt);
    toast.success("Prompt sent to Create & Refine");
  };

  const handleComponentChange = (key: keyof PromptComponents, value: string) => {
    setComponents({ ...components, [key]: value });
  };

  return (
    <div className="space-y-4">
      {hasReferenceImage && (
        <Card className="bg-brass/10 border-brass/30 p-3">
          <p className="text-xs text-[#FFFCF5] flex items-center gap-2">
            <Info className="w-3 h-3 text-brass flex-shrink-0" />
            <span><strong>Product Placement Mode:</strong> Describe the SCENE for your reference product.</span>
          </p>
        </Card>
      )}

      <Card className="bg-[#2F2A26] border-[#3D3935] p-4">
        <h3 className="font-serif text-sm text-[#FFFCF5] mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brass" />Quick Presets
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_PRESETS.map((preset) => {
            const IconComponent = preset.icon;
            return (
              <Button key={preset.id} variant="outline" size="sm" onClick={() => handlePresetClick(preset)}
                className="bg-[#252220] border-[#3D3935] hover:bg-[#3D3935] text-[#FFFCF5] h-auto py-2 px-3 flex flex-col items-start gap-1">
                <div className="flex items-center gap-1.5 w-full">
                  <IconComponent className="w-3 h-3 text-brass flex-shrink-0" />
                  <span className="text-xs font-medium text-left">{preset.label}</span>
                </div>
              </Button>
            );
          })}
        </div>
      </Card>

      <Card className="bg-[#2F2A26] border-[#3D3935] p-4">
        <h3 className="font-serif text-sm text-[#FFFCF5] mb-3 flex items-center gap-2">
          <Camera className="w-4 h-4 text-brass" />Build Custom Prompt
        </h3>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs text-[#D4CFC8]">Subject + Action</Label>
            <Input value={components.subject || ""} onChange={(e) => handleComponentChange('subject', e.target.value)}
              placeholder="E.g., luxury perfume bottle standing upright"
              className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[#D4CFC8]">Environment</Label>
            <Select value={components.environment || ""} onValueChange={(value) => handleComponentChange('environment', value)}>
              <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] text-xs"><SelectValue placeholder="Choose setting..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ENVIRONMENTS.SURFACES.MARBLE}>White Marble</SelectItem>
                <SelectItem value={ENVIRONMENTS.SURFACES.WOOD}>Warm Wood</SelectItem>
                <SelectItem value={ENVIRONMENTS.SETTINGS.DESERT}>Desert Landscape</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[#D4CFC8]">Lighting</Label>
            <Select value={components.lighting || ""} onValueChange={(value) => handleComponentChange('lighting', value)}>
              <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] text-xs"><SelectValue placeholder="Choose lighting..." /></SelectTrigger>
              <SelectContent>
                <SelectItem value={LIGHTING.NATURAL.GOLDEN_HOUR}>Golden Hour</SelectItem>
                <SelectItem value={LIGHTING.NATURAL.WINDOW}>Soft Window Light</SelectItem>
                <SelectItem value={LIGHTING.STUDIO.THREE_POINT}>Studio Three-Point</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[#D4CFC8]">Additional Details</Label>
            <Input value={customDetails} onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="E.g., brass props, soft shadows, warm tones..."
              className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] text-xs" />
          </div>
          <Button onClick={handleBuildPrompt} className="w-full bg-brass hover:bg-brass/90 text-[#1A1816] text-xs font-medium">
            <Lightbulb className="w-3 h-3 mr-1.5" />Build Prompt
          </Button>
        </div>
      </Card>

      {builtPrompt && (
        <Card className="bg-[#252220] border-brass/30 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-serif text-xs text-[#FFFCF5] flex items-center gap-1.5">
                <Wand2 className="w-3 h-3 text-brass" />Built Prompt
              </h4>
              <Button size="sm" onClick={handleUsePrompt} className="bg-brass hover:bg-brass/90 text-[#1A1816] h-7 text-xs px-2">
                Use This Prompt
              </Button>
            </div>
            <Textarea value={builtPrompt} readOnly className="bg-[#2F2A26] border-[#3D3935] text-[#D4CFC8] text-xs leading-relaxed resize-none" rows={4} />
          </div>
        </Card>
      )}
    </div>
  );
}
