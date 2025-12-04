import { supabase } from '@/integrations/supabase/client';

/**
 * Profile update type for onboarding
 */
export interface OnboardingUpdate {
    has_scanned_website?: boolean;
    has_uploaded_docs?: boolean;
    has_scheduled_call?: boolean;
    onboarding_status?: 'not_started' | 'in_progress' | 'complete';
}

/**
 * Update the user's onboarding step and optional profile fields
 * 
 * @param stepNumber - The step number to update to (1-5)
 * @param updates - Optional profile field updates
 * @returns The updated profile or null if error
 */
export async function updateOnboardingStep(
    stepNumber: number,
    updates: OnboardingUpdate = {}
) {
    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('[updateOnboardingStep] No authenticated user:', userError);
            return null;
        }

        // Validate step number
        if (stepNumber < 1 || stepNumber > 5) {
            console.error('[updateOnboardingStep] Invalid step number:', stepNumber);
            return null;
        }

        // Prepare update payload
        const updatePayload = {
            current_onboarding_step: stepNumber,
            ...updates,
            updated_at: new Date().toISOString(),
        };

        // Update the profile
        const { data: profile, error: updateError } = await supabase
            .from('profiles')
            .update(updatePayload)
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('[updateOnboardingStep] Error updating profile:', updateError);
            return null;
        }

        console.log('[updateOnboardingStep] Successfully updated to step', stepNumber, profile);
        return profile;
    } catch (error) {
        console.error('[updateOnboardingStep] Unexpected error:', error);
        return null;
    }
}

/**
 * Get the current user's profile with onboarding information
 * 
 * @returns The user's profile or null if error
 */
export async function getUserProfile() {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('[getUserProfile] No authenticated user:', userError);
            return null;
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.error('[getUserProfile] Error fetching profile:', profileError);
            return null;
        }

        return profile;
    } catch (error) {
        console.error('[getUserProfile] Unexpected error:', error);
        return null;
    }
}

/**
 * Redirect user based on their onboarding status
 * This function should be called on protected routes to ensure proper onboarding flow
 * 
 * @returns The redirect path or null if user should stay on current page
 */
export async function getOnboardingRedirectPath(): Promise<string | null> {
    try {
        const profile = await getUserProfile();

        if (!profile) {
            return '/auth';
        }

        // If onboarding is complete, allow access to dashboard
        if (profile.onboarding_status === 'complete') {
            return null; // No redirect needed
        }

        // Route based on current step
        const step = profile.current_onboarding_step || 1;

        switch (step) {
            case 1:
                return '/onboarding/step1';
            case 2:
                return '/onboarding/step2';
            case 3:
                return '/onboarding/step3';
            case 4:
                return '/onboarding/schedule';
            case 5:
                return '/onboarding/finish';
            default:
                return '/dashboard';
        }
    } catch (error) {
        console.error('[getOnboardingRedirectPath] Error:', error);
        return null;
    }
}

/**
 * Check if user needs to be redirected for onboarding
 * Use this in route guards
 * 
 * @returns Object with shouldRedirect boolean and path string
 */
export async function checkOnboardingStatus(): Promise<{
    shouldRedirect: boolean;
    path: string | null;
    profile: any;
}> {
    const profile = await getUserProfile();

    if (!profile) {
        return {
            shouldRedirect: true,
            path: '/auth',
            profile: null,
        };
    }

    if (profile.onboarding_status === 'complete') {
        return {
            shouldRedirect: false,
            path: null,
            profile,
        };
    }

    const redirectPath = await getOnboardingRedirectPath();

    return {
        shouldRedirect: !!redirectPath,
        path: redirectPath,
        profile,
    };
}
