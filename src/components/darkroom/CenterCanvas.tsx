import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Save,
  CheckCircle,
  Loader2,
  Wand2,
} from "lucide-react";
import { ThumbnailCarousel } from "./ThumbnailCarousel";
import { cn } from "@/lib/utils";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isSaved: boolean;
  isHero?: boolean;
}

interface CenterCanvasProps {
  // Images
  images: GeneratedImage[];
  heroImage: GeneratedImage | null;
  onSetHero: (id: string) => void;
  onSaveImage: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onDownloadImage: (image: GeneratedImage) => void;
  onRefineImage: (image: GeneratedImage) => void;

  // Prompt
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onGenerate: () => void;

  // State
  isGenerating: boolean;
  isSaving: boolean;
  canGenerate: boolean;

  // Pro Mode indicator
  proSettingsCount: number;

  // Session
  maxImages: number;
}

// Generating State with Scanline Animation
function GeneratingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="generating-state"
    >
      {/* Empty Frame with Pulsing Border */}
      <motion.div
        className="generating-frame"
        animate={{
          borderColor: [
            "rgba(184, 149, 106, 0.2)",
            "rgba(184, 149, 106, 0.5)",
            "rgba(184, 149, 106, 0.2)",
          ],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Scanline Effect */}
        <motion.div
          className="scanline"
          animate={{
            y: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ position: "absolute", left: 0, right: 0, top: 0 }}
        />

        <p className="generating-text">Exposing image...</p>
      </motion.div>
    </motion.div>
  );
}

// Image Reveal with Flash Effect
function ImageReveal({
  image,
  onSave,
  onDownload,
  onRefine,
  isSaving,
}: {
  image: GeneratedImage;
  onSave: () => void;
  onDownload: () => void;
  onRefine: () => void;
  isSaving: boolean;
}) {
  const [showFlash, setShowFlash] = useState(true);
  const [showGlow, setShowGlow] = useState(true);

  useEffect(() => {
    // Flash effect duration
    const flashTimer = setTimeout(() => setShowFlash(false), 100);
    // Glow effect duration
    const glowTimer = setTimeout(() => setShowGlow(false), 1200);
    return () => {
      clearTimeout(flashTimer);
      clearTimeout(glowTimer);
    };
  }, [image.id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="image-reveal"
    >
      {/* Flash Effect */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            className="flash-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          />
        )}
      </AnimatePresence>

      {/* Image Fade In */}
      <motion.img
        src={image.imageUrl}
        alt="Generated"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hero-image hero-image--revealing"
      />

      {/* Radial Glow from Center */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            className="reveal-glow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.5, 2] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <motion.div
        className="hero-actions"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <motion.button
          className="hero-action-btn"
          onClick={onDownload}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Download size={18} />
          <span>Download</span>
        </motion.button>

        <motion.button
          className={cn("hero-action-btn", image.isSaved && "primary")}
          onClick={onSave}
          disabled={isSaving || image.isSaved}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isSaving ? (
            <Loader2 size={18} className="animate-spin" />
          ) : image.isSaved ? (
            <CheckCircle size={18} />
          ) : (
            <Save size={18} />
          )}
          <span>{image.isSaved ? "Saved" : "Save to Library"}</span>
        </motion.button>

        <motion.button
          className="hero-action-btn"
          onClick={onRefine}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Wand2 size={18} />
          <span>Refine</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// Empty State
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="empty-state"
    >
      <div className="empty-frame">
        <Sparkles className="center-canvas__empty-icon" strokeWidth={1} />
        <h3 className="center-canvas__empty-title">Your canvas awaits</h3>
        <p className="center-canvas__empty-description">
          Describe your vision below and watch Madison bring it to life
        </p>
      </div>
    </motion.div>
  );
}

export function CenterCanvas({
  images,
  heroImage,
  onSetHero,
  onSaveImage,
  onDeleteImage,
  onDownloadImage,
  onRefineImage,
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  isSaving,
  canGenerate,
  proSettingsCount,
  maxImages,
}: CenterCanvasProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "48px";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canGenerate && !isGenerating) {
        onGenerate();
      }
    }
  };

  return (
    <section className="center-canvas">
      {/* Main Viewport */}
      <div className="center-canvas__viewport">
        <AnimatePresence mode="wait">
          {isGenerating ? (
            <GeneratingState key="generating" />
          ) : heroImage ? (
            <ImageReveal
              key={heroImage.id}
              image={heroImage}
              onSave={() => onSaveImage(heroImage.id)}
              onDownload={() => onDownloadImage(heroImage)}
              onRefine={() => onRefineImage(heroImage)}
              isSaving={isSaving}
            />
          ) : (
            <EmptyState key="empty" />
          )}
        </AnimatePresence>
      </div>

      {/* Film Strip Thumbnail Carousel */}
      <ThumbnailCarousel
        images={images}
        activeId={heroImage?.id || null}
        onSelect={onSetHero}
        onSave={onSaveImage}
        onDelete={onDeleteImage}
        maxSlots={maxImages}
      />

      {/* Prompt Bar */}
      <div className={cn("prompt-bar", isFocused && "focused")}>
        {/* Pro Mode Indicator */}
        {proSettingsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prompt-bar__pro-indicator"
          >
            <span>🎛️</span>
            <span>
              Pro Mode: {proSettingsCount} setting
              {proSettingsCount > 1 ? "s" : ""} active
            </span>
          </motion.div>
        )}

        <div className="prompt-bar__input-container">
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              onPromptChange(e.target.value);
              resizeTextarea();
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder="Describe your vision... (Press Enter to generate)"
            className="prompt-input"
            disabled={isGenerating}
            rows={1}
          />

          <motion.button
            type="button"
            className="prompt-submit"
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating || images.length >= maxImages}
            whileHover={canGenerate ? { scale: 1.05 } : {}}
            whileTap={canGenerate ? { scale: 0.95 } : {}}
          >
            {isGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
