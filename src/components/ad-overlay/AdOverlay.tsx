/**
 * AdOverlay Component - Madison Studio
 * 
 * Renders a professional ad overlay on top of an image with:
 * - Color blocks (solid, gradient, badge)
 * - Text positioning
 * - CTA buttons
 * - Export functionality
 */

import { forwardRef, useMemo } from "react";
import { cn } from "@/lib/utils";
import { AD_FONT_OPTIONS, type AdLayoutPreset } from "@/config/adLayoutPresets";

export interface AdOverlayConfig {
  preset: AdLayoutPreset;
  headline: string;
  subtext: string;
  ctaText: string;
  // Custom overrides
  colorBlockColor?: string;
  colorBlockOpacity?: number;
  textColor?: string;
  ctaBackgroundColor?: string;
  ctaTextColor?: string;
  fontFamily?: string;
}

interface AdOverlayProps {
  imageUrl: string;
  config: AdOverlayConfig;
  className?: string;
}

export const AdOverlay = forwardRef<HTMLDivElement, AdOverlayProps>(
  ({ imageUrl, config, className }, ref) => {
    const { preset, headline, subtext, ctaText } = config;
    const layout = preset.layout;
    const defaults = preset.defaultStyles;

    // Merge custom overrides with defaults
    const styles = useMemo(() => ({
      colorBlockColor: config.colorBlockColor || defaults.colorBlockColor,
      colorBlockOpacity: config.colorBlockOpacity ?? defaults.colorBlockOpacity,
      textColor: config.textColor || defaults.textColor,
      ctaBackgroundColor: config.ctaBackgroundColor || defaults.ctaBackgroundColor,
      ctaTextColor: config.ctaTextColor || defaults.ctaTextColor,
      fontFamily: config.fontFamily || defaults.fontFamily,
    }), [config, defaults]);

    // Get font style
    const fontStyle = useMemo(() => {
      const font = AD_FONT_OPTIONS.find(f => f.value === styles.fontFamily);
      return font?.style || "'Lato', sans-serif";
    }, [styles.fontFamily]);

    // Calculate color block styles based on position
    const colorBlockStyles = useMemo(() => {
      if (!layout.hasColorBlock) return null;

      const baseStyles: React.CSSProperties = {
        position: 'absolute',
        backgroundColor: styles.colorBlockColor,
        opacity: styles.colorBlockOpacity,
      };

      switch (layout.colorBlockPosition) {
        case 'top':
          return {
            ...baseStyles,
            top: 0,
            left: 0,
            right: 0,
            height: `${layout.colorBlockSize}%`,
          };
        case 'bottom':
          // For gradient-bottom preset, use gradient
          if (preset.id === 'gradient-bottom') {
            return {
              position: 'absolute' as const,
              bottom: 0,
              left: 0,
              right: 0,
              height: `${layout.colorBlockSize}%`,
              background: `linear-gradient(to bottom, transparent 0%, ${styles.colorBlockColor} 100%)`,
              opacity: styles.colorBlockOpacity,
            };
          }
          return {
            ...baseStyles,
            bottom: 0,
            left: 0,
            right: 0,
            height: `${layout.colorBlockSize}%`,
          };
        case 'left':
          return {
            ...baseStyles,
            top: 0,
            left: 0,
            bottom: 0,
            width: `${layout.colorBlockSize}%`,
          };
        case 'right':
          return {
            ...baseStyles,
            top: 0,
            right: 0,
            bottom: 0,
            width: `${layout.colorBlockSize}%`,
          };
        case 'full':
          return {
            ...baseStyles,
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          };
        case 'badge':
          // Corner badge or minimal badge
          if (preset.id === 'corner-badge') {
            return {
              position: 'absolute' as const,
              top: 0,
              left: 0,
              width: '50%',
              height: '50%',
              background: `linear-gradient(135deg, ${styles.colorBlockColor} 50%, transparent 50%)`,
              opacity: styles.colorBlockOpacity,
            };
          }
          // Minimal badge at bottom right
          return {
            ...baseStyles,
            bottom: '16px',
            right: '16px',
            padding: '12px 20px',
            borderRadius: '4px',
            width: 'auto',
            height: 'auto',
          };
        default:
          return baseStyles;
      }
    }, [layout, styles, preset.id]);

    // Calculate text container styles
    const textContainerStyles = useMemo((): React.CSSProperties => {
      const base: React.CSSProperties = {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        fontFamily: fontStyle,
        color: styles.textColor,
        zIndex: 10,
      };

      // Text alignment
      const alignItems = layout.textAlign === 'center' ? 'center' 
        : layout.textAlign === 'right' ? 'flex-end' 
        : 'flex-start';

      switch (layout.textPosition) {
        case 'top':
          return {
            ...base,
            top: 0,
            left: 0,
            right: 0,
            padding: preset.id === 'top-strip' ? '8px 16px' : '24px',
            alignItems,
            height: layout.hasColorBlock && layout.colorBlockPosition === 'top' 
              ? `${layout.colorBlockSize}%` 
              : 'auto',
            justifyContent: 'center',
          };
        case 'bottom':
          return {
            ...base,
            bottom: 0,
            left: 0,
            right: 0,
            padding: '24px',
            alignItems,
            height: layout.hasColorBlock && layout.colorBlockPosition === 'bottom'
              ? `${layout.colorBlockSize}%`
              : 'auto',
            justifyContent: 'center',
          };
        case 'center':
          return {
            ...base,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '24px',
            alignItems: 'center',
            textAlign: 'center',
            width: '80%',
          };
        case 'left':
          return {
            ...base,
            top: 0,
            left: 0,
            bottom: 0,
            width: `${layout.colorBlockSize}%`,
            padding: '24px',
            alignItems: 'flex-start',
            justifyContent: 'center',
          };
        case 'right':
          return {
            ...base,
            top: 0,
            right: 0,
            bottom: 0,
            width: `${layout.colorBlockSize}%`,
            padding: '24px',
            alignItems: 'flex-start',
            justifyContent: 'center',
          };
        default:
          return base;
      }
    }, [layout, fontStyle, styles.textColor, preset.id]);

    // CTA button styles
    const ctaStyles = useMemo((): React.CSSProperties => ({
      backgroundColor: styles.ctaBackgroundColor,
      color: styles.ctaTextColor,
      padding: '12px 24px',
      borderRadius: '2px',
      fontWeight: 600,
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      border: 'none',
      cursor: 'pointer',
      marginTop: layout.ctaPosition === 'inline' ? '16px' : '0',
    }), [styles, layout.ctaPosition]);

    // For badge layout, text is inside the badge
    const isBadgeLayout = layout.colorBlockPosition === 'badge' && preset.id === 'minimal-badge';

    return (
      <div
        ref={ref}
        className={cn("ad-overlay", className)}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        {/* Background Image */}
        <img
          src={imageUrl}
          alt="Ad background"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Color Block */}
        {layout.hasColorBlock && colorBlockStyles && !isBadgeLayout && (
          <div style={colorBlockStyles} />
        )}

        {/* Badge Layout - Special handling */}
        {isBadgeLayout ? (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              right: '16px',
              backgroundColor: styles.colorBlockColor,
              opacity: styles.colorBlockOpacity,
              padding: '12px 20px',
              borderRadius: '4px',
              fontFamily: fontStyle,
              color: styles.textColor,
              zIndex: 10,
            }}
          >
            {headline && (
              <div style={{ fontWeight: 600, fontSize: '14px' }}>
                {headline}
              </div>
            )}
            {subtext && (
              <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '2px' }}>
                {subtext}
              </div>
            )}
          </div>
        ) : (
          /* Text Container */
          <div style={textContainerStyles}>
            {headline && (
              <h2
                className="ad-overlay__headline"
                style={{
                  fontSize: preset.id === 'top-strip' ? '16px' : '28px',
                  fontWeight: 600,
                  margin: 0,
                  lineHeight: 1.2,
                  textShadow: layout.colorBlockPosition === 'full' || !layout.hasColorBlock
                    ? '0 2px 4px rgba(0,0,0,0.3)'
                    : 'none',
                }}
              >
                {headline}
              </h2>
            )}
            
            {subtext && (
              <p
                className="ad-overlay__subtext"
                style={{
                  fontSize: preset.id === 'top-strip' ? '12px' : '16px',
                  margin: 0,
                  opacity: 0.9,
                  lineHeight: 1.4,
                }}
              >
                {subtext}
              </p>
            )}

            {/* CTA Button - Inline position */}
            {layout.hasCTA && ctaText && layout.ctaPosition === 'inline' && (
              <button style={ctaStyles}>
                {ctaText}
              </button>
            )}
          </div>
        )}

        {/* CTA Button - Bottom position (separate from text) */}
        {layout.hasCTA && ctaText && layout.ctaPosition === 'bottom' && !isBadgeLayout && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 10,
            }}
          >
            <button style={ctaStyles}>
              {ctaText}
            </button>
          </div>
        )}

        {/* CTA Button - Right position (for CTA Bottom Bar layout) */}
        {layout.hasCTA && ctaText && layout.ctaPosition === 'right' && !isBadgeLayout && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              right: '24px',
              zIndex: 10,
            }}
          >
            <button style={ctaStyles}>
              {ctaText}
            </button>
          </div>
        )}
      </div>
    );
  }
);

AdOverlay.displayName = "AdOverlay";

export default AdOverlay;
