/**
 * MastersBadge Component
 * Shows which Madison Masters the framework channels
 *
 * Elegant brass-toned badge displaying methodology influences
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MadisonMaster } from '@/types/librarian';
import { MADISON_MASTERS } from '@/types/librarian';

interface MastersBadgeProps {
    masters: MadisonMaster[];
    showNames?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

export function MastersBadge({
    masters,
    showNames = false,
    size = 'sm',
    className
}: MastersBadgeProps) {
    if (!masters.length) return null;

    // Get readable names
    const masterNames = masters
        .map((m) => MADISON_MASTERS[m]?.name.split(' ').pop()) // Get last name
        .filter(Boolean);

    return (
        <div
            className={cn(
                'masters-badge',
                size === 'md' && 'px-3 py-1.5 text-xs',
                className
            )}
            title={masters.map((m) => MADISON_MASTERS[m]?.name).join(' · ')}
        >
            <Sparkles className="masters-badge-icon" />
            {showNames ? (
                <span>{masterNames.join(' · ')}</span>
            ) : (
                <span>{masters.length} Master{masters.length !== 1 ? 's' : ''}</span>
            )}
        </div>
    );
}

/**
 * Extended view showing all masters with their specialties
 */
interface MastersDetailProps {
    masters: MadisonMaster[];
    className?: string;
}

export function MastersDetail({ masters, className }: MastersDetailProps) {
    if (!masters.length) return null;

    return (
        <div className={cn('space-y-2', className)}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Channelling
            </h4>
            <div className="flex flex-wrap gap-2">
                {masters.map((masterId) => {
                    const master = MADISON_MASTERS[masterId];
                    if (!master) return null;

                    return (
                        <div
                            key={masterId}
                            className="flex items-center gap-2 px-3 py-2 bg-brand-brass/5 rounded-md border border-brand-brass/10"
                        >
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: master.color }}
                            />
                            <div className="flex flex-col">
                                <span className="text-xs font-medium text-ink-black">
                                    {master.name}
                                </span>
                                <span className="text-[10px] text-charcoal/70">
                                    {master.specialty}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
