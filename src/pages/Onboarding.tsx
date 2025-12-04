import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { BrandDNAScan } from "@/components/onboarding/BrandDNAScan";
import { OnboardingBrandUpload } from "@/components/onboarding/OnboardingBrandUpload";
import { OnboardingSuccess } from "@/components/onboarding/OnboardingSuccess";
import { Button } from "@/components/ui/button";
import { updateOnboardingStep, getUserProfile } from "@/lib/onboarding";
import { logger } from "@/lib/logger";

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<any>({});
  const [scanningBrandDNA, setScanningBrandDNA] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const resetProgress = () => {
    if (!user) return;

    // Clear ALL onboarding-related localStorage keys
    localStorage.removeItem('madison-onboarding-progress');
    localStorage.removeItem(`onboarding_step_${user.id}`);
    localStorage.removeItem(`onboarding_completed_${user.id}`);
    localStorage.removeItem(`post_onboarding_guide_shown_${user.id}`);

    setOnboardingData({});
    setCurrentStep(1);
    setScanningBrandDNA(false);
  };

  const isValidStep = currentStep >= 1 && currentStep <= 4;

  // Load saved progress from Supabase profiles table
  // Check for ?reset=true URL parameter to force restart
  useEffect(() => {
    const loadOnboardingProgress = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const urlParams = new URLSearchParams(window.location.search);
      const shouldReset = urlParams.get('reset') === 'true';

      if (shouldReset) {
        resetProgress();
        // Reset in database too
        await updateOnboardingStep(1, {
          onboarding_status: 'in_progress',
          has_scanned_website: false,
          has_uploaded_docs: false,
          has_scheduled_call: false,
        });
        // Clean up URL
        window.history.replaceState({}, '', '/onboarding');
        setLoadingProfile(false);
        return;
      }

      try {
        // Get profile from Supabase
        const profile = await getUserProfile();

        if (profile) {
          const step = profile.current_onboarding_step || 1;
          const safeStep = [1, 2, 3, 4].includes(step) ? step : 1;

          // If step is 4 (success page), don't auto-load it - start fresh instead
          if (safeStep === 4) {
            logger.log('[Onboarding] Previous step was success page - starting fresh');
            resetProgress();
            await updateOnboardingStep(1, { onboarding_status: 'in_progress' });
            setLoadingProfile(false);
            return;
          }

          // Load any saved data from localStorage for form state
          const savedProgress = localStorage.getItem('madison-onboarding-progress');
          if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            setOnboardingData(progress.data || {});
            setScanningBrandDNA(progress.data?.useBrandDNAScan === true);
          }

          setCurrentStep(safeStep);
        } else {
          // No profile found, start fresh
          setCurrentStep(1);
          setOnboardingData({});
          setScanningBrandDNA(false);
        }
      } catch (error) {
        logger.error('[Onboarding] Error loading progress:', error);
        // Clear corrupted data and start fresh
        localStorage.removeItem('madison-onboarding-progress');
        setCurrentStep(1);
        setOnboardingData({});
        setScanningBrandDNA(false);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadOnboardingProgress();
  }, [user]);

  // Save progress whenever data changes
  useEffect(() => {
    if (Object.keys(onboardingData).length > 0) {
      localStorage.setItem('madison-onboarding-progress', JSON.stringify({
        step: currentStep,
        data: onboardingData
      }));
    }
  }, [currentStep, onboardingData]);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth', { replace: true });
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth or profile
  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-lg font-serif">Loading…</div>
      </div>
    );
  }

  // Don't render if no user (will redirect)
  if (!user) {
    return null;
  }

  const handleStepComplete = async (stepData: any) => {
    const updatedData = { ...onboardingData, ...stepData };
    setOnboardingData(updatedData);

    // Step 1: Brand Basics (with optional website scan)
    if (currentStep === 1) {
      // Update database with step 1 completion
      await updateOnboardingStep(3, {
        has_scanned_website: !!stepData.hasWebsiteScan,
        onboarding_status: 'in_progress',
      });

      // If user scanned website on Step 1, they can go to deep knowledge or skip
      if (stepData.hasWebsiteScan) {
        // User scanned website, offer deep knowledge step (optional)
        setCurrentStep(3); // Go to deep knowledge (document upload/Essential 5)
      } else {
        // No website scan, go to deep knowledge step
        setCurrentStep(3);
      }
    }
    // Step 2: Brand DNA Scan (legacy - kept for backward compatibility)
    else if (stepData.useBrandDNAScan) {
      await updateOnboardingStep(2, {
        has_scanned_website: true,
        onboarding_status: 'in_progress',
      });
      setScanningBrandDNA(true);
      setCurrentStep(2);
    } else if (stepData.skipDeepDive) {
      // User scanned DNA but wants to skip document upload
      await updateOnboardingStep(4, {
        onboarding_status: 'in_progress',
      });
      setCurrentStep(4); // Go directly to success
    } else if (stepData.useBrandDNAScan === false) {
      // User chose to upload documents, skip Brand DNA scan
      await updateOnboardingStep(3, {
        onboarding_status: 'in_progress',
      });
      setCurrentStep(3);
    }
    // Step 3: Deep Knowledge (document upload/Essential 5)
    else if (currentStep === 3) {
      // After deep knowledge, go to success/summary
      await updateOnboardingStep(4, {
        has_uploaded_docs: true,
        onboarding_status: 'in_progress',
      });
      setCurrentStep(4);
    }
    // Step 4: Success/Summary
    else if (currentStep < 4) {
      await updateOnboardingStep(currentStep + 1, {
        onboarding_status: 'in_progress',
      });
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

    // Mark onboarding as complete in database
    await updateOnboardingStep(5, {
      onboarding_status: 'complete',
      has_scheduled_call: false, // Can be updated later if they schedule
    });

    // Also mark in localStorage for backward compatibility
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

  if (!isValidStep) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <h1 className="text-2xl font-serif text-foreground">Let's restart your onboarding</h1>
          <p className="text-muted-foreground">
            We couldn't resume your previous onboarding progress. Click below to start over.
          </p>
          <Button onClick={() => {
            resetProgress();
            window.location.reload();
          }} className="px-6">
            Restart Onboarding
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentStep === 1 && (
        <OnboardingWelcome
          onContinue={handleStepComplete}
          onSkip={handleSkip}
          initialData={onboardingData}
        />
      )}

      {currentStep === 2 && scanningBrandDNA && (
        <BrandDNAScan
          onContinue={handleStepComplete}
          onBack={handleBack}
          onSkip={handleSkip}
          brandData={onboardingData}
        />
      )}

      {currentStep === 3 && (
        <OnboardingBrandUpload
          onContinue={handleStepComplete}
          onBack={handleBack}
          onSkip={handleSkip}
          brandData={onboardingData}
        />
      )}

      {currentStep === 4 && (
        <OnboardingSuccess
          brandData={onboardingData}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
