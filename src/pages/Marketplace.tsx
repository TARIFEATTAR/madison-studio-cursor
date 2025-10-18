import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllPlatforms } from "@/config/marketplaceTemplates";
import { ArrowRight } from "lucide-react";

// Static color map for platform icons to avoid Tailwind purging dynamic classes
const platformColors = {
  etsy: { bg: 'bg-orange-500/10', text: 'text-orange-500' },
  tiktok_shop: { bg: 'bg-pink-500/10', text: 'text-pink-500' },
};

export default function Marketplace() {
  const navigate = useNavigate();
  const platforms = getAllPlatforms();

  useEffect(() => {
    console.log("✅ Marketplace mounted");
    return () => console.log("❌ Marketplace unmounted");
  }, []);

  return (
    <div className="min-h-screen bg-parchment-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-ink-black mb-2">Marketplace</h1>
          <p className="text-charcoal">
            Create platform-optimized listings with Madison's guidance
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {platforms.map((platform) => {
            const Icon = platform.icon;
            return (
              <Card 
                key={platform.id}
                className="border-aged-brass/20 hover:border-aged-brass/40 transition-all hover:shadow-lg group cursor-pointer"
                onClick={() => navigate(`/marketplace/${platform.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`w-12 h-12 rounded-lg ${platformColors[platform.id as keyof typeof platformColors]?.bg || 'bg-aged-brass/10'} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${platformColors[platform.id as keyof typeof platformColors]?.text || 'text-aged-brass'}`} />
                    </div>
                    <ArrowRight className="w-5 h-5 text-charcoal/40 group-hover:text-aged-brass group-hover:translate-x-1 transition-all" />
                  </div>
                  <CardTitle className="text-2xl">{platform.name}</CardTitle>
                  <CardDescription className="text-base">
                    {platform.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-charcoal/80">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-aged-brass" />
                      <span>Title limit: {platform.validation.titleMaxLength} characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-aged-brass" />
                      <span>Max tags: {platform.validation.tagsMax}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-aged-brass" />
                      <span>Export formats: {platform.exportFormats.join(', ').toUpperCase()}</span>
                    </div>
                  </div>
                  <Button 
                    className="w-full mt-4 bg-aged-brass hover:bg-aged-brass/90"
                    onClick={() => navigate(`/marketplace/${platform.id}`)}
                  >
                    Create {platform.name} Listing
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="mt-8 p-6 bg-white border border-aged-brass/20 rounded-lg">
          <h3 className="font-semibold text-ink-black mb-2">📋 How It Works</h3>
          <ul className="space-y-2 text-sm text-charcoal">
            <li className="flex items-start gap-2">
              <span className="text-aged-brass mt-0.5">1.</span>
              <span>Select a platform and link to an existing product (or create from scratch)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-aged-brass mt-0.5">2.</span>
              <span>Madison generates platform-optimized copy that matches your brand voice</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-aged-brass mt-0.5">3.</span>
              <span>Review, tweak, and export as CSV for bulk upload to your marketplace</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-charcoal/60">
            💡 <strong>Compliance Note:</strong> This tool generates CSV files for manual upload. 
            You are responsible for ensuring content complies with platform terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
