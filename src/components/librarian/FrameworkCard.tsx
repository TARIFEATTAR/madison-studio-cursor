/**
 * FrameworkCard Component
 * Individual index card with pull animation
 *
 * Displays framework preview with expand capability
 * Like pulling a card from a library catalogue drawer
 */

import React, { useState, useCallback } from 'react';
import { Copy, ChevronDown, ChevronUp, Check, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LibrarianFramework, FrameworkCardProps } from '@/types/librarian';
import { MastersBadge, MastersDetail } from './MastersBadge';
import { ChannelTag, CategoryTag, IntentTag, IndustryTags } from './CategoryTags';
import { AwarenessIndicator, AwarenessDetail } from './AwarenessIndicator';
import { toast } from '@/hooks/use-toast';

interface ExtendedFrameworkCardProps extends FrameworkCardProps {
    onUse?: (framework: LibrarianFramework) => void;
    isDraggable?: boolean;
    className?: string;
}

export function FrameworkCard({
    framework,
    isExpanded = false,
    onExpand,
    onCollapse,
    onCopy,
    onDrag,
    onUse,
    isDraggable = true,
    className,
}: ExtendedFrameworkCardProps) {
    const [isCopied, setIsCopied] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleToggleExpand = useCallback(() => {
        if (isExpanded) {
            onCollapse?.();
        } else {
            onExpand?.();
        }
    }, [isExpanded, onExpand, onCollapse]);

    const handleCopy = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();

        try {
            await navigator.clipboard.writeText(framework.framework_content);
            setIsCopied(true);
            onCopy?.();

            // Madison's voice: "Framework acquired"
            toast({
                title: "Framework acquired.",
                description: "Do make good use of it.",
            });

            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Something's gone awry.",
                description: "The framework couldn't be copied. Do try again.",
            });
        }
    }, [framework.framework_content, onCopy]);

    const handleUse = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        onUse?.(framework);
        handleCopy(e);
    }, [framework, onUse, handleCopy]);

    const handleDragStart = useCallback((e: React.DragEvent) => {
        e.dataTransfer.setData('text/plain', framework.framework_content);
        e.dataTransfer.setData('application/x-librarian-framework', JSON.stringify({
            id: framework.id,
            title: framework.title,
        }));
        e.dataTransfer.effectAllowed = 'copy';
        onDrag?.();
    }, [framework, onDrag]);

    return (
        <div
            className={cn(
                'framework-card',
                isExpanded && 'expanded',
                className
            )}
            onClick={handleToggleExpand}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            draggable={isDraggable}
            onDragStart={handleDragStart}
            role="article"
            aria-expanded={isExpanded}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggleExpand();
                }
            }}
        >
            {/* Drag handle (visible on hover) */}
            {isDraggable && isHovered && !isExpanded && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-50">
                    <GripVertical className="w-4 h-4 text-stone" />
                </div>
            )}

            {/* Card Header */}
            <div className="framework-card-header">
                <div className="flex-1">
                    <div className="flex items-start gap-2 mb-2">
                        <h3 className="framework-card-title">{framework.title}</h3>
                        <CategoryTag category={framework.category} />
                    </div>

                    {/* Quick info row */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <MastersBadge masters={framework.masters} />
                        <ChannelTag channel={framework.channel} size="sm" />
                        <AwarenessIndicator stage={framework.awareness_stage} showLabel={false} />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Copy button */}
                    <button
                        className={cn(
                            'p-2 rounded-md transition-all duration-200',
                            isCopied
                                ? 'bg-muted-sage/20 text-muted-sage'
                                : 'hover:bg-brand-brass/10 text-charcoal/60 hover:text-brand-brass'
                        )}
                        onClick={handleCopy}
                        aria-label={isCopied ? 'Copied' : 'Copy framework'}
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4" />
                        ) : (
                            <Copy className="w-4 h-4" />
                        )}
                    </button>

                    {/* Expand/Collapse indicator */}
                    <div className="text-charcoal/40">
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                        ) : (
                            <ChevronDown className="w-5 h-5" />
                        )}
                    </div>
                </div>
            </div>

            {/* Short description (collapsed view) */}
            {!isExpanded && framework.short_description && (
                <p className="framework-card-description mt-2">
                    {framework.short_description}
                </p>
            )}

            {/* Expanded Content */}
            {isExpanded && (
                <div className="framework-expanded-content">
                    {/* Tags row */}
                    <div className="flex items-center gap-2 flex-wrap mb-4">
                        <IntentTag intent={framework.intent} />
                        <IndustryTags industries={framework.industries} />
                    </div>

                    {/* Masters detail */}
                    <MastersDetail masters={framework.masters} className="mb-4" />

                    {/* Awareness detail */}
                    <AwarenessDetail stage={framework.awareness_stage} className="mb-4" />

                    {/* Framework content */}
                    <div className="mb-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-charcoal/60 mb-2">
                            Framework
                        </h4>
                        <div className="framework-content-block">
                            {framework.framework_content}
                        </div>
                    </div>

                    {/* Madison's Note */}
                    <div className="madison-note">
                        <div className="madison-note-avatar">M</div>
                        <p>{framework.madison_note}</p>
                    </div>

                    {/* Example output (if available) */}
                    {framework.example_output && (
                        <details className="mb-4">
                            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wider text-charcoal/60 hover:text-brand-brass transition-colors">
                                Example Output
                            </summary>
                            <div className="mt-2 p-4 bg-stone/5 rounded-md text-sm text-charcoal/80 italic">
                                {framework.example_output}
                            </div>
                        </details>
                    )}

                    {/* Use This Button */}
                    <button className="use-framework-button" onClick={handleUse}>
                        <Copy className="w-4 h-4" />
                        <span>Use This Framework</span>
                    </button>
                </div>
            )}
        </div>
    );
}

/**
 * Loading skeleton for framework cards
 */
export function FrameworkCardSkeleton() {
    return (
        <div className="framework-skeleton">
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                    <div className="framework-skeleton-title" />
                    <div className="flex gap-2 mt-2">
                        <div className="w-16 h-5 bg-brand-brass/10 rounded" />
                        <div className="w-12 h-5 bg-stone/10 rounded" />
                    </div>
                </div>
                <div className="w-8 h-8 bg-stone/10 rounded" />
            </div>
            <div className="framework-skeleton-description" />
            <div className="framework-skeleton-description" />
        </div>
    );
}
