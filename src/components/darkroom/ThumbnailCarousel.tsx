import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Save, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isSaved: boolean;
}

interface ThumbnailCarouselProps {
  images: GeneratedImage[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onSave?: (id: string) => void;
  onDelete?: (id: string) => void;
  maxSlots?: number;
}

interface FilmFrameProps {
  image?: GeneratedImage;
  index: number;
  isActive: boolean;
  isNew?: boolean;
  onSelect?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
}

function FilmFrame({
  image,
  index,
  isActive,
  isNew = false,
  onSelect,
  onSave,
  onDelete,
}: FilmFrameProps) {
  const [showActions, setShowActions] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

  const handleClick = (e: React.MouseEvent) => {
    if (!image) return;
    
    // On touch devices or if actions are already showing, toggle actions
    if (isTouchDevice) {
      e.preventDefault();
      e.stopPropagation();
      setShowActions(!showActions);
    } else {
      // On desktop, clicking selects the image (hover shows actions)
      onSelect?.();
    }
  };

  const handleDoubleClick = () => {
    if (image && isTouchDevice) {
      // On touch devices, double-tap selects
      onSelect?.();
    }
  };

  return (
    <motion.div
      className={cn(
        "film-frame",
        image ? "exposed" : "unexposed",
        isActive && "active",
        showActions && "actions-visible"
      )}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        delay: index * 0.05,
        duration: 0.3,
      }}
      whileHover={
        image
          ? {
              y: -4,
              scale: 1.02,
            }
          : {}
      }
      onMouseEnter={() => !isTouchDevice && setShowActions(true)}
      onMouseLeave={() => !isTouchDevice && setShowActions(false)}
    >
      {/* Film Frame Border (Glossy Black) */}
      <div className="film-frame-border">
        {/* Frame Number */}
        <div className="frame-number">{String(index + 1).padStart(2, "0")}</div>

        {/* Image Area */}
        <div className="film-frame-image">
          {image ? (
            <>
              {/* Actual Image with Development Animation */}
              <motion.img
                src={image.imageUrl}
                alt={`Frame ${index + 1}`}
                initial={
                  isNew
                    ? {
                        opacity: 0,
                        filter: "brightness(2) contrast(0.5)",
                      }
                    : { opacity: 1 }
                }
                animate={{
                  opacity: 1,
                  filter: "brightness(1) contrast(1)",
                }}
                transition={{
                  duration: isNew ? 1.2 : 0,
                  ease: "easeOut",
                }}
              />

              {/* Glossy Overlay */}
              <div className="film-gloss" />

              {/* Active Glow */}
              {isActive && (
                <motion.div
                  className="film-active-glow"
                  layoutId="filmActiveGlow"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              {/* Saved Badge */}
              {image.isSaved && (
                <motion.div
                  className="film-saved-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Check size={10} />
                </motion.div>
              )}

              {/* Hover/Tap Actions */}
              <AnimatePresence>
                {showActions && (onSave || onDelete) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="film-frame-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Close button for mobile */}
                    {isTouchDevice && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-5 w-5 p-0 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActions(false);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    )}
                    {!image.isSaved && onSave && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:text-[var(--darkroom-success)] bg-black/50 hover:bg-black/70 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSave();
                          if (isTouchDevice) setShowActions(false);
                        }}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-white hover:text-[var(--darkroom-error)] bg-black/50 hover:bg-black/70 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete();
                          if (isTouchDevice) setShowActions(false);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          ) : (
            <div className="film-unexposed">
              <span className="unexposed-label">UNEXPOSED</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ThumbnailCarousel({
  images,
  activeId,
  onSelect,
  onSave,
  onDelete,
  maxSlots = 10,
}: ThumbnailCarouselProps) {
  const slots = Array.from({ length: maxSlots }, (_, i) => images[i] || null);
  const savedCount = images.filter((img) => img.isSaved).length;

  return (
    <div className="film-strip-container">
      {/* Progress Indicator */}
      <div className="carousel-header">
        <span className="carousel-progress">
          {images.length}/{maxSlots} frames exposed
          {savedCount > 0 && (
            <span className="saved-count"> · {savedCount} saved</span>
          )}
        </span>
      </div>

      {/* Film Strip */}
      <div className="film-strip">
        {/* Left Sprocket Edge */}
        <div className="film-edge left">
          {Array.from({ length: Math.ceil(maxSlots / 2) }).map((_, i) => (
            <div key={i} className="sprocket-hole" />
          ))}
        </div>

        {/* Film Frames */}
        <div className="film-frames">
          {slots.map((image, index) => (
            <FilmFrame
              key={image?.id || `slot-${index}`}
              image={image || undefined}
              index={index}
              isActive={image?.id === activeId}
              isNew={
                image && index === images.length - 1 && images.length > 0
                  ? true
                  : false
              }
              onSelect={image ? () => onSelect(image.id) : undefined}
              onSave={
                image && !image.isSaved && onSave
                  ? () => onSave(image.id)
                  : undefined
              }
              onDelete={image && onDelete ? () => onDelete(image.id) : undefined}
            />
          ))}
        </div>

        {/* Right Sprocket Edge */}
        <div className="film-edge right">
          {Array.from({ length: Math.ceil(maxSlots / 2) }).map((_, i) => (
            <div key={i} className="sprocket-hole" />
          ))}
        </div>
      </div>
    </div>
  );
}
