import { useOnboardingTooltips } from "@/hooks/useOnboardingTooltips";
import { ContextualTooltip } from "./ContextualTooltip";

/**
 * OnboardingTooltipProvider
 * 
 * This component manages the display of contextual tooltips during user onboarding.
 * It automatically shows tooltips when users complete checklist tasks and navigate
 * to relevant pages.
 * 
 * Place this component at the root of your app (in App.tsx) to enable tooltips
 * throughout the application.
 */
export function OnboardingTooltipProvider() {
    const { activeTooltip, dismissTooltip, completeTooltip } = useOnboardingTooltips();

    if (!activeTooltip) {
        return null;
    }

    return (
        <ContextualTooltip
            id={activeTooltip.id}
            targetSelector={activeTooltip.targetSelector}
            title={activeTooltip.title}
            description={activeTooltip.description}
            position={activeTooltip.position}
            action={activeTooltip.action}
            onDismiss={dismissTooltip}
            onComplete={completeTooltip}
            showOnce={true}
        />
    );
}
