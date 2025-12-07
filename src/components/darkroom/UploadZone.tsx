import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Replace, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type UploadType = "product" | "background" | "style";

interface UploadedImage {
  url: string;
  file?: File;
  name?: string;
}

interface UploadZoneProps {
  type: UploadType;
  label: string;
  description: string;
  image: UploadedImage | null;
  onUpload: (image: UploadedImage) => void;
  onRemove?: () => void;
  disabled?: boolean;
  className?: string;
}

const TYPE_CONFIG: Record<UploadType, { icon: string; color: string }> = {
  product: { icon: "📦", color: "var(--darkroom-accent)" },
  background: { icon: "🌄", color: "#6366F1" },
  style: { icon: "🎨", color: "#EC4899" },
};

export function UploadZone({
  type,
  label,
  description,
  image,
  onUpload,
  onRemove,
  disabled = false,
  className,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const config = TYPE_CONFIG[type];

  const processFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      if (file.size > 20 * 1024 * 1024) {
        toast.error("File too large (max 20MB)");
        return;
      }

      setIsUploading(true);

      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          onUpload({
            url: reader.result as string,
            file,
            name: file.name,
          });
          setIsUploading(false);
        };
        reader.onerror = () => {
          toast.error("Failed to read file");
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error("Failed to process image");
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [disabled, processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
      // Reset input so same file can be selected again
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [processFile]
  );

  const handleClick = useCallback(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  }, [disabled]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove]
  );

  const handleReplace = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (inputRef.current) {
        inputRef.current.click();
      }
    },
    []
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("upload-zone-wrapper", className)}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <AnimatePresence mode="wait">
        {image ? (
          // Image Preview Mode
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="upload-zone upload-zone--has-image"
          >
            <div className="upload-zone__preview">
              <img src={image.url} alt={label} />
              <div className="upload-zone__preview-overlay">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleReplace}
                  className="h-8 px-3 bg-white/10 hover:bg-white/20 text-white border-0"
                >
                  <Replace className="w-3.5 h-3.5 mr-1.5" />
                  Replace
                </Button>
                {onRemove && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRemove}
                    className="h-8 px-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border-0"
                  >
                    <X className="w-3.5 h-3.5 mr-1.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm">{config.icon}</span>
              <span className="text-xs font-medium text-[var(--darkroom-text)]">
                {label.replace(/^[^\s]+\s/, "")}
              </span>
            </div>
          </motion.div>
        ) : (
          // Upload Mode
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "upload-zone",
              isDragging && "upload-zone--dragging",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="upload-zone__content">
              {isUploading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <ImageIcon className="upload-zone__icon" />
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Upload className="upload-zone__icon" />
                </motion.div>
              )}
              <span className="upload-zone__label">{label}</span>
              <span className="upload-zone__description">{description}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
