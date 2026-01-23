/**
 * AgentSuggestion Component
 * Floating suggestion card from Madison
 *
 * Appears as a subtle, dismissable notification with Madison's avatar
 * "Perhaps The Librarian might have something useful?"
 */

import React, { useState, useEffect } from 'react';
import { X, ChevronRight, BookOpen, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { SuggestionType } from '@/types/librarian';

interface AgentSuggestionProps {
    type: SuggestionType;
    message: string;
    secondaryMessage?: string;
    onAccept?: () => void;
    onDismiss?: () => void;
    acceptLabel?: string;
    dismissLabel?: string;
    autoHideDuration?: number; // ms, 0 = no auto-hide
    className?: string;
}

const SUGGESTION_ICONS: Record<SuggestionType, React.ElementType> = {
    idle_prompt: BookOpen,
    post_generation: Sparkles,
    framework_recommend: BookOpen,
    brand_health: AlertCircle,
    welcome_back: Sparkles,
    onboarding_help: Sparkles,
};

export function AgentSuggestion({
    type,
    message,
    secondaryMessage,
    onAccept,
    onDismiss,
    acceptLabel = 'Yes, please',
    dismissLabel = 'Not now',
    autoHideDuration = 0,
    className,
}: AgentSuggestionProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        if (autoHideDuration > 0) {
            const timer = setTimeout(() => {
                handleDismiss();
            }, autoHideDuration);
            return () => clearTimeout(timer);
        }
    }, [autoHideDuration]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onDismiss?.();
        }, 300);
    };

    const handleAccept = () => {
        setIsExiting(true);
        setTimeout(() => {
            setIsVisible(false);
            onAccept?.();
        }, 200);
    };

    if (!isVisible) return null;

    const Icon = SUGGESTION_ICONS[type];

    return (
        <div
            className={cn(
                'fixed bottom-6 right-6 z-50',
                'max-w-sm w-full',
                'animate-in slide-in-from-bottom-4 fade-in duration-300',
                isExiting && 'animate-out slide-out-to-bottom-4 fade-out duration-300',
                className
            )}
            role="alert"
            aria-live="polite"
        >
            <div className="relative bg-parchment-white border border-brand-brass/20 rounded-lg shadow-level-3 overflow-hidden">
                {/* Brass accent bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-brass via-brass-light to-brand-brass" />

                {/* Dismiss button */}
                <button
                    onClick={handleDismiss}
                    className="absolute top-3 right-3 p-1 rounded-md text-charcoal/40 hover:text-charcoal/70 hover:bg-stone/10 transition-colors"
                    aria-label="Dismiss"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="p-4 pr-10">
                    {/* Madison avatar and message */}
                    <div className="flex items-start gap-3">
                        {/* Madison's avatar */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-brass to-stone flex items-center justify-center shadow-md">
                            <span className="font-serif text-lg font-bold text-parchment-white">M</span>
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Main message */}
                            <p className="text-sm text-ink-black leading-relaxed font-medium">
                                {message}
                            </p>

                            {/* Secondary message */}
                            {secondaryMessage && (
                                <p className="mt-1 text-xs text-charcoal/70 leading-relaxed">
                                    {secondaryMessage}
                                </p>
                            )}

                            {/* Action buttons */}
                            <div className="mt-3 flex items-center gap-2">
                                {onAccept && (
                                    <Button
                                        size="sm"
                                        className="bg-brand-brass hover:bg-brand-brass/90 text-parchment-white text-xs h-8"
                                        onClick={handleAccept}
                                    >
                                        {acceptLabel}
                                        <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-charcoal/60 hover:text-charcoal text-xs h-8"
                                    onClick={handleDismiss}
                                >
                                    {dismissLabel}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Minimal inline suggestion (for use within content areas)
 */
interface InlineSuggestionProps {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export function InlineSuggestion({
    message,
    actionLabel = 'Show me',
    onAction,
    className,
}: InlineSuggestionProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg',
                'bg-brand-brass/5 border border-brand-brass/10',
                className
            )}
        >
            <div className="w-6 h-6 rounded-full bg-brand-brass/10 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-brand-brass" />
            </div>
            <p className="flex-1 text-sm text-charcoal italic">
                {message}
            </p>
            {onAction && (
                <button
                    onClick={onAction}
                    className="text-xs text-brand-brass hover:text-brand-brass/80 font-medium flex items-center gap-1 transition-colors"
                >
                    {actionLabel}
                    <ChevronRight className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
