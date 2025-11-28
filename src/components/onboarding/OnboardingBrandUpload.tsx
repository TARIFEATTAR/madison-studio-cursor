import { useState } from "react";
import { X, Upload, Globe, FileText, ArrowRight, ArrowLeft, Check, Lightbulb, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OnboardingProgressBar } from "./OnboardingProgressBar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { VideoHelpTrigger } from "@/components/help/VideoHelpTrigger";
import madisonLogo from "@/assets/madison-horizontal-logo.png";
import { getOrCreateOrganizationId } from "@/lib/organization";
import { logger } from "@/lib/logger";

interface OnboardingBrandUploadProps {
  onContinue: (data: any) => void;
  onBack: () => void;
  onSkip: () => void;
  brandData: any;
}

type UploadMethod = "pdf" | "website" | "manual" | null;

export function OnboardingBrandUpload({ onContinue, onBack, onSkip, brandData }: OnboardingBrandUploadProps) {
  const { user } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState<UploadMethod>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [manualText, setManualText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (
      file.type === "application/pdf" ||
      file.type === "text/plain" ||
      file.type === "text/markdown" ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.txt')
    )) {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF, TXT, or Markdown file",
        variant: "destructive"
      });
    }
  };

  const handleContinue = async () => {
    if (!isValid()) return;

    setIsProcessing(true);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const organizationId = await getOrCreateOrganizationId(user.id);

      let uploadContent = "";

      if (selectedMethod === "pdf" && uploadedFile) {
        // Upload file to Supabase Storage
        const fileName = `${Date.now()} -${uploadedFile.name} `;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-documents')
          .upload(`${organizationId}/${fileName}`, uploadedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('brand-documents')
          .getPublicUrl(uploadData.path);

        // Create document record
        const { error: docError } = await supabase
          .from('brand_documents')
          .insert({
            organization_id: organizationId,
            uploaded_by: user?.id,
            file_name: uploadedFile.name,
            file_type: 'pdf',
            file_url: publicUrl,
            file_size: uploadedFile.size,
            processing_status: 'pending'
          });

        if (docError) throw docError;

        uploadContent = uploadedFile.name;
      } else if (selectedMethod === "website") {
        const websiteUrlTrimmed = websiteUrl.trim();

        toast({
          title: "Processing website...",
          description: "Analyzing your brand's website for voice and style."
        });

        const { data: websiteData, error: websiteError } = await supabase.functions.invoke(
          'scrape-brand-website',
          {
            body: {
              url: websiteUrlTrimmed,
              organizationId
            }
          }
        );

        if (websiteError) throw websiteError;

        // Show success toast with what was extracted
        toast({
          title: "✓ Website analyzed successfully",
          description: "Brand voice, vocabulary, and writing style have been captured."
        });

        uploadContent = websiteUrlTrimmed;
      } else if (selectedMethod === "manual") {
        uploadContent = manualText;

        // Save manual entry directly to brand_knowledge
        const { error: knowledgeError } = await supabase
          .from('brand_knowledge')
          .insert({
            organization_id: organizationId,
            knowledge_type: 'brand_guidelines',
            content: { text: manualText }
          });

        if (knowledgeError) throw knowledgeError;
      }

      onContinue({
        uploadMethod: selectedMethod,
        uploadContent
      });
    } catch (error) {
      logger.error('Error processing brand upload:', error);
      toast({
        title: "Error",
        description: "Failed to process your brand guidelines. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isValid = () => {
    if (selectedMethod === "pdf") return !!uploadedFile;
    if (selectedMethod === "website") return websiteUrl.trim().length > 0;
    if (selectedMethod === "manual") return manualText.trim().length >= 200;
    return false;
  };

  const getCharacterFeedback = () => {
    const length = manualText.trim().length;
    if (length < 200) {
      return (
        <p className="text-xs text-amber-600 flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Add more details for better AI understanding ({length}/200 characters)
        </p>
      );
    }
    return (
      <p className="text-xs text-green-600 flex items-center gap-1">
        <Check className="w-3 h-3" />
        Great! This gives us enough context ({length} characters)
      </p>
    );
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#FDFBF7]">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 shrink-0 border-b border-border/10">
        <img src={madisonLogo} alt="MADISON" className="h-6 opacity-90" />
        <div className="flex items-center gap-4">
          <VideoHelpTrigger videoId="understanding-brand-guidelines" variant="link" />
          <button
            onClick={onSkip}
            className="text-charcoal/40 hover:text-charcoal transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-6 overflow-y-auto">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center space-y-4">
            <OnboardingProgressBar currentStep={2} />

            <div className="space-y-2">
              <h1 className="font-serif text-3xl text-ink-black">
                {brandData.brandDNA ? "Now let's go deeper" : "Brand Guidelines"}
              </h1>
              
              {brandData.brandDNA && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brass/5 border border-brass/20 mb-2">
                  <Check className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-medium text-charcoal/80">Visual DNA captured</span>
                </div>
              )}

              <p className="text-base text-charcoal/70 font-light max-w-lg mx-auto">
                {brandData.brandDNA
                  ? "Upload documents to teach Madison your unique brand voice and messaging."
                  : "Help our AI understand your brand's unique voice."}
              </p>
            </div>
          </div>

          {/* Upload Method Cards - More Compact */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setSelectedMethod("pdf")}
              className={`group relative p-4 rounded-xl border transition-all text-left ${selectedMethod === "pdf"
                ? "border-brass bg-white shadow-md shadow-brass/5"
                : "border-charcoal/10 bg-white/50 hover:border-brass/40 hover:bg-white"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${selectedMethod === "pdf" ? "bg-brass/10 text-brass" : "bg-charcoal/5 text-charcoal/60 group-hover:text-brass group-hover:bg-brass/5"} transition-colors`}>
                  <Upload className="w-5 h-5" />
                </div>
                <Badge variant="secondary" className="bg-green-600/90 text-white border-0 text-[10px] px-2 h-5">
                  Best
                </Badge>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Upload Files</h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                PDF, TXT, or Markdown files
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod("website")}
              className={`group relative p-4 rounded-xl border transition-all text-left ${selectedMethod === "website"
                ? "border-brass bg-white shadow-md shadow-brass/5"
                : "border-charcoal/10 bg-white/50 hover:border-brass/40 hover:bg-white"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${selectedMethod === "website" ? "bg-brass/10 text-brass" : "bg-charcoal/5 text-charcoal/60 group-hover:text-brass group-hover:bg-brass/5"} transition-colors`}>
                  <Globe className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Scrape Website</h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                Analyze website for brand voice
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod("manual")}
              className={`group relative p-4 rounded-xl border transition-all text-left ${selectedMethod === "manual"
                ? "border-brass bg-white shadow-md shadow-brass/5"
                : "border-charcoal/10 bg-white/50 hover:border-brass/40 hover:bg-white"
                }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${selectedMethod === "manual" ? "bg-brass/10 text-brass" : "bg-charcoal/5 text-charcoal/60 group-hover:text-brass group-hover:bg-brass/5"} transition-colors`}>
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-medium text-gray-900 mb-1">Manual Entry</h3>
              <p className="text-xs text-charcoal/60 leading-relaxed">
                Type guidelines directly
              </p>
            </button>
          </div>

          {/* Method-specific Input Area - Compact */}
          <div className="min-h-[140px]">
            {selectedMethod === "pdf" && (
              <label
                htmlFor="file-upload"
                className="block w-full p-8 border-2 border-dashed border-charcoal/10 rounded-xl cursor-pointer hover:border-brass/50 hover:bg-white transition-all text-center group bg-white/30"
              >
                <div className="w-10 h-10 rounded-full bg-charcoal/5 mx-auto mb-3 flex items-center justify-center group-hover:bg-brass/10 group-hover:text-brass transition-colors">
                  <Upload className="w-5 h-5 text-charcoal/40 group-hover:text-brass" />
                </div>
                {uploadedFile ? (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
                    <p className="text-xs text-charcoal/50 mt-0.5">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
                    <p className="text-xs text-charcoal/50 mt-0.5">PDF, TXT, or Markdown files</p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.txt,.md,application/pdf,text/plain,text/markdown"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}

            {selectedMethod === "website" && (
              <div className="bg-white p-1 rounded-xl border border-charcoal/10">
                <Input
                  placeholder="https://yourbrand.com"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="h-11 border-0 bg-transparent focus-visible:ring-0 text-base"
                />
              </div>
            )}

            {selectedMethod === "manual" && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Describe your brand voice, tone, values, and style guidelines..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={6}
                  className="resize-none bg-white border-charcoal/10 focus:border-brass/50 transition-colors"
                />
                {getCharacterFeedback()}
              </div>
            )}
            
            {!selectedMethod && (
              <div className="h-full flex items-center justify-center p-8 border-2 border-dashed border-transparent rounded-xl">
                <p className="text-sm text-charcoal/40 italic">Select an upload method above</p>
              </div>
            )}
          </div>

          {/* Action Buttons - Fixed at bottom or naturally flowing */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              onClick={onBack}
              variant="ghost"
              className="h-11 px-4 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <div className="flex-1" />

            <Button
              onClick={onSkip}
              variant="ghost"
              className="h-11 px-6 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5"
            >
              Skip for now
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!isValid() || isProcessing}
              variant="brass"
              className="h-11 px-8 min-w-[140px]"
            >
              {isProcessing ? "Processing..." : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
