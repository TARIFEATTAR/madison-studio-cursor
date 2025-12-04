import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { checkOnboardingStatus } from '@/lib/onboarding';
import { useAuth } from '@/hooks/useAuth';

/**
 * OnboardingGuard component that redirects users based on their onboarding status
 * Wrap protected routes with this component to ensure proper onboarding flow
 */
export function OnboardingGuard({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const checkAndRedirect = async () => {
            if (authLoading) return;

            if (!user) {
                navigate('/auth', { replace: true });
                return;
            }

            try {
                const { shouldRedirect, path } = await checkOnboardingStatus();

                if (shouldRedirect && path && location.pathname !== path) {
                    console.log('[OnboardingGuard] Redirecting to:', path);
                    navigate(path, { replace: true });
                }
            } catch (error) {
                console.error('[OnboardingGuard] Error checking onboarding:', error);
            } finally {
                setChecking(false);
            }
        };

        checkAndRedirect();
    }, [user, authLoading, navigate, location.pathname]);

    if (authLoading || checking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-muted-foreground text-lg font-serif">Loading…</div>
            </div>
        );
    }

    return <>{children}</>;
}

/**
 * Hook to use onboarding guard logic in components
 */
export function useOnboardingGuard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const redirectBasedOnOnboarding = async () => {
        if (!user) {
            navigate('/auth', { replace: true });
            return;
        }

        const { shouldRedirect, path } = await checkOnboardingStatus();

        if (shouldRedirect && path) {
            navigate(path, { replace: true });
        }
    };

    return { redirectBasedOnOnboarding };
}
