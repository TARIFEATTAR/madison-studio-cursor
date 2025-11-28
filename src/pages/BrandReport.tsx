import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Download, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandReportTemplate } from "@/components/reports/BrandReportTemplate";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { normalizeDomain, type BrandReport } from "@/types/brandReport";

export default function BrandReport() {
  const { domainId } = useParams<{ domainId: string }>();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scanId') || 'latest';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [scanData, setScanData] = useState<BrandReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user || !domainId) return;

      try {
        setLoading(true);

        // Get organization ID from user's memberships
        const { data: orgData } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)
          .single();

        if (!orgData) {
          toast({
            title: "Error",
            description: "Organization not found",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setOrganizationId(orgData.organization_id);

        // Normalize domain (decode URL-encoded domain)
        const normalizedDomain = decodeURIComponent(domainId).replace(/^www\./, '');
        
        // Fetch scan data
        let scan;
        if (scanId === 'latest') {
          // Get latest scan for domain
          const { data, error } = await supabase
            .from('brand_scans')
            .select('*')
            .eq('organization_id', orgData.organization_id)
            .eq('domain', normalizedDomain)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (error) throw error;
          scan = data;
        } else {
          // Get specific scan
          const { data, error } = await supabase
            .from('brand_scans')
            .select('*')
            .eq('id', scanId)
            .eq('organization_id', orgData.organization_id)
            .maybeSingle();

          if (error) throw error;
          scan = data;
        }

        if (!scan || !scan.scan_data) {
          toast({
            title: "No scan found",
            description: "No brand scan found for this domain. Please run a scan first.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // scan.scan_data is already a BrandReport
        setScanData(scan.scan_data);
      } catch (error) {
        logger.error('Error fetching report:', error);
        toast({
          title: "Error",
          description: "Failed to load report",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user, domainId, scanId, toast]);

  const handleDownloadPDF = async () => {
    if (!organizationId || !domainId) return;

    setGeneratingPDF(true);
    try {
      // Call PDF generation endpoint
      const normalizedDomain = decodeURIComponent(domainId).replace(/^www\./, '');
      
      const { data, error } = await supabase.functions.invoke('generate-report-pdf', {
        body: {
          domain: normalizedDomain,
          scanId: scanId,
        },
      });

      if (error) throw error;

      // Handle PDF download
      if (data?.pdfUrl) {
        // Direct PDF URL
        const link = document.createElement('a');
        link.href = data.pdfUrl;
        link.download = `${normalizedDomain}_Brand_Audit_${new Date().toISOString().split('T')[0]}.pdf`;
        link.click();
        
        toast({
          title: "Success",
          description: "PDF downloaded successfully",
        });
      } else if (data?.latestPdfUrl) {
        // Latest PDF URL
        const link = document.createElement('a');
        link.href = data.latestPdfUrl;
        link.download = `${normalizedDomain}_Brand_Audit_latest.pdf`;
        link.click();
        
        toast({
          title: "Success",
          description: "Latest PDF downloaded successfully",
        });
      } else if (data?.reportUrl) {
        // Fallback: Open report page for browser print-to-PDF
        toast({
          title: "PDF Generation",
          description: "Opening report page. Use browser print (Cmd/Ctrl + P) to save as PDF.",
        });
        window.open(data.reportUrl, '_blank');
      } else {
        // Fallback: Use browser print-to-PDF
        toast({
          title: "PDF Generation",
          description: "Use browser print (Cmd/Ctrl + P) to save as PDF.",
        });
        window.print();
      }
    } catch (error) {
      logger.error('Error generating PDF:', error);
      
      // Fallback to browser print
      toast({
        title: "PDF Generation",
        description: "Using browser print. Press Cmd/Ctrl + P to save as PDF.",
      });
      setTimeout(() => window.print(), 500);
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-brass" />
          <p className="text-muted-foreground">Loading brand report...</p>
        </div>
      </div>
    );
  }

  if (!scanData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-serif mb-4">Report Not Found</h1>
          <p className="text-muted-foreground mb-6">
            No brand scan found for this domain. Please run a brand scan first.
          </p>
          <Button onClick={() => navigate('/onboarding')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go to Brand Scan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-xl font-serif">Brand Audit Report</h1>
                <p className="text-sm text-muted-foreground">{domainId}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={generatingPDF}
                className="bg-brass text-white hover:bg-brass/90"
              >
                {generatingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Latest PDF
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="w-full">
        <BrandReportTemplate
          report={scanData}
          domain={domainId}
        />
      </div>
    </div>
  );
}

