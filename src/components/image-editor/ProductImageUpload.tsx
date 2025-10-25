import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Label } from "@/components/ui/label";
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
    // Validation
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
    
    // Convert to base64
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

  if (productImage) {
    return (
      <div className="flex items-center gap-3 p-2 bg-[#111111] border border-[#B8956A] rounded-lg">
        <img 
          src={productImage.url} 
          alt="Product" 
          className="w-12 h-12 object-cover rounded border border-zinc-700"
        />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[#F5F1E8] truncate">
            {productImage.file.name}
          </p>
          <p className="text-[10px] text-[#B8956A]">
            Enhancement mode active
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          className="text-red-400 hover:text-red-300 hover:bg-red-400/10 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Label
        htmlFor="product-image-upload"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files?.[0];
          if (file && !disabled) processFile(file);
        }}
        aria-label="Upload a product image"
        className={`flex flex-col items-center justify-center p-3 border border-dashed rounded-lg cursor-pointer transition-all duration-300 group ${
          isDragging 
            ? 'border-[#B8956A] bg-[#B8956A]/8' 
            : 'border-zinc-700 bg-zinc-900/30 hover:border-[#B8956A]/60 hover:bg-[#B8956A]/5'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Upload className="w-5 h-5 text-[#B8956A] mb-1 group-hover:scale-110 transition-transform" />
        <span className="text-xs text-[#F5F1E8] text-center">
          Upload or Drag & Drop Here
        </span>
        <span className="text-[10px] text-[#B8956A] italic mt-0.5 text-center">
          Max 20MB
        </span>
      </Label>
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
};
