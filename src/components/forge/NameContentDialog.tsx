import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface NameContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
}

export function NameContentDialog({ open, onOpenChange, onConfirm }: NameContentDialogProps) {
  const [contentName, setContentName] = useState("");

  const handleConfirm = () => {
    if (contentName.trim()) {
      onConfirm(contentName);
      setContentName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md"
        style={{
          backgroundColor: "#FFFCF5",
          borderColor: "#D4CFC8"
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif" style={{ color: "#1A1816" }}>
            Name Your Content
          </DialogTitle>
          <DialogDescription style={{ color: "#6B6560" }}>
            Give your content a memorable name to find it easily later.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <Label htmlFor="content-name" className="text-base mb-2" style={{ color: "#1A1816" }}>
            Content Name
          </Label>
          <Input
            id="content-name"
            value={contentName}
            onChange={(e) => setContentName(e.target.value)}
            placeholder="e.g., Lavender Serum Launch"
            className="mt-2"
            style={{
              backgroundColor: "#F5F1E8",
              borderColor: "#D4CFC8",
              color: "#1A1816"
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && contentName.trim()) {
                handleConfirm();
              }
            }}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            style={{
              borderColor: "#D4CFC8",
              color: "#6B6560"
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!contentName.trim()}
            variant="brass"
            className="gap-2 bg-gradient-to-r from-aged-brass to-antique-gold text-ink-black disabled:opacity-100"
          >
            <Sparkles className="w-4 h-4 text-ink-black" />
            <span>Generate Content</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
