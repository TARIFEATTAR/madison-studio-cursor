import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Save,
  CheckCircle,
  Loader2,
  Wand2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

// Thumbnail Slot component
function ThumbnailSlot({
  image,
  isActive,
  index,
  onClick,
  onSave,
  onDelete,
  onRefine,
}: {
  image?: GeneratedImage;
  isActive: boolean;
  index: number;
  onClick?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onRefine?: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  if (!image) {
    return (
      <div className="thumbnail-slot thumbnail-slot--empty">
        <span className="text-[10px] text-[var(--darkroom-text-dim)]">
          {index + 1}
        </span>
      </div>
    );
  }

  return (
    <motion.div
      className={cn(
        "thumbnail-slot",
        isActive && "thumbnail-slot--active",
        image.isSaved && "thumbnail-slot--saved"
      )}
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
    >
      <img src={image.imageUrl} alt={`Generated ${index + 1}`} />
      
      {/* Hover Actions */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 flex items-center justify-center gap-1 p-1"
            onClick={(e) => e.stopPropagation()}
          >
            {!image.isSaved && onSave && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:text-[var(--darkroom-success)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <Save className="w-3 h-3" />
              </Button>
            )}
            {onRefine && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:text-[var(--darkroom-accent)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onRefine();
                }}
              >
                <Wand2 className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-white hover:text-[var(--darkroom-error)]"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Saved Indicator */}
      {image.isSaved && (
        <div className="absolute top-0.5 right-0.5">
          <CheckCircle className="w-3 h-3 text-[var(--darkroom-success)]" />
        </div>
      )}
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
  const [isNewImage, setIsNewImage] = useState(false);

  // Trigger reveal animation when heroImage changes
  useEffect(() => {
    if (heroImage) {
      setIsNewImage(true);
      const timer = setTimeout(() => setIsNewImage(false), 800);
      return () => clearTimeout(timer);
    }
  }, [heroImage?.id]);

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

  const savedCount = images.filter((img) => img.isSaved).length;

  return (
    <section className="center-canvas">
      {/* Main Viewport */}
      <div className="center-canvas__viewport">
        <AnimatePresence mode="wait">
          {heroImage ? (
            <motion.div
              key={heroImage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hero-image-container"
            >
              <img
                src={heroImage.imageUrl}
                alt="Generated"
                className={cn("hero-image", isNewImage && "hero-image--revealing")}
              />

              {/* Quick Actions */}
              <div className="hero-image-container__actions">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onSaveImage(heroImage.id)}
                  disabled={isSaving || heroImage.isSaved}
                  className={cn(
                    "h-9 px-3 bg-[var(--darkroom-surface)]/90 backdrop-blur-sm border-0",
                    heroImage.isSaved &&
                      "bg-[var(--darkroom-success)]/20 text-[var(--darkroom-success)]"
                  )}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : heroImage.isSaved ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span className="ml-1.5 text-xs">
                    {heroImage.isSaved ? "Saved" : "Save"}
                  </span>
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onDownloadImage(heroImage)}
                  className="h-9 w-9 p-0 bg-[var(--darkroom-surface)]/90 backdrop-blur-sm border-0"
                >
                  <Download className="w-4 h-4" />
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onRefineImage(heroImage)}
                  className="h-9 px-3 bg-[var(--darkroom-surface)]/90 backdrop-blur-sm border-0"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="ml-1.5 text-xs">Refine</span>
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="center-canvas__empty"
            >
              <Sparkles className="center-canvas__empty-icon" strokeWidth={1} />
              <div>
                <h3 className="center-canvas__empty-title">Your canvas awaits</h3>
                <p className="center-canvas__empty-description">
                  Describe your vision below and watch Madison bring it to life
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generating Overlay */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="generating-overlay"
            >
              <Loader2 className="generating-overlay__spinner" />
              <p className="generating-overlay__text">Developing your image...</p>
              <p className="generating-overlay__subtext">
                This may take a moment
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thumbnail Carousel */}
      <div className="thumbnail-carousel">
        <div className="thumbnail-carousel__slots">
          {Array.from({ length: maxImages }).map((_, index) => {
            const image = images[index];
            return (
              <ThumbnailSlot
                key={image?.id || `slot-${index}`}
                image={image}
                isActive={image?.id === heroImage?.id}
                index={index}
                onClick={image ? () => onSetHero(image.id) : undefined}
                onSave={image && !image.isSaved ? () => onSaveImage(image.id) : undefined}
                onDelete={image ? () => onDeleteImage(image.id) : undefined}
                onRefine={image ? () => onRefineImage(image) : undefined}
              />
            );
          })}
        </div>
        <div className="thumbnail-carousel__progress">
          <span className="text-[var(--darkroom-text)]">{images.length}</span>
          <span className="text-[var(--darkroom-text-muted)]">/{maxImages}</span>
          {savedCount > 0 && (
            <span className="ml-2 text-[var(--darkroom-success)]">
              ({savedCount} saved)
            </span>
          )}
        </div>
      </div>

      {/* Prompt Bar */}
      <div className="prompt-bar">
        {/* Pro Mode Indicator */}
        {proSettingsCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="prompt-bar__pro-indicator"
          >
            <span>🎛️</span>
            <span>
              Pro Mode: {proSettingsCount} setting{proSettingsCount > 1 ? "s" : ""} active
            </span>
          </motion.div>
        )}

        <div className="prompt-bar__input-container">
          <Textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => {
              onPromptChange(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Describe the image you want to create..."
            className="prompt-bar__input"
            disabled={isGenerating}
          />

          <Button
            onClick={onGenerate}
            disabled={!canGenerate || isGenerating || images.length >= maxImages}
            variant="brass"
            size="lg"
            className="h-12 px-6 min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
