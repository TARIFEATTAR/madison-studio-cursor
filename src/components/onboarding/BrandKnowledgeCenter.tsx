import { useState } from "react";
import { Upload, Link as LinkIcon, FileText, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
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
          <TabsList className="grid w-full grid-cols-2 bg-muted/50">
            <TabsTrigger value="url" className="data-[state=active]:bg-card">
              <LinkIcon className="h-4 w-4 mr-2" />
              Website URL
            </TabsTrigger>
            <TabsTrigger value="manual" className="data-[state=active]:bg-card">
              <FileText className="h-4 w-4 mr-2" />
              Manual Entry
            </TabsTrigger>
          </TabsList>

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
