/**
 * Background Removal Tab
 * 
 * A tab component for the ImageEditorModal that provides
 * background removal functionality with preview and download.
 * 
 * Features:
 * - One-click background removal
 * - Before/after comparison slider
 * - Download transparent PNG
 * - Save to library option
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Download,
  Save,
  RefreshCw,
  Check,
  Scissors,
  ImageOff,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBackgroundRemoval } from "@/hooks/useBackgroundRemoval";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface BackgroundRemovalTabProps {
  imageUrl: string;
  onImageProcessed?: (newImageUrl: string, savedImageId?: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function BackgroundRemovalTab({
  imageUrl,
  onImageProcessed,
}: BackgroundRemovalTabProps) {
  const { removeBackground, isRemoving, result, reset } = useBackgroundRemoval();
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [isSaving, setIsSaving] = useState(false);

  const processedImageUrl = result?.imageUrl;
  const processedBase64 = result?.imageBase64;

  // Get displayable image URL
  const getDisplayUrl = useCallback(() => {
    if (processedImageUrl) return processedImageUrl;
    if (processedBase64) return `data:image/png;base64,${processedBase64}`;
    return null;
  }, [processedImageUrl, processedBase64]);

  const displayUrl = getDisplayUrl();

  // Handle remove background
  const handleRemoveBackground = async () => {
    const response = await removeBackground({
      imageUrl,
      saveToLibrary: false,
      onSuccess: (res) => {
        toast.success("Background removed successfully!");
        if (res.imageUrl || res.imageBase64) {
          setShowComparison(true);
        }
      },
      onError: (err) => {
        toast.error(err.message || "Failed to remove background");
      },
    });

    if (response?.success && response.imageUrl) {
      onImageProcessed?.(response.imageUrl);
    }
  };

  // Handle download
  const handleDownload = async () => {
    const url = displayUrl;
    if (!url) return;

    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = `madison-bg-removed-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(downloadUrl);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download image");
    }
  };

  // Handle save to library
  const handleSaveToLibrary = async () => {
    if (!displayUrl) return;

    setIsSaving(true);
    try {
      const response = await removeBackground({
        imageUrl: displayUrl.startsWith("data:") ? imageUrl : displayUrl,
        saveToLibrary: true,
        onSuccess: (res) => {
          toast.success("Saved to library!");
          if (res.savedImageId) {
            onImageProcessed?.(res.imageUrl || displayUrl, res.savedImageId);
          }
        },
        onError: (err) => {
          toast.error(err.message || "Failed to save to library");
        },
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    reset();
    setShowComparison(false);
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Scissors className="w-4 h-4 text-[var(--darkroom-accent)]" />
        <h4 className="text-sm font-medium text-[var(--darkroom-text)]">
          Remove Background
        </h4>
      </div>

      {/* Description */}
      <p className="text-xs text-[rgba(245,240,230,0.5)]">
        Remove the background from your image to create a transparent PNG.
        Perfect for product shots and compositing.
      </p>

      {/* Main Action / Result */}
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="initial"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Preview */}
            <div className="relative aspect-square bg-[var(--darkroom-bg)] rounded-lg overflow-hidden border border-[rgba(184,149,106,0.2)]">
              <img
                src={imageUrl}
                alt="Original"
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/80">Click below to remove background</span>
              </div>
            </div>

            {/* Remove Button */}
            <Button
              variant="brass"
              onClick={handleRemoveBackground}
              disabled={isRemoving}
              className="w-full"
            >
              {isRemoving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Removing Background...
                </>
              ) : (
                <>
                  <ImageOff className="w-4 h-4 mr-2" />
                  Remove Background
                </>
              )}
            </Button>

            {/* Processing indicator */}
            {isRemoving && (
              <div className="flex items-center justify-center gap-2 py-2">
                <Sparkles className="w-4 h-4 text-[var(--darkroom-accent)] animate-pulse" />
                <span className="text-xs text-[rgba(245,240,230,0.5)]">
                  AI is working its magic...
                </span>
              </div>
            )}
          </motion.div>
        ) : result.success && displayUrl ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            {/* Comparison Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[rgba(245,240,230,0.5)]">
                {showComparison ? "Comparison View" : "Result Preview"}
              </span>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs text-[var(--darkroom-accent)] hover:underline"
              >
                {showComparison ? "Hide comparison" : "Show comparison"}
              </button>
            </div>

            {/* Result Preview */}
            <div className="relative aspect-square rounded-lg overflow-hidden border border-[rgba(184,149,106,0.2)]">
              {showComparison ? (
                // Comparison slider
                <div className="relative w-full h-full">
                  {/* Checkerboard background for transparency */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
                        linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
                        linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
                      `,
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      backgroundColor: "#2a2a2a",
                    }}
                  />

                  {/* Original image */}
                  <img
                    src={imageUrl}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Processed image (clipped) */}
                  <div
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${comparisonPosition}%` }}
                  >
                    <img
                      src={displayUrl}
                      alt="Background removed"
                      className="w-full h-full object-contain"
                      style={{ width: `${100 / (comparisonPosition / 100)}%` }}
                    />
                  </div>

                  {/* Slider handle */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-[var(--darkroom-accent)] cursor-ew-resize"
                    style={{ left: `${comparisonPosition}%` }}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-[var(--darkroom-accent)] rounded-full flex items-center justify-center">
                      <ChevronLeft className="w-3 h-3 text-[var(--darkroom-bg)]" />
                      <ChevronRight className="w-3 h-3 text-[var(--darkroom-bg)]" />
                    </div>
                  </div>

                  {/* Slider input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={comparisonPosition}
                    onChange={(e) => setComparisonPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
                  />

                  {/* Labels */}
                  <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    After
                  </span>
                  <span className="absolute bottom-2 right-2 text-[0.65rem] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                    Before
                  </span>
                </div>
              ) : (
                // Simple result view with checkerboard
                <div className="relative w-full h-full">
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `
                        linear-gradient(45deg, #1a1a1a 25%, transparent 25%),
                        linear-gradient(-45deg, #1a1a1a 25%, transparent 25%),
                        linear-gradient(45deg, transparent 75%, #1a1a1a 75%),
                        linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)
                      `,
                      backgroundSize: "20px 20px",
                      backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                      backgroundColor: "#2a2a2a",
                    }}
                  />
                  <img
                    src={displayUrl}
                    alt="Background removed"
                    className="relative w-full h-full object-contain"
                  />
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-green-600/90 text-white text-[0.65rem] px-2 py-1 rounded-full">
                    <Check className="w-3 h-3" />
                    Done
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
                className="border border-[rgba(184,149,106,0.4)] bg-transparent text-[var(--darkroom-text)] hover:bg-[rgba(184,149,106,0.15)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
              <Button
                variant="brass"
                size="sm"
                onClick={handleSaveToLibrary}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save to Library
              </Button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 py-2 text-xs text-[rgba(245,240,230,0.5)] hover:text-[rgba(245,240,230,0.8)] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Remove from different image
            </button>

            {/* Provider info */}
            {result.provider && (
              <p className="text-[0.65rem] text-[rgba(245,240,230,0.3)] text-center">
                Processed with {result.provider}
              </p>
            )}
          </motion.div>
        ) : (
          // Error state
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <ImageOff className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-red-400">
              {result?.error || "Failed to remove background"}
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="border border-[rgba(184,149,106,0.4)]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="mt-2 p-3 bg-[rgba(26,24,22,0.5)] rounded-lg border border-[rgba(184,149,106,0.1)]">
        <span className="text-[0.65rem] uppercase tracking-wider text-[rgba(184,149,106,0.6)]">
          Tips for best results
        </span>
        <ul className="mt-2 space-y-1 text-[0.7rem] text-[rgba(245,240,230,0.5)]">
          <li>• Product images with clear edges work best</li>
          <li>• Good lighting helps distinguish the subject</li>
          <li>• Avoid complex backgrounds with similar colors</li>
        </ul>
      </div>
    </motion.div>
  );
}

export default BackgroundRemovalTab;





