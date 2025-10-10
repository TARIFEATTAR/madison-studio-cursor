import { useState } from "react";
import { Lightbulb, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ThinkModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThinkModeDialog({ open, onOpenChange }: ThinkModeDialogProps) {
  const [idea, setIdea] = useState("");

  const handleSubmit = () => {
    // TODO: Send to AI for brainstorming
    console.log("Think Mode idea:", idea);
    // Close dialog and AI suggestions to form
    onOpenChange(false);
  };

  const examplePrompts = [
    "I want to write about our new lavender serum...",
    "Need content for Instagram...",
    "How do I explain rose water benefits..."
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl border-0 p-0 overflow-hidden" style={{ backgroundColor: "#F5E8" }}>
        {/* Header */}
        <div 
          className="p-6"
          style={{
            background: "linear-gradient(to-right, #B8956A, #D4AF37)"
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-3" style={{ color: "#1A1816" }}>
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(26, 25, 22, 0.1)" }}
              >
                <Lightbulb className="w-6 h-6" style={{ color: "#1A1816" }} />
              </div>
              <div>
                <div>Think Mode</div>
                <div className="text-sm font-normal mt-1" style={{ color: "#1A1816", opacity: 0.8 }}>
                  Let's explore your ideas together
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div 
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: "#FFFCF5" }}
            >
              <Lightbulb className="w-8 h-8" style={{ color: "#B8956A" }} />
            </div>
            <h3 className="text-2xl font-serif mb-3" style={{ color: "#1A1816" }}>
              What's on your mind?
            </h3>
            <p className="text-base" style={{ color: "#6B6560" }}>
              Share a rough idea, a product you want to write about, or even just a feeling.<br />
              I'll help you shape it into content.
            </p>
          </div>

          {/* Example Prompts */}
          <div className="mb-6">
            <p className="text-sm mb-3" style={{ color: "#6B6560" }}>
              Try something like:
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setIdea(prompt)}
                  className="px-4 py-2 text-sm rounded-full border transition-all hover:border-[#B8956A]"
                  style={{
                    backgroundColor: "#FFFCF5",
                    borderColor: "#D4CFC8",
                    color: "#1A1816"
                  }}
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="relative">
            <Textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Share your thoughts..."
              className="min-h-[120px] pr-16 text-base resize-none"
              style={{
                backgroundColor: "#FFFCF5",
                borderColor: "#D4CFC8",
                color: "#1A1816"
              }}
            />
            <Button
              onClick={handleSubmit}
              disabled={!idea.trim()}
              className="absolute right-3 bottom-3"
              size="icon"
              style={{
                background: "linear-gradient(to-right, #B8956A, #D4AF85)",
                color: "#1A1816"
              }}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
