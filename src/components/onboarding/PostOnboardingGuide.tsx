import { useState } from "react";
import { X, Sparkles, Calendar, Library, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PostOnboardingGuideProps {
  onDismiss: () => void;
  userName?: string;
}

export function PostOnboardingGuide({ onDismiss, userName }: PostOnboardingGuideProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: "You're All Set!",
      description: "Your workspace is ready. Madison has learned your brand voice and is ready to help you create content that converts.",
      action: "Show Me Around",
      color: "text-accent"
    },
    {
      icon: Rocket,
      title: "Create Your First Content",
      description: "Start with a social post, blog article, or product description. Madison will ensure it's on-brand and optimized.",
      action: "Start Creating",
      route: "/create",
      color: "text-primary"
    },
    {
      icon: Calendar,
      title: "Plan Your Content",
      description: "Use the calendar to schedule posts and see your content pipeline at a glance. Stay consistent without the stress.",
      action: "View Calendar",
      route: "/calendar",
      color: "text-blue-600"
    },
    {
      icon: Library,
      title: "Your Content Library",
      description: "All your content lives here. Search, filter, and repurpose anything you've created. Nothing gets lost.",
      action: "Browse Library",
      route: "/library",
      color: "text-purple-600"
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onDismiss();
    } else if (currentStepData.route) {
      navigate(currentStepData.route);
      onDismiss();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    onDismiss();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-card border-border/20 shadow-2xl relative animate-in fade-in-0 zoom-in-95 duration-300">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>

        <div className="p-6 space-y-6">
          {/* Progress Dots */}
          <div className="flex gap-2 justify-center">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === currentStep
                    ? "w-8 bg-primary"
                    : idx < currentStep
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-border"
                  }`}
              />
            ))}
          </div>

          {/* Icon */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-full bg-accent/10 ${currentStepData.color}`}>
              <currentStepData.icon className="w-8 h-8" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-3">
            <h2 className="font-serif text-2xl text-gray-900">
              {currentStepData.title}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentStepData.description}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-2">
            <Button
              onClick={handleNext}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              size="lg"
            >
              {currentStepData.action}
            </Button>
            <Button
              onClick={handleSkip}
              variant="ghost"
              className="w-full text-gray-700 hover:text-gray-900"
              size="sm"
            >
              Skip Tour
            </Button>
          </div>

          {/* Step Counter */}
          <p className="text-xs text-gray-600 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>
      </Card>
    </div>
  );
}
