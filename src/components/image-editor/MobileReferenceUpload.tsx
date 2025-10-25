import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MobileReferenceUploadProps {
  image: { url: string; file: File } | null;
  onUpload: (file: File, url: string) => void;
  onRemove: () => void;
  className?: string;
}

export default function MobileReferenceUpload({
  image,
  onUpload,
  onRemove,
  className
}: MobileReferenceUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        onUpload(file, url);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".webp"] },
    maxFiles: 1,
    multiple: false
  });

  if (image) {
    return (
      <div className={cn("relative rounded-lg overflow-hidden border border-studio-border", className)}>
        <img
          src={image.url}
          alt="Reference"
          className="w-full h-32 object-cover"
        />
        <Button
          variant="destructive"
          size="icon"
          onClick={onRemove}
          className="absolute top-2 right-2 h-8 w-8 rounded-full"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
        isDragActive
          ? "border-aged-brass bg-aged-brass/5"
          : "border-studio-border hover:border-studio-border/80 hover:bg-studio-card",
        className
      )}
    >
      <input {...getInputProps()} />
      <Upload className="w-8 h-8 mx-auto mb-2 text-studio-text-secondary" />
      <p className="text-sm text-studio-text-secondary">
        {isDragActive ? "Drop image here" : "Add Reference Image"}
      </p>
      <p className="text-xs text-studio-text-tertiary mt-1">
        Optional: Tap or drag to upload
      </p>
    </div>
  );
}
