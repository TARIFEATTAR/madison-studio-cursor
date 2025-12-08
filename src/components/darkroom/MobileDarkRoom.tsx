/**
 * MobileDarkRoom - Mobile-optimized Dark Room interface
 * 
 * Clean tile-based UI for mobile that avoids scrolling by using
 * full-screen modals for each setting category.
 * 
 * Features:
 * - Hero image preview with developing animation
 * - Full-screen image viewer on tap
 * - Tile-based settings grid
 */

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Dices, Camera, Loader2, ChevronLeft, X, Save, Trash2, CheckCircle, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileSettingsGrid } from "./MobileSettingsGrid";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { UploadZone } from "./UploadZone";
import { ThumbnailCarousel } from "./ThumbnailCarousel";
import { DevelopingAnimation, useDevelopingAnimation } from "./DevelopingAnimation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProModeSettings } from "./ProSettings";
import { Product } from "@/hooks/useProducts";
import { ProductSelector } from "@/components/forge/ProductSelector";

interface UploadedImage {
  url: string;
  file?: File;
  name?: string;
}

interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isSaved: boolean;
  isHero?: boolean;
}

interface MobileDarkRoomProps {
  // Prompt
  prompt: string;
  onPromptChange: (value: string) => void;
  
  // Generation
  onGenerate: () => void;
  isGenerating: boolean;
  canGenerate: boolean;
  
  // Images
  images: GeneratedImage[];
  heroImageId: string | null;
  onSetHero: (id: string) => void;
  onSaveImage: (id: string) => void;
  onDeleteImage: (id: string) => void;
  onRefineImage: (image: GeneratedImage) => void;
  maxImages: number;
  
  // Track newly generated for animation
  newlyGeneratedId?: string | null;
  
  // Product & References
  selectedProduct: Product | null;
  onProductSelect: (product: Product | null) => void;
  productImage: UploadedImage | null;
  onProductImageUpload: (image: UploadedImage | null) => void;
  backgroundImage: UploadedImage | null;
  onBackgroundImageUpload: (image: UploadedImage | null) => void;
  styleReference: UploadedImage | null;
  onStyleReferenceUpload: (image: UploadedImage | null) => void;
  
  // Pro Settings
  proSettings: ProModeSettings;
  onProSettingsChange: (settings: ProModeSettings) => void;
}

export function MobileDarkRoom({
  prompt,
  onPromptChange,
  onGenerate,
  isGenerating,
  canGenerate,
  images,
  heroImageId,
  onSetHero,
  onSaveImage,
  onDeleteImage,
  onRefineImage,
  maxImages,
  newlyGeneratedId,
  selectedProduct,
  onProductSelect,
  productImage,
  onProductImageUpload,
  backgroundImage,
  onBackgroundImageUpload,
  styleReference,
  onStyleReferenceUpload,
  proSettings,
  onProSettingsChange,
}: MobileDarkRoomProps) {
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputsSheetOpen, setInputsSheetOpen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<GeneratedImage | null>(null);
  const [showDevelopingPreview, setShowDevelopingPreview] = useState(false);

  const heroImage = images.find((img) => img.id === heroImageId) || images[0] || null;
  const isNewlyGenerated = heroImage && heroImage.id === newlyGeneratedId;

  // Use the developing animation hook for newly generated images
  const { phase } = useDevelopingAnimation(
    isNewlyGenerated ? heroImage?.imageUrl : null,
    {
      autoStart: !!isNewlyGenerated,
      developDuration: 2500,
      onComplete: () => {
        // Animation complete
      },
    }
  );

  // Show developing preview when generating or when we have a new image
  useEffect(() => {
    if (isGenerating) {
      setShowDevelopingPreview(true);
    } else if (isNewlyGenerated && phase === "revealed") {
      // Keep showing for a moment after reveal
      const timer = setTimeout(() => {
        setShowDevelopingPreview(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isGenerating, isNewlyGenerated, phase]);

  // Auto-resize textarea
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onPromptChange(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  };

  // Random prompt ideas
  const handleRandomPrompt = () => {
    const prompts = [
      "Elegant product shot with soft morning light",
      "Minimalist composition on marble surface",
      "Luxurious lifestyle setting with botanical elements",
      "Dramatic studio lighting with deep shadows",
      "Golden hour glow with natural textures",
    ];
    const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    onPromptChange(randomPrompt);
  };

  // Handle generate with Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && canGenerate && !isGenerating) {
      e.preventDefault();
      onGenerate();
    }
  };

  // Handle button interactions with proper touch support
  const handleBackClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === "touchend") e.preventDefault();
    navigate(-1);
  }, [navigate]);

  const handleRandomClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === "touchend") e.preventDefault();
    handleRandomPrompt();
  }, []);

  const handleGenerateClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (e.type === "touchend") e.preventDefault();
    if (canGenerate && !isGenerating && images.length < maxImages) {
      onGenerate();
    }
  }, [canGenerate, isGenerating, images.length, maxImages, onGenerate]);

  const handleOpenInputsClick = useCallback((e?: React.MouseEvent | React.TouchEvent) => {
    if (e?.type === "touchend") e.preventDefault();
    setInputsSheetOpen(true);
  }, []);

  return (
    <div className="mobile-darkroom">
      {/* Header */}
      <div className="mobile-darkroom__header">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            onTouchEnd={handleBackClick}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--darkroom-surface)] text-[var(--darkroom-text-muted)] active:bg-[var(--darkroom-surface-elevated)] active:scale-95 transition-all"
            type="button"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="mobile-darkroom__title">Dark Room</h1>
        </div>
      </div>

      {/* Prompt Area */}
      <div className="mobile-darkroom__prompt-area">
        <textarea
          ref={textareaRef}
          className="mobile-darkroom__prompt-input"
          placeholder="Write or talk about your idea..."
          value={prompt}
          onChange={handlePromptChange}
          onKeyDown={handleKeyDown}
          rows={3}
        />
        <div className="mobile-darkroom__prompt-footer">
          <div className="mobile-darkroom__image-count">
            <Plus className="w-4 h-4" />
            <span>{images.length}/{maxImages}</span>
          </div>
          <button
            className="mobile-darkroom__random-btn"
            onClick={handleRandomClick}
            onTouchEnd={handleRandomClick}
            title="Random prompt idea"
            type="button"
          >
            <Dices className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Hero Image Preview - Shows during/after generation */}
      <AnimatePresence mode="wait">
        {(isGenerating || heroImage) && (
          <motion.div
            className="mobile-darkroom__hero-preview"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isGenerating ? (
              // Developing animation while generating
              <div className="mobile-darkroom__developing">
                <DevelopingAnimation
                  phase="submerged"
                  developingText="Exposing image..."
                />
              </div>
            ) : heroImage && isNewlyGenerated ? (
              // Newly generated image with reveal animation
              <motion.div 
                className="mobile-darkroom__hero-container"
                onClick={() => setFullscreenImage(heroImage)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setFullscreenImage(heroImage);
                }}
              >
                <DevelopingAnimation
                  imageUrl={heroImage.imageUrl}
                  phase={phase}
                  developDuration={2500}
                  developingText="Developing..."
                />
                <div className="mobile-darkroom__hero-hint">Tap to expand</div>
              </motion.div>
            ) : heroImage ? (
              // Regular hero image display
              <motion.div 
                className="mobile-darkroom__hero-container"
                onClick={() => setFullscreenImage(heroImage)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setFullscreenImage(heroImage);
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <img 
                  src={heroImage.imageUrl} 
                  alt="Generated" 
                  className="mobile-darkroom__hero-image"
                />
                {heroImage.isSaved && (
                  <div className="mobile-darkroom__saved-badge">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                )}
                <div className="mobile-darkroom__hero-hint">Tap to expand</div>
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Grid */}
      <MobileSettingsGrid
        proSettings={proSettings}
        onProSettingsChange={onProSettingsChange}
        onOpenInputs={handleOpenInputsClick}
        hasProductImage={!!productImage}
        hasBackgroundImage={!!backgroundImage}
        hasStyleReference={!!styleReference}
        disabled={isGenerating}
      />

      {/* Film Strip (if images exist) */}
      {images.length > 0 && (
        <div className="mobile-darkroom__film-strip">
          <ThumbnailCarousel
            images={images}
            activeId={heroImageId}
            onSelect={(id) => {
              onSetHero(id);
              const img = images.find(i => i.id === id);
              if (img) setFullscreenImage(img);
            }}
            onSave={onSaveImage}
            onDelete={onDeleteImage}
            maxSlots={maxImages}
          />
        </div>
      )}

      {/* Generate Button */}
      <button
        className="mobile-darkroom__generate-btn"
        onClick={handleGenerateClick}
        onTouchEnd={handleGenerateClick}
        disabled={!canGenerate || isGenerating || images.length >= maxImages}
        type="button"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            <span>Generate Image</span>
          </>
        )}
      </button>

      {/* Inputs Sheet (Product, Background, Style images) */}
      <MobileBottomSheet
        isOpen={inputsSheetOpen}
        onClose={() => setInputsSheetOpen(false)}
        title="Reference Images"
        className="mobile-inputs-sheet"
      >
        <div className="space-y-4 p-2">
          {/* Product Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--darkroom-text-muted)]">
              Product Context
            </label>
            <ProductSelector
              value={selectedProduct?.name || ""}
              onSelect={(product) => onProductSelect(product)}
              onProductDataChange={(product) => onProductSelect(product)}
              showLabel={false}
              buttonClassName="w-full justify-between h-12 bg-[var(--darkroom-bg)] border-[var(--darkroom-border)] text-[var(--darkroom-text-muted)] hover:text-[var(--darkroom-text)] hover:border-[var(--darkroom-accent)]"
            />
          </div>

          {/* Product Image */}
          <UploadZone
            type="product"
            label="Product Image"
            description="For enhancement & placement"
            image={productImage}
            onUpload={onProductImageUpload}
            onRemove={() => onProductImageUpload(null)}
            disabled={isGenerating}
          />

          {/* Background Scene */}
          <UploadZone
            type="background"
            label="Background Scene"
            description="Composites product into scene"
            image={backgroundImage}
            onUpload={onBackgroundImageUpload}
            onRemove={() => onBackgroundImageUpload(null)}
            disabled={isGenerating}
          />

          {/* Style Reference */}
          <UploadZone
            type="style"
            label="Style Reference"
            description="Matches lighting & mood"
            image={styleReference}
            onUpload={onStyleReferenceUpload}
            onRemove={() => onStyleReferenceUpload(null)}
            disabled={isGenerating}
          />

          {/* Done Button */}
          <Button
            className="w-full mt-4"
            variant="brass"
            onClick={() => setInputsSheetOpen(false)}
          >
            Done
          </Button>
        </div>
      </MobileBottomSheet>

      {/* Fullscreen Image Viewer */}
      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            className="mobile-darkroom__fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div 
              className="mobile-darkroom__fullscreen-backdrop"
              onClick={() => setFullscreenImage(null)}
              onTouchEnd={(e) => {
                e.preventDefault();
                setFullscreenImage(null);
              }}
            />

            {/* Image Container */}
            <motion.div
              className="mobile-darkroom__fullscreen-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <img
                src={fullscreenImage.imageUrl}
                alt="Generated"
                className="mobile-darkroom__fullscreen-image"
              />

              {/* Close Button */}
              <button
                className="mobile-darkroom__fullscreen-close"
                onClick={() => setFullscreenImage(null)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setFullscreenImage(null);
                }}
                type="button"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Action Buttons */}
              <div className="mobile-darkroom__fullscreen-actions">
                {/* Refine - Primary action */}
                <button
                  className="mobile-darkroom__fullscreen-action mobile-darkroom__fullscreen-action--primary"
                  onClick={() => {
                    setFullscreenImage(null);
                    onRefineImage(fullscreenImage);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    setFullscreenImage(null);
                    onRefineImage(fullscreenImage);
                  }}
                  type="button"
                >
                  <Wand2 className="w-5 h-5" />
                  <span>Refine</span>
                </button>

                {/* Save */}
                <button
                  className="mobile-darkroom__fullscreen-action"
                  onClick={() => {
                    onSaveImage(fullscreenImage.id);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onSaveImage(fullscreenImage.id);
                  }}
                  disabled={fullscreenImage.isSaved}
                  type="button"
                >
                  {fullscreenImage.isSaved ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{fullscreenImage.isSaved ? "Saved" : "Save"}</span>
                </button>

                {/* Delete */}
                <button
                  className="mobile-darkroom__fullscreen-action mobile-darkroom__fullscreen-action--delete"
                  onClick={() => {
                    onDeleteImage(fullscreenImage.id);
                    setFullscreenImage(null);
                  }}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    onDeleteImage(fullscreenImage.id);
                    setFullscreenImage(null);
                  }}
                  type="button"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

