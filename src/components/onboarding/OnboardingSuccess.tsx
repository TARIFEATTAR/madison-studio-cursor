import { useState, useEffect } from "react";
import { Check, Sparkles, ArrowRight, BookOpen, Loader2, Video, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoHelpTrigger } from "@/components/help/VideoHelpTrigger";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { pdf } from "@react-pdf/renderer";
import { BrandBookPDF } from "@/components/pdf/BrandBookPDF";

interface OnboardingSuccessProps {
  brandData: any;
  onComplete: (destination: string) => void;
}

export function OnboardingSuccess({ brandData, onComplete }: OnboardingSuccessProps) {
  const [sampleContent, setSampleContent] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsGeneratingSample(true);
      try {
        // Fetch any brand knowledge from website scrape
        const { data: knowledgeData } = await supabase
          .from('brand_knowledge')
          .select('content')
          .eq('organization_id', brandData.organizationId)
          .eq('knowledge_type', 'website_scrape')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (knowledgeData?.content) {
          setScrapedData(knowledgeData.content);
        }

        let enhancedPrompt = `Write a 100-word brand introduction for ${brandData.brandName}`;
        
        if (brandData.industry) {
          enhancedPrompt += `, a ${brandData.industry} brand`;
        }

        // If we have website scrape data, use it to inform the generation
        if (knowledgeData?.content && typeof knowledgeData.content === 'object') {
          const analysis = knowledgeData.content as any;
          if (Array.isArray(analysis.tone) && analysis.tone.length > 0) {
            enhancedPrompt += `. Tone should be: ${analysis.tone.join(', ')}`;
          }
          if (Array.isArray(analysis.brandValues) && analysis.brandValues.length > 0) {
            enhancedPrompt += `. Core values: ${analysis.brandValues.join(', ')}`;
          }
        }

        enhancedPrompt += '. Focus on brand essence and what makes them unique. Keep it elegant and concise.';

        const { data } = await supabase.functions.invoke('generate-with-claude', {
          body: {
            prompt: enhancedPrompt,
            organizationId: brandData.organizationId,
            mode: "generate",
            styleOverlay: "brand-voice"
          }
        });
        if (data?.generatedContent) setSampleContent(data.generatedContent);
      } catch (error) {
        logger.error('Sample generation error:', error);
      } finally {
        setIsGeneratingSample(false);
      }
    };
    if (brandData.organizationId) fetchData();
  }, [brandData]);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      console.log('Starting PDF generation...');
      console.log('Brand name:', brandData.brandName);
      console.log('Brand data:', scrapedData);
      
      const doc = <BrandBookPDF brandName={brandData.brandName} brandData={scrapedData || {}} />;
      
      // Generate PDF - try toBlob first, fallback to buffer
      console.log('Generating PDF blob...');
      let blob: Blob;
      
      try {
        blob = await pdf(doc).toBlob();
      } catch (blobError) {
        console.warn('toBlob failed, trying toBuffer:', blobError);
        // Fallback: use toBuffer and convert to blob
        const buffer = await pdf(doc).toBuffer();
        blob = new Blob([buffer], { type: 'application/pdf' });
      }
      
      if (!blob || blob.size === 0) {
        throw new Error('PDF blob is empty or invalid');
      }
      
      console.log('PDF blob generated successfully, size:', blob.size, 'bytes');
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${brandData.brandName.replace(/\s+/g, '_')}_Brand_Audit.pdf`;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Cleanup after a short delay
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('PDF download initiated successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      logger.error('PDF generation error:', error);
      
      // Show more detailed error message
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const fullError = error instanceof Error ? error.stack : String(error);
      console.error('Full error details:', fullError);
      
      alert(`Failed to generate PDF: ${errorMessage}\n\nPlease check the browser console for more details.`);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brass/5 via-background to-gold/5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brass/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brass to-gold/80 mb-6 animate-zoom-in">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-serif text-5xl text-foreground mb-4">You're All Set!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to Madison, <strong>{brandData.brandName}</strong>! Your brand intelligence platform is ready to create content that truly reflects your voice.
          </p>
        </div>

        {/* DOWNLOAD AUDIT BUTTON - HERO PLACEMENT */}
        <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
          <Button 
            onClick={handleDownloadPDF}
            disabled={isGeneratingPDF}
            className="bg-white border-2 border-brass text-brass hover:bg-brass hover:text-white h-12 px-8 text-base font-medium shadow-lg shadow-brass/10 transition-all hover:shadow-brass/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
            {isGeneratingPDF ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Audit...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download Initial Brand Audit (PDF)
                  </>
                )}
              </Button>
          
          {/* Living Report Link */}
          {brandData.organizationId && (
            <a
              href={`/reports/${encodeURIComponent(brandData.brandName || 'your-brand')}?scanId=latest`}
              className="text-sm text-brass hover:text-brass/80 underline"
            >
              View Living Report →
            </a>
          )}
        </div>

        {/* What We've Set Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {brandData.brandDNA && (
            <div className="p-6 rounded-lg border-2 border-brass/30 bg-gradient-to-br from-brass/5 to-transparent">
              <div className="flex items-center gap-3 mb-3">
                <Check className="w-4 h-4 text-brass" />
                <h3 className="font-semibold text-foreground">Brand DNA Extracted</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Logo, colors, fonts, and visual style captured
              </p>
            </div>
          )}

          <div className="p-6 rounded-lg border border-border/40 bg-card">
            <div className="flex items-center gap-3 mb-3">
              {brandData.uploadContent ? (
                <Check className="w-4 h-4 text-brass" />
              ) : (
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: brandData.primaryColor || '#B8956A' }} />
              )}
              <h3 className="font-semibold text-foreground">Brand Identity</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {brandData.brandName}'s unique voice and style
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-card">
            <div className="flex items-center gap-3 mb-3">
              {brandData.uploadContent && <Check className="w-4 h-4 text-brass" />}
              <h3 className="font-semibold text-foreground">Brand Knowledge</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {brandData.uploadContent ? "AI trained on your brand voice" : "Ready to add documents"}
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Content Library</h3>
            <p className="text-sm text-muted-foreground">
              Ready to store your content
            </p>
          </div>
        </div>

        {/* Quick Start Video */}
        <div className="mb-12 p-6 rounded-lg border-2 border-brass/30 bg-gradient-to-br from-brass/5 to-transparent">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brass to-gold/80 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Welcome to Madison</h3>
              <p className="text-sm text-muted-foreground">4-minute overview to get you started</p>
            </div>
          </div>
          <VideoHelpTrigger 
            videoId="welcome-to-madison" 
            variant="button"
            className="w-full"
          />
        </div>

        {/* Sample Content Preview */}
        <div className="mb-12 p-8 rounded-lg border border-border/40 bg-card paper-texture">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="secondary" className="bg-brass/10 text-brass">
              {isGeneratingSample ? "Generating Sample..." : "Sample Output"}
            </Badge>
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-3">
            {brandData.brandName}
          </h2>
          
          {isGeneratingSample ? (
            <div className="flex items-center gap-2 py-4 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin text-brass" />
              <span className="text-sm">Generating sample content with your brand voice...</span>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {sampleContent || `Your brand's story begins here. With Madison's AI-powered platform, you'll create content that captures the essence of ${brandData.brandName}, maintaining consistency across every channel.`}
              </p>
              <p className="text-xs text-muted-foreground">
                {sampleContent ? `Generated using ${brandData.brandName}'s brand guidelines and voice` : 'Sample content'}
              </p>
            </>
          )}
        </div>

        {/* Quick Tips */}
        <div className="mb-12 p-6 rounded-lg border border-border/40 bg-card/50">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            Quick Tips to Get Started
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-brass">•</span>
              <span>Visit <strong>The Editorial Desk</strong> to create your first piece of content with AI assistance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brass">•</span>
              <span>Use <strong>The Syndicate</strong> to repurpose content across multiple channels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brass">•</span>
              <span>Schedule posts in <strong>The Planner</strong> to maintain consistent publishing</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => onComplete('/create')}
            className="flex-1 h-14 bg-gradient-to-r from-brass to-gold text-white hover:opacity-90 text-base"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Create Your First Content
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            onClick={() => onComplete('/')}
            variant="outline"
            className="flex-1 h-14 text-base"
            size="lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
