import { useState } from "react";
import { X, Upload, Globe, FileText, ArrowRight, ArrowLeft, Check } from "lucide-react";
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
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
    }
  };

  const handleContinue = async () => {
    if (!isValid()) return;

    setIsProcessing(true);

    try {
      // Get organization ID
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('created_by', user?.id)
        .single();

      if (!org) {
        throw new Error('Organization not found');
      }

      let uploadContent = "";

      if (selectedMethod === "pdf" && uploadedFile) {
        // Upload file to Supabase Storage
        const fileName = `${Date.now()}-${uploadedFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('brand-documents')
          .upload(`${org.id}/${fileName}`, uploadedFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('brand-documents')
          .getPublicUrl(uploadData.path);

        // Create document record
        const { error: docError } = await supabase
          .from('brand_documents')
          .insert({
            organization_id: org.id,
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
              organizationId: org.id
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
            organization_id: org.id,
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
      console.error('Error processing brand upload:', error);
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
        <p className="text-sm text-amber-600">
          ⚠️ Add more details for better AI understanding ({length}/200 characters)
        </p>
      );
    }
    return (
      <p className="text-sm text-green-600 flex items-center gap-1">
        <Check className="w-4 h-4" />
        Great! This gives us enough context ({length} characters)
      </p>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/20">
        <div className="flex items-center gap-3">
          <img src={madisonLogo} alt="MADISON" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <VideoHelpTrigger 
            videoId="understanding-brand-guidelines" 
            variant="button" 
          />
          <button
            onClick={onSkip}
            className="p-2 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <OnboardingProgressBar currentStep={2} />

          <div className="mt-12 text-center mb-12">
            <h1 className="font-serif text-4xl text-foreground mb-3">Brand Guidelines</h1>
            <p className="text-lg text-muted-foreground">
              Help our AI understand your brand's unique voice
            </p>
            <p className="text-sm text-muted-foreground mt-4 max-w-2xl mx-auto">
              🧠 <strong>Why this matters:</strong> Our AI will learn your brand's unique voice, tone, and style to generate content that sounds authentically like you.
            </p>
          </div>

          {/* Upload Method Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <button
              onClick={() => setSelectedMethod("pdf")}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selectedMethod === "pdf"
                  ? "border-brass bg-brass/5"
                  : "border-border/40 hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brass to-gold/80 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <Badge variant="secondary" className="bg-gradient-to-r from-brass to-gold text-white">
                  Recommended
                </Badge>
              </div>
              <h3 className="font-semibold text-foreground mb-2">Upload PDF</h3>
              <p className="text-sm text-muted-foreground">
                Drag & drop your brand guidelines document
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod("website")}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selectedMethod === "website"
                  ? "border-brass bg-brass/5"
                  : "border-border/40 hover:border-border"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brass to-gold/80 flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Scrape Website</h3>
              <p className="text-sm text-muted-foreground">
                We'll analyze your website for brand voice
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod("manual")}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                selectedMethod === "manual"
                  ? "border-brass bg-brass/5"
                  : "border-border/40 hover:border-border"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brass to-gold/80 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Manual Entry</h3>
              <p className="text-sm text-muted-foreground">
                Type your brand guidelines directly
              </p>
            </button>
          </div>

          {/* Method-specific Input */}
          {selectedMethod === "pdf" && (
            <div className="mb-8">
              <label
                htmlFor="file-upload"
                className="block w-full p-12 border-2 border-dashed border-border/40 rounded-lg cursor-pointer hover:border-brass transition-colors text-center"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                {uploadedFile ? (
                  <div>
                    <p className="text-foreground font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-foreground font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-muted-foreground mt-1">PDF files only</p>
                  </div>
                )}
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {selectedMethod === "website" && (
            <div className="mb-8">
              <Input
                placeholder="https://yourbrand.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="h-12 text-base"
              />
              <p className="text-sm text-muted-foreground mt-2">
                We'll analyze your website's content, tone, and style to understand your brand voice
              </p>
            </div>
          )}

          {selectedMethod === "manual" && (
            <div className="mb-8">
              <Textarea
                placeholder="Describe your brand voice, tone, values, and style guidelines..."
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                rows={8}
                className="text-base resize-none"
              />
              <div className="mt-2">
                {getCharacterFeedback()}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="outline"
              className="h-12 px-6"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back
            </Button>

            <Button
              onClick={handleContinue}
              disabled={!isValid() || isProcessing}
              className="flex-1 h-12 bg-gradient-to-r from-brass to-gold text-white hover:opacity-90 text-base"
            >
              {isProcessing ? "Processing..." : "Continue"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
