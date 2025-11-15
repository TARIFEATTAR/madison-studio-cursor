import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingProgressBar } from "./OnboardingProgressBar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/logger";

interface OnboardingDocumentUploadProps {
  open: boolean;
  organizationId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingDocumentUpload({
  open,
  organizationId,
  onComplete,
  onSkip,
}: OnboardingDocumentUploadProps) {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFile = fileArray.find(file => 
      file.type === 'application/pdf' || 
      file.type === 'text/plain' || 
      file.type === 'text/markdown' ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt')
    );

    if (!validFile) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF, TXT, or Markdown file.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(validFile);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Generate unique file path
      const timestamp = Date.now();
      const sanitizedFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${organizationId}/${timestamp}_${sanitizedFileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('brand-documents')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Insert document record
      const { data: docData, error: insertError } = await supabase
        .from('brand_documents')
        .insert({
          organization_id: organizationId,
          uploaded_by: user.id,
          file_name: selectedFile.name,
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          file_url: filePath,
          processing_status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Trigger document processing in background
      if (docData) {
        supabase.functions.invoke('process-brand-document', {
          body: { documentId: docData.id }
        });
      }

      setUploadComplete(true);

      toast({
        title: "Document Uploaded!",
        description: "Processing in background. Let's create your first content!",
      });

      // Auto-redirect to Create after 2 seconds
      setTimeout(() => {
        onComplete();
      }, 2000);

    } catch (error) {
      logger.error("Error uploading document:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload document.",
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFilesAdded(files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesAdded(e.target.files);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onSkip()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-center mb-2">
            Add Your Brand Knowledge
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Upload one document to train the AI on your brand voice
          </DialogDescription>
        </DialogHeader>

        <OnboardingProgressBar currentStep={2} />

        {uploadComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <div className="h-20 w-20 rounded-full bg-brass/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="h-10 w-10 text-brass" />
            </div>
            <h3 className="font-serif text-xl text-ink mb-2">Upload Complete!</h3>
            <p className="text-charcoal/70">Redirecting you to create your first content...</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer",
                isDragging
                  ? "border-brass bg-brass/5 scale-[1.02]"
                  : "border-charcoal/30 hover:border-brass/50 hover:bg-vellum/50"
              )}
              onClick={() => document.getElementById('onboarding-file-input')?.click()}
            >
              <input
                id="onboarding-file-input"
                type="file"
                accept="application/pdf,.txt,.md,text/plain,text/markdown"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {selectedFile ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  <div className="h-16 w-16 rounded-full bg-brass/10 flex items-center justify-center mx-auto">
                    <FileText className="h-8 w-8 text-brass" />
                  </div>
                  <div>
                    <p className="font-medium text-ink">{selectedFile.name}</p>
                    <p className="text-sm text-charcoal/70">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                    }}
                    variant="ghost"
                    size="sm"
                    className="text-charcoal"
                  >
                    Choose Different File
                  </Button>
                </motion.div>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-full bg-brass/10 flex items-center justify-center mx-auto mb-4">
                    <Upload className="h-8 w-8 text-brass" />
                  </div>
                  <h3 className="font-serif text-lg text-ink mb-2">
                    Drop your document here
                  </h3>
                  <p className="text-sm text-charcoal/70 mb-4">
                    or click to browse (PDF, TXT, or Markdown)
                  </p>
                  <div className="text-xs text-charcoal/60 space-y-1">
                    <p>✦ Brand guidelines</p>
                    <p>✦ Sample blog post</p>
                    <p>✦ Any PDF that represents your brand voice</p>
                  </div>
                </>
              )}
            </div>

            {/* Upload Button */}
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              className="w-full bg-brass text-ink hover:bg-antique-gold shadow-level-1 hover:shadow-level-2 transition-all"
              size="lg"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Continue to Create"
              )}
            </Button>

            {/* Skip Button */}
            <Button
              onClick={onSkip}
              variant="ghost"
              className="w-full text-charcoal/70 hover:text-charcoal"
            >
              Skip for Now - I'll Add This Later
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
