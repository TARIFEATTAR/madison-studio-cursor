import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingProgressBarProps {
  currentStep: 1 | 2 | 3;
}

export function OnboardingProgressBar({ currentStep }: OnboardingProgressBarProps) {
  const steps = [
    { number: 1, label: "Brand Setup" },
    { number: 2, label: "Add Document" },
    { number: 3, label: "Generate Content" },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-serif text-sm transition-all shadow-level-1",
                  currentStep > step.number
                    ? "bg-brass/20 text-brass"
                    : currentStep === step.number
                    ? "bg-brass text-parchment"
                    : "border-2 border-charcoal/30 text-charcoal/50"
                )}
              >
                {currentStep > step.number ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium mt-2 transition-colors",
                  currentStep >= step.number ? "text-ink" : "text-charcoal/50"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] flex-1 mx-4 transition-colors",
                  currentStep > step.number ? "bg-brass" : "bg-charcoal/20"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
