import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function usePostOnboardingGuide() {
  const { user } = useAuth();
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    // Disabled: Post-onboarding guide modal is redundant
    // To re-enable, uncomment the code below

    // if (!user) return;

    // // Check if onboarding was just completed and guide hasn't been shown
    // const onboardingCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
    // const guideShown = localStorage.getItem(`post_onboarding_guide_shown_${user.id}`);

    // if (onboardingCompleted === "true" && !guideShown) {
    //   // Small delay to let dashboard load
    //   const timer = setTimeout(() => {
    //     setShowGuide(true);
    //   }, 500);
    //   return () => clearTimeout(timer);
    // }
  }, [user]);

  const dismissGuide = () => {
    if (!user) return;
    localStorage.setItem(`post_onboarding_guide_shown_${user.id}`, "true");
    setShowGuide(false);
  };

  return {
    showGuide,
    dismissGuide,
  };
}
