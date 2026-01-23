/**
 * LibrarianTrigger Component
 * Brass pull-tab button that opens The Librarian drawer
 *
 * Can be used as a floating tab or inline button
 */

import React, { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LibrarianDrawer } from './LibrarianDrawer';
import type { FrameworkCategory, UsageContext, LibrarianFramework } from '@/types/librarian';

interface LibrarianTriggerProps {
    /** Visual style of the trigger */
    variant?: 'tab' | 'button' | 'icon' | 'link';
    /** Where this trigger is being used from */
    context?: UsageContext;
    /** Initial category filter when opening */
    category?: FrameworkCategory;
    /** Custom label text */
    label?: string;
    /** Callback when a framework is selected */
    onFrameworkSelect?: (framework: LibrarianFramework) => void;
    /** Controlled open state */
    open?: boolean;
    /** Controlled open state change handler */
    onOpenChange?: (open: boolean) => void;
    /** Additional class names */
    className?: string;
}

export function LibrarianTrigger({
    variant = 'button',
    context = 'global',
    category,
    label = 'The Librarian',
    onFrameworkSelect,
    className,
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange,
}: LibrarianTriggerProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Determine if controlled or uncontrolled
    const isControlled = controlledOpen !== undefined;
    const isOpen = isControlled ? controlledOpen : internalIsOpen;

    // Handle open change
    const setIsOpen = (newOpen: boolean) => {
        if (!isControlled) {
            setInternalIsOpen(newOpen);
        }
        controlledOnOpenChange?.(newOpen);
    };

    const handleFrameworkSelect = (framework: LibrarianFramework) => {
        onFrameworkSelect?.(framework);
        setIsOpen(false);
    };

    // Floating tab style (fixed to right edge)
    if (variant === 'tab') {
        return (
            <>
                <button
                    className={cn('librarian-trigger-tab', className)}
                    onClick={() => setIsOpen(true)}
                    aria-label="Open The Librarian"
                >
                    <BookOpen className="w-4 h-4" />
                </button>

                <LibrarianDrawer
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    context={context}
                    initialCategory={category}
                    onFrameworkSelect={handleFrameworkSelect}
                />
            </>
        );
    }

    // Icon-only button
    if (variant === 'icon') {
        return (
            <>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                                'text-charcoal/60 hover:text-brand-brass hover:bg-brand-brass/10',
                                className
                            )}
                            onClick={() => setIsOpen(true)}
                            aria-label="Open The Librarian"
                        >
                            <BookOpen className="h-4 w-4" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Open The Librarian</p>
                    </TooltipContent>
                </Tooltip>

                <LibrarianDrawer
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    context={context}
                    initialCategory={category}
                    onFrameworkSelect={handleFrameworkSelect}
                />
            </>
        );
    }

    // Link style
    if (variant === 'link') {
        return (
            <>
                <button
                    className={cn(
                        'inline-flex items-center gap-1.5 text-sm text-brand-brass hover:text-brand-brass/80 underline-offset-4 hover:underline transition-colors',
                        className
                    )}
                    onClick={() => setIsOpen(true)}
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{label}</span>
                </button>

                <LibrarianDrawer
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                    context={context}
                    initialCategory={category}
                    onFrameworkSelect={handleFrameworkSelect}
                />
            </>
        );
    }

    // Default button style
    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    'border-brand-brass/30 text-brand-brass hover:bg-brand-brass/10 hover:border-brand-brass/50',
                    className
                )}
                onClick={() => setIsOpen(true)}
            >
                <BookOpen className="h-4 w-4 mr-2" />
                {label}
            </Button>

            <LibrarianDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                context={context}
                initialCategory={category}
                onFrameworkSelect={handleFrameworkSelect}
            />
        </>
    );
}

/**
 * Hook-based approach for more control over the Librarian
 */
export function useLibrarian(options: {
    context?: UsageContext;
    category?: FrameworkCategory;
} = {}) {
    const [isOpen, setIsOpen] = useState(false);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        toggle: () => setIsOpen((prev) => !prev),
        DrawerComponent: (props: { onFrameworkSelect?: (framework: LibrarianFramework) => void }) => (
            <LibrarianDrawer
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                context={options.context}
                initialCategory={options.category}
                onFrameworkSelect={props.onFrameworkSelect}
            />
        ),
    };
}
