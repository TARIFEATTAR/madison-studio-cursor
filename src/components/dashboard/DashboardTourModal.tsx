import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Award, TrendingUp, Calendar, ChevronRight, ChevronLeft, X } from "lucide-react";

interface TourStep {
  title: string;
  description: string;
  icon: any;
  tip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: "Welcome to Your Dashboard",
    description: "This is your command center for all content creation. Everything you need is organized and accessible from here.",
    icon: TrendingUp,
    tip: "Tip: Use the sidebar to navigate between different sections quickly."
  },
  {
    title: "Brand Health Score",
    description: "Track your brand consistency and identify gaps. This is your most valuable tool for maintaining quality.",
    icon: Shield,
    tip: "Located at the top of your dashboard for quick access."
  },
  {
    title: "Editorial Accolades",
    description: "Earn badges as you create content. Progress from Novice to Literary Master by building your content library.",
    icon: Award,
    tip: "Click on your accolade card to see all available achievements and requirements."
  },
  {
    title: "Streak Tracker",
    description: "Maintain consistency with weekly creation streaks. A 3-day grace period helps you keep momentum.",
    icon: Calendar,
    tip: "Create at least one piece per week to maintain your streak and build habits."
  },
  {
    title: "Content Workflow",
    description: "Track your content through Create → Library → Schedule → Published stages.",
    icon: TrendingUp,
    tip: "Click on any stage to jump directly to that workflow section."
  }
];

const TOUR_STORAGE_KEY = 'dashboard-tour-completed';

export function DashboardTourModal() {
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if tour has been completed
    const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!tourCompleted) {
      // Small delay so dashboard loads first
      setTimeout(() => setOpen(true), 1000);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setOpen(false);
  };

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  const step = TOUR_STEPS[currentStep];
  const Icon = step.icon;
  const isLastStep = currentStep === TOUR_STEPS.length - 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-parchment-white border border-charcoal/20 max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-ink-black flex items-center gap-3">
            <div className="w-10 h-10 bg-aged-brass/10 border border-aged-brass/20 flex items-center justify-center">
              <Icon className="w-5 h-5 text-aged-brass" />
            </div>
            {step.title}
          </DialogTitle>
          <DialogDescription className="text-charcoal/70 leading-relaxed pt-4">
            {step.description}
          </DialogDescription>
        </DialogHeader>

        {/* Tip box */}
        <div className="bg-aged-brass/5 border border-aged-brass/20 p-4 mt-4">
          <p className="text-xs font-medium text-aged-brass mb-1">💡 Pro Tip</p>
          <p className="text-sm text-charcoal/80">{step.tip}</p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 my-4">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === currentStep 
                  ? 'w-8 bg-aged-brass' 
                  : index < currentStep 
                    ? 'w-4 bg-aged-brass/50' 
                    : 'w-4 bg-charcoal/10'
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <Button
            onClick={handleSkip}
            variant="ghost"
            size="sm"
            className="text-charcoal/60 hover:text-charcoal text-xs"
          >
            Skip Tour
          </Button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                onClick={handlePrevious}
                variant="outline"
                size="sm"
                className="border-charcoal/20 text-charcoal hover:bg-vellum-cream gap-1"
              >
                <ChevronLeft className="w-3 h-3" />
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="bg-ink-black hover:bg-charcoal text-parchment-white gap-1"
              size="sm"
            >
              {isLastStep ? "Get Started" : "Next"}
              {!isLastStep && <ChevronRight className="w-3 h-3" />}
            </Button>
          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-xs text-charcoal/50 mt-2">
          Step {currentStep + 1} of {TOUR_STEPS.length}
        </p>
      </DialogContent>
    </Dialog>
  );
}

// Export function to reset tour (for settings)
export function resetDashboardTour() {
  localStorage.removeItem(TOUR_STORAGE_KEY);
}
