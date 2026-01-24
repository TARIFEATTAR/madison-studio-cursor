/**
 * AssetRack - Right Panel for The Cutting Room
 *
 * Quick presets, video history, and pro mode settings
 * Matches Dark Room's RightPanel aesthetic
 */

import React, { useState } from 'react';
import {
    Sparkles, Film, Settings2, Clock,
    ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import '@/styles/darkroom.css';
import '@/styles/cuttingroom.css';

export type VideoPreset = 'cinematic' | 'product_spin' | 'social_reel' | 'ambient' | 'custom';
export type AIProvider = 'auto' | 'runway' | 'luma' | 'pika';
export type VideoQuality = 'standard' | 'hd' | '4k';

interface AssetRackProps {
    selectedPreset: VideoPreset;
    onPresetChange: (preset: VideoPreset) => void;
    aiProvider: AIProvider;
    onAIProviderChange: (provider: AIProvider) => void;
    quality: VideoQuality;
    onQualityChange: (quality: VideoQuality) => void;
    recentClipsCount: number;
    creditsRemaining?: number;
}

const PRESETS: { value: VideoPreset; label: string; description: string; icon: React.ReactNode }[] = [
    {
        value: 'cinematic',
        label: 'Cinematic',
        description: 'Dramatic lighting, slow motion',
        icon: <Film className="w-4 h-4" />,
    },
    {
        value: 'product_spin',
        label: 'Product Spin',
        description: '360° rotation showcase',
        icon: <Sparkles className="w-4 h-4" />,
    },
    {
        value: 'social_reel',
        label: 'Social Reel',
        description: 'Fast-paced, vertical format',
        icon: <Zap className="w-4 h-4" />,
    },
    {
        value: 'ambient',
        label: 'Ambient',
        description: 'Subtle motion, atmospheric',
        icon: <Clock className="w-4 h-4" />,
    },
];

const AI_PROVIDERS: { value: AIProvider; label: string }[] = [
    { value: 'auto', label: 'Auto (Best Available)' },
    { value: 'runway', label: 'Runway Gen-3' },
    { value: 'luma', label: 'Luma Dream Machine' },
    { value: 'pika', label: 'Pika Labs' },
];

const QUALITY_OPTIONS: { value: VideoQuality; label: string }[] = [
    { value: 'standard', label: 'Standard (720p)' },
    { value: 'hd', label: 'HD (1080p)' },
    { value: '4k', label: '4K Ultra HD' },
];

export function AssetRack({
    selectedPreset,
    onPresetChange,
    aiProvider,
    onAIProviderChange,
    quality,
    onQualityChange,
    recentClipsCount,
    creditsRemaining,
}: AssetRackProps) {
    const [proModeOpen, setProModeOpen] = useState(false);

    return (
        <div className="right-panel">
            {/* Quick Presets Section */}
            <div className="right-panel__section">
                <div className="right-panel__section-title">
                    <Sparkles className="w-3.5 h-3.5" />
                    Quick Presets
                </div>

                <div className="grid grid-cols-2 gap-2">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.value}
                            onClick={() => onPresetChange(preset.value)}
                            className={cn(
                                "flex flex-col items-start p-3 rounded-lg text-left transition-all",
                                "border",
                                selectedPreset === preset.value
                                    ? "bg-[#B8956A]/10 border-[#B8956A]/50 text-[#B8956A]"
                                    : "bg-[#0a0a0a] border-white/10 text-white/70 hover:border-white/20 hover:text-white"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {preset.icon}
                                <span className="text-xs font-medium">{preset.label}</span>
                            </div>
                            <span className="text-[10px] text-white/40 leading-snug">
                                {preset.description}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Clips Section */}
            <div className="right-panel__section">
                <div className="right-panel__section-title">
                    <Film className="w-3.5 h-3.5" />
                    Recent Clips
                </div>

                <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-4 text-center">
                    <Film className="w-6 h-6 text-white/20 mx-auto mb-2" />
                    <p className="text-xs text-white/40">
                        {recentClipsCount === 0
                            ? 'No clips generated yet'
                            : `${recentClipsCount} clip${recentClipsCount === 1 ? '' : 's'} in this session`}
                    </p>
                </div>
            </div>

            {/* Pro Mode Section */}
            <div className="right-panel__section">
                <button
                    onClick={() => setProModeOpen(!proModeOpen)}
                    className="right-panel__section-title w-full flex items-center justify-between cursor-pointer hover:text-[#B8956A] transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <Settings2 className="w-3.5 h-3.5" />
                        Pro Mode
                    </div>
                    {proModeOpen ? (
                        <ChevronUp className="w-4 h-4" />
                    ) : (
                        <ChevronDown className="w-4 h-4" />
                    )}
                </button>

                {proModeOpen && (
                    <div className="space-y-4 mt-3">
                        {/* AI Provider */}
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">
                                AI Provider
                            </label>
                            <Select value={aiProvider} onValueChange={(v) => onAIProviderChange(v as AIProvider)}>
                                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white/90 text-xs h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#151515] border-white/10">
                                    {AI_PROVIDERS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="text-white/90 text-xs focus:bg-white/10 focus:text-white"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quality */}
                        <div>
                            <label className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5 block">
                                Output Quality
                            </label>
                            <Select value={quality} onValueChange={(v) => onQualityChange(v as VideoQuality)}>
                                <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white/90 text-xs h-8">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-[#151515] border-white/10">
                                    {QUALITY_OPTIONS.map((opt) => (
                                        <SelectItem
                                            key={opt.value}
                                            value={opt.value}
                                            className="text-white/90 text-xs focus:bg-white/10 focus:text-white"
                                        >
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}
            </div>

            {/* Credits Display */}
            {creditsRemaining !== undefined && (
                <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-white/40">Video Credits</span>
                        <span className="text-[#B8956A] font-medium">{creditsRemaining} remaining</span>
                    </div>
                </div>
            )}
        </div>
    );
}
