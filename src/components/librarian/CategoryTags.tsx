/**
 * CategoryTags Component
 * Channel and industry tags for frameworks
 *
 * Shows applicable channels and target industries
 */

import React from 'react';
import {
    Mail,
    Share2,
    Globe,
    ShoppingBag,
    MessageSquare,
    Video,
    FileText,
    Instagram,
    Linkedin,
    Twitter,
    Printer
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FrameworkChannel, FrameworkCategory, FrameworkIntent } from '@/types/librarian';
import { CHANNELS } from '@/types/librarian';

// Icon mapping
const CHANNEL_ICONS: Record<FrameworkChannel, React.ElementType> = {
    email: Mail,
    social: Share2,
    web: Globe,
    marketplace: ShoppingBag,
    sms: MessageSquare,
    video: Video,
    blog: FileText,
    instagram: Instagram,
    linkedin: Linkedin,
    twitter: Twitter,
    print: Printer,
};

interface ChannelTagProps {
    channel: FrameworkChannel;
    size?: 'sm' | 'md';
    showLabel?: boolean;
    className?: string;
}

export function ChannelTag({
    channel,
    size = 'sm',
    showLabel = true,
    className
}: ChannelTagProps) {
    const channelInfo = CHANNELS[channel];
    const Icon = CHANNEL_ICONS[channel];

    if (!channelInfo) return null;

    return (
        <div
            className={cn(
                'channel-tag',
                size === 'md' && 'px-3 py-1.5',
                className
            )}
            style={{
                borderColor: `${channelInfo.color}20`,
                backgroundColor: `${channelInfo.color}08`
            }}
        >
            <Icon
                className="channel-tag-icon"
                style={{ color: channelInfo.color }}
            />
            {showLabel && (
                <span style={{ color: channelInfo.color }}>
                    {channelInfo.name}
                </span>
            )}
        </div>
    );
}

/**
 * Category Tag (Copy, Image, Video)
 */
interface CategoryTagProps {
    category: FrameworkCategory;
    size?: 'sm' | 'md';
    className?: string;
}

const CATEGORY_LABELS: Record<FrameworkCategory, string> = {
    copy: 'Copy',
    image: 'Image',
    video: 'Video',
};

const CATEGORY_COLORS: Record<FrameworkCategory, string> = {
    copy: '#B8956A',
    image: '#8B5CF6',
    video: '#EF4444',
};

export function CategoryTag({ category, size = 'sm', className }: CategoryTagProps) {
    const color = CATEGORY_COLORS[category];

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                size === 'md' && 'px-3 py-1 text-xs',
                className
            )}
            style={{
                backgroundColor: `${color}15`,
                color: color,
                border: `1px solid ${color}30`,
            }}
        >
            {CATEGORY_LABELS[category]}
        </span>
    );
}

/**
 * Intent Tag (Launch, Nurture, Convert, Retain, Win-back)
 */
interface IntentTagProps {
    intent: FrameworkIntent;
    size?: 'sm' | 'md';
    className?: string;
}

const INTENT_LABELS: Record<FrameworkIntent, string> = {
    launch: 'Launch',
    nurture: 'Nurture',
    convert: 'Convert',
    retain: 'Retain',
    winback: 'Win-back',
};

const INTENT_COLORS: Record<FrameworkIntent, string> = {
    launch: '#F97316',
    nurture: '#10B981',
    convert: '#4A90E2',
    retain: '#8B5CF6',
    winback: '#EF4444',
};

export function IntentTag({ intent, size = 'sm', className }: IntentTagProps) {
    const color = INTENT_COLORS[intent];

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider',
                size === 'md' && 'px-3 py-1 text-xs',
                className
            )}
            style={{
                backgroundColor: `${color}10`,
                color: color,
            }}
        >
            {INTENT_LABELS[intent]}
        </span>
    );
}

/**
 * Industry Tags
 */
interface IndustryTagsProps {
    industries: string[];
    max?: number;
    className?: string;
}

const INDUSTRY_LABELS: Record<string, string> = {
    fragrance: 'Fragrance',
    skincare: 'Skincare',
    home_fragrance: 'Home Fragrance',
    candles: 'Candles',
    wellness: 'Wellness',
    luxury: 'Luxury',
    general: 'General',
    fashion: 'Fashion',
    beauty: 'Beauty',
    food_beverage: 'Food & Beverage',
};

export function IndustryTags({ industries, max = 3, className }: IndustryTagsProps) {
    const displayIndustries = industries.slice(0, max);
    const remaining = industries.length - max;

    return (
        <div className={cn('flex flex-wrap gap-1', className)}>
            {displayIndustries.map((industry) => (
                <span
                    key={industry}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-charcoal/70 bg-stone/10"
                >
                    {INDUSTRY_LABELS[industry] || industry}
                </span>
            ))}
            {remaining > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] text-charcoal/50">
                    +{remaining} more
                </span>
            )}
        </div>
    );
}
