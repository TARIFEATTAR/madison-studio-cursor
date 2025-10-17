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
      <DialogContent className="max-w-md bg-card border-border/20" onPointerDownOutside={(e) => e.preventDefault()}>
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
          <DialogTitle className="font-serif text-2xl text-foreground">
            Welcome to MADISON
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Step 1 of 3 • This takes 30 seconds
          </p>
        </DialogHeader>

        <div className="space-y-4 py-4">
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

        <div className="pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!brandName.trim() || !industry}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            Continue
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          You can always update this later in your settings.
        </p>
      </DialogContent>
    </Dialog>
  );
}
