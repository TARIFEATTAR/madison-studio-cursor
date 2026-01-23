/**
 * useAgentBehavior Hook
 * Manages Madison's proactive agent behaviors
 *
 * Triggers context-aware suggestions based on user activity
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { SuggestionType, LibrarianFramework } from '@/types/librarian';

interface AgentSuggestion {
    id: string;
    type: SuggestionType;
    message: string;
    secondaryMessage?: string;
    frameworkId?: string;
    context?: Record<string, unknown>;
}

interface UseAgentBehaviorOptions {
    /** Current page/context the user is on */
    context: 'forge' | 'dark_room' | 'multiply' | 'dashboard' | 'library' | 'global';
    /** Whether to track idle time */
    trackIdle?: boolean;
    /** Idle threshold in milliseconds */
    idleThreshold?: number;
    /** Whether agent behaviors are enabled */
    enabled?: boolean;
}

interface UseAgentBehaviorReturn {
    /** Current active suggestion (if any) */
    currentSuggestion: AgentSuggestion | null;
    /** Dismiss the current suggestion */
    dismissSuggestion: () => void;
    /** Accept the current suggestion */
    acceptSuggestion: () => void;
    /** Trigger a specific suggestion manually */
    triggerSuggestion: (suggestion: Omit<AgentSuggestion, 'id'>) => void;
    /** Check if user is idle */
    isIdle: boolean;
    /** Post-generation hook */
    onGenerationComplete: (contentType?: string) => void;
    /** Welcome back hook */
    checkWelcomeBack: () => void;
}

// Madison's suggestion messages by type
const SUGGESTION_MESSAGES: Record<SuggestionType, { message: string; secondary?: string }[]> = {
    idle_prompt: [
        {
            message: "Perhaps The Librarian might have something useful?",
            secondary: "I could suggest a framework to get you started."
        },
        {
            message: "Shall I assist?",
            secondary: "I've noticed you've been here a while."
        },
        {
            message: "A framework might provide some inspiration.",
            secondary: "The Librarian has quite the collection."
        },
    ],
    post_generation: [
        {
            message: "That's come together rather well.",
            secondary: "Shall I suggest how to multiply this content across channels?"
        },
        {
            message: "Rather pleased with this one.",
            secondary: "I'd recommend exploring the derivatives options."
        },
    ],
    framework_recommend: [
        {
            message: "I have a framework that might suit this perfectly.",
        },
        {
            message: "This particular framework has proven rather effective.",
            secondary: "I've seen it perform beautifully for similar work."
        },
    ],
    brand_health: [
        {
            message: "I've noticed a few gaps in your brand documentation.",
            secondary: "Shall we address the voice guidelines first?"
        },
    ],
    welcome_back: [
        {
            message: "Welcome back.",
            secondary: "Shall we continue where you left off?"
        },
    ],
    onboarding_help: [
        {
            message: "This can be rather powerful.",
            secondary: "Shall I walk you through your first session?"
        },
    ],
};

// Get random message from type
function getRandomMessage(type: SuggestionType) {
    const messages = SUGGESTION_MESSAGES[type];
    return messages[Math.floor(Math.random() * messages.length)];
}

export function useAgentBehavior(options: UseAgentBehaviorOptions): UseAgentBehaviorReturn {
    const {
        context,
        trackIdle = true,
        idleThreshold = 10 * 60 * 1000, // 10 minutes default
        enabled = true,
    } = options;

    const [currentSuggestion, setCurrentSuggestion] = useState<AgentSuggestion | null>(null);
    const [isIdle, setIsIdle] = useState(false);
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());
    const suggestionCooldownRef = useRef<Set<SuggestionType>>(new Set());

    // Reset idle timer on activity
    const resetIdleTimer = useCallback(() => {
        lastActivityRef.current = Date.now();
        setIsIdle(false);

        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }

        if (trackIdle && enabled) {
            idleTimerRef.current = setTimeout(() => {
                setIsIdle(true);

                // Check if we should show idle suggestion
                if (!suggestionCooldownRef.current.has('idle_prompt') && !currentSuggestion) {
                    const { message, secondary } = getRandomMessage('idle_prompt');
                    setCurrentSuggestion({
                        id: `idle-${Date.now()}`,
                        type: 'idle_prompt',
                        message,
                        secondaryMessage: secondary,
                    });

                    // Add to cooldown for 30 minutes
                    suggestionCooldownRef.current.add('idle_prompt');
                    setTimeout(() => {
                        suggestionCooldownRef.current.delete('idle_prompt');
                    }, 30 * 60 * 1000);
                }
            }, idleThreshold);
        }
    }, [trackIdle, enabled, idleThreshold, currentSuggestion]);

    // Track user activity
    useEffect(() => {
        if (!enabled) return;

        const handleActivity = () => resetIdleTimer();

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);
        window.addEventListener('scroll', handleActivity);

        resetIdleTimer();

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            window.removeEventListener('scroll', handleActivity);

            if (idleTimerRef.current) {
                clearTimeout(idleTimerRef.current);
            }
        };
    }, [enabled, resetIdleTimer]);

    // Log suggestion to database
    const logSuggestion = useCallback(async (
        suggestion: AgentSuggestion,
        response: 'accepted' | 'dismissed'
    ) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await (supabase as any).from('agent_suggestions_log').insert({
                user_id: user.id,
                suggestion_type: suggestion.type,
                suggestion_content: suggestion.message,
                trigger_context: { context, ...suggestion.context },
                framework_id: suggestion.frameworkId || null,
                accepted: response === 'accepted',
                dismissed: response === 'dismissed',
                responded_at: new Date().toISOString(),
            });
        } catch (err) {
            console.error('[Agent] Error logging suggestion:', err);
        }
    }, [context]);

    // Dismiss current suggestion
    const dismissSuggestion = useCallback(() => {
        if (currentSuggestion) {
            logSuggestion(currentSuggestion, 'dismissed');
            setCurrentSuggestion(null);
        }
    }, [currentSuggestion, logSuggestion]);

    // Accept current suggestion
    const acceptSuggestion = useCallback(() => {
        if (currentSuggestion) {
            logSuggestion(currentSuggestion, 'accepted');
            setCurrentSuggestion(null);
        }
    }, [currentSuggestion, logSuggestion]);

    // Trigger a suggestion manually
    const triggerSuggestion = useCallback((suggestion: Omit<AgentSuggestion, 'id'>) => {
        if (!enabled) return;

        setCurrentSuggestion({
            ...suggestion,
            id: `${suggestion.type}-${Date.now()}`,
        });
    }, [enabled]);

    // Post-generation suggestion
    const onGenerationComplete = useCallback((contentType?: string) => {
        if (!enabled) return;
        if (suggestionCooldownRef.current.has('post_generation')) return;
        if (currentSuggestion) return;

        // Wait a moment before showing
        setTimeout(() => {
            const { message, secondary } = getRandomMessage('post_generation');
            setCurrentSuggestion({
                id: `post-gen-${Date.now()}`,
                type: 'post_generation',
                message,
                secondaryMessage: secondary,
                context: { contentType },
            });

            // Cooldown for 15 minutes
            suggestionCooldownRef.current.add('post_generation');
            setTimeout(() => {
                suggestionCooldownRef.current.delete('post_generation');
            }, 15 * 60 * 1000);
        }, 2000);
    }, [enabled, currentSuggestion]);

    // Check for welcome back state
    const checkWelcomeBack = useCallback(async () => {
        if (!enabled) return;

        try {
            // Check last session time from localStorage
            const lastSession = localStorage.getItem('madison_last_session');
            const now = Date.now();

            if (lastSession) {
                const lastTime = parseInt(lastSession, 10);
                const hoursSince = (now - lastTime) / (1000 * 60 * 60);

                // If more than 24 hours since last session
                if (hoursSince > 24 && !suggestionCooldownRef.current.has('welcome_back')) {
                    setTimeout(() => {
                        const { message, secondary } = getRandomMessage('welcome_back');
                        setCurrentSuggestion({
                            id: `welcome-${Date.now()}`,
                            type: 'welcome_back',
                            message,
                            secondaryMessage: secondary,
                        });
                    }, 3000);

                    suggestionCooldownRef.current.add('welcome_back');
                }
            }

            // Update last session time
            localStorage.setItem('madison_last_session', now.toString());
        } catch (err) {
            console.error('[Agent] Error checking welcome back:', err);
        }
    }, [enabled]);

    return {
        currentSuggestion,
        dismissSuggestion,
        acceptSuggestion,
        triggerSuggestion,
        isIdle,
        onGenerationComplete,
        checkWelcomeBack,
    };
}
