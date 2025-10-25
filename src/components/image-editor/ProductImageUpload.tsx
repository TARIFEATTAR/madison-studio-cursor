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
  const [isHovering, setIsHovering] = useState(false);
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

  // Compact chip when image is uploaded
  if (productImage) {
    return (
      <div className="flex items-center gap-2 h-9 px-3 py-1 bg-[#1A1A1A] border border-white/8 rounded-md">
        <Upload className="w-4 h-4 text-[#B8956A] flex-shrink-0" />
        <span className="text-xs font-medium text-[#E0E0E0] truncate">
          {productImage.file.name}
        </span>
        <span className="text-xs text-[#B8956A] whitespace-nowrap ml-auto">
          — Enhancement Mode Active
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          className="text-zinc-400 hover:text-red-400 hover:bg-transparent h-6 w-6 p-0 ml-2 flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  // Hidden dropzone when no image - only shows on hover
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
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
        className={`flex items-center gap-2 h-9 px-3 py-1 border rounded-md cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-[#B8956A] bg-[#B8956A]/10' 
            : isHovering
            ? 'border-white/12 bg-[#1A1A1A]'
            : 'border-transparent bg-transparent'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="💡 Upload your product image if you want Madison to use it directly in the scene."
      >
        <Upload className={`w-4 h-4 transition-all ${
          isDragging || isHovering ? 'text-[#B8956A]' : 'text-zinc-600'
        }`} />
        <span className={`text-xs transition-all ${
          isDragging || isHovering ? 'text-[#E0E0E0]' : 'text-zinc-600'
        }`}>
          {isDragging ? 'Drop image here' : 'Upload product image'}
        </span>
        {(isDragging || isHovering) && (
          <span className="text-[10px] text-zinc-500 ml-auto">
            Max 20MB
          </span>
        )}
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
