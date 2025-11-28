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
import { buildBrandAuditReport } from "@/lib/buildBrandAuditReport";

export default function BrandReport() {
  const { domainId } = useParams<{ domainId: string }>();
  const [searchParams] = useSearchParams();
  const scanId = searchParams.get('scanId') || 'latest';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const supabaseAny = supabase as any;

  const [scanData, setScanData] = useState<BrandReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [organizationId, setOrganizationId] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!user || !domainId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get organization ID from user's memberships
        const { data: orgData, error: orgError } = await supabase
          .from('organization_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .limit(1)
          .maybeSingle();

        if (orgError || !orgData) {
          logger.error('Error fetching organization:', orgError);
          toast({
            title: "Error",
            description: "Organization not found or access denied.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        setOrganizationId(orgData.organization_id);

        // Normalize domain using the same function as scan-website
        const decodedDomain = decodeURIComponent(domainId);
        const normalizedDomain = normalizeDomain(decodedDomain);
        
        logger.debug(`[BrandReport] Fetching report for domain: ${normalizedDomain}, scanId: ${scanId}`);
        
        // Fetch scan data
        let scan;
        if (scanId === 'latest') {
          // First try: exact domain match (completed scans only)
        const { data: domainScan, error: domainError } = await supabaseAny
            .from('brand_scans')
            .select('*')
            .eq('organization_id', orgData.organization_id)
            .eq('domain', normalizedDomain)
            .eq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (domainError) {
            logger.warn('[BrandReport] Domain query error:', domainError);
            // If table doesn't exist, this will help debug
            if (domainError.code === 'PGRST116' || domainError.message?.includes('does not exist')) {
              throw new Error('brand_scans table does not exist. Please run the migration.');
            }
          }
          
          scan = domainScan;
          
          // Fallback: latest scan for organization (if domain match failed)
          if (!scan) {
            logger.debug('[BrandReport] No domain match, fetching latest scan for organization');
            const { data: latestScan, error: latestError } = await supabaseAny
              .from('brand_scans')
              .select('*')
              .eq('organization_id', orgData.organization_id)
              .eq('status', 'completed')
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();

            if (latestError) {
              logger.error('[BrandReport] Latest scan query error:', latestError);
              // If table doesn't exist, throw helpful error
              if (latestError.code === 'PGRST116' || latestError.message?.includes('does not exist')) {
                throw new Error('brand_scans table does not exist. Please run the migration.');
              }
              throw latestError;
            }
            
            scan = latestScan;
          }
        } else {
          // Get specific scan by ID
          const { data: specificScan, error: specificError } = await supabaseAny
            .from('brand_scans')
            .select('*')
            .eq('id', scanId)
            .eq('organization_id', orgData.organization_id)
            .maybeSingle();

          if (specificError) {
            if (specificError.code === 'PGRST116' || specificError.message?.includes('does not exist')) {
              throw new Error('brand_scans table does not exist. Please run the migration.');
            }
            throw specificError;
          }
          scan = specificScan;
        }

        if (!scan) {
          // Debug: Check what scans actually exist
          const { data: allScans, error: debugError } = await supabaseAny
            .from('brand_scans')
            .select('id, domain, status, created_at, organization_id')
            .eq('organization_id', orgData.organization_id)
            .order('created_at', { ascending: false })
            .limit(10);
          
          logger.warn('[BrandReport] No scan found', {
            normalizedDomain,
            scanId,
            allScans: allScans || [],
            debugError,
            organizationId: orgData.organization_id,
          });
          
          setLoading(false);
          return;
        }

        if (!scan.scan_data || Object.keys(scan.scan_data).length === 0) {
          logger.warn('[BrandReport] Scan found but scan_data is empty', scan);
          toast({
            title: "Incomplete Scan",
            description: "This scan is still processing or incomplete. Please try again in a moment.",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        logger.debug('[BrandReport] ✅ Scan data loaded successfully', {
          scanId: scan.id,
          domain: scan.domain,
          normalizedDomain,
          status: scan.status,
          hasScanData: !!scan.scan_data,
          scanDataKeys: Object.keys(scan.scan_data || {}),
          scanDataType: typeof scan.scan_data,
        });

        // scan.scan_data is already a BrandReport
        setScanData(scan.scan_data as BrandReport);
      } catch (error: any) {
        logger.error('[BrandReport] Error fetching report:', error);
        
        // Check if it's a 404 or table doesn't exist
        if (error?.code === 'PGRST116' || error?.message?.includes('does not exist') || error?.message?.includes('brand_scans table')) {
          logger.error('[BrandReport] Table does not exist - migration needed');
          toast({
            title: "Database Setup Required",
            description: "The brand scans table needs to be created. Please run the migration: supabase/migrations/20250101000000_create_brand_scans.sql",
            variant: "destructive",
            duration: 10000, // Show longer so user can read it
          });
        } else {
          logger.error('[BrandReport] Unexpected error:', error);
          toast({
            title: "Error",
            description: error?.message || "Failed to load report. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [user, domainId, scanId, toast]);

  const handleDownloadPDF = async () => {
    if (!domainId || !scanData) return;

    setGeneratingPDF(true);
    try {
      const normalizedDomain = normalizeDomain(decodeURIComponent(domainId));
      const clientName =
        (user?.user_metadata?.full_name as string | undefined) ||
        user?.email ||
        scanData.brandProfile.brandName ||
        normalizedDomain;

      const reportPayload = buildBrandAuditReport(scanData, {
        clientName,
        domain: normalizedDomain,
      });

      const { data, error } = await supabase.functions.invoke("generate-report-pdf", {
        body: {
          domain: normalizedDomain,
          reportData: reportPayload,
          scanId,
          storeInSupabase: false,
        },
        headers: { Accept: "application/pdf" },
        // @ts-ignore responseType is supported by the implementation but missing in types
        responseType: "blob",
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("No data received from PDF generation service");
      }

      if (!(data instanceof Blob)) {
        console.error("Received data is not a Blob:", data);
        // Try to parse as JSON to see if it's an error message
        if (typeof data === 'object') {
           const errorMsg = (data as any).error || JSON.stringify(data);
           throw new Error(`PDF generation failed: ${errorMsg}`);
        }
        throw new Error("Invalid response format from PDF service");
      }

      const blobUrl = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${normalizedDomain}_Brand_Audit_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

      toast({
        title: "Success",
        description: "PDF downloaded successfully",
      });
    } catch (error: any) {
      logger.error('Error generating PDF:', error);
      
      let errorMessage = error.message || "Failed to generate PDF. Please try again.";
      
      // Try to parse detailed error from Supabase FunctionsHttpError context
      if (error && typeof error === 'object' && 'context' in error) {
        try {
          // Clone the response because it might have been read already
          const response = (error as any).context;
          if (response && typeof response.text === 'function') {
            const text = await response.text();
            try {
              const json = JSON.parse(text);
              if (json.error) errorMessage = json.error;
            } catch {
              if (text) errorMessage = text;
            }
          }
        } catch (e) {
          logger.debug('Failed to parse error context:', e);
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.error) {
        errorMessage = error.error;
      }

      toast({
        title: "PDF Generation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleRescan = async () => {
    if (!domainId || !organizationId) return;

    try {
      toast({
        title: "Starting Rescan",
        description: "Scanning your website for the latest brand data...",
      });

      // Get the URL from scan data or use domain
      const urlToScan = scanData?.site?.url || `https://${normalizeDomain(decodeURIComponent(domainId))}`;
      
      const { data, error } = await supabase.functions.invoke('scan-website', {
        body: {
          url: urlToScan,
          organizationId: organizationId,
          forceRescan: true,
        },
      });

      if (error) throw error;

      toast({
        title: "Rescan Complete",
        description: "Your brand report has been updated with the latest data.",
      });

      // Reload the page to show new data
      window.location.reload();
    } catch (error) {
      logger.error('Error rescanning:', error);
      toast({
        title: "Rescan Failed",
        description: error instanceof Error ? error.message : "Failed to rescan. Please try again.",
        variant: "destructive",
      });
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
          <p className="text-muted-foreground mb-4">
            No brand scan found for this domain or organization. 
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
            <p className="text-sm text-amber-900">
              <strong>Possible reasons:</strong>
            </p>
            <ul className="text-sm text-amber-800 mt-2 space-y-1 list-disc list-inside">
              <li>No scan has been run yet</li>
              <li>The scan is still processing</li>
              <li>The database migration hasn't been run</li>
            </ul>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate('/onboarding')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Run Brand Scan
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
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
                onClick={handleRescan}
                disabled={!organizationId}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Rescan Website
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Refresh
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={generatingPDF || !scanData}
                className="bg-brass text-[#1C150D] hover:bg-brass/90 font-medium"
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
      <div className="w-full" id="brand-report-content">
        <BrandReportTemplate
          report={scanData}
          domain={domainId}
        />
      </div>
    </div>
  );
}

