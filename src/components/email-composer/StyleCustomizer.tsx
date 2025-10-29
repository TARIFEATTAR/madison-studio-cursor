import { EMAIL_FONTS } from "@/utils/emailTemplates";
import { FOOTER_PRESETS, type FooterPreset } from "@/config/emailFooterPresets";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Type, Layout } from "lucide-react";

interface StyleCustomizerProps {
  brandColor: string;
  secondaryColor: string;
  fontFamily: string;
  buttonColor?: string;
  buttonTextColor?: string;
  textColor?: string;
  footerBackgroundColor?: string;
  footerTextColor?: string;
  footerLinkColor?: string;
  onBrandColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
  onButtonColorChange?: (color: string) => void;
  onButtonTextColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
  onFooterBackgroundColorChange?: (color: string) => void;
  onFooterTextColorChange?: (color: string) => void;
  onFooterLinkColorChange?: (color: string) => void;
}

export function StyleCustomizer({
  brandColor,
  secondaryColor,
  fontFamily,
  buttonColor,
  buttonTextColor,
  textColor,
  footerBackgroundColor,
  footerTextColor,
  footerLinkColor,
  onBrandColorChange,
  onSecondaryColorChange,
  onFontChange,
  onButtonColorChange,
  onButtonTextColorChange,
  onTextColorChange,
  onFooterBackgroundColorChange,
  onFooterTextColorChange,
  onFooterLinkColorChange,
}: StyleCustomizerProps) {
  
  const applyFooterPreset = (preset: FooterPreset) => {
    if (onFooterBackgroundColorChange) onFooterBackgroundColorChange(preset.backgroundColor);
    if (onFooterTextColorChange) onFooterTextColorChange(preset.textColor);
    if (onFooterLinkColorChange) onFooterLinkColorChange(preset.linkColor);
  };

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Style Customization</h3>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Type className="w-3 h-3 text-muted-foreground" />
          <Label className="text-sm">Font Family</Label>
        </div>
        <Select value={fontFamily} onValueChange={onFontChange}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EMAIL_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Primary Brand Color</Label>
        <div className="flex gap-2">
          <input type="color" value={brandColor} onChange={(e) => onBrandColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
          <input type="text" value={brandColor} onChange={(e) => onBrandColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder="#B8956A" />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Secondary/Accent Color</Label>
        <div className="flex gap-2">
          <input type="color" value={secondaryColor} onChange={(e) => onSecondaryColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
          <input type="text" value={secondaryColor} onChange={(e) => onSecondaryColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder="#f8f8f8" />
        </div>
      </div>

      {onButtonColorChange && (
        <div className="space-y-2">
          <Label className="text-sm">CTA Button Color</Label>
          <div className="flex gap-2">
            <input type="color" value={buttonColor || brandColor} onChange={(e) => onButtonColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
            <input type="text" value={buttonColor || brandColor} onChange={(e) => onButtonColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder={brandColor} />
          </div>
        </div>
      )}

      {onButtonTextColorChange && (
        <div className="space-y-2">
          <Label className="text-sm">Button Text Color</Label>
          <div className="flex gap-2">
            <input type="color" value={buttonTextColor || '#ffffff'} onChange={(e) => onButtonTextColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
            <input type="text" value={buttonTextColor || '#ffffff'} onChange={(e) => onButtonTextColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder="#ffffff" />
          </div>
        </div>
      )}

      {onTextColorChange && (
        <div className="space-y-2">
          <Label className="text-sm">Body Text Color</Label>
          <div className="flex gap-2">
            <input type="color" value={textColor || '#555555'} onChange={(e) => onTextColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
            <input type="text" value={textColor || '#555555'} onChange={(e) => onTextColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder="#555555" />
          </div>
        </div>
      )}

      <div className="space-y-4 mt-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 mb-3">
          <Layout className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Footer Style</h3>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Footer Style Presets</Label>
          <div className="grid grid-cols-2 gap-2">
            {FOOTER_PRESETS.map((preset) => (
              <button key={preset.id} onClick={() => applyFooterPreset(preset)} className="p-3 border border-border rounded-lg hover:border-primary transition-colors text-left group">
                <div className="h-12 rounded mb-2 transition-transform group-hover:scale-105" style={{ background: preset.preview }} />
                <p className="text-xs font-medium text-foreground">{preset.name}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        {onFooterBackgroundColorChange && (
          <div className="space-y-2">
            <Label className="text-sm">Footer Background</Label>
            <div className="flex gap-2">
              <input type="color" value={footerBackgroundColor || '#F8F8F8'} onChange={(e) => onFooterBackgroundColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
              <input type="text" value={footerBackgroundColor || '#F8F8F8'} onChange={(e) => onFooterBackgroundColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder="#F8F8F8" />
            </div>
          </div>
        )}

        {onFooterTextColorChange && (
          <div className="space-y-2">
            <Label className="text-sm">Footer Text Color</Label>
            <div className="flex gap-2">
              <input type="color" value={footerTextColor || '#666666'} onChange={(e) => onFooterTextColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
              <input type="text" value={footerTextColor || '#666666'} onChange={(e) => onFooterTextColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder="#666666" />
            </div>
          </div>
        )}

        {onFooterLinkColorChange && (
          <div className="space-y-2">
            <Label className="text-sm">Footer Link Color</Label>
            <div className="flex gap-2">
              <input type="color" value={footerLinkColor || brandColor} onChange={(e) => onFooterLinkColorChange(e.target.value)} className="w-12 h-10 rounded cursor-pointer border border-border" />
              <input type="text" value={footerLinkColor || brandColor} onChange={(e) => onFooterLinkColorChange(e.target.value)} className="flex-1 px-3 py-2 rounded-md border border-border bg-background text-sm" placeholder={brandColor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
