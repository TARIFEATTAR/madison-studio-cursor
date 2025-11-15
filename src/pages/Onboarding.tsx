import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { BrandDNAScan } from "@/components/onboarding/BrandDNAScan";
import { OnboardingBrandUpload } from "@/components/onboarding/OnboardingBrandUpload";
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess";
import { logger } from "@/lib/logger";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [scanningBrandDNA, setScanningBrandDNA] = useState(false);

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

    // Check if user chose Brand DNA scan
    if (stepData.useBrandDNAScan) {
      setCurrentStep(2); // Go to Brand DNA scan
    } else if (stepData.skipDeepDive) {
      // User scanned DNA but wants to skip document upload
      setCurrentStep(4); // Go directly to success
    } else if (stepData.useBrandDNAScan === false) {
      // User chose to upload documents, skip Brand DNA scan
      setCurrentStep(3); // Go directly to document upload step
    } else if (currentStep < 4) {
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
          }).catch(err => logger.error('Brand health analysis error:', err));
        }
      } catch (error) {
        logger.error('Error triggering brand health:', error);
      }
    }
    
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {currentStep === 1 ? (
        <OnboardingWelcome
          onContinue={handleStepComplete}
          onSkip={handleSkip}
          initialData={onboardingData}
        />
      ) : currentStep === 2 ? (
        <BrandDNAScan
          onContinue={handleStepComplete}
          onBack={handleBack}
          onSkip={handleSkip}
          brandData={onboardingData}
        />
      ) : currentStep === 3 ? (
        <OnboardingBrandUpload
          onContinue={handleStepComplete}
          onBack={handleBack}
          onSkip={handleSkip}
          brandData={onboardingData}
        />
      ) : currentStep === 4 ? (
        <OnboardingSuccess
          brandData={onboardingData}
          onComplete={handleComplete}
        />
      ) : (
        // Fallback: if currentStep is invalid or state is corrupt, reset to step 1
        <OnboardingWelcome
          onContinue={handleStepComplete}
          onSkip={handleSkip}
          initialData={onboardingData}
        />
      )}
    </div>
  );
}
