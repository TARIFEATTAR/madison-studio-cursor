import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VideoScene } from "@/pages/VideoProject";

interface VideoPreviewProps {
  scenes: VideoScene[];
  activeSceneId: string | null;
  aspectRatio: "9:16" | "16:9" | "1:1";
  isPlaying: boolean;
  onPlayPause: () => void;
  fullPreview?: boolean;
}

export function VideoPreview({
  scenes,
  activeSceneId,
  aspectRatio,
  isPlaying,
  onPlayPause,
  fullPreview = false,
}: VideoPreviewProps) {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [sceneProgress, setSceneProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentScene = fullPreview
    ? scenes[currentSceneIndex]
    : scenes.find((s) => s.id === activeSceneId) || scenes[0];

  // Check if current scene has a generated video
  const hasVideo = !!currentScene?.videoUrl;

  const totalDuration = scenes.reduce((sum, s) => sum + s.duration, 0);

  // Sync video element with playback state
  useEffect(() => {
    if (!videoRef.current || !hasVideo) return;

    if (isPlaying) {
      videoRef.current.play().catch(console.error);
    } else {
      videoRef.current.pause();
    }
  }, [isPlaying, hasVideo]);

  // Handle video mute state
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Playback logic for full preview
  useEffect(() => {
    if (!fullPreview || !isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setSceneProgress((prev) => {
        const newProgress = prev + 0.1;
        const currentSceneDuration = scenes[currentSceneIndex]?.duration || 10;

        if (newProgress >= currentSceneDuration) {
          // Move to next scene
          const nextIndex = currentSceneIndex + 1;
          if (nextIndex >= scenes.length) {
            // End of video
            onPlayPause();
            setCurrentSceneIndex(0);
            return 0;
          }
          setCurrentSceneIndex(nextIndex);
          return 0;
        }

        return newProgress;
      });
    }, 100);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fullPreview, isPlaying, currentSceneIndex, scenes, onPlayPause]);

  // Reset on scene change
  useEffect(() => {
    if (!fullPreview) {
      setCurrentSceneIndex(scenes.findIndex((s) => s.id === activeSceneId) || 0);
      setSceneProgress(0);
    }
  }, [activeSceneId, fullPreview, scenes]);

  const handleReset = () => {
    setCurrentSceneIndex(0);
    setSceneProgress(0);
    if (isPlaying) {
      onPlayPause();
    }
  };

  // Get motion animation for current scene
  const getMotionStyle = (scene: VideoScene) => {
    if (!isPlaying && !fullPreview) return {};

    const progress = sceneProgress / scene.duration;

    switch (scene.motion) {
      case "zoom-in":
        return { scale: 1 + progress * 0.2 };
      case "zoom-out":
        return { scale: 1.2 - progress * 0.2 };
      case "pan-left":
        return { x: `${-progress * 10}%` };
      case "pan-right":
        return { x: `${progress * 10}%` };
      default:
        return {};
    }
  };

  const aspectRatioClass = {
    "9:16": "aspect-[9/16]",
    "16:9": "aspect-video",
    "1:1": "aspect-square",
  }[aspectRatio];

  return (
    <div className={cn("video-preview", fullPreview && "video-preview--full")}>
      {/* Preview Frame */}
      <div className={cn("preview-frame", aspectRatioClass)}>
        {/* If scene has a generated video, show it */}
        {currentScene?.videoUrl ? (
          <div className="preview-video-container">
            <video
              ref={videoRef}
              src={currentScene.videoUrl}
              className="preview-video"
              loop
              muted={isMuted}
              playsInline
              onEnded={() => {
                // Move to next scene in full preview mode
                if (fullPreview) {
                  const nextIndex = currentSceneIndex + 1;
                  if (nextIndex >= scenes.length) {
                    onPlayPause();
                    setCurrentSceneIndex(0);
                  } else {
                    setCurrentSceneIndex(nextIndex);
                  }
                }
              }}
            />
            {/* Mute toggle */}
            <button
              className="preview-mute-btn"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        ) : currentScene?.imageUrl ? (
          <motion.div
            className="preview-image-container"
            animate={getMotionStyle(currentScene)}
            transition={{ duration: 0.1, ease: "linear" }}
          >
            <img
              src={currentScene.imageUrl}
              alt="Preview"
              className="preview-image"
            />
          </motion.div>
        ) : (
          <div className="preview-placeholder">
            <span>Add an image to preview</span>
          </div>
        )}

        {/* Text Overlay */}
        <AnimatePresence>
          {currentScene?.text && (
            <motion.div
              className={cn(
                "preview-text-overlay",
                `preview-text-overlay--${currentScene.text.position}`
              )}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {currentScene.text.headline && (
                <h2 className="preview-headline">{currentScene.text.headline}</h2>
              )}
              {currentScene.text.subtext && (
                <p className="preview-subtext">{currentScene.text.subtext}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Film Strip Border Effect */}
        <div className="preview-film-border preview-film-border--left" />
        <div className="preview-film-border preview-film-border--right" />
      </div>

      {/* Playback Controls */}
      {fullPreview && (
        <div className="preview-controls">
          <Button
            variant="ghost"
            size="icon"
            className="preview-control-btn"
            onClick={handleReset}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>

          <Button
            variant="brass"
            size="icon"
            className="preview-play-btn"
            onClick={onPlayPause}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>

          <div className="preview-time">
            {Math.floor(sceneProgress + scenes.slice(0, currentSceneIndex).reduce((s, sc) => s + sc.duration, 0))}s / {totalDuration}s
          </div>
        </div>
      )}

      {/* Scene Indicator (for full preview) */}
      {fullPreview && (
        <div className="preview-scene-indicators">
          {scenes.map((scene, index) => (
            <div
              key={scene.id}
              className={cn(
                "scene-indicator",
                index === currentSceneIndex && "scene-indicator--active",
                index < currentSceneIndex && "scene-indicator--complete"
              )}
            >
              <div
                className="scene-indicator-fill"
                style={{
                  width:
                    index === currentSceneIndex
                      ? `${(sceneProgress / scene.duration) * 100}%`
                      : index < currentSceneIndex
                      ? "100%"
                      : "0%",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
