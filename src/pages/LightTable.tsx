/**
 * Light Table - Madison Studio's Image Refinement & Review Studio
 * 
 * A full-screen dedicated page for reviewing and refining generated images.
 * Features an animated vertical film strip on the right showing all session images.
 * 
 * Flow: Dark Room (generate) → Light Table (review/refine) → Library (save) or Video Project (create video)
 */

import { useState, useCallback, useEffect, useRef, useMemo, KeyboardEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { toPng } from "html-to-image";

// Session persistence key
const LIGHT_TABLE_SESSION_KEY = "madison-light-table-session";
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
  Layout,
  RotateCcw,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";

// Ad Overlay components
import { AdOverlay, AdPresetSelector, type AdOverlayConfig } from "@/components/ad-overlay";
import { 
  AD_LAYOUT_PRESETS, 
  AD_FONT_OPTIONS, 
  AD_COLOR_PRESETS,
  type AdLayoutPreset 
} from "@/config/adLayoutPresets";

// Styles
import "@/styles/light-table.css";
import "@/styles/ad-overlay.css";

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

  // Load session from navigation state ONLY (localStorage is for persistence during the session)
  const loadSession = useCallback(() => {
    // Check navigation state (coming from Dark Room) - this is the primary source
    if (locationState?.sessionImages && locationState.sessionImages.length > 0) {
      console.log("📷 Loading session from navigation state:", locationState.sessionImages.length, "images");
      // Clear any old localStorage session when coming fresh from Dark Room
      localStorage.removeItem(LIGHT_TABLE_SESSION_KEY);
      return {
        images: locationState.sessionImages,
        selectedId: locationState.selectedImageId || locationState.sessionImages[0]?.id || null,
        sessionId: locationState.sessionId || uuidv4(),
      };
    }

    // Only check localStorage if we're returning to an active session (e.g., page refresh)
    // This is checked by looking at the session age - only load if less than 30 minutes old
    try {
      const saved = localStorage.getItem(LIGHT_TABLE_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const sessionAge = Date.now() - (parsed.savedAt || 0);
        const MAX_SESSION_AGE = 30 * 60 * 1000; // 30 minutes
        
        if (parsed.images && parsed.images.length > 0 && sessionAge < MAX_SESSION_AGE) {
          console.log("📷 Restoring session from localStorage:", parsed.images.length, "images, age:", Math.round(sessionAge / 1000), "seconds");
          return {
            images: parsed.images as SessionImage[],
            selectedId: parsed.selectedImageId || parsed.images[0]?.id || null,
            sessionId: parsed.sessionId || uuidv4(),
          };
        } else if (sessionAge >= MAX_SESSION_AGE) {
          console.log("📷 Session expired, clearing localStorage");
          localStorage.removeItem(LIGHT_TABLE_SESSION_KEY);
        }
      }
    } catch (e) {
      console.error("Failed to load session from localStorage:", e);
      localStorage.removeItem(LIGHT_TABLE_SESSION_KEY);
    }
    
    return { images: [], selectedId: null, sessionId: uuidv4() };
  }, [locationState]);

  const initialSession = useMemo(() => loadSession(), []);
  
  // Images state
  const [images, setImages] = useState<SessionImage[]>(initialSession.images);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(initialSession.selectedId);
  const [sessionId] = useState<string>(initialSession.sessionId);

  // Save session to localStorage whenever images change
  useEffect(() => {
    if (images.length > 0) {
      try {
        localStorage.setItem(
          LIGHT_TABLE_SESSION_KEY,
          JSON.stringify({
            images,
            selectedImageId,
            sessionId,
            savedAt: Date.now(),
          })
        );
      } catch (e) {
        console.error("Failed to save session to localStorage:", e);
      }
    }
  }, [images, selectedImageId, sessionId]);

  // UI state
  const [activeTab, setActiveTab] = useState<"refine" | "text" | "variations" | "ad">("refine");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingAd, setIsExportingAd] = useState(false);

  // Refine state
  const [refinementPrompt, setRefinementPrompt] = useState("");

  // Variations state
  const [variations, setVariations] = useState<Variation[]>([]);

  // Text overlay state
  const [textOverlay, setTextOverlay] = useState({
    headline: "",
    subtext: "",
    position: "bottom" as "top" | "center" | "bottom",
    font: "cormorant" as "cormorant" | "playfair" | "montserrat" | "oswald",
  });
  const [isEnhancingText, setIsEnhancingText] = useState(false);

  // Ad overlay state
  const adOverlayRef = useRef<HTMLDivElement>(null);
  const [showCustomizeAd, setShowCustomizeAd] = useState(false);
  const [adConfig, setAdConfig] = useState<AdOverlayConfig>({
    preset: AD_LAYOUT_PRESETS[0],
    headline: "",
    subtext: "",
    ctaText: "",
  });

  // Font options for text overlay
  const FONT_OPTIONS = [
    { value: "cormorant", label: "Cormorant", style: "'Cormorant Garamond', serif" },
    { value: "playfair", label: "Playfair", style: "'Playfair Display', serif" },
    { value: "montserrat", label: "Montserrat", style: "'Montserrat', sans-serif" },
    { value: "oswald", label: "Oswald", style: "'Oswald', sans-serif" },
  ];

  // Selected image - MUST be defined before callbacks that use it
  const selectedImage = useMemo(
    () => images.find((img) => img.id === selectedImageId) || images[0] || null,
    [images, selectedImageId]
  );

  // AI enhance text using Gemini
  const handleEnhanceText = useCallback(async () => {
    if (!textOverlay.headline && !textOverlay.subtext) {
      toast.error("Enter some text to enhance");
      return;
    }

    setIsEnhancingText(true);

    try {
      const { data, error } = await supabase.functions.invoke("enhance-copy", {
        body: {
          headline: textOverlay.headline,
          subtext: textOverlay.subtext,
          context: selectedImage?.prompt || "product advertisement",
          style: "luxury brand, elegant, compelling",
        },
      });

      if (error) throw error;

      if (data?.headline || data?.subtext) {
        setTextOverlay((prev) => ({
          ...prev,
          headline: data.headline || prev.headline,
          subtext: data.subtext || prev.subtext,
        }));
        toast.success("Text enhanced!");
      }
    } catch (error: any) {
      console.error("Text enhancement error:", error);
      // Fallback: Simple enhancement without API
      setTextOverlay((prev) => ({
        ...prev,
        headline: prev.headline ? prev.headline.toUpperCase() : prev.headline,
        subtext: prev.subtext ? `${prev.subtext} ✨` : prev.subtext,
      }));
      toast.info("Applied basic enhancement");
    } finally {
      setIsEnhancingText(false);
    }
  }, [textOverlay, selectedImage?.prompt]);

  // Update refinement prompt when image changes
  useEffect(() => {
    if (selectedImage) {
      setRefinementPrompt(selectedImage.prompt);
    }
  }, [selectedImage?.id]);

  // Handle no images - redirect back to Dark Room
  useEffect(() => {
    if (images.length === 0) {
      // Don't show error toast if we're just loading the page fresh
      if (locationState?.sessionImages) {
        toast.error("No images to review");
      }
      navigate("/darkroom", { replace: true });
    }
  }, [images.length, navigate, locationState]);

  // Clear session from localStorage
  const handleClearSession = useCallback(() => {
    localStorage.removeItem(LIGHT_TABLE_SESSION_KEY);
    toast.success("Session cleared");
    navigate("/darkroom");
  }, [navigate]);

  // Generate refinement
  const handleRefine = useCallback(async () => {
    if (!selectedImage) {
      toast.error("No image selected");
      return;
    }
    
    if (!user) {
      toast.error("Please sign in to generate images");
      return;
    }
    
    if (!orgId) {
      toast.error("Organization not found. Please complete onboarding.");
      return;
    }
    
    if (!refinementPrompt.trim()) {
      toast.error("Please enter a refinement prompt");
      return;
    }

    setIsGenerating(true);
    
    console.log("🎨 Starting refinement:", {
      prompt: refinementPrompt.substring(0, 50) + "...",
      referenceImage: selectedImage.imageUrl.substring(0, 50) + "...",
      userId: user.id,
      orgId,
    });

    try {
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          prompt: refinementPrompt,
          referenceImages: [
            {
              url: selectedImage.imageUrl,
              label: "product",
              description: "Base image to refine - maintain core visual elements",
            },
          ],
          userId: user.id,
          organizationId: orgId,
          goalType: "refinement",
          aspectRatio: "1:1",
        },
      });

      console.log("📡 Raw response:", { data, error });

      if (error) {
        console.error("❌ Refinement API error:", error);
        // Try to get more details from the error
        const errorDetails = error?.context?.body || error?.message || JSON.stringify(error);
        console.error("❌ Error details:", errorDetails);
        throw new Error(typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails));
      }

      // Check if data contains an error
      if (data?.error) {
        console.error("❌ API returned error:", data.error);
        throw new Error(data.error);
      }

      console.log("✅ Refinement response:", data);

      if (data?.imageUrl) {
        const newImage: SessionImage = {
          id: data.savedImageId || uuidv4(),
          imageUrl: data.imageUrl,
          prompt: refinementPrompt,
          timestamp: Date.now(),
          isSaved: true,
        };

        // Add to images and select it
        setImages((prev) => [...prev, newImage]);
        setSelectedImageId(newImage.id);

        toast.success("Refinement generated!");
      } else {
        console.error("❌ No imageUrl in response:", data);
        toast.error(data?.error || "No image returned from generation");
      }
    } catch (error: any) {
      console.error("❌ Refinement error:", error);
      const errorMsg = error?.message || error?.toString() || "Failed to generate refinement";
      toast.error(errorMsg.substring(0, 150));
    } finally {
      setIsGenerating(false);
    }
  }, [selectedImage, user, orgId, refinementPrompt]);

  // Handle Enter key in textarea
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!isGenerating && refinementPrompt.trim()) {
          handleRefine();
        }
      }
    },
    [handleRefine, isGenerating, refinementPrompt]
  );

  // Generate variations
  const handleGenerateVariations = useCallback(async () => {
    if (!selectedImage) {
      toast.error("No image selected");
      return;
    }
    if (!user) {
      toast.error("Please sign in");
      return;
    }
    if (!orgId) {
      toast.error("Organization not found");
      return;
    }

    setIsGenerating(true);
    
    console.log("🎨 Starting variations generation for:", selectedImage.id);

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

      console.log("📸 Generating 3 variations...");

      const results = await Promise.allSettled(
        variationPrompts.map(async (prompt, index) => {
          console.log(`  → Variation ${index + 1} starting...`);
          
          const { data, error } = await supabase.functions.invoke("generate-madison-image", {
            body: {
              prompt,
              referenceImages: [
                {
                  url: selectedImage.imageUrl,
                  label: "product",
                  description: "Reference for variation - maintain product appearance",
                },
              ],
              userId: user.id,
              organizationId: orgId,
              goalType: "variation",
              aspectRatio: "1:1",
            },
          });

          if (error) {
            console.error(`  ❌ Variation ${index + 1} error:`, error);
            throw error;
          }
          
          console.log(`  ✅ Variation ${index + 1} complete:`, data?.imageUrl?.substring(0, 50));
          
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
          console.warn(`  ⚠️ Variation ${index + 1} failed or empty`);
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
      } else {
        toast.error("No variations could be generated");
      }
    } catch (error: any) {
      console.error("❌ Variations error:", error);
      toast.error(error?.message || "Failed to generate variations");
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

  // Ad overlay handlers
  const handleSelectAdPreset = useCallback((preset: AdLayoutPreset) => {
    setAdConfig((prev) => ({
      ...prev,
      preset,
      // Reset custom colors to preset defaults
      colorBlockColor: undefined,
      colorBlockOpacity: undefined,
      textColor: undefined,
      ctaBackgroundColor: undefined,
      ctaTextColor: undefined,
      fontFamily: undefined,
    }));
  }, []);

  const handleResetAdConfig = useCallback(() => {
    setAdConfig({
      preset: AD_LAYOUT_PRESETS[0],
      headline: "",
      subtext: "",
      ctaText: "",
    });
    setShowCustomizeAd(false);
  }, []);

  const handleExportAd = useCallback(async () => {
    if (!adOverlayRef.current) {
      toast.error("No ad to export");
      return;
    }

    if (!adConfig.headline && !adConfig.subtext) {
      toast.error("Add some text to your ad first");
      return;
    }

    setIsExportingAd(true);

    try {
      const dataUrl = await toPng(adOverlayRef.current, {
        quality: 1,
        pixelRatio: 2, // Higher quality export
      });

      // Download the image
      const link = document.createElement("a");
      link.download = `madison-ad-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Ad exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export ad");
    } finally {
      setIsExportingAd(false);
    }
  }, [adConfig.headline, adConfig.subtext]);

  // Check if ad has content
  const hasAdContent = adConfig.headline || adConfig.subtext || adConfig.ctaText;

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
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSession}
            className="light-table-clear-btn"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
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
              {/* Show Ad Overlay when in ad tab */}
              {activeTab === "ad" ? (
                <AdOverlay
                  ref={adOverlayRef}
                  imageUrl={selectedImage.imageUrl}
                  config={adConfig}
                  className="light-table-image"
                />
              ) : (
                <>
                  <img
                    src={selectedImage.imageUrl}
                    alt="Selected"
                    className="light-table-image"
                  />

                  {/* Text Overlay Preview */}
                  {(textOverlay.headline || textOverlay.subtext) && (
                    <div
                      className={cn(
                        "light-table-text-overlay",
                        `light-table-text-overlay--${textOverlay.position}`
                      )}
                      style={{
                        fontFamily: FONT_OPTIONS.find((f) => f.value === textOverlay.font)?.style,
                      }}
                    >
                      {textOverlay.headline && (
                        <h2 className="light-table-text-headline">{textOverlay.headline}</h2>
                      )}
                      {textOverlay.subtext && (
                        <p className="light-table-text-subtext">{textOverlay.subtext}</p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Saved Badge */}
              {selectedImage.isSaved && activeTab !== "ad" && (
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
              <Button 
                variant="brass" 
                size="sm" 
                disabled
                title="Coming Soon"
                className="opacity-50 cursor-not-allowed"
              >
                <Film className="w-4 h-4 mr-2" />
                Coming Soon
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
              <button
                className={cn(
                  "light-table-tab",
                  activeTab === "ad" && "light-table-tab--active"
                )}
                onClick={() => setActiveTab("ad")}
              >
                <Layout className="w-4 h-4" />
                <span>Ad</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="light-table-tab-content">
              {activeTab === "refine" && (
                <div className="light-table-refine">
                  <label className="light-table-label">
                    Describe changes <span className="light-table-hint">(Press Enter to generate)</span>
                  </label>
                  <Textarea
                    value={refinementPrompt}
                    onChange={(e) => setRefinementPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                      style={{ fontFamily: FONT_OPTIONS.find((f) => f.value === textOverlay.font)?.style }}
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
                      style={{ fontFamily: FONT_OPTIONS.find((f) => f.value === textOverlay.font)?.style }}
                    />
                  </div>

                  {/* Font Selection */}
                  <div className="light-table-text-field">
                    <label>Font</label>
                    <div className="light-table-font-btns">
                      {FONT_OPTIONS.map((font) => (
                        <button
                          key={font.value}
                          className={cn(
                            "light-table-font-btn",
                            textOverlay.font === font.value && "light-table-font-btn--active"
                          )}
                          style={{ fontFamily: font.style }}
                          onClick={() =>
                            setTextOverlay((prev) => ({ ...prev, font: font.value as any }))
                          }
                        >
                          {font.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
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

                  {/* AI Enhance Button */}
                  <Button
                    variant="outline"
                    onClick={handleEnhanceText}
                    disabled={isEnhancingText || (!textOverlay.headline && !textOverlay.subtext)}
                    className="light-table-enhance-btn"
                  >
                    {isEnhancingText ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    {isEnhancingText ? "Enhancing..." : "Enhance with AI"}
                  </Button>
                </div>
              )}

              {/* Ad Layout Tab */}
              {activeTab === "ad" && (
                <div className="light-table-ad-editor">
                  {/* Preset Selector */}
                  <div className="light-table-ad-editor__presets">
                    <span className="light-table-ad-editor__presets-label">Choose Layout</span>
                    <AdPresetSelector
                      selectedPresetId={adConfig.preset.id}
                      onSelectPreset={handleSelectAdPreset}
                    />
                  </div>

                  {/* Text Inputs */}
                  <div className="light-table-ad-editor__inputs">
                    <div className="light-table-ad-editor__field">
                      <label>Headline</label>
                      <input
                        type="text"
                        value={adConfig.headline}
                        onChange={(e) =>
                          setAdConfig((prev) => ({ ...prev, headline: e.target.value }))
                        }
                        placeholder="e.g., SUMMER SALE"
                      />
                    </div>
                    <div className="light-table-ad-editor__field">
                      <label>Subtext</label>
                      <input
                        type="text"
                        value={adConfig.subtext}
                        onChange={(e) =>
                          setAdConfig((prev) => ({ ...prev, subtext: e.target.value }))
                        }
                        placeholder="e.g., Up to 50% off all items"
                      />
                    </div>
                    {adConfig.preset.layout.hasCTA && (
                      <div className="light-table-ad-editor__field">
                        <label>CTA Button</label>
                        <input
                          type="text"
                          value={adConfig.ctaText}
                          onChange={(e) =>
                            setAdConfig((prev) => ({ ...prev, ctaText: e.target.value }))
                          }
                          placeholder="e.g., Shop Now"
                        />
                      </div>
                    )}
                  </div>

                  {/* Customize Section (Collapsible) */}
                  <div className="light-table-ad-editor__customize">
                    <button
                      className="light-table-ad-editor__customize-toggle"
                      onClick={() => setShowCustomizeAd(!showCustomizeAd)}
                    >
                      <span>Customize Colors & Font</span>
                      <ChevronRight
                        className={cn(
                          "w-4 h-4 transition-transform",
                          showCustomizeAd && "rotate-90"
                        )}
                      />
                    </button>

                    {showCustomizeAd && (
                      <div className="light-table-ad-editor__customize-content">
                        {/* Color Block Color */}
                        <div className="light-table-ad-editor__color-field">
                          <label>Background Color</label>
                          <div className="light-table-ad-editor__color-swatches">
                            {AD_COLOR_PRESETS.map((color) => (
                              <button
                                key={color.value}
                                className={cn(
                                  "light-table-ad-editor__color-swatch",
                                  (adConfig.colorBlockColor || adConfig.preset.defaultStyles.colorBlockColor) === color.value &&
                                    "light-table-ad-editor__color-swatch--selected"
                                )}
                                style={{ backgroundColor: color.value }}
                                onClick={() =>
                                  setAdConfig((prev) => ({ ...prev, colorBlockColor: color.value }))
                                }
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Text Color */}
                        <div className="light-table-ad-editor__color-field">
                          <label>Text Color</label>
                          <div className="light-table-ad-editor__color-swatches">
                            {AD_COLOR_PRESETS.map((color) => (
                              <button
                                key={color.value}
                                className={cn(
                                  "light-table-ad-editor__color-swatch",
                                  (adConfig.textColor || adConfig.preset.defaultStyles.textColor) === color.value &&
                                    "light-table-ad-editor__color-swatch--selected"
                                )}
                                style={{ backgroundColor: color.value }}
                                onClick={() =>
                                  setAdConfig((prev) => ({ ...prev, textColor: color.value }))
                                }
                                title={color.name}
                              />
                            ))}
                          </div>
                        </div>

                        {/* CTA Color (if has CTA) */}
                        {adConfig.preset.layout.hasCTA && (
                          <div className="light-table-ad-editor__color-field">
                            <label>Button Color</label>
                            <div className="light-table-ad-editor__color-swatches">
                              {AD_COLOR_PRESETS.map((color) => (
                                <button
                                  key={color.value}
                                  className={cn(
                                    "light-table-ad-editor__color-swatch",
                                    (adConfig.ctaBackgroundColor || adConfig.preset.defaultStyles.ctaBackgroundColor) === color.value &&
                                      "light-table-ad-editor__color-swatch--selected"
                                  )}
                                  style={{ backgroundColor: color.value }}
                                  onClick={() =>
                                    setAdConfig((prev) => ({ ...prev, ctaBackgroundColor: color.value }))
                                  }
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Font Selection */}
                        <div className="light-table-ad-editor__color-field">
                          <label>Font</label>
                          <div className="light-table-ad-editor__fonts">
                            {AD_FONT_OPTIONS.map((font) => (
                              <button
                                key={font.value}
                                className={cn(
                                  "light-table-ad-editor__font-btn",
                                  (adConfig.fontFamily || adConfig.preset.defaultStyles.fontFamily) === font.value &&
                                    "light-table-ad-editor__font-btn--active"
                                )}
                                style={{ fontFamily: font.style }}
                                onClick={() =>
                                  setAdConfig((prev) => ({ ...prev, fontFamily: font.value }))
                                }
                              >
                                {font.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="light-table-ad-editor__actions">
                    <button
                      className="light-table-ad-editor__reset-btn"
                      onClick={handleResetAdConfig}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      className="light-table-ad-editor__export-btn"
                      onClick={handleExportAd}
                      disabled={isExportingAd || !hasAdContent}
                    >
                      {isExportingAd ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Exporting...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Export Ad
                        </>
                      )}
                    </button>
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
