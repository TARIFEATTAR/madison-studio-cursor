import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ASPECT_RATIOS = [
  { value: '1:1', label: 'Square (1:1)' },
  { value: '4:5', label: 'Portrait (4:5)' },
  { value: '16:9', label: 'Landscape (16:9)' },
  { value: '9:16', label: 'Vertical (9:16)' },
  { value: '21:9', label: 'Ultra-wide (21:9)' }
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
