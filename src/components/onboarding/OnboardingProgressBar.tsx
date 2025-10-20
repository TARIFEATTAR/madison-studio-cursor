import { Check } from "lucide-react";
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
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all",
                  currentStep > step.number
                    ? "bg-brass text-white"
                    : currentStep === step.number
                    ? "bg-brass text-white"
                    : "border-2 border-charcoal/20 text-charcoal/40"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-sm mt-2 transition-colors whitespace-nowrap",
                  currentStep === step.number 
                    ? "text-foreground font-semibold" 
                    : currentStep > step.number
                    ? "text-foreground"
                    : "text-charcoal/40"
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connecting Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-[2px] w-16 sm:w-24 mx-2 sm:mx-4 transition-colors",
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
