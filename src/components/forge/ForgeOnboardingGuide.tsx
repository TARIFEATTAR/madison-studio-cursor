import { useState } from "react";
import { Sparkles, X, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface ForgeOnboardingGuideProps {
  onDismiss: () => void;
}

export function ForgeOnboardingGuide({ onDismiss }: ForgeOnboardingGuideProps) {
  const [currentTip, setCurrentTip] = useState(0);

  const tips = [
    {
      title: "Welcome to Create!",
      description: "This is where you create content in your brand voice. Let's generate your first piece.",
      icon: Sparkles,
    },
    {
      title: "Step 1: Choose Content Type",
      description: "Try starting with 'Social Media Post' for a quick test. Select it from the dropdown below.",
      icon: ArrowRight,
    },
    {
      title: "Step 2: Describe What You Want",
      description: "Add a brief description like 'Write a post about our brand values' in the instructions field.",
      icon: ArrowRight,
    },
    {
      title: "Step 3: Generate!",
      description: "Click the Generate button and watch the AI create content in your unique brand voice.",
      icon: ArrowRight,
    },
  ];

  const handleNext = () => {
    if (currentTip < tips.length - 1) {
      setCurrentTip(currentTip + 1);
    } else {
      onDismiss();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <Card className="border-2 border-brass shadow-level-3 bg-gradient-to-br from-brass/5 to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-brass flex items-center justify-center flex-shrink-0 shadow-level-1">
                {(() => {
                  const Icon = tips[currentTip].icon;
                  return <Icon className="h-6 w-6 text-parchment" />;
                })()}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-serif text-lg text-ink mb-1">
                      {tips[currentTip].title}
                    </h3>
                    <p className="text-sm text-charcoal/70">
                      {tips[currentTip].description}
                    </p>
                  </div>
                  <Button
                    onClick={onDismiss}
                    variant="ghost"
                    size="sm"
                    className="text-charcoal/50 hover:text-ink -mt-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex gap-1.5">
                    {tips.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all ${
                          index === currentTip
                            ? "w-8 bg-brass"
                            : index < currentTip
                            ? "w-1.5 bg-brass/50"
                            : "w-1.5 bg-charcoal/20"
                        }`}
                      />
                    ))}
                  </div>

                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="bg-brass text-ink hover:bg-antique-gold"
                  >
                    {currentTip < tips.length - 1 ? "Next" : "Got It!"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
