import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingBrandUpload } from "@/components/onboarding/OnboardingBrandUpload";
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});

  // Load saved progress on mount and align storage keys
  useEffect(() => {
    const savedProgress = localStorage.getItem('madison-onboarding-progress');
    if (savedProgress) {
      const progress = JSON.parse(savedProgress);
      setCurrentStep(progress.step || 1);
      setOnboardingData(progress.data || {});
    }
  }, []);

  // Save progress whenever data changes
  useEffect(() => {
    if (Object.keys(onboardingData).length > 0) {
      localStorage.setItem('madison-onboarding-progress', JSON.stringify({
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
    localStorage.removeItem('madison-onboarding-progress');
    // DO NOT mark as completed when skipping
    navigate('/library');
  };

  const handleComplete = async (destination: string) => {
    if (!user) return;
    
    // Clean up old progress
    localStorage.removeItem('madison-onboarding-progress');
    
    // Mark onboarding as complete using user-specific key
    localStorage.setItem(`onboarding_step_${user.id}`, 'completed');
    localStorage.setItem(`onboarding_completed_${user.id}`, 'true');
    
    // Trigger brand health analysis if brand knowledge was added
    if (onboardingData.uploadContent) {
      try {
        const { data: orgs } = await supabase
          .from('organizations')
          .select('id')
          .eq('created_by', user.id)
          .maybeSingle();
        
        if (orgs?.id) {
          // Fire and forget - don't wait for completion
          supabase.functions.invoke('analyze-brand-health', {
            body: { organizationId: orgs.id }
          }).catch(err => console.error('Brand health analysis error:', err));
        }
      } catch (error) {
        console.error('Error triggering brand health:', error);
      }
    }
    
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
