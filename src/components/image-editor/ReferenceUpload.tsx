import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, Loader2, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface ReferenceUploadProps {
  currentImage: string | null;
  description: string;
  onUpload: (url: string, description: string) => void;
  onRemove: () => void;
  isUploading?: boolean;
}

export function ReferenceUpload({ currentImage, description, onUpload, onRemove, isUploading = false }: ReferenceUploadProps) {
  const [localDescription, setLocalDescription] = useState(description);
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
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
      onUpload(reader.result as string, localDescription);
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
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-brass" />
              <h3 className="font-serif text-sm text-[#FFFCF5]">Add Reference Image</h3>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3 h-3 text-aged-brass/60 hover:text-aged-brass cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">Upload your product image to place it into a new scene or use it as a style/lighting reference.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {currentImage && (
              <span className="text-xs text-green-400">✓ Added</span>
            )}
          </div>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="max-h-64 overflow-y-auto overscroll-contain">
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
                <>
                  {isUploading && (
                    <div className="flex items-center gap-2 text-xs text-[#D4CFC8]">
                      <Loader2 className="w-4 h-4 animate-spin text-brass" />
                      Uploading reference…
                    </div>
                  )}
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
                      Main use: place your product into a new scene. Also works for style/lighting reference.
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
                      placeholder="E.g., 'Place this exact product into the scene; match lighting/angle'"
                      className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] placeholder:text-[#A8A39E] text-xs"
                    />
                  </div>
                </>
              </>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
