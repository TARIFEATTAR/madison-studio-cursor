/**
 * ViewToggle Component
 * Switch between organisational views
 *
 * Alphabetical | By Channel | By Intent | By Masters
 */

import React from 'react';
import {
    ArrowDownAZ,
    MessageSquare,
    Target,
    Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LibrarianViewMode } from '@/types/librarian';

interface ViewToggleProps {
    viewMode: LibrarianViewMode;
    onViewModeChange: (mode: LibrarianViewMode) => void;
    className?: string;
}

interface ViewOption {
    mode: LibrarianViewMode;
    label: string;
    icon: React.ElementType;
}

const VIEW_OPTIONS: ViewOption[] = [
    { mode: 'alphabetical', label: 'A–Z', icon: ArrowDownAZ },
    { mode: 'channel', label: 'Channel', icon: MessageSquare },
    { mode: 'intent', label: 'Intent', icon: Target },
    { mode: 'masters', label: 'Masters', icon: Sparkles },
];

export function ViewToggle({
    viewMode,
    onViewModeChange,
    className
}: ViewToggleProps) {
    return (
        <div className={cn('view-toggle', className)} role="tablist">
            {VIEW_OPTIONS.map(({ mode, label, icon: Icon }) => (
                <button
                    key={mode}
                    className={cn(
                        'view-toggle-button',
                        viewMode === mode && 'active'
                    )}
                    onClick={() => onViewModeChange(mode)}
                    role="tab"
                    aria-selected={viewMode === mode}
                    aria-controls={`view-${mode}`}
                >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{label}</span>
                </button>
            ))}
        </div>
    );
}
