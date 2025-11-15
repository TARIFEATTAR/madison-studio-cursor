import { useState } from "react";
import { X, Sparkles, ArrowRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingProgressBar } from "./OnboardingProgressBar";
import { getIndustryOptions } from "@/config/industryTemplates";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { VideoHelpTrigger } from "@/components/help/VideoHelpTrigger";
import madisonLogo from "@/assets/madison-horizontal-logo.png";
import { getOrCreateOrganizationId } from "@/lib/organization";
import { logger } from "@/lib/logger";

interface OnboardingWelcomeProps {
  onContinue: (data: any) => void;
  onSkip: () => void;
  initialData?: any;
}

const INDUSTRY_OPTIONS = getIndustryOptions();

export function OnboardingWelcome({ onContinue, onSkip, initialData }: OnboardingWelcomeProps) {
  const { user } = useAuth();
  const [userName, setUserName] = useState(initialData?.userName || "");
  const [brandName, setBrandName] = useState(initialData?.brandName || "");
  const [industry, setIndustry] = useState(initialData?.industry || "");
  const [primaryColor, setPrimaryColor] = useState(initialData?.primaryColor || "#B8956A");

  const handleContinue = async (options?: { useBrandDNAScan?: boolean }) => {
    if (!userName.trim() || !brandName.trim()) return;
    let organizationId: string | null = null;

    // Update organization with brand config AND user profile
    if (user) {
      try {
        // ALWAYS update user profile with the name they enter during onboarding
        // This overrides any name from Google OAuth or email
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            full_name: userName.trim() 
          })
          .eq('id', user.id);

        if (profileError) {
          logger.error('[Onboarding] Error updating profile:', profileError);
          toast({
            title: "Warning",
            description: "Your profile name may not have been saved. You can update it in Settings.",
            variant: "destructive"
          });
        } else {
          logger.debug('[Onboarding] Profile updated successfully with name:', userName.trim());
        }

        organizationId = await getOrCreateOrganizationId(user.id);

        const { error: orgUpdateError } = await supabase
          .from('organizations')
          .update({
            name: brandName.trim(),
            brand_config: {
              brandName: brandName.trim(),
              industry: industry || null,
              primaryColor: primaryColor,
              industryTemplate: industry || 'other',
              industry_config: {
                id: industry || 'other',
                name: INDUSTRY_OPTIONS.find(opt => opt.value === industry)?.label || 'Other'
              }
            }
          })
          .eq('id', organizationId);

        if (orgUpdateError) throw orgUpdateError;
      } catch (error) {
        logger.error('Error saving brand config:', error);
        toast({
          title: "Error",
          description: "Failed to save brand information. Please try again.",
          variant: "destructive"
        });
        return;
      }
    }

    onContinue({
      userName: userName.trim(),
      brandName: brandName.trim(),
      industry: industry || null,
      primaryColor,
      useBrandDNAScan: options?.useBrandDNAScan || false,
      organizationId
    });
  };

  const isValid = userName.trim() && brandName.trim();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/20">
        <div className="flex items-center gap-3">
          <img src={madisonLogo} alt="Madison" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <VideoHelpTrigger 
            videoId="setting-up-brand-identity" 
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
        <div className="w-full max-w-xl">
          <OnboardingProgressBar currentStep={1} />

          <div className="mt-12 text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-brass to-gold/80 mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="font-serif text-4xl text-foreground mb-3">Welcome to Madison</h1>
            <p className="text-lg text-muted-foreground">
              Let's set up your brand profile to create on-brand content at scale
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              We'll help Madison learn your brand in two ways: <strong>Quick Scan</strong> for visual identity, and <strong>Deep Dive</strong> for brand voice
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="userName" className="text-foreground text-base">
                Your First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="userName"
                placeholder="e.g., Jordan"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-input border-border/40 h-12 text-base"
              />
              <p className="text-sm text-muted-foreground">
                This is how Madison will address you throughout the platform
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="brandName" className="text-foreground text-base">
                Brand Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="brandName"
                placeholder="e.g., Maison Lumière"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="bg-input border-border/40 h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry" className="text-foreground text-base">
                Industry <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger className="bg-input border-border/40 h-12">
                  <SelectValue placeholder="Select your industry" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/20">
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor" className="text-foreground text-base">
                Primary Brand Color <span className="text-muted-foreground text-sm">(optional)</span>
              </Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-12 w-24 rounded border border-border/40 cursor-pointer"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#B8956A"
                  className="bg-input border-border/40 h-12 flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This color will be used in your generated content and brand materials
              </p>
            </div>
          </div>

          {/* Two-Track Approach Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 mt-12">
            <div className="p-6 rounded-lg border-2 border-brass/30 bg-gradient-to-br from-brass/5 to-transparent">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--aged-brass))] to-[hsl(var(--antique-gold))]/80 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Quick Scan</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter your website URL and we'll extract your visual identity — colors, fonts, logo, and style
              </p>
              <Badge variant="secondary" className="bg-brass/10 text-brass text-xs">
                Takes 2-3 minutes
              </Badge>
            </div>

            <div className="p-6 rounded-lg border border-border/40 bg-card">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--aged-brass))] to-[hsl(var(--antique-gold))]/80 flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">Deep Dive</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload brand documents to teach Madison your unique voice, tone, and messaging
              </p>
              <Badge variant="secondary" className="text-xs">
                Optional but recommended
              </Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => handleContinue({ useBrandDNAScan: true })}
              disabled={!isValid}
              variant="brass"
              className="flex-1 h-12 text-base"
            >
              Start with Quick Scan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <Button
              onClick={() => handleContinue({ useBrandDNAScan: false })}
              disabled={!isValid}
              variant="outline"
              className="flex-1 h-12 text-base"
            >
              <FileText className="mr-2 h-5 w-5" />
              Upload Documents
            </Button>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={onSkip}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip onboarding
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
