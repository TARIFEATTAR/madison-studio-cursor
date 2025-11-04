import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface ImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadComplete: (imageUrl: string, promptText?: string, title?: string) => void;
}

export function ImageUploadDialog({ open, onOpenChange, onUploadComplete }: ImageUploadDialogProps) {
  const { toast } = useToast();
  const { currentOrganizationId } = useOnboarding();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [title, setTitle] = useState("");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please upload an image file (PNG, JPEG, WebP, etc.)",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".webp", ".gif"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  const handleUpload = async () => {
    if (!uploadedFile || !currentOrganizationId || !user) {
      toast({
        title: "Error",
        description: "Missing required information",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = uploadedFile.name.split(".").pop();
      const fileName = `${currentOrganizationId}/${user.id}/${timestamp}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase storage bucket (use generated-images for recipe images)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("generated-images")
        .upload(fileName, uploadedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(uploadError.message || "Failed to upload image to storage");
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Call completion handler
      onUploadComplete(imageUrl, promptText || undefined, title || undefined);

      // Reset form
      handleRemove();
      setPromptText("");
      setTitle("");
      onOpenChange(false);

      toast({
        title: "Image uploaded",
        description: "Your image has been added to the library",
      });
    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      handleRemove();
      setPromptText("");
      setTitle("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-2xl max-h-[90vh]",
        isMobile && "max-w-[95vw]"
      )}>
        <DialogHeader>
          <DialogTitle>Upload Image Recipe</DialogTitle>
          <DialogDescription>
            Upload an image and optionally add a prompt. You can add the prompt later if needed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Upload Area */}
          <div>
            <Label className="mb-2 block">Image</Label>
            {!previewUrl ? (
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                  isUploading && "opacity-50 cursor-not-allowed"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">
                  {isDragActive ? "Drop image here" : "Drag & drop or click to upload"}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPEG, WebP (max 10MB)
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-auto rounded-lg border border-border max-h-[400px] object-contain mx-auto"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white hover:bg-black/80"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Optional Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your image recipe a name"
                disabled={isUploading}
              />
            </div>

            <div>
              <Label htmlFor="prompt">Prompt Text (optional)</Label>
              <Textarea
                id="prompt"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Add the prompt used to generate this image, or add it later"
                rows={4}
                disabled={isUploading}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can add or edit the prompt later from the recipe library
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!uploadedFile || isUploading}
              className="gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Image
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

