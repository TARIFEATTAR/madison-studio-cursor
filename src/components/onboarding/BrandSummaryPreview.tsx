import { useEffect, useState } from "react";
import { Check, Palette, Type, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { normalizeDomain, type BrandReport } from "@/types/brandReport";

interface BrandSummaryPreviewProps {
  organizationId: string;
  brandName: string;
  websiteUrl?: string;
}

export function BrandSummaryPreview({ organizationId, brandName, websiteUrl }: BrandSummaryPreviewProps) {
  const [scanData, setScanData] = useState<BrandReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestScan = async () => {
      if (!organizationId) {
        setLoading(false);
        return;
      }

      try {
        // Try to get latest scan for this organization
        const { data: scans, error } = await supabase
          .from('brand_scans')
          .select('scan_data, domain, created_at')
          .eq('organization_id', organizationId)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (scans?.scan_data) {
          setScanData(scans.scan_data as BrandReport);
        }
      } catch (error) {
        console.error('Error fetching scan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestScan();
  }, [organizationId]);

  if (loading) {
    return (
      <Card className="p-6 border-brass/20 bg-gradient-to-br from-brass/5 to-transparent">
        <div className="flex items-center gap-3 text-charcoal/60">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading brand summary...</span>
        </div>
      </Card>
    );
  }

  if (!scanData) {
    return (
      <Card className="p-6 border-brass/20 bg-gradient-to-br from-brass/5 to-transparent">
        <div className="text-center space-y-2">
          <Sparkles className="w-8 h-8 text-brass mx-auto" />
          <h3 className="font-serif text-lg text-ink-black">Brand Summary</h3>
          <p className="text-sm text-charcoal/60">
            Your brand profile for <strong>{brandName}</strong> is ready. 
            {websiteUrl && (
              <> Scan your website to see detailed insights here.</>
            )}
          </p>
        </div>
      </Card>
    );
  }

  const colors = scanData.colors?.primary || [];
  const logo = scanData.site?.logoUrl;
  const brandProfile = scanData.brandProfile;

  return (
    <Card className="p-6 border-brass/20 bg-gradient-to-br from-brass/5 to-transparent">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl text-ink-black mb-1">{brandName}</h3>
            {brandProfile?.tagline && (
              <p className="text-sm text-charcoal/70 italic">"{brandProfile.tagline}"</p>
            )}
          </div>
          <Badge variant="secondary" className="bg-brass/10 text-brass border-brass/20">
            Ready
          </Badge>
        </div>

        {/* Logo & Colors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logo && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-charcoal/60">
                <ImageIcon className="w-3 h-3" />
                Logo
              </div>
              <div className="h-16 bg-white border border-charcoal/10 rounded-md p-3 flex items-center justify-center">
                <img src={logo} alt={`${brandName} logo`} className="max-h-full max-w-full object-contain" />
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-charcoal/60">
                <Palette className="w-3 h-3" />
                Color Palette
              </div>
              <div className="flex gap-2 flex-wrap">
                {colors.slice(0, 5).map((color, idx) => (
                  <div
                    key={idx}
                    className="w-12 h-12 rounded-md border border-charcoal/10 shadow-sm"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brand Profile Highlights */}
        {brandProfile && (
          <div className="space-y-3 pt-4 border-t border-charcoal/10">
            {brandProfile.positioning && (
              <div>
                <div className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">Positioning</div>
                <p className="text-sm text-charcoal/80">{brandProfile.positioning}</p>
              </div>
            )}

            {brandProfile.primaryAudience && brandProfile.primaryAudience.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">Target Audience</div>
                <div className="flex flex-wrap gap-2">
                  {brandProfile.primaryAudience.slice(0, 3).map((audience, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-charcoal/20">
                      {audience}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {brandProfile.toneTraits && brandProfile.toneTraits.length > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">Brand Voice</div>
                <div className="flex flex-wrap gap-2">
                  {brandProfile.toneTraits.slice(0, 4).map((trait, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs border-brass/30 text-brass">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-charcoal/10">
          <div className="text-center">
            <div className="text-lg font-serif text-ink-black">
              {colors.length > 0 ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : '—'}
            </div>
            <div className="text-xs text-charcoal/60 mt-1">Colors</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-serif text-ink-black">
              {logo ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : '—'}
            </div>
            <div className="text-xs text-charcoal/60 mt-1">Logo</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-serif text-ink-black">
              {brandProfile ? <Check className="w-5 h-5 text-green-600 mx-auto" /> : '—'}
            </div>
            <div className="text-xs text-charcoal/60 mt-1">Profile</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

