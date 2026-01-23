/**
 * Studio - Madison Studio's Unified Visual Production Suite
 *
 * A single destination for both image (Dark Room) and video (Cutting Room) generation.
 * Users can toggle between Photo and Video modes like switching modes on a camera.
 *
 * Phase A: Shell wrapper around DarkRoom with mode toggle UI
 * Phase B: Add CuttingRoomView when video generation is ready
 */

import { useState, lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { Camera, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Lazy load the views to keep initial bundle small
const DarkRoom = lazy(() => import("./DarkRoom"));
// const CuttingRoomView = lazy(() => import("@/components/cuttingroom").then(m => ({ default: m.CuttingRoomView })));

type StudioMode = "photo" | "video";

interface ModeToggleProps {
    mode: StudioMode;
    onChange: (mode: StudioMode) => void;
    disabled?: boolean;
}

/**
 * Camera-style mode toggle switch
 * Mimics the Photo/Video selector on professional cameras
 */
function ModeToggle({ mode, onChange, disabled }: ModeToggleProps) {
    return (
        <div className="inline-flex items-center gap-1 p-1 bg-[#0a0a0a] border border-white/10 rounded-lg">
            <button
                onClick={() => onChange("photo")}
                disabled={disabled}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    mode === "photo"
                        ? "bg-[#B8956A] text-white shadow-[0_0_12px_rgba(184,149,106,0.3)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                )}
                aria-pressed={mode === "photo"}
            >
                <Camera className="w-4 h-4" />
                <span className="hidden sm:inline">Photo</span>
            </button>

            <button
                onClick={() => onChange("video")}
                disabled={disabled}
                className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200",
                    mode === "video"
                        ? "bg-[#ff3b30] text-white shadow-[0_0_12px_rgba(255,59,48,0.3)]"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                )}
                aria-pressed={mode === "video"}
            >
                <Film className="w-4 h-4" />
                <span className="hidden sm:inline">Video</span>
            </button>
        </div>
    );
}

/**
 * Loading fallback for lazy-loaded views
 */
function StudioLoader() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-[#B8956A]" />
                <p className="text-white/60 text-sm font-medium">Loading Studio...</p>
            </div>
        </div>
    );
}

/**
 * Video mode placeholder (Phase B)
 */
function CuttingRoomPlaceholder() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <div className="text-center max-w-md px-6">
                <div className="w-16 h-16 rounded-full bg-[#ff3b30]/20 flex items-center justify-center mx-auto mb-6">
                    <Film className="w-8 h-8 text-[#ff3b30]" />
                </div>
                <h2 className="text-2xl font-serif text-white mb-3">The Cutting Room</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6">
                    AI video generation is coming soon. Transform your scripts and images into dynamic video content.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/40 text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse" />
                    In Development
                </div>
            </div>
        </div>
    );
}

export default function Studio() {
    const location = useLocation();

    // Allow mode to be set via navigation state or URL param
    const initialMode: StudioMode =
        (location.state as { mode?: StudioMode })?.mode ||
        new URLSearchParams(location.search).get("mode") as StudioMode ||
        "photo";

    const [mode, setMode] = useState<StudioMode>(initialMode);

    return (
        <div className="relative min-h-screen bg-[#050505]">
            {/* Floating Mode Toggle - Top Center */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
                <ModeToggle mode={mode} onChange={setMode} />
            </div>

            {/* Render the active view */}
            <Suspense fallback={<StudioLoader />}>
                {mode === "photo" ? (
                    <DarkRoom />
                ) : (
                    <CuttingRoomPlaceholder />
                )}
            </Suspense>
        </div>
    );
}
