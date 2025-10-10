import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingBrandUpload } from "@/components/onboarding/OnboardingBrandUpload";
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess";

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('scriptora-onboarding-progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentStep(progress.step || 1);
      setOnboardingData(progress.data || {});
    }
  }, []);

  // Save progress whenever data changes
  useEffect(() => {
    if (Object.keys(onboardingData).length > 0) {
      localStorage.setItem('scriptora-onboarding-progress', JSON.stringify({
        step: currentStep,
        data: onboardingData
      }));
    }
  }, [currentStep, onboardingData]);

  const handleStepComplete = (stepData: any) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    navigate('/library', { replace: true });
  };

  const handleComplete = (destination: string) => {
    localStorage.removeItem('scriptora-onboarding-progress');
    localStorage.setItem('scriptora-onboarding-completed', 'true');
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === 1 && (
        <OnboardingWelcome
          onContinue={handleStepComplete}
          onSkip={handleSkip}
          initialData={onboardingData}
        />
      )}

      {currentStep === 2 && (
        <OnboardingBrandUpload
          onContinue={handleStepComplete}
          onBack={handleBack}
          onSkip={handleSkip}
          brandData={onboardingData}
        />
      )}

      {currentStep === 3 && (
        <OnboardingSuccess
          brandData={onboardingData}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
