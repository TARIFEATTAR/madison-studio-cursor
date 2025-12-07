/**
 * ImageEditorModal - Universal Image Editor Overlay
 * 
 * A modal that opens when clicking on any image (from Dark Room, Light Table, 
 * Library, or Video Project) to provide refinement and editing capabilities.
 * 
 * Features:
 * - Large image preview
 * - Refine with AI (generate variations)
 * - Add text overlays
 * - Create video (link to Video Project)
 * - Generate variations
 * - Save to library / Export
 * 
 * Keeps users in context by overlaying rather than navigating away.
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  X,
  ArrowLeft,
  Wand2,
  Type,
  Film,
  Download,
  Save,
  Loader2,
  Copy,
  RefreshCw,
  Plus,
  Check,
  Sparkles,
  Image as ImageIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";

// Styles
import "@/styles/image-editor-modal.css";

export interface ImageEditorImage {
  id: string;
  imageUrl: string;
  prompt: string;
  isSaved?: boolean;
  // Additional metadata
  goalType?: string;
  aspectRatio?: string;
  createdAt?: string;
  sessionName?: string;
}

export interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  image: ImageEditorImage | null;
  onSave?: (image: ImageEditorImage) => void;
  onImageGenerated?: (newImage: ImageEditorImage) => void;
  source?: "darkroom" | "library" | "video-project";
}

interface Variation {
  id: string;
  imageUrl: string;
  isGenerating: boolean;
}

export function ImageEditorModal({
  isOpen,
  onClose,
  image,
  onSave,
  onImageGenerated,
  source = "darkroom",
}: ImageEditorModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();

  // UI State
  const [activeTab, setActiveTab] = useState<"refine" | "text" | "variations">("refine");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refine State
  const [refinementPrompt, setRefinementPrompt] = useState("");
  
  // Variations State
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);

  // Text Overlay State (placeholder for future)
  const [textOverlay, setTextOverlay] = useState({
    headline: "",
    subtext: "",
    position: "bottom" as "top" | "center" | "bottom",
  });

  // Reset state when image changes
  useEffect(() => {
    if (image) {
      setRefinementPrompt(image.prompt || "");
      setVariations([]);
      setSelectedVariationId(null);
      setActiveTab("refine");
    }
  }, [image?.id]);

  // Generate a variation/refinement
  const handleRefine = useCallback(async () => {
    if (!image || !user || !orgId || !refinementPrompt.trim()) {
      toast.error("Please enter a refinement prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          prompt: refinementPrompt,
          // Pass as referenceImages array (correct format for edge function)
          referenceImages: [{
            url: image.imageUrl,
            label: "product",
            description: "Image to refine"
          }],
          userId: user.id,
          organizationId: orgId,
          goalType: "refinement",
          aspectRatio: image.aspectRatio || "1:1",
          parentImageId: image.id,
          isRefinement: true,
          refinementInstruction: refinementPrompt,
          parentPrompt: image.prompt,
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: ImageEditorImage = {
          id: data.savedImageId || uuidv4(),
          imageUrl: data.imageUrl,
          prompt: refinementPrompt,
          isSaved: true,
        };

        // Add to variations
        setVariations((prev) => [
          ...prev,
          { id: newImage.id, imageUrl: newImage.imageUrl, isGenerating: false },
        ]);
        setSelectedVariationId(newImage.id);

        if (onImageGenerated) {
          onImageGenerated(newImage);
        }

        toast.success("Refinement generated!");
      }
    } catch (error) {
      console.error("Refinement error:", error);
      toast.error("Failed to generate refinement");
    } finally {
      setIsGenerating(false);
    }
  }, [image, user, orgId, refinementPrompt, onImageGenerated]);

  // Generate multiple variations at once
  const handleGenerateVariations = useCallback(async () => {
    if (!image || !user || !orgId) return;

    setIsGenerating(true);
    
    // Create placeholder variations
    const placeholders: Variation[] = Array(3)
      .fill(null)
      .map(() => ({
        id: uuidv4(),
        imageUrl: "",
        isGenerating: true,
      }));
    
    setVariations(placeholders);

    try {
      // Generate 3 variations with slightly different prompts
      const variationPrompts = [
        `${image.prompt}. Alternative angle with dramatic lighting.`,
        `${image.prompt}. Softer, more elegant presentation.`,
        `${image.prompt}. Bold contrast with rich shadows.`,
      ];

      const results = await Promise.allSettled(
        variationPrompts.map(async (prompt, index) => {
          const { data, error } = await supabase.functions.invoke("generate-madison-image", {
            body: {
              prompt,
              // Pass as referenceImages array (correct format for edge function)
              referenceImages: [{
                url: image.imageUrl,
                label: "product",
                description: "Source image for variation"
              }],
              userId: user.id,
              organizationId: orgId,
              goalType: "variation",
              aspectRatio: image.aspectRatio || "1:1",
              parentImageId: image.id,
            },
          });

          if (error) throw error;
          return {
            id: data?.savedImageId || placeholders[index].id,
            imageUrl: data?.imageUrl || "",
            isGenerating: false,
          };
        })
      );

      // Update variations with results
      const newVariations = results.map((result, index) => {
        if (result.status === "fulfilled" && result.value.imageUrl) {
          return result.value;
        }
        return {
          id: placeholders[index].id,
          imageUrl: "",
          isGenerating: false,
        };
      }).filter((v) => v.imageUrl);

      setVariations(newVariations);
      
      if (newVariations.length > 0) {
        toast.success(`Generated ${newVariations.length} variations`);
      } else {
        toast.error("Failed to generate variations");
      }
    } catch (error) {
      console.error("Variations error:", error);
      toast.error("Failed to generate variations");
      setVariations([]);
    } finally {
      setIsGenerating(false);
    }
  }, [image, user, orgId]);

  // Create video from this image
  const handleCreateVideo = useCallback(() => {
    if (!image) return;

    navigate("/video-project", {
      state: {
        startingImage: {
          url: image.imageUrl,
          id: image.id,
          prompt: image.prompt,
        },
      },
    });
    onClose();
    toast.success("Starting video project...");
  }, [image, navigate, onClose]);

  // Save to library
  const handleSave = useCallback(async () => {
    if (!image) return;

    setIsSaving(true);
    try {
      // If onSave callback provided, use it
      if (onSave) {
        onSave(image);
      }
      toast.success("Saved to library");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [image, onSave]);

  // Download image
  const handleDownload = useCallback(async () => {
    if (!image) return;

    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `madison-studio-${image.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download");
    }
  }, [image]);

  // Copy prompt
  const handleCopyPrompt = useCallback(() => {
    if (!image?.prompt) return;
    navigator.clipboard.writeText(image.prompt);
    toast.success("Prompt copied to clipboard");
  }, [image?.prompt]);

  // Get displayed image (selected variation or original)
  const displayedImage = selectedVariationId
    ? variations.find((v) => v.id === selectedVariationId)?.imageUrl || image?.imageUrl
    : image?.imageUrl;

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="image-editor-modal">
        <DialogHeader className="image-editor-modal__header">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="image-editor-modal__back-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {source === "library" ? "Library" : "Dark Room"}
          </Button>
          <DialogTitle className="image-editor-modal__title">
            Image Editor
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="image-editor-modal__close-btn"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="image-editor-modal__content">
          {/* Main Image Preview */}
          <div className="image-editor-modal__preview">
            <motion.div
              className="image-editor-modal__image-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <img
                src={displayedImage}
                alt="Selected image"
                className="image-editor-modal__image"
              />
              
              {/* Text Overlay Preview (if set) */}
              {textOverlay.headline && (
                <div className={cn(
                  "image-editor-modal__text-overlay",
                  `image-editor-modal__text-overlay--${textOverlay.position}`
                )}>
                  {textOverlay.headline && (
                    <h2 className="image-editor-modal__text-headline">
                      {textOverlay.headline}
                    </h2>
                  )}
                  {textOverlay.subtext && (
                    <p className="image-editor-modal__text-subtext">
                      {textOverlay.subtext}
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <div className="image-editor-modal__quick-actions">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyPrompt}
                className="image-editor-modal__action-btn"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="image-editor-modal__action-btn"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                variant="brass"
                size="sm"
                onClick={handleCreateVideo}
                className="image-editor-modal__action-btn"
              >
                <Film className="w-4 h-4 mr-2" />
                Create Video
              </Button>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="image-editor-modal__panel">
            {/* Tabs */}
            <div className="image-editor-modal__tabs">
              <button
                className={cn(
                  "image-editor-modal__tab",
                  activeTab === "refine" && "image-editor-modal__tab--active"
                )}
                onClick={() => setActiveTab("refine")}
              >
                <Wand2 className="w-4 h-4" />
                <span>Refine</span>
              </button>
              <button
                className={cn(
                  "image-editor-modal__tab",
                  activeTab === "variations" && "image-editor-modal__tab--active"
                )}
                onClick={() => setActiveTab("variations")}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Variations</span>
              </button>
              <button
                className={cn(
                  "image-editor-modal__tab",
                  activeTab === "text" && "image-editor-modal__tab--active"
                )}
                onClick={() => setActiveTab("text")}
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="image-editor-modal__tab-content">
              {/* Refine Tab */}
              {activeTab === "refine" && (
                <motion.div
                  className="image-editor-modal__refine"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <label className="image-editor-modal__label">
                    Describe what you'd like to change
                  </label>
                  <Textarea
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder="e.g., Make the lighting warmer, add more shadows, zoom in on the product..."
                    className="image-editor-modal__textarea"
                    rows={4}
                  />
                  <Button
                    variant="brass"
                    onClick={handleRefine}
                    disabled={isGenerating || !refinementPrompt.trim()}
                    className="image-editor-modal__generate-btn"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? "Generating..." : "Refine Image"}
                  </Button>

                  {/* Original Prompt Display */}
                  <div className="image-editor-modal__original-prompt">
                    <span className="image-editor-modal__prompt-label">Original prompt:</span>
                    <p className="image-editor-modal__prompt-text">{image.prompt}</p>
                  </div>
                </motion.div>
              )}

              {/* Variations Tab */}
              {activeTab === "variations" && (
                <motion.div
                  className="image-editor-modal__variations"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="image-editor-modal__variations-header">
                    <h4>Style Variations</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerateVariations}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4 mr-2" />
                      )}
                      Generate
                    </Button>
                  </div>

                  {/* Original + Variations Grid */}
                  <div className="image-editor-modal__variations-grid">
                    {/* Original Image */}
                    <button
                      className={cn(
                        "image-editor-modal__variation-item",
                        !selectedVariationId && "image-editor-modal__variation-item--selected"
                      )}
                      onClick={() => setSelectedVariationId(null)}
                    >
                      <img src={image.imageUrl} alt="Original" />
                      {!selectedVariationId && (
                        <div className="image-editor-modal__variation-selected">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      <span className="image-editor-modal__variation-label">Original</span>
                    </button>

                    {/* Generated Variations */}
                    {variations.map((variation, index) => (
                      <button
                        key={variation.id}
                        className={cn(
                          "image-editor-modal__variation-item",
                          selectedVariationId === variation.id && "image-editor-modal__variation-item--selected"
                        )}
                        onClick={() => !variation.isGenerating && setSelectedVariationId(variation.id)}
                        disabled={variation.isGenerating}
                      >
                        {variation.isGenerating ? (
                          <div className="image-editor-modal__variation-loading">
                            <Loader2 className="w-6 h-6 animate-spin" />
                          </div>
                        ) : (
                          <>
                            <img src={variation.imageUrl} alt={`Variation ${index + 1}`} />
                            {selectedVariationId === variation.id && (
                              <div className="image-editor-modal__variation-selected">
                                <Check className="w-4 h-4" />
                              </div>
                            )}
                          </>
                        )}
                        <span className="image-editor-modal__variation-label">
                          {variation.isGenerating ? "Generating..." : `V${index + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>

                  {variations.length === 0 && !isGenerating && (
                    <p className="image-editor-modal__variations-empty">
                      Click "Generate" to create style variations of this image
                    </p>
                  )}
                </motion.div>
              )}

              {/* Text Tab */}
              {activeTab === "text" && (
                <motion.div
                  className="image-editor-modal__text-editor"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="image-editor-modal__text-field">
                    <label>Headline</label>
                    <input
                      type="text"
                      value={textOverlay.headline}
                      onChange={(e) => setTextOverlay((prev) => ({ ...prev, headline: e.target.value }))}
                      placeholder="Enter headline text..."
                      className="image-editor-modal__text-input"
                    />
                  </div>
                  
                  <div className="image-editor-modal__text-field">
                    <label>Subtext</label>
                    <input
                      type="text"
                      value={textOverlay.subtext}
                      onChange={(e) => setTextOverlay((prev) => ({ ...prev, subtext: e.target.value }))}
                      placeholder="Enter subtext..."
                      className="image-editor-modal__text-input"
                    />
                  </div>

                  <div className="image-editor-modal__text-field">
                    <label>Position</label>
                    <div className="image-editor-modal__position-btns">
                      {(["top", "center", "bottom"] as const).map((pos) => (
                        <button
                          key={pos}
                          className={cn(
                            "image-editor-modal__position-btn",
                            textOverlay.position === pos && "image-editor-modal__position-btn--active"
                          )}
                          onClick={() => setTextOverlay((prev) => ({ ...prev, position: pos }))}
                        >
                          {pos.charAt(0).toUpperCase() + pos.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="image-editor-modal__text-note">
                    Text will be rendered on the image when you export
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="image-editor-modal__footer">
              {!image.isSaved && (
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save to Library
                </Button>
              )}
              <Button variant="brass" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
