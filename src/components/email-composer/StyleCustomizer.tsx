import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EMAIL_FONTS } from "@/utils/emailTemplates";
import { Palette } from "lucide-react";

interface StyleCustomizerProps {
  brandColor: string;
  secondaryColor: string;
  fontFamily: string;
  onBrandColorChange: (color: string) => void;
  onSecondaryColorChange: (color: string) => void;
  onFontChange: (font: string) => void;
}

export function StyleCustomizer({
  brandColor,
  secondaryColor,
  fontFamily,
  onBrandColorChange,
  onSecondaryColorChange,
  onFontChange,
}: StyleCustomizerProps) {
  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Palette className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm text-foreground">Style Customization</h3>
      </div>

      {/* Font Family */}
      <div className="space-y-2">
        <Label htmlFor="font-family" className="text-sm">Font Family</Label>
        <Select value={fontFamily} onValueChange={onFontChange}>
          <SelectTrigger id="font-family" className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            {EMAIL_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                {font.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Brand Color */}
      <div className="space-y-2">
        <Label htmlFor="brand-color" className="text-sm">Primary Brand Color</Label>
        <div className="flex gap-2">
          <input
            id="brand-color"
            type="color"
            value={brandColor}
            onChange={(e) => onBrandColorChange(e.target.value)}
            className="w-12 h-10 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={brandColor}
            onChange={(e) => onBrandColorChange(e.target.value)}
            placeholder="#B8956A"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono"
          />
        </div>
      </div>

      {/* Secondary Color */}
      <div className="space-y-2">
        <Label htmlFor="secondary-color" className="text-sm">Secondary Color (Optional)</Label>
        <div className="flex gap-2">
          <input
            id="secondary-color"
            type="color"
            value={secondaryColor}
            onChange={(e) => onSecondaryColorChange(e.target.value)}
            className="w-12 h-10 rounded border border-border cursor-pointer"
          />
          <input
            type="text"
            value={secondaryColor}
            onChange={(e) => onSecondaryColorChange(e.target.value)}
            placeholder="#f8f8f8"
            className="flex-1 px-3 py-2 bg-background border border-border rounded-md text-sm font-mono"
          />
        </div>
      </div>
    </div>
  );
}
