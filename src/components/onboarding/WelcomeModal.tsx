import { useState } from "react";
import { X, Sparkles, FlaskConical, Box, FlaskRound, Briefcase } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIndustryOptions } from "@/config/industryTemplates";
import { cn } from "@/lib/utils";
import type { BusinessType } from "@/hooks/useBusinessType";

interface WelcomeModalProps {
  open: boolean;
  onComplete: (data: { 
    userName: string;
    brandName: string; 
    industry: string; 
    primaryColor: string;
    websiteUrl?: string;
    businessType?: BusinessType;
  }) => void;
  onSkip?: () => void;
}

const INDUSTRY_OPTIONS = getIndustryOptions();

const BUSINESS_TYPE_OPTIONS = [
  { value: "finished_goods" as BusinessType, label: "Finished Goods Brand", description: "Sell products to consumers", icon: Sparkles },
  { value: "marketing_agency" as BusinessType, label: "Marketing Agency", description: "Content for beauty brands", icon: Briefcase },
  { value: "bottles_vessels" as BusinessType, label: "Bottles & Vessels", description: "Container manufacturing", icon: FlaskConical },
  { value: "packaging_boxes" as BusinessType, label: "Packaging & Boxes", description: "Secondary packaging", icon: Box },
  { value: "raw_materials" as BusinessType, label: "Raw Materials", description: "Ingredient supplier", icon: FlaskRound },
];

export function WelcomeModal({ open, onComplete, onSkip }: WelcomeModalProps) {
  const [userName, setUserName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("finished_goods");

  const handleSubmit = () => {
    if (!userName.trim() || !brandName.trim()) return;
    onComplete({ 
      userName: userName.trim(),
      brandName: brandName.trim(), 
      industry, 
      primaryColor: "#B8956A",
      websiteUrl: websiteUrl.trim() || undefined,
      businessType,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onSkip?.()}>
      <DialogContent className="max-w-2xl bg-card border-border/20" onPointerDownOutside={(e) => e.preventDefault()}>
        {onSkip && (
          <button
            onClick={onSkip}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Skip onboarding</span>
          </button>
        )}
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl text-foreground">
            Welcome to MADISON
          </DialogTitle>
          <p className="text-base text-muted-foreground mt-3">
            Let's set up your brand in under 60 seconds
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="userName" className="text-foreground">
              Your First Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="userName"
              placeholder="e.g., Jordan"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="bg-input border-border/40"
            />
            <p className="text-xs text-muted-foreground">This is how Madison will address you</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-foreground">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brandName"
              placeholder="e.g., Maison Lumière"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="bg-input border-border/40"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">
              What kind of business are you?
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {BUSINESS_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = businessType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setBusinessType(option.value)}
                    className={cn(
                      "flex items-start gap-2 p-3 rounded-lg border text-left transition-all",
                      isSelected 
                        ? "border-primary bg-primary/5" 
                        : "border-border/40 hover:border-border"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 mt-0.5 flex-shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <div>
                      <p className={cn(
                        "text-sm font-medium",
                        isSelected ? "text-primary" : "text-foreground"
                      )}>
                        {option.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-foreground">
              Industry <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="bg-input border-border/40">
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
            <Label htmlFor="websiteUrl" className="text-foreground">
              Website URL <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="websiteUrl"
              placeholder="https://yourbrand.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="bg-input border-border/40"
            />
            <p className="text-xs text-muted-foreground">
              We'll scan your website to learn your visual identity
            </p>
          </div>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!userName.trim() || !brandName.trim()}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {websiteUrl.trim() ? "Scan & Get Started" : "Get Started"}
          </Button>
          {websiteUrl.trim() && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Takes 30-60 seconds to scan your website
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
