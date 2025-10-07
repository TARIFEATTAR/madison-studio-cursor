import { useState, useCallback } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle, FileUp } from "lucide-react";
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
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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

  const handleFileUpload = async (files: FileList | File[]) => {
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

    setUploadedFiles(pdfFiles);
    setIsProcessing(true);
    setUploadStatus("processing");

    try {
      for (const file of pdfFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('organizationId', organizationId);

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        // Insert document record
        const { error: insertError } = await supabase
          .from('brand_documents')
          .insert({
            organization_id: organizationId,
            uploaded_by: user.id,
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            processing_status: 'pending',
          });

        if (insertError) throw insertError;
      }

      setUploadStatus("success");
      toast({
        title: "Documents Uploaded",
        description: `Successfully uploaded ${pdfFiles.length} document${pdfFiles.length > 1 ? 's' : ''}.`,
      });

      setTimeout(() => {
        setUploadedFiles([]);
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
      handleFileUpload(files);
    }
  }, [organizationId]);

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
      handleFileUpload(e.target.files);
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
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-sm font-medium text-foreground">Processing documents...</p>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {isDragging ? 'Drop files here' : 'Drag & drop PDFs here'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          or click to browse
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {uploadedFiles.length > 0 && !isProcessing && (
                  <div className="mt-4 text-left">
                    <p className="text-xs font-medium text-foreground mb-2">Selected files:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {uploadedFiles.map((file, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <FileText className="h-3 w-3" />
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {uploadStatus === "success" && (
                <div className="flex items-center gap-2 text-sm text-forest-ink bg-forest-ink/10 p-3 rounded-md border border-forest-ink/20">
                  <CheckCircle2 className="h-4 w-4" />
                  Documents uploaded successfully!
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
