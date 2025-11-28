import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";
import { normalizeDomain } from "@/types/brandReport";

export function LivingReportCard() {
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const [domain, setDomain] = useState<string | null>(null);
  const [hasReport, setHasReport] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestScan = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Get latest scan to find domain
        const { data: scan, error } = await supabase
          .from('brand_scans')
          .select('domain, created_at')
          .eq('organization_id', organizationId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        
        if (scan?.domain) {
          setDomain(scan.domain);
          setHasReport(true);
        } else {
          // Try to get domain from organization's brand config
          const { data: org } = await supabase
            .from('organizations')
            .select('brand_config')
            .eq('id', organizationId)
            .maybeSingle();

          if (org?.brand_config?.websiteUrl) {
            try {
              const url = new URL(org.brand_config.websiteUrl.startsWith('http') ? org.brand_config.websiteUrl : `https://${org.brand_config.websiteUrl}`);
              setDomain(normalizeDomain(url.hostname));
            } catch {
              // Invalid URL
            }
          }
        }
      } catch (error) {
        console.error('Error fetching report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestScan();
  }, [organizationId]);

  if (loading) {
    return (
      <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-white border border-[#E0E0E0] rounded-xl min-h-[180px] md:min-h-[200px]">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!hasReport && !domain) {
    return null; // Don't show if no report available
  }

  const reportUrl = domain ? `/reports/${encodeURIComponent(domain)}?scanId=latest` : null;

  return (
    <Card className="col-span-1 md:col-span-4 p-4 md:p-6 bg-gradient-to-br from-brass/5 to-transparent border border-brass/20 rounded-xl min-h-[180px] md:min-h-[200px] hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brass/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brass" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#1C150D]/80 mb-0.5">Living Brand Report</h3>
              <p className="text-xs text-[#1C150D]/60">Always up-to-date brand audit</p>
            </div>
          </div>
          {hasReport && (
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Report available" />
          )}
        </div>

        <div className="flex-1 mb-4">
          <p className="text-sm text-[#1C150D]/70 leading-relaxed">
            {hasReport 
              ? "View your comprehensive brand analysis with logo, colors, voice, and strategic insights."
              : "Scan your website to generate a detailed brand audit report."
            }
          </p>
        </div>

        <div className="mt-auto">
          {reportUrl ? (
            <Button
              onClick={() => navigate(reportUrl)}
              className="w-full bg-brass hover:bg-aged-brass text-white min-h-[44px] touch-manipulation"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Report
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          ) : (
            <Button
              onClick={() => navigate('/onboarding')}
              variant="outline"
              className="w-full border-brass/30 hover:bg-brass/5 text-brass min-h-[44px] touch-manipulation"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

