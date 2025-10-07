import { useState, useCallback } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle, FileUp, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface BrandKnowledgeCenterProps {
  organizationId: string;
}

export function BrandKnowledgeCenter({ organizationId }: BrandKnowledgeCenterProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("url");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);

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
        
        // Reset after 3 seconds
        setTimeout(() => {
          setWebsiteUrl("");
          setUploadStatus("idle");
        }, 3000);
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
        const { error: insertError } = await supabase
          .from('brand_documents')
          .insert({
            organization_id: organizationId,
            uploaded_by: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            file_url: filePath,
            processing_status: 'uploaded',
          });

        if (insertError) {
          console.error('Database insert error:', insertError);
          throw insertError;
        }
      }

      setUploadStatus("success");
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded ${stagedFiles.length} document${stagedFiles.length > 1 ? 's' : ''}.`,
      });

      // Clear staging area after successful upload
      setStagedFiles([]);
      
      setTimeout(() => {
        setUploadStatus("idle");
      }, 3000);
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
    <Card className="border-border/20 shadow-level-2 hover:shadow-level-3 transition-shadow">
      <CardHeader>
        <CardTitle className="font-serif text-xl flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Brand Knowledge Center
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Train the AI to understand your brand's unique voice and style
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50">
            <TabsTrigger value="upload" className="data-[state=active]:bg-card">
              <FileUp className="h-4 w-4 mr-2" />
              Upload PDFs
            </TabsTrigger>
            <TabsTrigger value="url" className="data-[state=active]:bg-card">
              <LinkIcon className="h-4 w-4 mr-2" />
              Website URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-card">
              <FileText className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4 mt-4">
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

              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-forest-ink bg-forest-ink/10 p-3 rounded-md border border-forest-ink/20">
                  <CheckCircle2 className="h-4 w-4" />
                  Documents uploaded and stored successfully!
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  Failed to upload documents. Please try again.
                </div>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded-md border border-border/20">
              <p className="text-sm font-medium text-foreground mb-2">Supported documents:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Brand style guides (PDF)</li>
                <li>• Voice & tone documentation (PDF)</li>
                <li>• Collection-specific guidelines (PDF)</li>
                <li>• Product catalogs & descriptions (PDF)</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="url" className="space-y-4 mt-4">
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

              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-forest-ink bg-forest-ink/10 p-3 rounded-md border border-forest-ink/20">
                  <CheckCircle2 className="h-4 w-4" />
                  Brand knowledge extracted and saved!
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
                  <AlertCircle className="h-4 w-4" />
                  Failed to scan website. Please try again.
                </div>
              )}
            </div>

            <div className="bg-muted/30 p-4 rounded-md border border-border/20">
              <p className="text-sm font-medium text-foreground mb-2">What we extract:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Brand voice and tone patterns</li>
                <li>• Common vocabulary and phrases</li>
                <li>• Writing style and structure</li>
                <li>• Brand personality indicators</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="brandVoice" className="text-foreground">
                Brand Voice Description
              </Label>
              <p className="text-xs text-muted-foreground">
                Describe your brand's voice, tone, and personality in your own words.
              </p>
              <Textarea
                id="brandVoice"
                placeholder="Example: Our brand voice is warm, authentic, and educational. We avoid corporate jargon and speak directly to our customers with empathy. We use storytelling to convey the heritage and craftsmanship behind each product..."
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                disabled={isProcessing}
                className="min-h-[150px] bg-input border-border/40 resize-none"
              />
            </div>

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
                  <Upload className="mr-2 h-4 w-4" />
                  Save Brand Voice
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
