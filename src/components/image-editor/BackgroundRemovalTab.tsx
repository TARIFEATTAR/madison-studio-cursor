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
import { supabase } from "@/integrations/supabase/client";
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

  // Handle save to library - saves the already-processed image directly
  const handleSaveToLibrary = async () => {
    if (!displayUrl) return;

    setIsSaving(true);
    try {
      // Fetch the processed image
      const response = await fetch(displayUrl);
      const blob = await response.blob();
      
      // Generate a unique filename
      const fileName = `bg-removed/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("generated-images")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: true,
        });
      
      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(fileName);
      
      const publicUrl = urlData.publicUrl;
      
      // Get current user/org for saving to generated_images table
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Get user's organization
        const { data: orgData } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .single();
        
        // Save to generated_images table with all required fields
        const { data: savedImage, error: saveError } = await supabase
          .from("generated_images")
          .insert({
            user_id: user.id,
            organization_id: orgData?.organization_id,
            image_url: publicUrl,
            goal_type: "product",
            aspect_ratio: "1:1",
            final_prompt: "Background removed using AI",
            image_generator: "fal-ai/birefnet",
            saved_to_library: true,
          })
          .select()
          .single();
        
        if (saveError) {
          console.error("Error saving to database:", saveError);
          toast.error("Upload succeeded but failed to save to library");
          return;
        }
        
        toast.success("Saved to library!");
        onImageProcessed?.(publicUrl, savedImage?.id);
      } else {
        toast.success("Image uploaded!");
        onImageProcessed?.(publicUrl);
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save to library");
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
      className="flex flex-col gap-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Description - concise */}
      <p className="text-sm text-[rgba(245,240,230,0.6)] leading-relaxed">
        Remove the background from your image to create a transparent PNG. Perfect for product shots and compositing.
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
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[rgba(245,240,230,0.7)]">
                {showComparison ? "Before / After" : "Result"}
              </span>
              <button
                onClick={() => setShowComparison(!showComparison)}
                className="text-xs text-[var(--darkroom-accent)] hover:text-[var(--darkroom-accent-hover)] transition-colors"
              >
                {showComparison ? "Hide comparison" : "Compare"}
              </button>
            </div>

            {/* Result Preview - larger aspect ratio */}
            <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-[rgba(184,149,106,0.25)] shadow-lg">
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

            {/* Action Buttons - stacked for clarity */}
            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="brass"
                onClick={handleSaveToLibrary}
                disabled={isSaving}
                className="w-full h-11"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save to Library
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleDownload}
                className="w-full h-10 border border-[rgba(184,149,106,0.3)] bg-transparent text-[var(--darkroom-text)] hover:bg-[rgba(184,149,106,0.1)]"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PNG
              </Button>
            </div>

            {/* Reset link */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 py-3 text-xs text-[rgba(245,240,230,0.4)] hover:text-[var(--darkroom-accent)] transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try a different image
            </button>
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

    </motion.div>
  );
}

export default BackgroundRemovalTab;





