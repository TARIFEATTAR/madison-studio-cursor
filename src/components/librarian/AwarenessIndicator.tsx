/**
 * AwarenessIndicator Component
 * Visual representation of Schwartz's Awareness Stages
 *
 * Shows where in the buyer's journey this framework targets
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { AwarenessStage } from '@/types/librarian';
import { AWARENESS_STAGES } from '@/types/librarian';

interface AwarenessIndicatorProps {
    stage: AwarenessStage;
    showLabel?: boolean;
    size?: 'sm' | 'md';
    className?: string;
}

const STAGE_ORDER: AwarenessStage[] = ['unaware', 'problem', 'solution', 'product', 'most'];

export function AwarenessIndicator({
    stage,
    showLabel = true,
    size = 'sm',
    className
}: AwarenessIndicatorProps) {
    const stageInfo = AWARENESS_STAGES[stage];
    const stageIndex = STAGE_ORDER.indexOf(stage);

    return (
        <div className={cn('awareness-indicator', className)}>
            <div className="awareness-stages">
                {STAGE_ORDER.map((s, index) => (
                    <div
                        key={s}
                        className={cn(
                            'awareness-stage-dot',
                            index <= stageIndex && 'active',
                            size === 'md' && 'w-3 h-3'
                        )}
                        title={AWARENESS_STAGES[s].name}
                    />
                ))}
            </div>
            {showLabel && (
                <span className={cn(
                    'awareness-label',
                    size === 'md' && 'text-sm'
                )}>
                    {stageInfo.name}
                </span>
            )}
        </div>
    );
}

/**
 * Extended view with full awareness stage explanation
 */
interface AwarenessDetailProps {
    stage: AwarenessStage;
    className?: string;
}

export function AwarenessDetail({ stage, className }: AwarenessDetailProps) {
    const stageInfo = AWARENESS_STAGES[stage];
    const stageIndex = STAGE_ORDER.indexOf(stage);

    return (
        <div className={cn('space-y-3', className)}>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60">
                Awareness Stage
            </h4>

            {/* Visual progression */}
            <div className="flex items-center gap-1">
                {STAGE_ORDER.map((s, index) => (
                    <React.Fragment key={s}>
                        <div
                            className={cn(
                                'flex-1 h-1.5 rounded-full transition-colors duration-300',
                                index <= stageIndex
                                    ? 'bg-brand-brass'
                                    : 'bg-stone/30'
                            )}
                        />
                        {index < STAGE_ORDER.length - 1 && (
                            <div
                                className={cn(
                                    'w-1 h-1 rounded-full',
                                    index < stageIndex
                                        ? 'bg-brand-brass'
                                        : 'bg-stone/20'
                                )}
                            />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Stage labels */}
            <div className="flex justify-between text-[10px] text-charcoal/50">
                <span>Unaware</span>
                <span>Most Aware</span>
            </div>

            {/* Current stage info */}
            <div className="p-3 bg-brand-brass/5 rounded-md border border-brand-brass/10">
                <div className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-brand-brass" />
                    <span className="text-sm font-medium text-ink-black">
                        {stageInfo.name}
                    </span>
                </div>
                <p className="text-xs text-charcoal/70 mb-2">
                    {stageInfo.description}
                </p>
                <p className="text-xs text-brand-brass">
                    <span className="font-medium">Approach:</span> {stageInfo.approach}
                </p>
            </div>
        </div>
    );
}
