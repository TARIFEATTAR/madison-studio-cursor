/**
 * ControlBoard - Left Rail for The Cutting Room
 *
 * Script input, duration selection, camera motion controls
 * Matches Dark Room's LeftRail aesthetic
 */

import React from 'react';
import {
    Film, Clock, Move, Sparkles, Upload, Image as ImageIcon,
    ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RecIndicator } from './RecIndicator';

// Import Dark Room styles
import '@/styles/darkroom.css';
import '@/styles/cuttingroom.css';

export type VideoDuration = '3s' | '5s' | '10s' | '15s';
export type AspectRatio = '16:9' | '9:16' | '1:1';
export type CameraMotion = 'static' | 'pan_left' | 'pan_right' | 'zoom_in' | 'zoom_out' | 'orbit';

interface ControlBoardProps {
    script: string;
    onScriptChange: (script: string) => void;
    duration: VideoDuration;
    onDurationChange: (duration: VideoDuration) => void;
    aspectRatio: AspectRatio;
    onAspectRatioChange: (ratio: AspectRatio) => void;
    cameraMotion: CameraMotion;
    onCameraMotionChange: (motion: CameraMotion) => void;
    subjectImage: string | null;
    onSubjectImageUpload: (url: string) => void;
    onSubjectImageClear: () => void;
    isGenerating: boolean;
    canGenerate: boolean;
    onGenerate: () => void;
    clipsCount: number;
    maxClips: number;
}

const DURATION_OPTIONS: { value: VideoDuration; label: string }[] = [
    { value: '3s', label: '3 seconds' },
    { value: '5s', label: '5 seconds' },
    { value: '10s', label: '10 seconds' },
    { value: '15s', label: '15 seconds' },
];

const ASPECT_RATIO_OPTIONS: { value: AspectRatio; label: string; icon: string }[] = [
    { value: '16:9', label: 'Landscape', icon: '▬' },
    { value: '9:16', label: 'Portrait', icon: '▮' },
    { value: '1:1', label: 'Square', icon: '◼' },
];

const CAMERA_MOTION_OPTIONS: { value: CameraMotion; label: string }[] = [
    { value: 'static', label: 'Static' },
    { value: 'pan_left', label: 'Pan Left' },
    { value: 'pan_right', label: 'Pan Right' },
    { value: 'zoom_in', label: 'Zoom In' },
    { value: 'zoom_out', label: 'Zoom Out' },
    { value: 'orbit', label: 'Orbit' },
];

export function ControlBoard({
    script,
    onScriptChange,
    duration,
    onDurationChange,
    aspectRatio,
    onAspectRatioChange,
    cameraMotion,
    onCameraMotionChange,
    subjectImage,
    onSubjectImageUpload,
    onSubjectImageClear,
    isGenerating,
    canGenerate,
    onGenerate,
    clipsCount,
    maxClips,
}: ControlBoardProps) {
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onSubjectImageUpload(url);
        }
    };

    return (
        <div className="left-rail">
            {/* Script Input Section */}
            <div className="left-rail__section">
                <div className="left-rail__section-title">
                    <Film className="w-3.5 h-3.5" />
                    Scene Script
                </div>
                <Textarea
                    value={script}
                    onChange={(e) => onScriptChange(e.target.value)}
                    placeholder="Describe your scene... e.g., 'A perfume bottle slowly rotates on a marble surface with golden light filtering through'"
                    className="min-h-[120px] bg-[#0a0a0a] border-white/10 text-white/90 placeholder:text-white/30 resize-none focus:border-[#B8956A]/50 focus:ring-1 focus:ring-[#B8956A]/30"
                    disabled={isGenerating}
                />
            </div>

            {/* Subject Image Upload */}
            <div className="left-rail__section">
                <div className="left-rail__section-title">
                    <ImageIcon className="w-3.5 h-3.5" />
                    Subject Image
                    <span className="text-white/40 font-normal ml-1">(Optional)</span>
                </div>

                {subjectImage ? (
                    <div className="upload-zone upload-zone--has-image">
                        <div className="upload-zone__preview">
                            <img src={subjectImage} alt="Subject" />
                            <button
                                className="upload-remove"
                                onClick={onSubjectImageClear}
                                aria-label="Remove image"
                            >
                                ×
                            </button>
                        </div>
                    </div>
                ) : (
                    <label className="upload-zone cursor-pointer">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isGenerating}
                        />
                        <div className="upload-zone__content">
                            <Upload className="upload-zone__icon" />
                            <span className="upload-zone__label">Upload Image</span>
                            <span className="upload-zone__description">
                                Animate a Dark Room image
                            </span>
                        </div>
                    </label>
                )}
            </div>

            {/* Duration Selection */}
            <div className="left-rail__section">
                <div className="left-rail__section-title">
                    <Clock className="w-3.5 h-3.5" />
                    Duration
                </div>
                <Select value={duration} onValueChange={(v) => onDurationChange(v as VideoDuration)}>
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white/90">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151515] border-white/10">
                        {DURATION_OPTIONS.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-white/90 focus:bg-white/10 focus:text-white"
                            >
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Aspect Ratio */}
            <div className="left-rail__section">
                <div className="left-rail__section-title">
                    <span className="text-xs">◼</span>
                    Aspect Ratio
                </div>
                <div className="flex gap-2">
                    {ASPECT_RATIO_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onAspectRatioChange(opt.value)}
                            className={cn(
                                "flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all",
                                "border",
                                aspectRatio === opt.value
                                    ? "bg-[#B8956A]/20 border-[#B8956A]/50 text-[#B8956A]"
                                    : "bg-[#0a0a0a] border-white/10 text-white/60 hover:border-white/20"
                            )}
                            disabled={isGenerating}
                        >
                            <span className="mr-1">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Camera Motion */}
            <div className="left-rail__section">
                <div className="left-rail__section-title">
                    <Move className="w-3.5 h-3.5" />
                    Camera Motion
                </div>
                <Select value={cameraMotion} onValueChange={(v) => onCameraMotionChange(v as CameraMotion)}>
                    <SelectTrigger className="bg-[#0a0a0a] border-white/10 text-white/90">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151515] border-white/10">
                        {CAMERA_MOTION_OPTIONS.map((opt) => (
                            <SelectItem
                                key={opt.value}
                                value={opt.value}
                                className="text-white/90 focus:bg-white/10 focus:text-white"
                            >
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Generate Button */}
            <div className="mt-auto pt-4">
                <Button
                    onClick={onGenerate}
                    disabled={!canGenerate || isGenerating}
                    className={cn(
                        "w-full h-12 text-base font-semibold transition-all",
                        "bg-gradient-to-r from-[#ff3b30] to-[#ff6b5b]",
                        "hover:from-[#ff4f45] hover:to-[#ff7f70]",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "shadow-[0_0_20px_rgba(255,59,48,0.3)]",
                        isGenerating && "animate-pulse"
                    )}
                >
                    <RecIndicator isRecording={isGenerating} className="mr-2" />
                    {isGenerating ? 'Rolling...' : 'Action!'}
                </Button>

                {/* Clip Counter */}
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/40">
                    <Film className="w-3 h-3" />
                    <span>{clipsCount} / {maxClips} clips</span>
                </div>
            </div>
        </div>
    );
}
