/**
 * Light Table - Madison Studio's Image Refinement & Review Studio
 * 
 * A full-screen dedicated page for reviewing and refining generated images.
 * Features an animated vertical film strip on the right showing all session images.
 * 
 * Flow: Dark Room (generate) → Light Table (review/refine) → Library (save) or Video Project (create video)
 */

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
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
  Trash2,
  Heart,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";

// Styles
import "@/styles/light-table.css";

// Types
interface SessionImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isSaved: boolean;
  isHero?: boolean;
}

interface Variation {
  id: string;
  imageUrl: string;
  isGenerating: boolean;
}

interface LocationState {
  selectedImageId?: string;
  sessionImages?: SessionImage[];
  sessionId?: string;
}

export default function LightTable() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  const filmStripRef = useRef<HTMLDivElement>(null);

  // Get data from navigation state
  const locationState = location.state as LocationState | undefined;

  // Images state
  const [images, setImages] = useState<SessionImage[]>(
    locationState?.sessionImages || []
  );
  const [selectedImageId, setSelectedImageId] = useState<string | null>(
    locationState?.selectedImageId || (images[0]?.id ?? null)
  );
  const sessionId = locationState?.sessionId || uuidv4();

  // UI state
  const [activeTab, setActiveTab] = useState<"refine" | "text" | "variations">("refine");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Refine state
  const [refinementPrompt, setRefinementPrompt] = useState("");

  // Variations state
  const [variations, setVariations] = useState<Variation[]>([]);

  // Text overlay state
  const [textOverlay, setTextOverlay] = useState({
    headline: "",
    subtext: "",
    position: "bottom" as "top" | "center" | "bottom",
  });

  // Selected image
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) || images[0] || null,
    [images, selectedImageId]
  );

  // Update refinement prompt when image changes
  useEffect(() => {
    if (selectedImage) {
      setRefinementPrompt(selectedImage.prompt);
    }
  }, [selectedImage?.id]);

  // Handle no images - redirect back
  useEffect(() => {
    if (!locationState?.sessionImages || locationState.sessionImages.length === 0) {
      toast.error("No images to review");
      navigate("/darkroom");
    }
  }, [locationState, navigate]);

  // Generate refinement
  const handleRefine = useCallback(async () => {
    if (!selectedImage || !user || !orgId || !refinementPrompt.trim()) {
      toast.error("Please enter a refinement prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          prompt: refinementPrompt,
          referenceImageUrl: selectedImage.imageUrl,
          userId: user.id,
          organizationId: orgId,
          goalType: "refinement",
        },
      });

      if (error) throw error;

      if (data?.imageUrl) {
        const newImage: SessionImage = {
          id: data.imageId || uuidv4(),
          imageUrl: data.imageUrl,
          prompt: refinementPrompt,
          timestamp: Date.now(),
          isSaved: true,
        };

        // Add to images and select it
        setImages((prev) => [...prev, newImage]);
        setSelectedImageId(newImage.id);

        toast.success("Refinement generated!");
      }
    } catch (error) {
      console.error("Refinement error:", error);
      toast.error("Failed to generate refinement");
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImage, user, orgId, refinementPrompt]);

  // Generate variations
  const handleGenerateVariations = useCallback(async () => {
    if (!selectedImage || !user || !orgId) return;

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
      const variationPrompts = [
        `${selectedImage.prompt}. Alternative angle with dramatic lighting.`,
        `${selectedImage.prompt}. Softer, more elegant presentation.`,
        `${selectedImage.prompt}. Bold contrast with rich shadows.`,
      ];

      const results = await Promise.allSettled(
        variationPrompts.map(async (prompt, index) => {
          const { data, error } = await supabase.functions.invoke("generate-madison-image", {
            body: {
              prompt,
              referenceImageUrl: selectedImage.imageUrl,
              userId: user.id,
              organizationId: orgId,
              goalType: "variation",
            },
          });

          if (error) throw error;
          return {
            id: placeholders[index].id,
            imageUrl: data?.imageUrl || "",
            isGenerating: false,
          };
        })
      );

      const newVariations = results
        .map((result, index) => {
          if (result.status === "fulfilled" && result.value.imageUrl) {
            return result.value;
          }
          return { id: placeholders[index].id, imageUrl: "", isGenerating: false };
        })
        .filter((v) => v.imageUrl);

      setVariations(newVariations);

      // Add variations to images
      const newImages: SessionImage[] = newVariations.map((v) => ({
        id: v.id,
        imageUrl: v.imageUrl,
        prompt: selectedImage.prompt + " (variation)",
        timestamp: Date.now(),
        isSaved: true,
      }));
      setImages((prev) => [...prev, ...newImages]);

      if (newVariations.length > 0) {
        toast.success(`Generated ${newVariations.length} variations`);
      }
    } catch (error) {
      console.error("Variations error:", error);
      toast.error("Failed to generate variations");
      setVariations([]);
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImage, user, orgId]);

  // Create video from this image
  const handleCreateVideo = useCallback(() => {
    if (!selectedImage) return;

    navigate("/video-project", {
      state: {
        startingImage: {
          url: selectedImage.imageUrl,
          id: selectedImage.id,
          prompt: selectedImage.prompt,
        },
      },
    });
    toast.success("Starting video project...");
  }, [selectedImage, navigate]);

  // Save to library
  const handleSave = useCallback(async () => {
    if (!selectedImage) return;

    setIsSaving(true);
    try {
      // Update in database
      const { error } = await supabase
        .from("generated_images")
        .update({ saved_to_library: true })
        .eq("id", selectedImage.id);

      if (error) throw error;

      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id ? { ...img, isSaved: true } : img
        )
      );
      toast.success("Saved to library");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save");
    } finally {
      setIsSaving(false);
    }
  }, [selectedImage]);

  // Download image
  const handleDownload = useCallback(async () => {
    if (!selectedImage) return;

    try {
      const response = await fetch(selectedImage.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `madison-studio-${selectedImage.id.slice(0, 8)}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download");
    }
  }, [selectedImage]);

  // Copy prompt
  const handleCopyPrompt = useCallback(() => {
    if (!selectedImage?.prompt) return;
    navigator.clipboard.writeText(selectedImage.prompt);
    toast.success("Prompt copied");
  }, [selectedImage?.prompt]);

  // Delete image
  const handleDelete = useCallback(() => {
    if (!selectedImage) return;

    setImages((prev) => {
      const newImages = prev.filter((img) => img.id !== selectedImage.id);
      if (newImages.length === 0) {
        navigate("/darkroom");
        return prev;
      }
      // Select next image
      const currentIndex = prev.findIndex((img) => img.id === selectedImage.id);
      const nextIndex = Math.min(currentIndex, newImages.length - 1);
      setSelectedImageId(newImages[nextIndex]?.id || null);
      return newImages;
    });

    toast.success("Image removed from session");
  }, [selectedImage, navigate]);

  // Navigate back
  const handleBack = useCallback(() => {
    navigate("/darkroom");
  }, [navigate]);

  // Film strip scroll
  const scrollFilmStrip = useCallback((direction: "up" | "down") => {
    if (!filmStripRef.current) return;
    const scrollAmount = 200;
    filmStripRef.current.scrollBy({
      top: direction === "up" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  }, []);

  if (!selectedImage) {
    return null;
  }

  return (
    <div className="light-table-container">
      {/* Header */}
      <header className="light-table-header">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="light-table-back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dark Room
        </Button>

        <h1 className="light-table-title">Light Table</h1>

        <div className="light-table-header-actions">
          <span className="light-table-session-count">
            {images.length} image{images.length !== 1 ? "s" : ""} in session
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="light-table-content">
        {/* Left: Main Image & Controls */}
        <div className="light-table-main">
          {/* Image Preview */}
          <div className="light-table-preview">
            <motion.div
              key={selectedImage.id}
              className="light-table-image-container"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={selectedImage.imageUrl}
                alt="Selected"
                className="light-table-image"
              />

              {/* Text Overlay Preview */}
              {textOverlay.headline && (
                <div
                  className={cn(
                    "light-table-text-overlay",
                    `light-table-text-overlay--${textOverlay.position}`
                  )}
                >
                  {textOverlay.headline && (
                    <h2 className="light-table-text-headline">{textOverlay.headline}</h2>
                  )}
                  {textOverlay.subtext && (
                    <p className="light-table-text-subtext">{textOverlay.subtext}</p>
                  )}
                </div>
              )}

              {/* Saved Badge */}
              {selectedImage.isSaved && (
                <div className="light-table-saved-badge">
                  <Check className="w-3 h-3" />
                  Saved
                </div>
              )}
            </motion.div>

            {/* Quick Actions */}
            <div className="light-table-quick-actions">
              <Button variant="outline" size="sm" onClick={handleCopyPrompt}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Prompt
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="brass" size="sm" onClick={handleCreateVideo}>
                <Film className="w-4 h-4 mr-2" />
                Create Video
              </Button>
            </div>
          </div>

          {/* Editor Panel */}
          <div className="light-table-editor">
            {/* Tabs */}
            <div className="light-table-tabs">
              <button
                className={cn(
                  "light-table-tab",
                  activeTab === "refine" && "light-table-tab--active"
                )}
                onClick={() => setActiveTab("refine")}
              >
                <Wand2 className="w-4 h-4" />
                <span>Refine</span>
              </button>
              <button
                className={cn(
                  "light-table-tab",
                  activeTab === "variations" && "light-table-tab--active"
                )}
                onClick={() => setActiveTab("variations")}
              >
                <RefreshCw className="w-4 h-4" />
                <span>Variations</span>
              </button>
              <button
                className={cn(
                  "light-table-tab",
                  activeTab === "text" && "light-table-tab--active"
                )}
                onClick={() => setActiveTab("text")}
              >
                <Type className="w-4 h-4" />
                <span>Text</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="light-table-tab-content">
              {activeTab === "refine" && (
                <div className="light-table-refine">
                  <label className="light-table-label">Describe changes</label>
                  <Textarea
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    placeholder="e.g., Make the lighting warmer, add shadows..."
                    className="light-table-textarea"
                    rows={3}
                  />
                  <Button
                    variant="brass"
                    onClick={handleRefine}
                    disabled={isGenerating || !refinementPrompt.trim()}
                    className="light-table-generate-btn"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? "Generating..." : "Refine Image"}
                  </Button>
                </div>
              )}

              {activeTab === "variations" && (
                <div className="light-table-variations">
                  <div className="light-table-variations-header">
                    <span>Generate 3 style variations</span>
                    <Button
                      variant="brass"
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

                  {variations.length > 0 && (
                    <div className="light-table-variations-grid">
                      {variations.map((v, i) => (
                        <div key={v.id} className="light-table-variation-item">
                          {v.isGenerating ? (
                            <div className="light-table-variation-loading">
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                          ) : (
                            <img src={v.imageUrl} alt={`Variation ${i + 1}`} />
                          )}
                          <span>V{i + 1}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "text" && (
                <div className="light-table-text-editor">
                  <div className="light-table-text-field">
                    <label>Headline</label>
                    <input
                      type="text"
                      value={textOverlay.headline}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, headline: e.target.value }))
                      }
                      placeholder="Enter headline..."
                      className="light-table-text-input"
                    />
                  </div>
                  <div className="light-table-text-field">
                    <label>Subtext</label>
                    <input
                      type="text"
                      value={textOverlay.subtext}
                      onChange={(e) =>
                        setTextOverlay((prev) => ({ ...prev, subtext: e.target.value }))
                      }
                      placeholder="Enter subtext..."
                      className="light-table-text-input"
                    />
                  </div>
                  <div className="light-table-text-field">
                    <label>Position</label>
                    <div className="light-table-position-btns">
                      {(["top", "center", "bottom"] as const).map((pos) => (
                        <button
                          key={pos}
                          className={cn(
                            "light-table-position-btn",
                            textOverlay.position === pos && "light-table-position-btn--active"
                          )}
                          onClick={() =>
                            setTextOverlay((prev) => ({ ...prev, position: pos }))
                          }
                        >
                          {pos}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="light-table-footer">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="light-table-delete-btn"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
              <div className="light-table-footer-right">
                {!selectedImage.isSaved && (
                  <Button variant="outline" onClick={handleSave} disabled={isSaving}>
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
        </div>

        {/* Right: Animated Film Strip */}
        <div className="light-table-film-strip">
          {/* Film Strip Header */}
          <div className="film-strip-header">
            <span className="film-strip-title">Session</span>
            <button
              className="film-strip-scroll-btn"
              onClick={() => scrollFilmStrip("up")}
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Film Strip Scroll Area */}
          <div className="film-strip-scroll" ref={filmStripRef}>
            {/* Film sprocket holes - top */}
            <div className="film-strip-sprockets" />

            {/* Images */}
            <div className="film-strip-images">
              {images.map((image, index) => (
                <motion.button
                  key={image.id}
                  className={cn(
                    "film-strip-frame",
                    selectedImageId === image.id && "film-strip-frame--selected"
                  )}
                  onClick={() => setSelectedImageId(image.id)}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <img src={image.imageUrl} alt={`Frame ${index + 1}`} />
                  <div className="film-strip-frame-number">{index + 1}</div>
                  {image.isSaved && (
                    <div className="film-strip-frame-saved">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Film sprocket holes - bottom */}
            <div className="film-strip-sprockets" />
          </div>

          {/* Film Strip Footer */}
          <div className="film-strip-footer">
            <button
              className="film-strip-scroll-btn"
              onClick={() => scrollFilmStrip("down")}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
