import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, CheckCircle2, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { UploadProgress } from "./types";
import { formatFileSize } from "./types";

interface UploadDropzoneProps {
  onUpload: (files: File[]) => void;
  uploads: UploadProgress[];
  onClearUpload: (id: string) => void;
  folderId?: string;
  className?: string;
  compact?: boolean;
}

const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'application/pdf',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function UploadDropzone({
  onUpload,
  uploads,
  onClearUpload,
  className,
  compact = false,
}: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const validateFiles = useCallback((files: File[]): { valid: File[]; errors: string[] } => {
    const valid: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Unsupported file type`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        continue;
      }
      valid.push(file);
    }

    return { valid, errors };
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragError(null);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setDragError(errors[0]);
      setTimeout(() => setDragError(null), 3000);
    }

    if (valid.length > 0) {
      onUpload(valid);
    }
  }, [onUpload, validateFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const { valid, errors } = validateFiles(files);

    if (errors.length > 0) {
      setDragError(errors[0]);
      setTimeout(() => setDragError(null), 3000);
    }

    if (valid.length > 0) {
      onUpload(valid);
    }

    // Reset input
    e.target.value = '';
  }, [onUpload, validateFiles]);

  const hasActiveUploads = uploads.length > 0;

  if (compact) {
    return (
      <div className={cn("relative", className)}>
        <input
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-compact"
        />
        <label htmlFor="file-upload-compact">
          <Button variant="outline" size="sm" className="gap-2 cursor-pointer" asChild>
            <span>
              <Upload className="w-4 h-4" />
              Upload
            </span>
          </Button>
        </label>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Dropzone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-lg transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/30",
          dragError && "border-destructive bg-destructive/5"
        )}
      >
        <input
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
          <motion.div
            animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center mb-3",
              isDragging ? "bg-primary/20" : "bg-muted"
            )}>
              <Upload className={cn(
                "w-6 h-6",
                isDragging ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {isDragging ? (
              <motion.div
                key="dragging"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-lg font-medium text-primary">Drop files here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Release to upload
                </p>
              </motion.div>
            ) : dragError ? (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-destructive"
              >
                <p className="text-sm font-medium">{dragError}</p>
              </motion.div>
            ) : (
              <motion.div
                key="default"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <p className="text-sm font-medium">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                  Images, videos, and PDFs <span className="font-medium text-amber-600 dark:text-amber-500">(Max 10MB)</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Upload progress list */}
      <AnimatePresence>
        {hasActiveUploads && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            {uploads.map((upload) => (
              <UploadProgressItem
                key={upload.id}
                upload={upload}
                onClear={() => onClearUpload(upload.id)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface UploadProgressItemProps {
  upload: UploadProgress;
  onClear: () => void;
}

function UploadProgressItem({ upload, onClear }: UploadProgressItemProps) {
  const isComplete = upload.status === 'complete';
  const isError = upload.status === 'error';
  const isProcessing = upload.status === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border bg-card",
        isComplete && "border-green-200 bg-green-50/50",
        isError && "border-destructive/50 bg-destructive/5"
      )}
    >
      {/* Status icon */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
        isComplete && "bg-green-100",
        isError && "bg-destructive/10",
        !isComplete && !isError && "bg-muted"
      )}>
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </motion.div>
        ) : isError ? (
          <AlertCircle className="w-5 h-5 text-destructive" />
        ) : isProcessing ? (
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        ) : (
          <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{upload.fileName}</p>
        <div className="flex items-center gap-2 mt-1">
          {isComplete ? (
            <span className="text-xs text-green-600 font-medium">
              ✨ Uploaded successfully!
            </span>
          ) : isError ? (
            <span className="text-xs text-destructive">{upload.error}</span>
          ) : isProcessing ? (
            <span className="text-xs text-primary">Processing with AI...</span>
          ) : (
            <Progress value={upload.progress} className="h-1.5 flex-1" />
          )}
        </div>
      </div>

      {/* Close button */}
      {(isComplete || isError) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClear}
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </motion.div>
  );
}

// Celebration confetti component
export function UploadCelebration({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Simple celebration particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: ['#B8956A', '#F5F1E8', '#4ade80', '#fbbf24', '#f472b6'][i % 5],
          }}
          initial={{
            x: 0,
            y: 0,
            scale: 0,
          }}
          animate={{
            x: (Math.random() - 0.5) * 400,
            y: (Math.random() - 0.5) * 400,
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.02,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}
