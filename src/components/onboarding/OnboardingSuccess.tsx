import { useState, useEffect } from "react";
import { Check, Sparkles, ArrowRight, BookOpen, Loader2, Video, Download, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoHelpTrigger } from "@/components/help/VideoHelpTrigger";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { pdf } from "@react-pdf/renderer";
import { BrandBookPDF } from "@/components/pdf/BrandBookPDF";
import { BrandSummaryPreview } from "./BrandSummaryPreview";
import { useToast } from "@/hooks/use-toast";
import { normalizeDomain } from "@/types/brandReport";

interface OnboardingSuccessProps {
  brandData: any;
  onComplete: (destination: string) => void;
}

export function OnboardingSuccess({ brandData, onComplete }: OnboardingSuccessProps) {
  const { toast } = useToast();
  const [sampleContent, setSampleContent] = useState<string | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [domain, setDomain] = useState<string | null>(null);

  // Get calendar link from env or use default
  const CALENDAR_LINK = import.meta.env.VITE_CALENDAR_LINK || "https://cal.com/team/madison-studio/demo";

  useEffect(() => {
    // Extract domain from websiteUrl if available
    if (brandData.websiteUrl) {
      try {
        const url = new URL(brandData.websiteUrl.startsWith('http') ? brandData.websiteUrl : `https://${brandData.websiteUrl}`);
        setDomain(normalizeDomain(url.hostname));
      } catch {
        // Invalid URL, skip
      }
    }

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
      // If we have a domain and scan, use the new PDF generation endpoint
      if (domain && brandData.organizationId) {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const { data: { session } } = await supabase.auth.getSession();
        
        const response = await fetch(`${supabaseUrl}/functions/v1/generate-report-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            domain: domain,
            scanId: 'latest',
            storeInSupabase: false, // Direct download
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to generate PDF' }));
          throw new Error(errorData.error || "Failed to generate PDF");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${brandData.brandName.replace(/\s+/g, '_')}_Brand_Audit.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Success",
          description: "PDF downloaded successfully",
        });
        return;
      }

      // Fallback to old method if no scan
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
      
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col">
      {/* Header Area */}
      <div className="border-b border-[#E5E5E5] bg-white px-6 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-serif text-3xl text-ink-black">
                You're All Set, {brandData.brandName}!
              </h1>
              <Badge className="bg-green-600 text-white border-0 text-xs px-2 py-0.5">
                <Check className="w-3 h-3 mr-1" />
                Ready
              </Badge>
            </div>
            <p className="text-sm text-charcoal/70">
              Your brand profile is ready.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="bg-white border border-[#E5E5E5] text-ink-black hover:bg-charcoal/5 h-10 px-6 text-sm font-medium"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
            {brandData.organizationId && (
              <a
                href={`/reports/${encodeURIComponent(domain || brandData.brandName || 'your-brand')}?scanId=latest`}
                className="inline-flex items-center justify-center text-sm text-brass hover:text-brass/80 underline h-10"
              >
                View Report
                <ExternalLink className="ml-1.5 h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
          {/* Left Column: Results (60%) */}
          <div className="space-y-6">
            {/* Status Badges */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs">
                {brandData.uploadContent ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandData.primaryColor || '#B8956A' }} />
                )}
                <span className="text-charcoal/80">Identity</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs">
                {brandData.uploadContent && <Check className="w-3 h-3 text-green-600" />}
                <span className="text-charcoal/80">Knowledge</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded text-xs">
                <span className="text-charcoal/80">Library</span>
              </div>
            </div>

            {/* Sample Output Card */}
            <div className="bg-white border border-[#E5E5E5] rounded p-6">
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="bg-brass/10 text-brass border-0 text-xs">
                  {isGeneratingSample ? "Generating Sample..." : "Sample Output"}
                </Badge>
              </div>
              <h2 className="font-serif text-2xl text-ink-black mb-3">
                {brandData.brandName}
              </h2>
              
              {isGeneratingSample ? (
                <div className="flex items-center gap-2 py-4 text-charcoal/60">
                  <Loader2 className="w-4 h-4 animate-spin text-brass" />
                  <span className="text-sm">Generating sample content with your brand voice...</span>
                </div>
              ) : (
                <>
                  <p className="text-sm text-charcoal/70 leading-relaxed mb-3">
                    {sampleContent || `Your brand's story begins here. With Madison's AI-powered platform, you'll create content that captures the essence of ${brandData.brandName}, maintaining consistency across every channel.`}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    {sampleContent ? `Generated using ${brandData.brandName}'s brand guidelines and voice` : 'Sample content'}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Onboarding (40%) */}
          <div className="space-y-6">
            {/* Video Card */}
            <div className="bg-white border border-[#E5E5E5] rounded p-4">
              <div className="aspect-video bg-charcoal/5 rounded mb-3 flex items-center justify-center">
                <Video className="w-8 h-8 text-charcoal/30" />
              </div>
              <h3 className="font-semibold text-ink-black text-sm mb-1">Welcome to Madison</h3>
              <p className="text-xs text-charcoal/60 mb-3">4 min overview</p>
              <VideoHelpTrigger 
                videoId="welcome-to-madison" 
                variant="button"
                className="w-full text-xs"
              />
            </div>

            {/* Quick Tips Card */}
            <div className="bg-white border border-[#E5E5E5] rounded p-4">
              <h3 className="font-semibold text-ink-black mb-3 text-sm">
                Quick Tips
              </h3>
              <ul className="space-y-3 text-xs text-charcoal/70">
                <li className="flex items-start gap-2">
                  <span className="text-brass mt-0.5 font-bold">•</span>
                  <div>
                    <span className="font-semibold text-ink-black">Create Content</span>
                    <span className="text-charcoal/60"> — Go to the Create page to write your first piece with AI assistance</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brass mt-0.5 font-bold">•</span>
                  <div>
                    <span className="font-semibold text-ink-black">Multiply Content</span>
                    <span className="text-charcoal/60"> — Use the Multiply page to repurpose content across channels</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brass mt-0.5 font-bold">•</span>
                  <div>
                    <span className="font-semibold text-ink-black">Schedule Posts</span>
                    <span className="text-charcoal/60"> — Visit the Calendar to plan and schedule your content</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Need Help Card */}
            <div className="bg-white border border-[#E5E5E5] rounded p-4">
              <h3 className="font-semibold text-ink-black mb-2 text-sm">
                Need Help?
              </h3>
              <Button
                onClick={() => window.open(CALENDAR_LINK, '_blank')}
                variant="outline"
                className="w-full border-brass/30 hover:bg-brass/5 text-brass text-xs h-9"
              >
                <Calendar className="mr-2 h-3.5 w-3.5 text-brass scale-x-[-1]" />
                Book a Walkthrough
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Sticky Bar */}
      <div className="sticky bottom-0 border-t border-[#E5E5E5] bg-white px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => onComplete('/create')}
            className="flex-1 bg-ink-black hover:bg-charcoal text-white h-11 text-sm font-medium"
            size="lg"
          >
            Create First Content
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            onClick={() => onComplete('/')}
            variant="outline"
            className="flex-1 border-[#E5E5E5] text-ink-black hover:bg-charcoal/5 h-11 text-sm"
            size="lg"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
