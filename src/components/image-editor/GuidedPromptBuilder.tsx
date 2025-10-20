import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Sparkles } from 'lucide-react';
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
      camera: CAMERA_LENS.PROFESSIONAL.DSLR_SHALLOW,
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
      camera: CAMERA_LENS.PROFESSIONAL.DSLR_SHARP,
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
      camera: CAMERA_LENS.PROFESSIONAL.DSLR_SHALLOW,
      mood: 'dramatic, high-fashion, editorial',
      colorScheme: 'rich jewel tones with gold accents'
    }
  }
];

export function GuidedPromptBuilder({ onPromptGenerated, brandContext }: GuidedPromptBuilderProps) {
  const [components, setComponents] = useState<PromptComponents>({});
  const [customDetails, setCustomDetails] = useState('');

  const handlePresetClick = (preset: typeof QUICK_PRESETS[0]) => {
    setComponents(preset.components);
    const prompt = buildPromptFromComponents(preset.components, brandContext);
    onPromptGenerated(prompt);
  };

  const handleBuildPrompt = () => {
    const finalComponents = {
      ...components,
      additionalDetails: customDetails || undefined
    };
    const prompt = buildPromptFromComponents(finalComponents, brandContext);
    onPromptGenerated(prompt);
  };

  const handleComponentChange = (key: keyof PromptComponents, value: string) => {
    const updated = { ...components, [key]: value };
    setComponents(updated);
  };

  return (
    <div className="space-y-4">
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
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.DSLR_SHALLOW}>DSLR Shallow Focus</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.DSLR_SHARP}>DSLR Sharp Focus</SelectItem>
              <SelectItem value={CAMERA_LENS.PROFESSIONAL.MACRO}>Macro Lens</SelectItem>
              <SelectItem value={CAMERA_LENS.FILM["35MM_FILM"]}>35mm Film</SelectItem>
              <SelectItem value={CAMERA_LENS.FILM.POLAROID}>Polaroid</SelectItem>
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
