import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:5', label: 'Portrait (4:5)' },
  { value: '5:4', label: 'Etsy (5:4)' },
  { value: '2:3', label: 'Pinterest (2:3)' },
  { value: '3:2', label: 'Email/Web (3:2)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Vertical (9:16)' },
  { value: '21:9', label: 'Ultra-wide (21:9)' }
];

const PLATFORM_PRESETS = [
  { platform: 'Etsy', aspectRatio: '5:4', icon: '🛍️' },
  { platform: 'Instagram', aspectRatio: '4:5', icon: '📱' },
  { platform: 'Stories/TikTok', aspectRatio: '9:16', icon: '📹' },
  { platform: 'Pinterest', aspectRatio: '2:3', icon: '📌' },
  { platform: 'Email', aspectRatio: '3:2', icon: '✉️' },
  { platform: 'Website', aspectRatio: '16:9', icon: '💻' }
];

const OUTPUT_FORMATS = [
  { value: 'png', label: 'PNG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'webp', label: 'WebP' }
];

interface ExportOptionsProps {
  aspectRatio: string;
  outputFormat: string;
  onAspectRatioChange: (value: string) => void;
  onOutputFormatChange: (value: string) => void;
}

export function ExportOptions({ 
  aspectRatio, 
  outputFormat, 
  onAspectRatioChange, 
  onOutputFormatChange 
}: ExportOptionsProps) {
  return (
    <Card className="bg-[#2F2A26] border border-[#3D3935] shadow-level-1 p-6">
      <h3 className="font-serif text-lg text-[#FFFCF5] mb-4">Export Options</h3>
      
      <div className="space-y-4">
        <div>
          <Label className="font-sans text-sm font-medium text-[#D4CFC8] mb-2 block">
            Platform Presets
          </Label>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {PLATFORM_PRESETS.map(preset => (
              <Button
                key={preset.platform}
                variant="outline"
                size="sm"
                onClick={() => onAspectRatioChange(preset.aspectRatio)}
                className={`
                  text-xs h-auto py-2 px-2 flex flex-col items-center gap-1
                  ${aspectRatio === preset.aspectRatio 
                    ? 'bg-accent text-accent-foreground border-accent' 
                    : 'bg-[#252220] border-[#3D3935] text-[#D4CFC8] hover:bg-[#3D3935] hover:text-[#FFFCF5]'}
                `}
              >
                <span className="text-base">{preset.icon}</span>
                <span className="font-sans">{preset.platform}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="font-sans text-sm font-medium text-[#D4CFC8] mb-2 block">
            Aspect Ratio
          </Label>
          <Select value={aspectRatio} onValueChange={onAspectRatioChange}>
            <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ASPECT_RATIOS.map(ratio => (
                <SelectItem key={ratio.value} value={ratio.value}>
                  {ratio.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="font-sans text-sm font-medium text-[#D4CFC8] mb-2 block">
            Format
          </Label>
          <Select value={outputFormat} onValueChange={onOutputFormatChange}>
            <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OUTPUT_FORMATS.map(format => (
                <SelectItem key={format.value} value={format.value}>
                  {format.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
