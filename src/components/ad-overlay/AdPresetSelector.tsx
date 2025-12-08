/**
 * AdPresetSelector Component - Madison Studio
 * 
 * Visual grid of ad layout presets for quick selection.
 * Shows thumbnail preview of each layout style.
 */

import { cn } from "@/lib/utils";
import { AD_LAYOUT_PRESETS, type AdLayoutPreset } from "@/config/adLayoutPresets";
import { Check } from "lucide-react";

interface AdPresetSelectorProps {
  selectedPresetId: string;
  onSelectPreset: (preset: AdLayoutPreset) => void;
  className?: string;
}

export function AdPresetSelector({
  selectedPresetId,
  onSelectPreset,
  className,
}: AdPresetSelectorProps) {
  return (
    <div className={cn("ad-preset-selector", className)}>
      <div className="ad-preset-selector__grid">
        {AD_LAYOUT_PRESETS.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          
          return (
            <button
              key={preset.id}
              type="button"
              className={cn(
                "ad-preset-selector__item",
                isSelected && "ad-preset-selector__item--selected"
              )}
              onClick={() => onSelectPreset(preset)}
              title={preset.description}
            >
              {/* Thumbnail Preview */}
              <div
                className="ad-preset-selector__thumbnail"
                style={{
                  background: preset.thumbnail,
                  backgroundColor: '#F5F1E8', // Fallback cream color
                }}
              >
                {/* Layout indicator lines */}
                <LayoutIndicator preset={preset} />
              </div>
              
              {/* Label */}
              <span className="ad-preset-selector__label">
                {preset.name}
              </span>
              
              {/* Selected checkmark */}
              {isSelected && (
                <div className="ad-preset-selector__check">
                  <Check className="w-3 h-3" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Visual indicator of where text/CTA will appear
function LayoutIndicator({ preset }: { preset: AdLayoutPreset }) {
  const { layout } = preset;
  
  // For badge layouts, show a small rectangle in corner
  if (layout.colorBlockPosition === 'badge') {
    if (preset.id === 'corner-badge') {
      return (
        <div className="ad-preset-indicator ad-preset-indicator--corner-badge">
          <div className="ad-preset-indicator__text-line" />
        </div>
      );
    }
    return (
      <div className="ad-preset-indicator ad-preset-indicator--badge">
        <div className="ad-preset-indicator__text-line" />
      </div>
    );
  }

  // Text line indicators
  const textLines = (
    <div className="ad-preset-indicator__text-container">
      <div className="ad-preset-indicator__text-line ad-preset-indicator__text-line--long" />
      <div className="ad-preset-indicator__text-line ad-preset-indicator__text-line--short" />
      {layout.hasCTA && layout.ctaPosition === 'inline' && (
        <div className="ad-preset-indicator__cta" />
      )}
    </div>
  );

  // Position the text container
  const positionClass = `ad-preset-indicator--${layout.textPosition}`;
  
  return (
    <div className={cn("ad-preset-indicator", positionClass)}>
      {textLines}
      {/* CTA at bottom */}
      {layout.hasCTA && layout.ctaPosition === 'bottom' && (
        <div className="ad-preset-indicator__cta ad-preset-indicator__cta--bottom" />
      )}
      {/* CTA at right */}
      {layout.hasCTA && layout.ctaPosition === 'right' && (
        <div className="ad-preset-indicator__cta ad-preset-indicator__cta--right" />
      )}
    </div>
  );
}

export default AdPresetSelector;
