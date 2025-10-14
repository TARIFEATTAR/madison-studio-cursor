import { useState, useCallback, useEffect } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle, FileUp, X, Download, Trash2, Zap, ArrowRight, Sparkles, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

interface BrandKnowledgeCenterProps {
  organizationId: string;
}

interface UploadedDocument {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
  processing_status: string;
  file_url: string;
}

export function BrandKnowledgeCenter({ organizationId }: BrandKnowledgeCenterProps) {
  const { toast } = useToast();
  const [selectedMethod, setSelectedMethod] = useState<"upload" | "url" | "manual" | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [showQuickStart, setShowQuickStart] = useState(true);
  
  // Uploaded documents state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

  // Auto-select upload method when files are staged
  useEffect(() => {
    if (stagedFiles.length > 0 && !selectedMethod) {
      setSelectedMethod("upload");
    }
  }, [stagedFiles.length, selectedMethod]);

  // Fetch uploaded documents
  useEffect(() => {
    fetchUploadedDocuments();
  }, [organizationId]);

  const fetchUploadedDocuments = async () => {
    setLoadingDocuments(true);
    try {
      const { data, error } = await supabase
        .from("brand_documents")
        .select("id, file_name, file_size, created_at, processing_status, file_url")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUploadedDocuments(data || []);
      console.log("📄 Fetched documents:", data?.length || 0);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUrlScrape = async () => {
    if (!websiteUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid website URL to scan.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadStatus("processing");

    try {
      const { data, error } = await supabase.functions.invoke("scrape-brand-website", {
        body: { url: websiteUrl, organizationId },
      });

      if (error) throw error;

      if (data?.success) {
        setUploadStatus("success");
        toast({
          title: "Website Scanned",
          description: "Brand voice and tone extracted successfully!",
        });
        setWebsiteUrl("");
      }
    } catch (error) {
      console.error("Error scraping website:", error);
      setUploadStatus("error");
      toast({
        title: "Scraping Failed",
        description: error instanceof Error ? error.message : "Failed to extract brand information.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManualVoice = async () => {
    if (!brandVoice.trim()) {
      toast({
        title: "Description Required",
        description: "Please describe your brand voice.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await supabase.from("brand_knowledge").insert({
        organization_id: organizationId,
        knowledge_type: "voice_manual",
        content: { description: brandVoice },
      });

      if (error) throw error;

      toast({
        title: "Brand Voice Saved",
        description: "Your brand voice description has been stored.",
      });
      
      setBrandVoice("");
    } catch (error) {
      console.error("Error saving brand voice:", error);
      toast({
        title: "Save Failed",
        description: error instanceof Error ? error.message : "Failed to save brand voice.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const pdfFiles = fileArray.filter(file => file.type === 'application/pdf');

    if (pdfFiles.length === 0) {
      toast({
        title: "Invalid File Type",
        description: "Please upload PDF files only.",
        variant: "destructive",
      });
      return;
    }

    // Add new files to staging area, avoiding duplicates
    setStagedFiles(prev => {
      const existingNames = new Set(prev.map(f => f.name));
      const newFiles = pdfFiles.filter(f => !existingNames.has(f.name));
      
      if (newFiles.length < pdfFiles.length) {
        toast({
          title: "Duplicate Files Skipped",
          description: "Some files were already added.",
        });
      }
      
      console.log("📎 Files staged:", [...prev, ...newFiles].map(f => f.name));
      return [...prev, ...newFiles];
    });
  };

  const removeFileFromStaging = (index: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadStagedFiles = async () => {
    if (stagedFiles.length === 0) return;

    setIsProcessing(true);
    setUploadStatus("processing");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      for (const file of stagedFiles) {
        // Generate unique file path
        const timestamp = Date.now();
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `${organizationId}/${timestamp}_${sanitizedFileName}`;

        // Upload file to storage
        const { error: uploadError } = await supabase.storage
          .from('brand-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Storage upload error:', uploadError);
          throw uploadError;
        }

        // Insert document record with file URL
        const { data: docData, error: insertError } = await supabase
          .from('brand_documents')
          .insert({
            organization_id: organizationId,
            uploaded_by: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: filePath,
            processing_status: 'pending',
          })
          .select()
          .single();

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw insertError;
        }

        // Trigger document processing in background
        if (docData) {
          const { error: invokeError } = await supabase.functions.invoke('process-brand-document', {
            body: { documentId: docData.id }
          });
          
          if (invokeError) {
            console.error('Edge function invocation failed:', invokeError);
            
            // Mark as failed immediately so user can retry
            await supabase
              .from('brand_documents')
              .update({ 
                processing_status: 'failed',
                content_preview: `Invocation error: ${invokeError.message}`
              })
              .eq('id', docData.id);
            
            toast({
              title: "Processing Failed",
              description: `Failed to start processing ${file.name}. Please retry.`,
              variant: "destructive"
            });
          } else {
            console.log('Processing started for', file.name);
          }
        }
      }

      setUploadStatus("success");
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded ${stagedFiles.length} document${stagedFiles.length > 1 ? 's' : ''}.`,
      });

      console.log("✅ Documents uploaded successfully:", stagedFiles.map(f => f.name));
      
      // Clear staging area and refresh list
      setStagedFiles([]);
      await fetchUploadedDocuments();
    } catch (error) {
      console.error("Error uploading documents:", error);
      setUploadStatus("error");
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload documents.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadDocument = async (doc: UploadedDocument) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
        return;
      }

      const { data, error } = await supabase.storage
        .from("brand-documents")
        .createSignedUrl(doc.file_url, 60);

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
      toast({ title: "Success", description: "Document opened in new tab" });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleRetryProcessing = async (doc: UploadedDocument) => {
    try {
      setIsProcessing(true);
      
      // Update status to processing
      await supabase
        .from('brand_documents')
        .update({ processing_status: 'processing' })
        .eq('id', doc.id);

      // Trigger processing
      const { error } = await supabase.functions.invoke('process-brand-document', {
        body: { documentId: doc.id }
      });

      if (error) throw error;

      toast({
        title: "Processing Started",
        description: `Retrying processing for "${doc.file_name}"`,
      });

      // Refresh after a short delay
      setTimeout(() => {
        fetchUploadedDocuments();
      }, 2000);
    } catch (error: any) {
      console.error('Retry error:', error);
      toast({
        title: "Retry Failed",
        description: error.message || "Failed to retry processing",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteDocument = async (doc: UploadedDocument) => {
    if (!confirm(`Delete "${doc.file_name}"? This cannot be undone.`)) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "You must be logged in", variant: "destructive" });
        return;
      }

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("brand-documents")
        .remove([doc.file_url]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("brand_documents")
        .delete()
        .eq("id", doc.id);

      if (dbError) throw dbError;

      toast({ title: "Success", description: "Document deleted successfully" });
      await fetchUploadedDocuments();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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

  const handleQuickStart = () => {
    setShowQuickStart(false);
    setSelectedMethod("upload");
  };

  const handleSkipForNow = () => {
    toast({
      title: "No problem!",
      description: "You can add brand documents anytime from Settings.",
    });
  };

  return (
    <Card className="border-border/20 shadow-level-2 hover:shadow-level-3 transition-shadow">
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-brass" />
          Brand Knowledge Center
        </CardTitle>
        <CardDescription className="text-charcoal/70">
          Train the AI to understand your brand's unique voice and style
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-brass text-parchment flex items-center justify-center font-serif text-sm shadow-level-1">
              1
            </div>
            <span className="text-xs text-charcoal font-medium hidden sm:inline">Choose Method</span>
          </div>
          <div className={`h-[2px] w-12 transition-colors ${selectedMethod ? 'bg-brass' : 'bg-charcoal/20'}`} />
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-serif text-sm transition-all ${
              selectedMethod 
                ? 'bg-brass text-parchment shadow-level-1' 
                : 'border-2 border-charcoal/30 text-charcoal/50'
            }`}>
              2
            </div>
            <span className={`text-xs font-medium hidden sm:inline transition-colors ${
              selectedMethod ? 'text-charcoal' : 'text-charcoal/50'
            }`}>Add Content</span>
          </div>
          <div className={`h-[2px] w-12 transition-colors ${uploadStatus === 'success' ? 'bg-brass' : 'bg-charcoal/20'}`} />
          <div className="flex items-center gap-2">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-serif text-sm transition-all ${
              uploadStatus === 'success'
                ? 'bg-brass text-parchment shadow-level-1'
                : 'border-2 border-charcoal/30 text-charcoal/50'
            }`}>
              3
            </div>
            <span className={`text-xs font-medium hidden sm:inline transition-colors ${
              uploadStatus === 'success' ? 'text-charcoal' : 'text-charcoal/50'
            }`}>Complete</span>
          </div>
        </div>

        {/* Quick Start Option */}
        {showQuickStart && !selectedMethod && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="mb-6 bg-gradient-to-br from-brass/5 to-transparent border-2 border-brass/30 shadow-level-1 hover:shadow-level-2 transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-brass text-parchment flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-ink mb-1">Quick Start (30 seconds)</h3>
                    <p className="text-sm text-charcoal/70 mb-4">Drop one document and you're done — the fastest way to get started</p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleQuickStart}
                        className="bg-brass text-ink hover:bg-antique-gold shadow-level-1 hover:shadow-level-2 hover:-translate-y-0.5 transition-all"
                      >
                        Start Now
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setShowQuickStart(false)}
                        className="text-charcoal hover:text-ink"
                      >
                        See All Options
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Visual Card System - Replace Tabs */}
        {!selectedMethod && !showQuickStart && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Upload PDFs Card */}
            <Card 
              onClick={() => setSelectedMethod("upload")}
              className="cursor-pointer border-2 border-transparent hover:border-brass transition-all duration-300 hover:shadow-level-3 group"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4 p-4 rounded-full bg-brass/10 w-16 h-16 mx-auto flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                  <FileUp className="h-8 w-8 text-brass" />
                </div>
                <h3 className="font-serif text-xl text-ink mb-2">Upload PDFs</h3>
                <p className="text-sm text-charcoal/70 mb-3">Best for detailed documentation</p>
                <Badge className="bg-brass/10 text-brass border-brass/30 hover:bg-brass/20">Recommended</Badge>
                
                {/* Contextual Info */}
                <div className="mt-4 p-4 bg-vellum/50 rounded-md border border-charcoal/10 text-left">
                  <p className="text-xs font-medium text-ink mb-2 flex items-center gap-2">
                    <span className="text-brass">✦</span> Best For:
                  </p>
                  <ul className="text-xs text-charcoal/70 space-y-1">
                    <li>• Brand style guides</li>
                    <li>• Voice & tone docs</li>
                    <li>• Product catalogs</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Website Scan Card */}
            <Card 
              onClick={() => setSelectedMethod("url")}
              className="cursor-pointer border-2 border-transparent hover:border-brass transition-all duration-300 hover:shadow-level-3 group"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4 p-4 rounded-full bg-brass/10 w-16 h-16 mx-auto flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                  <LinkIcon className="h-8 w-8 text-brass" />
                </div>
                <h3 className="font-serif text-xl text-ink mb-2">Website Scan</h3>
                <p className="text-sm text-charcoal/70 mb-3">Fastest option</p>
                <Badge className="bg-brass/10 text-brass border-brass/30 hover:bg-brass/20">Quick</Badge>
                
                {/* Contextual Info */}
                <div className="mt-4 p-4 bg-vellum/50 rounded-md border border-charcoal/10 text-left">
                  <p className="text-xs font-medium text-ink mb-2 flex items-center gap-2">
                    <span className="text-brass">✦</span> We Extract:
                  </p>
                  <ul className="text-xs text-charcoal/70 space-y-1">
                    <li>• Voice & tone patterns</li>
                    <li>• Common vocabulary</li>
                    <li>• Writing style</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Manual Entry Card */}
            <Card 
              onClick={() => setSelectedMethod("manual")}
              className="cursor-pointer border-2 border-transparent hover:border-brass transition-all duration-300 hover:shadow-level-3 group"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4 p-4 rounded-full bg-brass/10 w-16 h-16 mx-auto flex items-center justify-center group-hover:bg-brass/20 transition-colors">
                  <FileText className="h-8 w-8 text-brass" />
                </div>
                <h3 className="font-serif text-xl text-ink mb-2">Manual Entry</h3>
                <p className="text-sm text-charcoal/70 mb-3">Most flexible</p>
                <Badge className="bg-brass/10 text-brass border-brass/30 hover:bg-brass/20">Custom</Badge>
                
                {/* Contextual Info */}
                <div className="mt-4 p-4 bg-vellum/50 rounded-md border border-charcoal/10 text-left">
                  <p className="text-xs font-medium text-ink mb-2 flex items-center gap-2">
                    <span className="text-brass">✦</span> Include:
                  </p>
                  <ul className="text-xs text-charcoal/70 space-y-1">
                    <li>• Tone of voice</li>
                    <li>• Key vocabulary</li>
                    <li>• Brand personality</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Upload Method Content */}
        {selectedMethod === "upload" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label className="text-foreground">Brand Documents</Label>
              <p className="text-xs text-muted-foreground">
                Upload PDFs containing brand guidelines, style guides, or documentation.
              </p>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`
                  relative border-2 border-dashed rounded-lg p-8 text-center transition-all
                  ${isDragging 
                    ? 'border-primary bg-primary/5 scale-[1.02]' 
                    : 'border-border/40 bg-muted/20 hover:border-primary/50 hover:bg-muted/30'
                  }
                  ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
                `}
              >
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  onChange={handleFileInputChange}
                  disabled={isProcessing}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center gap-3">
                  <FileUp className="h-12 w-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {isDragging ? 'Drop files here' : 'Drag & drop PDFs here'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      or click to browse • Max 20MB per file
                    </p>
                  </div>
                </div>
              </div>

              {/* Staging Area */}
              {stagedFiles.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground">
                      Files Ready to Upload ({stagedFiles.length})
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStagedFiles([])}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </Button>
                  </div>
                  
                  <div className="space-y-2 max-h-[200px] overflow-y-auto border border-border/40 rounded-md p-3 bg-muted/10">
                    {stagedFiles.map((file, idx) => (
                      <div 
                        key={idx}
                        className="flex items-center justify-between gap-3 p-2 rounded bg-card border border-border/30 hover:border-border/60 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFileFromStaging(idx)}
                          disabled={isProcessing}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive flex-shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUploadStagedFiles}
                    disabled={isProcessing}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading {stagedFiles.length} file{stagedFiles.length > 1 ? 's' : ''}...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload {stagedFiles.length} Document{stagedFiles.length > 1 ? 's' : ''}
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Enhanced Success State */}
              {uploadStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-lg border border-forest-ink/20 bg-gradient-to-br from-forest-ink/5 to-transparent p-6"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="h-12 w-12 rounded-full bg-forest-ink/10 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-6 w-6 text-forest-ink" />
                    </motion.div>
                    <div>
                      <h4 className="font-serif text-lg text-ink mb-1">Documents Secured</h4>
                      <p className="text-sm text-charcoal/70">Your brand knowledge is now preserved</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-forest-ink/5 to-transparent animate-shimmer pointer-events-none" />
                </motion.div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-deep-burgundy bg-deep-burgundy/10 p-3 rounded-md border border-deep-burgundy/20">
                  <AlertCircle className="h-4 w-4" />
                  Failed to upload documents. Please try again.
                </div>
              )}

              {/* Skip Button */}
              <Button 
                variant="ghost" 
                onClick={handleSkipForNow}
                className="w-full mt-4 text-charcoal/60 hover:text-charcoal text-sm"
              >
                I'll add this later
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* URL Method Content */}
        {selectedMethod === "url" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="websiteUrl" className="text-foreground">
                Website URL
              </Label>
              <p className="text-xs text-muted-foreground">
                We'll analyze your website to extract brand voice, tone, and vocabulary patterns.
              </p>
              <div className="flex gap-2">
                <Input
                  id="websiteUrl"
                  type="url"
                  placeholder="https://tarifeattar.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1 bg-input border-border/40"
                />
                <Button
                  onClick={handleUrlScrape}
                  disabled={isProcessing || !websiteUrl.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Scan
                    </>
                  )}
                </Button>
              </div>

              {/* Enhanced Processing State */}
              {isProcessing && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-brass/20" />
                    <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-brass border-t-transparent animate-spin" style={{ animationDuration: '1s' }} />
                  </div>
                  <p className="font-serif text-sm text-charcoal">Analyzing your website...</p>
                </div>
              )}

              {/* Enhanced Success State */}
              {uploadStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative overflow-hidden rounded-lg border border-forest-ink/20 bg-gradient-to-br from-forest-ink/5 to-transparent p-6"
                >
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className="h-12 w-12 rounded-full bg-forest-ink/10 flex items-center justify-center"
                    >
                      <CheckCircle2 className="h-6 w-6 text-forest-ink" />
                    </motion.div>
                    <div>
                      <h4 className="font-serif text-lg text-ink mb-1">Brand Knowledge Extracted</h4>
                      <p className="text-sm text-charcoal/70">Your website has been analyzed successfully</p>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-forest-ink/5 to-transparent animate-shimmer pointer-events-none" />
                </motion.div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-deep-burgundy bg-deep-burgundy/10 p-3 rounded-md border border-deep-burgundy/20">
                  <AlertCircle className="h-4 w-4" />
                  Failed to scan website. Please try again.
                </div>
              )}

              {/* Skip Button */}
              <Button 
                variant="ghost" 
                onClick={handleSkipForNow}
                className="w-full mt-4 text-charcoal/60 hover:text-charcoal text-sm"
              >
                I'll add this later
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Manual Method Content */}
        {selectedMethod === "manual" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="brandVoice" className="text-foreground">
                Brand Voice Description
              </Label>
              <p className="text-xs text-muted-foreground">
                Describe your brand's tone, personality, and preferred writing style.
              </p>
              <Textarea
                id="brandVoice"
                placeholder="Our brand voice is warm, elegant, and poetic. We use sensory language and evocative descriptions..."
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                disabled={isProcessing}
                rows={6}
                className="bg-input border-border/40 resize-none"
              />
              <Button
                onClick={handleManualVoice}
                disabled={isProcessing || !brandVoice.trim()}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Save Brand Voice
                  </>
                )}
              </Button>

              {/* Skip Button */}
              <Button 
                variant="ghost" 
                onClick={handleSkipForNow}
                className="w-full mt-4 text-charcoal/60 hover:text-charcoal text-sm"
              >
                I'll add this later
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* Back to Options Button */}
        {selectedMethod && (
          <Button 
            variant="outline"
            onClick={() => setSelectedMethod(null)}
            className="mt-4"
          >
            ← Back to Options
          </Button>
        )}

        {/* Reassurance Message */}
        {!selectedMethod && (
          <p className="text-xs text-center text-charcoal/50 mt-6">
            Don't worry — you can always add brand documents later from Settings
          </p>
        )}

        {/* Uploaded Documents List */}
        <div className="mt-8 pt-6 border-t border-border/20">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Uploaded Documents</h3>
          
          {loadingDocuments ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : uploadedDocuments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No documents uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {uploadedDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-border/30 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-foreground">{doc.file_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(doc.file_size)} • {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    {/* Processing Status Badge */}
                    {doc.processing_status === 'pending' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 capitalize flex-shrink-0 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Pending
                      </span>
                    )}
                    {doc.processing_status === 'processing' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 capitalize flex-shrink-0 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Processing
                      </span>
                    )}
                    {doc.processing_status === 'completed' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-700 dark:text-green-300 capitalize flex-shrink-0 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Ready
                      </span>
                    )}
                    {doc.processing_status === 'failed' && (
                      <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-700 dark:text-red-300 capitalize flex-shrink-0 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {/* Retry button for pending/failed documents */}
                    {(doc.processing_status === 'pending' || doc.processing_status === 'failed') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetryProcessing(doc)}
                        disabled={isProcessing}
                        className="hover:bg-accent text-brass hover:text-brass"
                        title="Retry processing"
                      >
                        <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(doc)}
                      className="hover:bg-accent"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
