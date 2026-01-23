/**
 * AlphabetScroller Component
 * Haptic A-Z navigation with brass styling
 *
 * The signature "index card catalogue" feel with satisfying letter selection
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { AlphabetScrollerProps } from '@/types/librarian';
import { ALPHABET } from '@/types/librarian';

interface ExtendedAlphabetScrollerProps extends AlphabetScrollerProps {
    className?: string;
    orientation?: 'vertical' | 'horizontal';
}

export function AlphabetScroller({
    selectedLetter,
    availableLetters,
    onLetterSelect,
    className,
    orientation = 'vertical'
}: ExtendedAlphabetScrollerProps) {
    const handleLetterClick = (letter: string) => {
        // Only allow clicking letters that have frameworks
        if (availableLetters.includes(letter)) {
            // Haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate(10);
            }
            onLetterSelect(letter);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent, letter: string) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleLetterClick(letter);
        }
    };

    return (
        <div
            className={cn(
                'alphabet-scroller',
                orientation === 'horizontal' && 'flex-row flex-wrap justify-center',
                className
            )}
            role="navigation"
            aria-label="Alphabetical navigation"
        >
            {ALPHABET.map((letter) => {
                const isAvailable = availableLetters.includes(letter);
                const isActive = selectedLetter === letter;

                return (
                    <button
                        key={letter}
                        className={cn(
                            'alphabet-letter',
                            isActive && 'active',
                            !isAvailable && 'opacity-30 cursor-not-allowed'
                        )}
                        disabled={!isAvailable}
                        onClick={() => handleLetterClick(letter)}
                        onKeyDown={(e) => handleKeyDown(e, letter)}
                        aria-label={`Jump to ${letter}`}
                        aria-pressed={isActive}
                        tabIndex={isAvailable ? 0 : -1}
                    >
                        {letter}
                    </button>
                );
            })}
        </div>
    );
}
