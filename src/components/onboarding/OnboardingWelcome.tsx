import { useState } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { OnboardingProgressBar } from "./OnboardingProgressBar";
import { getIndustryOptions } from "@/config/industryTemplates";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import madisonLogo from "@/assets/madison-horizontal-logo.png";

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

  const handleContinue = async () => {
    if (!userName.trim() || !brandName.trim()) return;

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
          console.error('[Onboarding] Error updating profile:', profileError);
          toast({
            title: "Warning",
            description: "Your profile name may not have been saved. You can update it in Settings.",
            variant: "destructive"
          });
        } else {
          console.log('[Onboarding] Profile updated successfully with name:', userName.trim());
        }

        // Find or create organization
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id')
          .eq('created_by', user.id)
          .maybeSingle();

        let orgId = orgs?.id;

        if (!orgId) {
          // Create organization
          const { data: newOrg, error: createError } = await supabase
            .from('organizations')
            .insert({
              name: brandName.trim(),
              created_by: user.id,
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
            .select()
            .single();

          if (createError) throw createError;
          orgId = newOrg.id;
        } else {
          // Update existing organization
          const { error: updateError } = await supabase
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
            .eq('id', orgId);

          if (updateError) throw updateError;
        }
      } catch (error) {
        console.error('Error saving brand config:', error);
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
      primaryColor
    });
  };

  const isValid = userName.trim() && brandName.trim();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border/20">
        <div className="flex items-center gap-3">
          <img src={madisonLogo} alt="MADISON" className="h-8" />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            Watch Tutorial
          </Button>
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
            <h1 className="font-serif text-4xl text-foreground mb-3">Welcome to MADISON</h1>
            <p className="text-lg text-muted-foreground">
              Let's set up your brand identity
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Takes 2 minutes — Your content will use this info to match your brand perfectly
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

          <div className="mt-12 space-y-4">
            <Button
              onClick={handleContinue}
              disabled={!isValid}
              className="w-full h-12 bg-gradient-to-r from-brass to-gold text-white hover:opacity-90 text-base"
              size="lg"
            >
              Continue
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <div className="text-center">
              <button
                onClick={onSkip}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                I'll do this later
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
