import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WelcomeModalProps {
  open: boolean;
  onComplete: (data: { brandName: string; industry: string; primaryColor: string }) => void;
  onSkip: () => void;
}

const INDUSTRIES = [
  "Beauty & Cosmetics",
  "Fashion & Apparel",
  "Food & Beverage",
  "Technology",
  "Healthcare",
  "Education",
  "Real Estate",
  "Professional Services",
  "Retail",
  "Other",
];

export function WelcomeModal({ open, onComplete, onSkip }: WelcomeModalProps) {
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#B8956A");

  const handleSubmit = () => {
    if (!brandName.trim()) return;
    onComplete({ brandName: brandName.trim(), industry, primaryColor });
  };

  return (
    <Dialog open={open} onOpenChange={() => onSkip()}>
      <DialogContent className="max-w-md bg-card border-border/20">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-foreground">
            Welcome to Scriptora
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Let's personalize your experience. This will only take 30 seconds.
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
              Industry <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger className="bg-input border-border/40">
                <SelectValue placeholder="Select your industry" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/20">
                {INDUSTRIES.map((ind) => (
                  <SelectItem key={ind} value={ind}>
                    {ind}
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

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={onSkip}
            className="flex-1 border-border/40 text-muted-foreground hover:bg-muted"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!brandName.trim()}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
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
