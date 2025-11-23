import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductImageUploadProps {
  productImage: { url: string; file: File } | null;
  onUpload: (image: { url: string; file: File }) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export const ProductImageUpload = ({
  productImage,
  onUpload,
  onRemove,
  disabled = false,
}: ProductImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }
    
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 20MB",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload({
        url: reader.result as string,
        file: file
      });
      toast({
        title: "Product image added",
        description: "Madison will use this image for enhancement",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // When image is uploaded - compact chip inside drop zone
  if (productImage) {
    return (
      <div className="flex flex-col items-center justify-center h-12 px-3 py-2 bg-[#1A1A1A] border border-brand-brass rounded-md transition-all duration-200">
        <div className="flex items-center gap-2 w-full">
          <Upload className="w-4 h-4 text-brand-brass flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[#E0E0E0] truncate">
              {productImage.file.name}
            </p>
            <p className="text-[10px] text-brand-brass">Enhancement Mode Active</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={disabled}
            className="text-zinc-400 hover:text-red-400 hover:bg-transparent h-6 w-6 p-0 flex-shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  // Default drop zone state - always visible
  return (
    <div className="relative h-12">
      <label
        htmlFor="product-image-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !disabled) processFile(file);
        }}
        className={`flex flex-col items-center justify-center h-full px-3 py-2 border border-dashed rounded-md cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-brand-brass bg-brand-brass/10 shadow-[0_0_8px_rgba(184,149,106,0.5)]' 
            : 'border-white/8 bg-[#111111] hover:border-white/12 hover:bg-[#1A1A1A]'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Upload your product image for Madison to use directly in the scene."
      >
        <div className="flex items-center gap-2">
          <Upload className={`w-4 h-4 transition-all ${
            isDragging ? 'text-brand-brass' : 'text-[#E0E0E0]'
          }`} />
          <span className="text-xs font-medium text-[#E0E0E0]">
            {isDragging ? 'Drop Image Here' : 'Upload or Drop Image'}
          </span>
        </div>
      </label>
      <Input
        id="product-image-upload"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />
    </div>
  );
}
