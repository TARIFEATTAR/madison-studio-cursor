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
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                  currentStep > step.number
                    ? "bg-green-600 text-white"
                    : currentStep === step.number
                      ? "border-2 border-gray-400 text-gray-900 bg-white"
                      : "border-2 border-charcoal/20 text-charcoal/40"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <span>{step.number}</span>
                )}
              </div>
              <span
                className={cn(
                  "text-xs mt-1.5 transition-colors whitespace-nowrap",
                  currentStep === step.number
                    ? "text-gray-900 font-semibold"
                    : currentStep > step.number
                      ? "text-gray-900"
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
                  "h-[2px] w-12 sm:w-20 mx-1.5 sm:mx-3 transition-colors",
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
