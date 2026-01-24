/**
 * VideoPlayer - Center Canvas for The Cutting Room
 *
 * HTML5 video player with custom controls matching the camera aesthetic
 */

import React, { useRef, useState, useEffect } from 'react';
import {
    Play, Pause, Volume2, VolumeX, Maximize,
    SkipBack, SkipForward, Download, Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RecIndicator } from './RecIndicator';

import '@/styles/darkroom.css';
import '@/styles/cuttingroom.css';

interface VideoPlayerProps {
    videoUrl: string | null;
    thumbnailUrl?: string | null;
    isGenerating: boolean;
    prompt?: string;
    onDownload?: () => void;
}

export function VideoPlayer({
    videoUrl,
    thumbnailUrl,
    isGenerating,
    prompt,
    onDownload,
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => setCurrentTime(video.currentTime);
        const handleLoadedMetadata = () => setDuration(video.duration);
        const handleEnded = () => setIsPlaying(false);

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            video.removeEventListener('ended', handleEnded);
        };
    }, [videoUrl]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleSeek = (value: number[]) => {
        const video = videoRef.current;
        if (!video) return;
        video.currentTime = value[0];
        setCurrentTime(value[0]);
    };

    const handleFullscreen = () => {
        const video = videoRef.current;
        if (!video) return;
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            video.requestFullscreen();
        }
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Empty state
    if (!videoUrl && !isGenerating) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#050505]">
                <div className="text-center max-w-md px-6">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                        <Film className="w-10 h-10 text-white/20" />
                    </div>
                    <h3 className="text-xl font-serif text-white/80 mb-2">No Video Yet</h3>
                    <p className="text-sm text-white/40 leading-relaxed">
                        Describe your scene in the Control Board and click "Action!" to generate your first clip.
                    </p>
                </div>
            </div>
        );
    }

    // Generating state
    if (isGenerating) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#050505] relative overflow-hidden">
                {/* Film grain overlay */}
                <div className="film-grain" />

                <div className="text-center z-10">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        {/* Spinning ring */}
                        <div className="absolute inset-0 rounded-full border-2 border-[#ff3b30]/20 animate-ping" />
                        <div className="absolute inset-2 rounded-full border-2 border-t-[#ff3b30] border-r-transparent border-b-transparent border-l-transparent animate-spin" />

                        {/* REC indicator */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RecIndicator isRecording className="w-4 h-4" />
                        </div>
                    </div>

                    <p className="text-[#ff3b30] font-mono text-sm uppercase tracking-widest mb-2">
                        ● Rendering
                    </p>
                    <p className="text-white/40 text-xs max-w-xs">
                        {prompt ? `"${prompt.slice(0, 60)}${prompt.length > 60 ? '...' : ''}"` : 'Generating your video...'}
                    </p>
                </div>
            </div>
        );
    }

    // Video player
    return (
        <div
            className="flex-1 flex flex-col bg-black relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            {/* Video */}
            <div className="flex-1 flex items-center justify-center relative">
                <video
                    ref={videoRef}
                    src={videoUrl || undefined}
                    poster={thumbnailUrl || undefined}
                    className="max-w-full max-h-full object-contain"
                    onClick={togglePlay}
                    playsInline
                />

                {/* Center play button overlay */}
                {!isPlaying && (
                    <button
                        onClick={togglePlay}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                            <Play className="w-6 h-6 text-white ml-1" fill="white" />
                        </div>
                    </button>
                )}
            </div>

            {/* Controls Bar */}
            <div
                className={cn(
                    "absolute bottom-0 left-0 right-0 p-4",
                    "bg-gradient-to-t from-black/90 to-transparent",
                    "transition-opacity duration-300",
                    showControls ? "opacity-100" : "opacity-0"
                )}
            >
                {/* Progress Bar */}
                <div className="mb-3">
                    <Slider
                        value={[currentTime]}
                        min={0}
                        max={duration || 100}
                        step={0.1}
                        onValueChange={handleSeek}
                        className="cursor-pointer"
                    />
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* Play/Pause */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={togglePlay}
                            className="text-white hover:bg-white/10"
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5" />
                            ) : (
                                <Play className="w-5 h-5" fill="white" />
                            )}
                        </Button>

                        {/* Skip buttons */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSeek([Math.max(0, currentTime - 5)])}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <SkipBack className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleSeek([Math.min(duration, currentTime + 5)])}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <SkipForward className="w-4 h-4" />
                        </Button>

                        {/* Time */}
                        <span className="text-xs font-mono text-white/60 ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mute */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleMute}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            {isMuted ? (
                                <VolumeX className="w-4 h-4" />
                            ) : (
                                <Volume2 className="w-4 h-4" />
                            )}
                        </Button>

                        {/* Download */}
                        {onDownload && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onDownload}
                                className="text-white/60 hover:text-white hover:bg-white/10"
                            >
                                <Download className="w-4 h-4" />
                            </Button>
                        )}

                        {/* Fullscreen */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleFullscreen}
                            className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                            <Maximize className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
