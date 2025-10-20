import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

interface ReferenceUploadProps {
  onUpload: (url: string, description: string) => void;
}

export function ReferenceUpload({ onUpload }: ReferenceUploadProps) {
  const [description, setDescription] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result as string, description);
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="bg-parchment-white border border-charcoal/10 shadow-level-1 p-6">
      <h3 className="font-serif text-lg text-ink-black mb-4">Reference Image</h3>
      
      <div className="space-y-4">
        <div>
          <Label 
            htmlFor="reference-upload" 
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed 
                     border-charcoal/20 hover:border-brass/40 rounded-sm cursor-pointer 
                     transition-all duration-300 group"
          >
            <Upload className="w-8 h-8 text-brass mb-3 group-hover:scale-110 transition-transform" />
            <span className="text-sm text-charcoal/60 text-center">
              Click to upload reference image
            </span>
            <span className="text-xs text-charcoal/40 italic mt-1">
              Optional: helps guide the generation
            </span>
          </Label>
          <Input
            id="reference-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <div>
          <Label className="font-sans text-sm font-medium text-ink-black mb-2 block">
            Description (optional)
          </Label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what you want to capture..."
            className="bg-vellum-cream border-charcoal/20 focus:border-brass focus:ring-brass"
          />
        </div>
      </div>
    </Card>
  );
}
