import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getIndustryOptions } from "@/config/industryTemplates";

interface WelcomeModalProps {
  open: boolean;
  onComplete: (data: { brandName: string; industry: string; primaryColor: string }) => void;
  onSkip?: () => void;
}

const INDUSTRY_OPTIONS = getIndustryOptions();

export function WelcomeModal({ open, onComplete, onSkip }: WelcomeModalProps) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#B8956A");

  const handleSubmit = () => {
    if (!brandName.trim() || !industry) return;
    onComplete({ brandName: brandName.trim(), industry, primaryColor });
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
            Your AI-powered editorial director for brand-perfect content
          </p>
        </DialogHeader>

        {/* Value Proposition Cards */}
        <div className="grid grid-cols-3 gap-3 py-4">
          <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-2xl mb-1">⚡</div>
            <div className="text-xs font-medium text-foreground">10x Faster</div>
            <div className="text-xs text-muted-foreground">Content creation</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-2xl mb-1">🎯</div>
            <div className="text-xs font-medium text-foreground">Always On-Brand</div>
            <div className="text-xs text-muted-foreground">Every piece</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-accent/10 border border-accent/20">
            <div className="text-2xl mb-1">📈</div>
            <div className="text-xs font-medium text-foreground">Better Results</div>
            <div className="text-xs text-muted-foreground">Data-driven</div>
          </div>
        </div>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="brandName" className="text-foreground">
              Brand Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="brandName"
              placeholder="Tarife Attar"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              className="bg-input border-border/40"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry" className="text-foreground">
              Industry <span className="text-destructive">*</span>
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
            <Label htmlFor="primaryColor" className="text-foreground">
              Primary Brand Color <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                id="primaryColor"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="h-10 w-20 rounded border border-border/40 cursor-pointer"
              />
              <Input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#B8956A"
                className="bg-input border-border/40 flex-1"
              />
            </div>
          </div>
        </div>

        {/* What's Next Preview */}
        <div className="bg-muted/30 rounded-lg p-4 border border-border/20">
          <div className="text-xs font-medium text-foreground mb-2">🎬 What's Next:</div>
          <ol className="text-xs text-muted-foreground space-y-1">
            <li>1. Optional: Upload brand documents (30 sec)</li>
            <li>2. Create your first piece of content (2 min)</li>
            <li>3. Start scaling your content strategy</li>
          </ol>
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!brandName.trim() || !industry}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            Continue to Setup
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Takes 30 seconds • Skip anytime • Edit later in settings
        </p>
      </DialogContent>
    </Dialog>
  );
}
