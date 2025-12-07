import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  Download,
  Save,
  CheckCircle,
  Loader2,
  Wand2,
  Send,
} from "lucide-react";
import { ThumbnailCarousel } from "./ThumbnailCarousel";
import { DevelopingAnimation, useDevelopingAnimation } from "./DevelopingAnimation";
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
  
  // Track newly generated images for developing animation
  newlyGeneratedId?: string | null;
}

// Generating State with Chemical Bath Animation
function GeneratingState({ pendingImageUrl }: { pendingImageUrl?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="generating-state"
    >
      <DevelopingAnimation
        imageUrl={pendingImageUrl}
        phase="submerged"
        developingText="Exposing image..."
      />
    </motion.div>
  );
}

// Image Reveal with Chemical Bath Developing Effect
function ImageReveal({
  image,
  onSave,
  onDownload,
  onRefine,
  isSaving,
  isNewlyGenerated = false,
}: {
  image: GeneratedImage;
  onSave: () => void;
  onDownload: () => void;
  onRefine: () => void;
  isSaving: boolean;
  isNewlyGenerated?: boolean;
}) {
  const [showActions, setShowActions] = useState(!isNewlyGenerated);
  
  // Use the developing animation for newly generated images
  const { phase, isComplete } = useDevelopingAnimation(
    isNewlyGenerated ? image.imageUrl : null,
    {
      autoStart: isNewlyGenerated,
      developDuration: 2500, // 2.5 seconds for the full reveal
      onComplete: () => setShowActions(true),
    }
  );

  // If not newly generated, show directly
  if (!isNewlyGenerated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="image-reveal image-reveal--direct"
      >
        <img
          src={image.imageUrl}
          alt="Generated"
          className="hero-image"
        />
        
        {/* Action Buttons - always visible for non-new images */}
        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
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

  // Newly generated image - show developing animation
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="image-reveal image-reveal--developing"
    >
      {/* Chemical Bath Developing Animation */}
      <DevelopingAnimation
        imageUrl={image.imageUrl}
        phase={phase}
        developDuration={2500}
      />

      {/* Action Buttons - appear after reveal completes */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4, ease: "easeOut" }}
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
        )}
      </AnimatePresence>
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
        <Camera className="center-canvas__empty-icon" strokeWidth={1} />
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
  newlyGeneratedId,
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
              isNewlyGenerated={heroImage.id === newlyGeneratedId}
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
              <Send size={18} />
            )}
          </motion.button>
        </div>
      </div>
    </section>
  );
}
