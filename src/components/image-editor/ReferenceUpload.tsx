import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface ReferenceUploadProps {
  currentImage: string | null;
  description: string;
  onUpload: (url: string, description: string) => void;
  onRemove: () => void;
}

export function ReferenceUpload({ currentImage, description, onUpload, onRemove }: ReferenceUploadProps) {
  const [localDescription, setLocalDescription] = useState(description);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result as string, localDescription);
      setIsOpen(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="bg-[#2F2A26] border-[#3D3935] p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brass" />
              <h3 className="font-serif text-sm text-[#FFFCF5]">Reference Image</h3>
            </div>
            {currentImage && (
              <span className="text-xs text-green-400">✓ Added</span>
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="space-y-3 mt-3">
            {currentImage ? (
              <div className="space-y-2">
                <div className="relative rounded overflow-hidden border border-[#3D3935]">
                  <img
                    src={currentImage}
                    alt="Reference"
                    className="w-full h-32 object-cover"
                  />
                  <Button
                    onClick={onRemove}
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-[#A8A39E] italic leading-relaxed">
                    <strong>How it works:</strong> The AI will place your product from this reference into the scene you describe.
                  </p>
                  <div className="bg-[#252220]/50 border border-[#3D3935] rounded p-2 space-y-1">
                    <p className="text-[10px] text-green-400 font-medium">✓ Good Prompt Example:</p>
                    <p className="text-[10px] text-[#D4CFC8] leading-relaxed">
                      "Place on weathered sandstone blocks with brass incense holder nearby, soft smoke wisps, warm golden hour lighting"
                    </p>
                    <p className="text-[10px] text-red-400 font-medium mt-2">✗ Avoid:</p>
                    <p className="text-[10px] text-[#A8A39E] leading-relaxed">
                      "Generate a perfume bottle" (Too generic - describe the SCENE instead)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Label 
                  htmlFor="reference-upload" 
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed 
                           border-[#3D3935] hover:border-brass/40 rounded cursor-pointer 
                           transition-all duration-300 group"
                >
                  <Upload className="w-6 h-6 text-brass mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs text-[#D4CFC8] text-center">
                    Upload reference image (Max 20MB)
                  </span>
                  <span className="text-[10px] text-[#A8A39E] italic mt-1 text-center max-w-[200px]">
                    Use for style, lighting, or composition reference
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
                    placeholder="E.g., 'Use the lighting and angle from this photo'"
                    className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] text-xs"
                  />
                </div>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
