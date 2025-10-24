import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

type ReferenceImage = {
  url: string;
  description: string;
  label: "Background" | "Product" | "Style Reference";
};

interface ReferenceUploadProps {
  images: ReferenceImage[];
  onUpload: (url: string, description: string, label: ReferenceImage["label"]) => void;
  onRemove: (index: number) => void;
  isUploading?: boolean;
  maxImages?: number;
}

export function ReferenceUpload({ images, onUpload, onRemove, isUploading = false, maxImages = 3 }: ReferenceUploadProps) {
  const [localDescription, setLocalDescription] = useState("");
  const [selectedLabel, setSelectedLabel] = useState<ReferenceImage["label"]>("Product");
  const [isOpen, setIsOpen] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  const canAddMore = images.length < maxImages;

  const processFile = (file: File) => {
    if (!canAddMore) {
      toast.error(`Maximum ${maxImages} reference images allowed`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large (max 20MB)');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result as string, localDescription, selectedLabel);
      setLocalDescription("");
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  return (
    <Card className="bg-[#2F2A26] border-[#3D3935] p-4">
      <Collapsible defaultOpen={true} open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brass" />
              <h3 className="font-serif text-sm text-[#FFFCF5]">Reference Images ({images.length}/{maxImages})</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-aged-brass/60 hover:text-aged-brass cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Combine up to {maxImages} references: background scene + product + style reference for Midjourney-style workflows</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {images.length > 0 && (
              <span className="text-xs text-green-400">✓ {images.length} Added</span>
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="max-h-96 overflow-y-auto overscroll-contain">
          <div className="space-y-3 mt-3">
            {/* Existing Images */}
            {images.map((img, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] text-brass border-brass/40">
                    {img.label}
                  </Badge>
                  <Button
                    onClick={() => onRemove(idx)}
                    size="sm"
                    variant="ghost"
                    className="h-6 px-2 text-xs text-red-400 hover:text-red-300"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                </div>
                <div className="relative rounded overflow-hidden border border-[#3D3935]">
                  <img
                    src={img.url}
                    alt={img.label}
                    className="w-full h-32 object-cover"
                  />
                </div>
                {img.description && (
                  <p className="text-[10px] text-[#A8A39E] italic">{img.description}</p>
                )}
              </div>
            ))}

            {/* Add New Image Section */}
            {canAddMore && (
              <>
                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-[#D4CFC8]">
                    <Loader2 className="w-4 h-4 animate-spin text-brass" />
                    Uploading reference…
                  </div>
                )}
                
                <div className="space-y-2 pt-2 border-t border-[#3D3935]">
                  <Label className="text-xs text-[#D4CFC8]">Image Type</Label>
                  <Select value={selectedLabel} onValueChange={(v) => setSelectedLabel(v as ReferenceImage["label"])}>
                    <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Background">Background Scene</SelectItem>
                      <SelectItem value="Product">Product/Subject</SelectItem>
                      <SelectItem value="Style Reference">Style/Lighting Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Label 
                  htmlFor="reference-upload" 
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const file = e.dataTransfer.files?.[0]; if (file) processFile(file); }}
                  className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded cursor-pointer transition-all duration-300 group ${isDragging ? 'border-brass/60 bg-[#252220]/40' : 'border-[#3D3935] hover:border-brass/40'}`}
                >
                  <Upload className="w-6 h-6 text-brass mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-[#D4CFC8] text-center">
                    Drag & drop or click to upload (Max 20MB)
                  </span>
                  <span className="text-[10px] text-[#A8A39E] italic mt-1 text-center max-w-[220px]">
                    Add {images.length === 0 ? "first" : "another"} reference ({maxImages - images.length} remaining)
                  </span>
                </Label>
                <Input
                  id="reference-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div>
                  <Label className="text-xs text-[#D4CFC8] mb-1.5 block">
                    Usage Notes (optional)
                  </Label>
                  <Input
                    value={localDescription}
                    onChange={(e) => setLocalDescription(e.target.value)}
                    placeholder={`E.g., "Use this ${selectedLabel.toLowerCase()} as the main ${selectedLabel === "Background" ? "environment" : "focus"}"`}
                    className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] text-xs"
                  />
                </div>
              </>
            )}

            {/* Usage Guide */}
            {images.length > 0 && (
              <div className="bg-[#252220]/50 border border-[#3D3935] rounded p-2 space-y-1 mt-3">
                <p className="text-[10px] text-green-400 font-medium">✓ Multi-Reference Example:</p>
                <p className="text-[10px] text-[#D4CFC8] leading-relaxed">
                  "Combine the desert background with my product bottle, using the warm lighting style from reference 3"
                </p>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
