/**
 * AgentContextProvider Component
 * Provides global access to Madison's agent behaviors
 *
 * Wrap your app with this to enable proactive suggestions
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAgentBehavior } from '@/hooks/useAgentBehavior';
import { AgentSuggestion } from './AgentSuggestion';
import { LibrarianDrawer } from '@/components/librarian';
import type { SuggestionType } from '@/types/librarian';

interface AgentContextValue {
    /** Trigger a custom suggestion */
    triggerSuggestion: (suggestion: {
        type: SuggestionType;
        message: string;
        secondaryMessage?: string;
        frameworkId?: string;
        context?: Record<string, unknown>;
    }) => void;
    /** Post-generation hook - call after content generation completes */
    onGenerationComplete: (contentType?: string) => void;
    /** Check if user is idle */
    isIdle: boolean;
    /** Dismiss current suggestion */
    dismissSuggestion: () => void;
    /** Open the librarian drawer */
    openLibrarian: () => void;
}

const AgentContext = createContext<AgentContextValue | null>(null);

interface AgentContextProviderProps {
    children?: ReactNode;
    /** Enable/disable agent behaviors globally */
    enabled?: boolean;
    /** Idle threshold in minutes (default: 10) */
    idleThresholdMinutes?: number;
}

export function AgentContextProvider({
    children,
    enabled = true,
    idleThresholdMinutes = 10,
}: AgentContextProviderProps) {
    const [isLibrarianOpen, setIsLibrarianOpen] = useState(false);

    const openLibrarian = () => setIsLibrarianOpen(true);
    const closeLibrarian = () => setIsLibrarianOpen(false);

    const {
        currentSuggestion,
        dismissSuggestion,
        acceptSuggestion,
        triggerSuggestion,
        isIdle,
        onGenerationComplete,
        checkWelcomeBack,
    } = useAgentBehavior({
        context: 'global',
        trackIdle: enabled,
        idleThreshold: idleThresholdMinutes * 60 * 1000,
        enabled,
    });

    // Check for welcome back on mount
    useEffect(() => {
        if (enabled) {
            checkWelcomeBack();
        }
    }, [enabled, checkWelcomeBack]);

    // Handle suggestion acceptance
    const handleAccept = () => {
        if (!currentSuggestion) return;

        // Different actions based on suggestion type
        switch (currentSuggestion.type) {
            case 'idle_prompt':
            case 'framework_recommend':
                // Open the librarian
                openLibrarian();
                break;
            case 'post_generation':
                // Could navigate to Multiply or show options
                // For now, just acknowledge
                break;
            case 'brand_health':
                // Could navigate to brand settings
                break;
            case 'welcome_back':
                // Could show recent work
                break;
            default:
                break;
        }

        acceptSuggestion();
    };

    // Get appropriate labels based on type
    const getAcceptLabel = (type: SuggestionType): string => {
        switch (type) {
            case 'idle_prompt':
            case 'framework_recommend':
                return 'Open The Librarian';
            case 'post_generation':
                return 'Show me how';
            case 'brand_health':
                return 'Let\'s address this';
            case 'welcome_back':
                return 'Continue where I left off';
            default:
                return 'Yes, please';
        }
    };

    const contextValue: AgentContextValue = {
        triggerSuggestion,
        onGenerationComplete,
        isIdle,
        dismissSuggestion,
        openLibrarian,
    };

    return (
        <AgentContext.Provider value={contextValue}>
            {children}

            {/* Render active suggestion */}
            {currentSuggestion && (
                <AgentSuggestion
                    type={currentSuggestion.type}
                    message={currentSuggestion.message}
                    secondaryMessage={currentSuggestion.secondaryMessage}
                    onAccept={handleAccept}
                    onDismiss={dismissSuggestion}
                    acceptLabel={getAcceptLabel(currentSuggestion.type)}
                    dismissLabel="Not now"
                    autoHideDuration={30000} // Auto-hide after 30 seconds
                />
            )}

            {/* Global Librarian Drawer instance */}
            <LibrarianDrawer
                isOpen={isLibrarianOpen}
                onClose={closeLibrarian}
                context="global"
            />
        </AgentContext.Provider>
    );
}

/**
 * Hook to access agent context
 * Must be used within AgentContextProvider
 */
export function useAgent(): AgentContextValue {
    const context = useContext(AgentContext);

    if (!context) {
        // Return a no-op implementation if not within provider
        // This allows components to use the hook without requiring the provider
        return {
            triggerSuggestion: () => { },
            onGenerationComplete: () => { },
            isIdle: false,
            dismissSuggestion: () => { },
            openLibrarian: () => { },
        };
    }

    return context;
}

export default AgentContextProvider;
