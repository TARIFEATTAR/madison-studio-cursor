/**
 * CuttingRoomView - The Cutting Room Main Interface
 *
 * Madison Studio's AI-powered video generation interface.
 * Composes ControlBoard (left), VideoPlayer + DailiesStrip (center), and AssetRack (right).
 *
 * Design follows the Dark Room camera-body aesthetic with film/broadcast metaphors.
 */

import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Cutting Room Components
import { ControlBoard, VideoDuration, AspectRatio, CameraMotion } from './ControlBoard';
import { VideoPlayer } from './VideoPlayer';
import { DailiesStrip, VideoClip } from './DailiesStrip';
import { AssetRack, VideoPreset, AIProvider, VideoQuality } from './AssetRack';
import { RecIndicator } from './RecIndicator';

// Styles
import '@/styles/darkroom.css';
import '@/styles/cuttingroom.css';

const MAX_CLIPS = 10;

interface CuttingRoomState {
    script: string;
    duration: VideoDuration;
    aspectRatio: AspectRatio;
    cameraMotion: CameraMotion;
    subjectImage: string | null;
    preset: VideoPreset;
    aiProvider: AIProvider;
    quality: VideoQuality;
}

export function CuttingRoomView() {
    const location = useLocation();
    const navState = location.state as {
        script?: string;
        duration?: string;
        cameraMovement?: string;
        subjectImage?: string;
    } | null;

    // Initialize from navigation state (from Multiply or Dark Room)
    const [state, setState] = useState<CuttingRoomState>({
        script: navState?.script || '',
        duration: (navState?.duration as VideoDuration) || '5s',
        aspectRatio: '16:9',
        cameraMotion: (navState?.cameraMovement as CameraMotion) || 'static',
        subjectImage: navState?.subjectImage || null,
        preset: 'cinematic',
        aiProvider: 'auto',
        quality: 'hd',
    });

    // Video generation state
    const [isGenerating, setIsGenerating] = useState(false);
    const [clips, setClips] = useState<VideoClip[]>([]);
    const [selectedClipId, setSelectedClipId] = useState<string | null>(null);

    // Get the currently selected clip
    const selectedClip = clips.find((c) => c.id === selectedClipId) || null;

    // State update helpers
    const updateState = <K extends keyof CuttingRoomState>(key: K, value: CuttingRoomState[K]) => {
        setState((prev) => ({ ...prev, [key]: value }));
    };

    // Check if generation is possible
    const canGenerate = state.script.trim().length > 0 && clips.length < MAX_CLIPS;

    // Handle video generation
    const handleGenerate = useCallback(async () => {
        if (!canGenerate || isGenerating) return;

        setIsGenerating(true);

        try {
            // TODO: Replace with actual Supabase Edge Function call
            // const { data, error } = await supabase.functions.invoke('generate-madison-video', {
            //     body: {
            //         prompt: state.script,
            //         duration: state.duration,
            //         aspectRatio: state.aspectRatio,
            //         cameraMotion: state.cameraMotion,
            //         subjectImageUrl: state.subjectImage,
            //         aiProvider: state.aiProvider,
            //         quality: state.quality,
            //     }
            // });

            // Simulate generation delay for now
            await new Promise((resolve) => setTimeout(resolve, 3000));

            // Mock response - replace with actual API response
            const mockClip: VideoClip = {
                id: `clip-${Date.now()}`,
                videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', // Sample video
                thumbnailUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=280&h=160&fit=crop',
                prompt: state.script,
                duration: parseInt(state.duration),
                timestamp: Date.now(),
                isHero: clips.length === 0, // First clip is hero by default
            };

            setClips((prev) => [mockClip, ...prev]);
            setSelectedClipId(mockClip.id);
        } catch (error) {
            console.error('Video generation failed:', error);
            // TODO: Show error toast
        } finally {
            setIsGenerating(false);
        }
    }, [canGenerate, isGenerating, state, clips.length]);

    // Handle clip actions
    const handleSelectClip = (id: string) => {
        setSelectedClipId(id);
    };

    const handleDeleteClip = (id: string) => {
        setClips((prev) => prev.filter((c) => c.id !== id));
        if (selectedClipId === id) {
            setSelectedClipId(clips[0]?.id || null);
        }
    };

    const handleSetHero = (id: string) => {
        setClips((prev) =>
            prev.map((c) => ({
                ...c,
                isHero: c.id === id,
            }))
        );
    };

    const handleDownload = () => {
        if (!selectedClip) return;
        const link = document.createElement('a');
        link.href = selectedClip.videoUrl;
        link.download = `madison-video-${selectedClip.id}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="darkroom">
            {/* Header */}
            <header className="darkroom-header">
                <div className="darkroom-header__left">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="darkroom-header__back-btn"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Back</span>
                    </Button>
                </div>

                <div className="darkroom-header__center">
                    <h1 className="darkroom-header__title">
                        <RecIndicator isRecording={isGenerating} className="mr-2" />
                        The Cutting Room
                    </h1>
                </div>

                <div className="darkroom-header__right">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="darkroom-header__action-btn"
                        disabled={clips.length === 0}
                    >
                        <Save className="w-4 h-4" />
                        <span className="hidden sm:inline ml-1">Save</span>
                    </Button>
                </div>
            </header>

            {/* Main 3-Column Layout */}
            <div className="darkroom-main">
                {/* Left Rail - Control Board */}
                <ControlBoard
                    script={state.script}
                    onScriptChange={(v) => updateState('script', v)}
                    duration={state.duration}
                    onDurationChange={(v) => updateState('duration', v)}
                    aspectRatio={state.aspectRatio}
                    onAspectRatioChange={(v) => updateState('aspectRatio', v)}
                    cameraMotion={state.cameraMotion}
                    onCameraMotionChange={(v) => updateState('cameraMotion', v)}
                    subjectImage={state.subjectImage}
                    onSubjectImageUpload={(v) => updateState('subjectImage', v)}
                    onSubjectImageClear={() => updateState('subjectImage', null)}
                    isGenerating={isGenerating}
                    canGenerate={canGenerate}
                    onGenerate={handleGenerate}
                    clipsCount={clips.length}
                    maxClips={MAX_CLIPS}
                />

                {/* Center - Monitor (Video Player + Dailies) */}
                <div className="darkroom-canvas flex flex-col">
                    {/* Video Player Area */}
                    <VideoPlayer
                        videoUrl={selectedClip?.videoUrl || null}
                        thumbnailUrl={selectedClip?.thumbnailUrl}
                        isGenerating={isGenerating}
                        prompt={state.script}
                        onDownload={selectedClip ? handleDownload : undefined}
                    />

                    {/* Dailies Strip */}
                    <DailiesStrip
                        clips={clips}
                        selectedClipId={selectedClipId}
                        onSelectClip={handleSelectClip}
                        onDeleteClip={handleDeleteClip}
                        onSetHero={handleSetHero}
                    />
                </div>

                {/* Right Panel - Asset Rack */}
                <AssetRack
                    selectedPreset={state.preset}
                    onPresetChange={(v) => updateState('preset', v)}
                    aiProvider={state.aiProvider}
                    onAIProviderChange={(v) => updateState('aiProvider', v)}
                    quality={state.quality}
                    onQualityChange={(v) => updateState('quality', v)}
                    recentClipsCount={clips.length}
                    creditsRemaining={50} // TODO: Get from user context
                />
            </div>
        </div>
    );
}
