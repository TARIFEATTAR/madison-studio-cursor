import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface WorksheetUploadProps {
  onUploadComplete: (uploadId: string) => void;
  organizationId: string;
}

export function WorksheetUpload({ onUploadComplete, organizationId }: WorksheetUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF, JPG, or PNG file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (20MB limit)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 20MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    setError(null);
    setUploading(true);
    setProgress(10);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setProgress(30);

      // Upload to storage
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const filePath = `${organizationId}/${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('worksheet-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('worksheet-uploads')
        .getPublicUrl(filePath);

      setProgress(60);

      // Create database record
      const { data: uploadRecord, error: dbError } = await supabase
        .from('worksheet_uploads')
        .insert({
          organization_id: organizationId,
          uploaded_by: user.id,
          file_url: filePath,
          file_name: file.name,
          file_size: file.size,
          processing_status: 'pending'
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setProgress(70);
      setUploading(false);
      setProcessing(true);

      // Call edge function to process worksheet
      const { data: parseData, error: parseError } = await supabase.functions.invoke('parse-content-worksheet', {
        body: {
          uploadId: uploadRecord.id,
          fileUrl: filePath,
          organizationId
        }
      });

      if (parseError) {
        // Extract detailed error message from response
        let errorMessage = parseError.message || "Failed to process worksheet";
        
        // Check error context for response body (might be a ReadableStream)
        if (parseError.context?.body) {
          try {
            // If it's a ReadableStream, read it
            if (parseError.context.body instanceof ReadableStream) {
              const reader = parseError.context.body.getReader();
              const decoder = new TextDecoder();
              let chunks = '';
              
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks += decoder.decode(value, { stream: true });
              }
              
              // Parse the JSON response
              try {
                const parsed = JSON.parse(chunks);
                if (parsed.error) {
                  errorMessage = parsed.error;
                } else if (parsed.message) {
                  errorMessage = parsed.message;
                }
              } catch (e) {
                // If not JSON, use the raw text
                if (chunks.length < 500) {
                  errorMessage = chunks;
                }
              }
            } else if (typeof parseError.context.body === 'string') {
              try {
                const parsed = JSON.parse(parseError.context.body);
                if (parsed.error) {
                  errorMessage = parsed.error;
                } else if (parsed.message) {
                  errorMessage = parsed.message;
                }
              } catch (e) {
                if (parseError.context.body.length < 500) {
                  errorMessage = parseError.context.body;
                }
              }
            } else if (parseError.context.body.error) {
              errorMessage = parseError.context.body.error;
            } else if (parseError.context.body.message) {
              errorMessage = parseError.context.body.message;
            }
          } catch (e) {
            console.error("Error extracting error message:", e);
          }
        }
        
        throw new Error(errorMessage);
      }

      setProgress(100);
      setProcessing(false);

      toast({
        title: "Worksheet uploaded!",
        description: "Extracting data from your worksheet..."
      });

      // Notify parent component
      onUploadComplete(uploadRecord.id);

    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again",
        variant: "destructive"
      });
      setUploading(false);
      setProcessing(false);
    }
  }, [organizationId, onUploadComplete, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    maxFiles: 1,
    disabled: uploading || processing
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive ? 'border-brass bg-brass/5' : 'border-warm-gray/30 hover:border-brass/50 hover:bg-brass/5'}
          ${(uploading || processing) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          {uploading || processing ? (
            <Loader2 className="w-12 h-12 text-brass animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-brass" />
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-ink-black mb-2">
              {isDragActive ? 'Drop your worksheet here' : 'Upload Your Completed Worksheet'}
            </h3>
            <p className="text-sm text-warm-gray mb-4">
              Drag & drop your worksheet here, or click to browse
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-warm-gray">
              <FileText className="w-4 h-4" />
              <span>Supports: PDF, JPG, PNG (max 20MB)</span>
            </div>
          </div>
        </div>
      </div>

      {uploadedFile && (
        <div className="flex items-center gap-3 p-4 bg-parchment-white rounded-lg border border-warm-gray/20">
          <FileText className="w-5 h-5 text-brass flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-ink-black truncate">
              {uploadedFile.name}
            </p>
            <p className="text-xs text-warm-gray">
              {(uploadedFile.size / 1024).toFixed(0)} KB
            </p>
          </div>
          {processing ? (
            <Loader2 className="w-5 h-5 text-brass animate-spin flex-shrink-0" />
          ) : error ? (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          )}
        </div>
      )}

      {(uploading || processing) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-warm-gray">
              {uploading ? 'Uploading...' : 'Processing worksheet...'}
            </span>
            <span className="text-brass font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 mb-1">Upload Error</p>
            <p className="text-xs text-red-600">{error}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setError(null);
              setUploadedFile(null);
              setProgress(0);
            }}
            className="text-xs"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
