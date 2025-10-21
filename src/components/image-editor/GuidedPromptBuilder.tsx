import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { 
  SHOT_TYPES, 
  LIGHTING, 
  ENVIRONMENTS, 
  CAMERA_LENS,
  buildPromptFromComponents,
  type PromptComponents 
} from '@/utils/promptFormula';

interface GuidedPromptBuilderProps {
  onPromptGenerated: (prompt: string) => void;
  brandContext?: any;
}

// Prompt Formula Guide Content
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

// Quick preset scenarios for common product photography needs
const QUICK_PRESETS = [
  {
    id: 'luxury-marble',
    label: 'Luxury Marble',
    icon: '💎',
    components: {
      shotType: SHOT_TYPES.PRODUCT.HERO,
      environment: ENVIRONMENTS.SURFACES.MARBLE,
      lighting: LIGHTING.STUDIO.SOFT_BOX,
      camera: CAMERA_LENS.PROFESSIONAL.DSLR_SHALLOW,
      mood: 'elegant, high-end luxury aesthetic',
      colorScheme: 'warm neutral tones'
    }
  },
  {
    id: 'desert-sandstone',
    label: 'Desert Sandstone',
    icon: '🏜️',
    components: {
      shotType: SHOT_TYPES.PRODUCT.HERO,
      environment: ENVIRONMENTS.SETTINGS.DESERT,
      lighting: LIGHTING.NATURAL.GOLDEN_HOUR,
      camera: CAMERA_LENS.PROFESSIONAL.NIKON_SHALLOW,
      mood: 'warm, organic, artisanal feel',
      colorScheme: 'warm desert tones, amber and sand'
    }
  },
  {
    id: 'botanical-garden',
    label: 'Botanical Garden',
    icon: '🌿',
    components: {
      shotType: SHOT_TYPES.PRODUCT.LIFESTYLE,
      environment: ENVIRONMENTS.SETTINGS.BOTANICAL,
      lighting: LIGHTING.NATURAL.OVERCAST,
      camera: CAMERA_LENS.PROFESSIONAL.SONY_SHARP,
      mood: 'fresh, natural, organic aesthetic',
      colorScheme: 'natural greens and earth tones'
    }
  },
  {
    id: 'minimalist-studio',
    label: 'Clean Minimalist',
    icon: '⚪',
    components: {
      shotType: SHOT_TYPES.PRODUCT.HERO,
      environment: ENVIRONMENTS.SETTINGS.MINIMALIST,
      lighting: LIGHTING.STUDIO.MINIMALIST,
      camera: CAMERA_LENS.PROFESSIONAL.DSLR_SHARP,
      mood: 'clean, modern, professional',
      colorScheme: 'monochromatic whites and grays'
    }
  },
  {
    id: 'rustic-wood',
    label: 'Rustic Wood',
    icon: '🪵',
    components: {
      shotType: SHOT_TYPES.PRODUCT["3_4_ANGLE"],
      environment: ENVIRONMENTS.SURFACES.WOOD,
      lighting: LIGHTING.NATURAL.SIDE_LIT,
      camera: CAMERA_LENS.FILM["35MM_FILM"],
      mood: 'warm, handcrafted, artisanal',
      colorScheme: 'warm wood tones, natural browns'
    }
  },
  {
    id: 'editorial-luxury',
    label: 'Editorial Luxury',
    icon: '✨',
    components: {
      shotType: SHOT_TYPES.PRODUCT.HERO,
      environment: ENVIRONMENTS.SETTINGS.LUXURY,
      lighting: LIGHTING.STUDIO.DRAMATIC,
      camera: CAMERA_LENS.SPECIALTY.HASSELBLAD_DIGITAL,
      mood: 'dramatic, high-fashion, editorial',
      colorScheme: 'rich jewel tones with gold accents'
    }
  }
];

export function GuidedPromptBuilder({ onPromptGenerated, brandContext }: GuidedPromptBuilderProps) {
  const [components, setComponents] = useState<PromptComponents>({});
  const [customDetails, setCustomDetails] = useState('');
  const [showFormulaGuide, setShowFormulaGuide] = useState(false);

  const handlePresetClick = (preset: typeof QUICK_PRESETS[0]) => {
    setComponents(preset.components);
    const prompt = buildPromptFromComponents(preset.components, brandContext);
    onPromptGenerated(prompt);
    
    toast.success(`${preset.label} preset applied - Prompt generated!`);
  };

  const handleBuildPrompt = () => {
    // Check if at least one component is selected
    const hasComponents = Object.values(components).some(value => value !== undefined && value !== '');
    
    if (!hasComponents && !customDetails) {
      toast.error("Please select at least one component (Shot Type, Environment, etc.) or add custom details");
      return;
    }
    
    const finalComponents = {
      ...components,
      additionalDetails: customDetails || undefined
    };
    const prompt = buildPromptFromComponents(finalComponents, brandContext);
    onPromptGenerated(prompt);
    
    toast.success("Prompt generated from formula!");
  };

  const handleComponentChange = (key: keyof PromptComponents, value: string) => {
    const updated = { ...components, [key]: value };
    setComponents(updated);
  };

  return (
    <div className="space-y-4">
      {/* Prompt Formula Guide Button - Above Presets */}
      <Button
        onClick={() => setShowFormulaGuide(!showFormulaGuide)}
        variant="outline"
        size="sm"
        className="w-full bg-brass/10 border-brass/40 hover:bg-brass/20 text-[#FFFCF5] font-semibold"
      >
        <Wand2 className="w-4 h-4 mr-2" />
        {showFormulaGuide ? 'Hide' : 'Show'} Simple Prompt Formula Guide
      </Button>

      {/* Collapsible Formula Guide */}
      {showFormulaGuide && (
        <Card className="bg-[#1F1A17] border-brass/40 p-4 space-y-3">
          <h4 className="font-serif text-sm text-brass font-bold">{PROMPT_FORMULA_GUIDE.title}</h4>
          
          <div className="space-y-1.5">
            {PROMPT_FORMULA_GUIDE.structure.map((item, idx) => (
              <div key={idx} className="text-[10px] leading-relaxed">
                <span className="text-brass font-semibold">[{item.label}]</span>
                <span className="text-[#A8A39E]"> - e.g., </span>
                <span className="text-[#D4CFC8] italic">{item.example}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-brass/20">
            <p className="text-[9px] text-[#A8A39E] mb-2 uppercase tracking-wide">Full Example:</p>
            <p className="text-[10px] text-[#FFFCF5] leading-relaxed bg-[#252220] p-2 rounded border border-brass/20">
              {PROMPT_FORMULA_GUIDE.fullExample}
            </p>
          </div>
        </Card>
      )}

      {/* Quick Presets */}
      <div className="space-y-2">
        <Label className="text-xs text-[#D4CFC8] font-semibold tracking-wide">
          QUICK PRESETS
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              onClick={() => handlePresetClick(preset)}
              variant="outline"
              size="sm"
              className="h-auto py-2 px-3 bg-[#252220] border-[#3D3935] hover:bg-[#3D3935] hover:border-brass text-left flex items-start gap-2"
            >
              <span className="text-lg">{preset.icon}</span>
              <span className="text-xs text-[#FFFCF5] flex-1">{preset.label}</span>
            </Button>
          ))}
        </div>
      </div>

      <div className="border-t border-[#3D3935] pt-4">
        <Label className="text-xs text-[#A8A39E] mb-3 block">
          OR BUILD YOUR OWN (Advanced)
        </Label>

        {/* Shot Type */}
        <div className="space-y-1.5 mb-3">
          <Label className="text-xs text-[#D4CFC8]">Shot Type</Label>
          <Select value={components.shotType} onValueChange={(v) => handleComponentChange('shotType', v)}>
            <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-xs">
              <SelectValue placeholder="Select shot type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SHOT_TYPES.PRODUCT.HERO}>Hero Shot</SelectItem>
              <SelectItem value={SHOT_TYPES.PRODUCT.CLOSE_UP}>Close-up</SelectItem>
              <SelectItem value={SHOT_TYPES.PRODUCT.LIFESTYLE}>Lifestyle</SelectItem>
              <SelectItem value={SHOT_TYPES.PRODUCT.FLAT_LAY}>Flat Lay</SelectItem>
              <SelectItem value={SHOT_TYPES.PRODUCT["3_4_ANGLE"]}>3/4 Angle</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Environment */}
        <div className="space-y-1.5 mb-3">
          <Label className="text-xs text-[#D4CFC8]">Environment/Surface</Label>
          <Select value={components.environment} onValueChange={(v) => handleComponentChange('environment', v)}>
            <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-xs">
              <SelectValue placeholder="Select environment..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ENVIRONMENTS.SURFACES.MARBLE}>Marble Surface</SelectItem>
              <SelectItem value={ENVIRONMENTS.SURFACES.WOOD}>Wooden Table</SelectItem>
              <SelectItem value={ENVIRONMENTS.SURFACES.SANDSTONE}>Sandstone Blocks</SelectItem>
              <SelectItem value={ENVIRONMENTS.SURFACES.CONCRETE}>Concrete Platform</SelectItem>
              <SelectItem value={ENVIRONMENTS.SETTINGS.MINIMALIST}>Minimalist White</SelectItem>
              <SelectItem value={ENVIRONMENTS.SETTINGS.LUXURY}>Luxury Editorial</SelectItem>
              <SelectItem value={ENVIRONMENTS.SETTINGS.BOTANICAL}>Botanical Garden</SelectItem>
              <SelectItem value={ENVIRONMENTS.SETTINGS.DESERT}>Desert Landscape</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lighting */}
        <div className="space-y-1.5 mb-3">
          <Label className="text-xs text-[#D4CFC8]">Lighting</Label>
          <Select value={components.lighting} onValueChange={(v) => handleComponentChange('lighting', v)}>
            <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-xs">
              <SelectValue placeholder="Select lighting..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={LIGHTING.NATURAL.GOLDEN_HOUR}>Golden Hour</SelectItem>
              <SelectItem value={LIGHTING.NATURAL.OVERCAST}>Soft Overcast</SelectItem>
              <SelectItem value={LIGHTING.NATURAL.BACKLIT}>Dramatic Backlit</SelectItem>
              <SelectItem value={LIGHTING.STUDIO.SOFT_BOX}>Studio Softbox</SelectItem>
              <SelectItem value={LIGHTING.STUDIO.DRAMATIC}>Dramatic Studio</SelectItem>
              <SelectItem value={LIGHTING.STUDIO.MINIMALIST}>Clean Minimalist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Camera/Lens */}
        <div className="space-y-1.5 mb-3">
          <Label className="text-xs text-[#D4CFC8]">Camera Style</Label>
          <Select value={components.camera} onValueChange={(v) => handleComponentChange('camera', v)}>
            <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-xs">
              <SelectValue placeholder="Select camera..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.DSLR_SHALLOW}>Canon R5 35mm f/1.4 (Shallow)</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.DSLR_SHARP}>Canon R5 50mm f/1.8 (Sharp)</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.NIKON_SHALLOW}>Nikon Z9 50mm f/1.2 (Ultra Shallow)</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.SONY_SHARP}>Sony A7R IV 85mm f/1.4 (Portrait)</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.MACRO}>Canon 100mm Macro f/2.8</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.TELEPHOTO}>Canon 85mm f/1.2 (Portrait)</SelectItem>
              <SelectItem value={CAMERA_LENS.FILM["35MM_FILM"]}>35mm Film (Kodak Portra 400)</SelectItem>
              <SelectItem value={CAMERA_LENS.FILM.CINESTILL}>CineStill 800T Film</SelectItem>
              <SelectItem value={CAMERA_LENS.FILM.FUJIFILM}>Fujifilm X100V (Classic Chrome)</SelectItem>
              <SelectItem value={CAMERA_LENS.FILM.POLAROID}>Polaroid SX-70</SelectItem>
              <SelectItem value={CAMERA_LENS.SPECIALTY.LEICA}>Leica M11 50mm Summilux</SelectItem>
              <SelectItem value={CAMERA_LENS.SPECIALTY.HASSELBLAD_DIGITAL}>Hasselblad X2D 100C</SelectItem>
              <SelectItem value={CAMERA_LENS.SPECIALTY.PHASE_ONE}>Phase One XF IQ4 150MP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Details */}
        <div className="space-y-1.5 mb-3">
          <Label className="text-xs text-[#D4CFC8]">Additional Details (Optional)</Label>
          <Input
            value={customDetails}
            onChange={(e) => setCustomDetails(e.target.value)}
            placeholder="E.g., 'with dried roses scattered nearby, soft smoke wisps'"
            className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] text-xs h-9"
          />
        </div>

        <Button
          onClick={handleBuildPrompt}
          size="sm"
          className="w-full bg-brass/20 hover:bg-brass/30 text-[#FFFCF5] border border-brass/40 h-8 text-xs"
        >
          <Wand2 className="w-3 h-3 mr-2" />
          Build Prompt from Formula
        </Button>
      </div>

      {/* Brand Context Indicator */}
      {brandContext && (brandContext.colors?.length > 0 || brandContext.styleKeywords?.length > 0) && (
        <div className="bg-[#252220]/50 border border-brass/20 rounded p-2 mt-3">
          <p className="text-[10px] text-brass font-semibold mb-1">BRAND CONTEXT ACTIVE</p>
          <div className="flex flex-wrap gap-1">
            {brandContext.colors?.map((color: string) => (
              <Badge key={color} variant="outline" className="text-[9px] border-brass/30 text-[#D4CFC8]">
                {color}
              </Badge>
            ))}
            {brandContext.styleKeywords?.map((keyword: string) => (
              <Badge key={keyword} variant="outline" className="text-[9px] border-brass/30 text-[#D4CFC8]">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
