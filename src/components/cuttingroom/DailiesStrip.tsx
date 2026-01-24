/**
 * DailiesStrip - Horizontal filmstrip of generated video clips
 *
 * Matches Dark Room's image grid aesthetic but with film sprocket holes
 */

import React, { useRef } from 'react';
import { Film, Play, Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import '@/styles/darkroom.css';
import '@/styles/cuttingroom.css';

export interface VideoClip {
    id: string;
    videoUrl: string;
    thumbnailUrl: string;
    prompt: string;
    duration: number;
    timestamp: number;
    isHero?: boolean;
}

interface DailiesStripProps {
    clips: VideoClip[];
    selectedClipId: string | null;
    onSelectClip: (id: string) => void;
    onDeleteClip: (id: string) => void;
    onSetHero: (id: string) => void;
}

export function DailiesStrip({
    clips,
    selectedClipId,
    onSelectClip,
    onDeleteClip,
    onSetHero,
}: DailiesStripProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const amount = 200;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -amount : amount,
            behavior: 'smooth',
        });
    };

    if (clips.length === 0) {
        return (
            <div className="h-[120px] border-t border-white/5 bg-[#080808] flex items-center justify-center">
                <div className="flex items-center gap-3 text-white/30">
                    <Film className="w-5 h-5" />
                    <span className="text-sm">Generated clips will appear here</span>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[120px] border-t border-white/5 bg-[#080808] relative">
            {/* Film sprocket holes - top */}
            <div className="absolute top-0 left-0 right-0 h-3 flex items-center justify-center overflow-hidden">
                <div className="flex gap-8">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={`top-${i}`}
                            className="w-2 h-2 rounded-sm bg-[#151515] border border-white/5"
                        />
                    ))}
                </div>
            </div>

            {/* Film sprocket holes - bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center overflow-hidden">
                <div className="flex gap-8">
                    {Array.from({ length: 30 }).map((_, i) => (
                        <div
                            key={`bottom-${i}`}
                            className="w-2 h-2 rounded-sm bg-[#151515] border border-white/5"
                        />
                    ))}
                </div>
            </div>

            {/* Scroll buttons */}
            {clips.length > 4 && (
                <>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scroll('left')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white/60 hover:text-white"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => scroll('right')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white/60 hover:text-white"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </>
            )}

            {/* Clips container */}
            <div
                ref={scrollRef}
                className="h-full px-6 py-4 flex items-center gap-3 overflow-x-auto scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {clips.map((clip) => (
                    <div
                        key={clip.id}
                        onClick={() => onSelectClip(clip.id)}
                        className={cn(
                            "relative flex-shrink-0 w-[140px] h-[80px] rounded-md overflow-hidden cursor-pointer group",
                            "border-2 transition-all duration-200",
                            selectedClipId === clip.id
                                ? "border-[#ff3b30] shadow-[0_0_12px_rgba(255,59,48,0.3)]"
                                : "border-white/10 hover:border-white/30"
                        )}
                    >
                        {/* Thumbnail */}
                        <img
                            src={clip.thumbnailUrl}
                            alt={`Clip ${clip.id.slice(0, 6)}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Play overlay */}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Play className="w-6 h-6 text-white" fill="white" />
                        </div>

                        {/* Duration badge */}
                        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-[10px] font-mono text-white/80">
                            {clip.duration}s
                        </div>

                        {/* Hero badge */}
                        {clip.isHero && (
                            <div className="absolute top-1 left-1">
                                <Star className="w-3 h-3 text-[#B8956A]" fill="#B8956A" />
                            </div>
                        )}

                        {/* Action buttons on hover */}
                        <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetHero(clip.id);
                                }}
                                className="w-5 h-5 rounded bg-black/70 flex items-center justify-center hover:bg-[#B8956A]/50"
                                title="Set as hero"
                            >
                                <Star className="w-3 h-3 text-white" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteClip(clip.id);
                                }}
                                className="w-5 h-5 rounded bg-black/70 flex items-center justify-center hover:bg-red-500/50"
                                title="Delete clip"
                            >
                                <Trash2 className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
