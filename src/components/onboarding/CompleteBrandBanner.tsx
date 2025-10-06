import { ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CompleteBrandBannerProps {
  onDismiss: () => void;
}

export function CompleteBrandBanner({ onDismiss }: CompleteBrandBannerProps) {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 mb-6 animate-fade-in">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="font-serif text-lg font-medium text-foreground mb-1">
            Enhance AI with Brand Knowledge
          </h3>
          <p className="text-sm text-muted-foreground">
            Upload your brand guidelines or website URL to get AI-generated content that truly reflects your brand voice.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismiss}
            className="border-border/40 text-muted-foreground hover:bg-muted"
          >
            Later
          </Button>
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              const element = document.getElementById("brand-knowledge-center");
              element?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Set Up Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <button
          onClick={handleDismiss}
          className="text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
