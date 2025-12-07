/**
 * Dark Room - Madison Studio's Image Generation Studio
 * 
 * A clean, sophisticated image generation interface with purposeful animations
 * that mimic darkroom photography processes.
 */

import { useState, useCallback, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

// Supabase & Auth
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { Product } from "@/hooks/useProducts";

// Dark Room Components
import {
  LeftRail,
  CenterCanvas,
  RightPanel,
  DarkRoomHeader,
} from "@/components/darkroom";
import type { ProModeSettings } from "@/components/darkroom";

// Styles
import "@/styles/darkroom.css";

// Constants
const MAX_IMAGES_PER_SESSION = 10;

// Types
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

interface HistoryItem {
  id: string;
  prompt: string;
  timestamp: Date;
}

interface Suggestion {
  id: string;
  text: string;
  type: "enhancement" | "variation" | "creative";
}

// Quick presets
const DEFAULT_PRESETS = [
  "Golden hour glow",
  "Minimalist white",
  "Luxury marble",
  "Natural botanical",
  "Dramatic shadows",
  "Soft diffused light",
];

// Default suggestions (context-aware ones are generated)
const generateSuggestions = (
  hasProduct: boolean,
  hasBackground: boolean,
  prompt: string
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  if (hasProduct && !hasBackground) {
    suggestions.push({
      id: "sug-1",
      text: "Place product on weathered sandstone blocks with warm desert light",
      type: "creative",
    });
    suggestions.push({
      id: "sug-2",
      text: "Studio shot with soft gradient background and subtle reflection",
      type: "enhancement",
    });
  } else if (hasProduct && hasBackground) {
    suggestions.push({
      id: "sug-3",
      text: "Add soft shadows and enhanced depth of field",
      type: "enhancement",
    });
    suggestions.push({
      id: "sug-4",
      text: "Shift lighting to golden hour warmth",
      type: "variation",
    });
  } else {
    suggestions.push({
      id: "sug-5",
      text: "Elegant perfume bottle on white marble with soft window light",
      type: "creative",
    });
    suggestions.push({
      id: "sug-6",
      text: "Hero product shot with dramatic studio lighting",
      type: "creative",
    });
  }

  return suggestions;
};

export default function DarkRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  // Session
  const [sessionId] = useState(() => uuidv4());
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [heroImageId, setHeroImageId] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Inputs
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productImage, setProductImage] = useState<UploadedImage | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<UploadedImage | null>(null);
  const [styleReference, setStyleReference] = useState<UploadedImage | null>(null);
  const [proSettings, setProSettings] = useState<ProModeSettings>({});

  // Prompt
  const [prompt, setPrompt] = useState("");

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derived
  const heroImage = useMemo(
    () => images.find((img) => img.id === heroImageId) || images[images.length - 1] || null,
    [images, heroImageId]
  );

  const savedCount = useMemo(
    () => images.filter((img) => img.isSaved).length,
    [images]
  );

  const proSettingsCount = Object.values(proSettings).filter(Boolean).length;

  const canGenerate = useMemo(() => {
    // Need either a prompt or a product image
    const hasInput = prompt.trim().length > 0 || !!productImage;
    // Not at session limit
    const hasCapacity = images.length < MAX_IMAGES_PER_SESSION;
    // Not already generating
    return hasInput && hasCapacity && !isGenerating;
  }, [prompt, productImage, images.length, isGenerating]);

  const suggestions = useMemo(
    () => generateSuggestions(!!productImage, !!backgroundImage, prompt),
    [productImage, backgroundImage, prompt]
  );

  // Effects
  useEffect(() => {
    // Check for initial product from navigation
    const state = location.state as { product?: Product } | undefined;
    if (state?.product) {
      setSelectedProduct(state.product);
    }
  }, [location.state]);

  // Handlers
  const handleGenerate = useCallback(async () => {
    if (!user || !canGenerate) return;

    const effectivePrompt = prompt.trim() || "Professional product photography";
    
    setIsGenerating(true);

    try {
      // Build reference images array
      const referenceImages: Array<{ url: string; description: string; label: string }> = [];

      if (productImage) {
        referenceImages.push({
          url: productImage.url,
          label: "Product",
          description: "User-uploaded product for enhancement",
        });
      }

      if (backgroundImage) {
        referenceImages.push({
          url: backgroundImage.url,
          label: "Background",
          description: "Background scene for composition",
        });
      }

      if (styleReference) {
        referenceImages.push({
          url: styleReference.url,
          label: "Style Reference",
          description: "Style reference for lighting and mood",
        });
      }

      // Build Pro Mode payload if active
      const proModePayload = proSettingsCount > 0 ? proSettings : undefined;

      console.log("🌑 Dark Room Generate:", {
        prompt: effectivePrompt,
        referenceImages: referenceImages.length,
        proMode: proModePayload,
        product: selectedProduct?.name,
      });

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("generate-madison-image", {
        body: {
          prompt: effectivePrompt,
          userId: user.id,
          organizationId: orgId,
          sessionId,
          goalType: "product_photography",
          aspectRatio: "1:1",
          outputFormat: "png",
          referenceImages,
          proModeControls: proModePayload,
          product_id: selectedProduct?.id,
          productContext: selectedProduct
            ? {
                name: selectedProduct.name,
                collection: selectedProduct.collection || "Unknown",
                scent_family: selectedProduct.scentFamily || "Unspecified",
                category: selectedProduct.category,
              }
            : undefined,
        },
      });

      if (error) {
        console.error("❌ Generation error:", error);
        const errorMsg = error.message || error.toString();

        if (errorMsg.includes("Rate limit") || error.status === 429) {
          toast.error("Rate limit reached", {
            description: "Please wait a moment before generating another image.",
          });
        } else if (errorMsg.includes("credits") || error.status === 402) {
          toast.error("AI credits depleted", {
            description: "Please add credits in Settings.",
          });
        } else {
          toast.error("Generation failed", {
            description: errorMsg.substring(0, 100),
          });
        }
        return;
      }

      if (!data?.imageUrl || !data?.savedImageId) {
        toast.error("Generation failed", {
          description: "No image returned from server.",
        });
        return;
      }

      // Add to session
      const newImage: GeneratedImage = {
        id: data.savedImageId,
        imageUrl: data.imageUrl,
        prompt: effectivePrompt,
        timestamp: Date.now(),
        isSaved: true, // Backend already saved
        isHero: true,
      };

      setImages((prev) => [...prev, newImage]);
      setHeroImageId(newImage.id);

      // Add to history
      setHistory((prev) => [
        {
          id: uuidv4(),
          prompt: effectivePrompt,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19), // Keep last 20
      ]);

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["generated-images"] });

      toast.success("Image created!", {
        description: "Your image has been saved to the library.",
      });
    } catch (err) {
      console.error("❌ Unexpected error:", err);
      toast.error("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  }, [
    user,
    canGenerate,
    prompt,
    productImage,
    backgroundImage,
    styleReference,
    proSettings,
    proSettingsCount,
    selectedProduct,
    orgId,
    sessionId,
    queryClient,
  ]);

  const handleSaveImage = useCallback(async (id: string) => {
    setIsSaving(true);
    try {
      // Image is already saved on generation, just mark local state
      setImages((prev) =>
        prev.map((img) => (img.id === id ? { ...img, isSaved: true } : img))
      );
      toast.success("Image saved to library");
    } finally {
      setIsSaving(false);
    }
  }, []);

  const handleDeleteImage = useCallback((id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (heroImageId === id) {
      setHeroImageId(null);
    }
    toast.success("Image removed from session");
  }, [heroImageId]);

  const handleDownloadImage = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `madison-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Image downloaded");
    } catch (err) {
      toast.error("Download failed");
    }
  }, []);

  const handleRefineImage = useCallback((image: GeneratedImage) => {
    // Set the image's prompt as the current prompt for refinement
    setPrompt(image.prompt + " - refined with ");
    // You could also navigate to a refinement mode or open a panel
    toast.info("Edit your prompt and regenerate to refine");
  }, []);

  const handleUseSuggestion = useCallback((suggestion: Suggestion) => {
    setPrompt(suggestion.text);
    toast.success("Suggestion applied");
  }, []);

  const handleApplyPreset = useCallback((preset: string) => {
    setPrompt((prev) => (prev ? `${prev}, ${preset.toLowerCase()}` : preset));
    toast.success(`Applied: ${preset}`);
  }, []);

  const handleRestoreFromHistory = useCallback((item: HistoryItem) => {
    setPrompt(item.prompt);
    toast.success("Prompt restored");
  }, []);

  const handleSaveAll = useCallback(async () => {
    const unsaved = images.filter((img) => !img.isSaved);
    if (unsaved.length === 0) {
      toast.info("All images already saved");
      return;
    }

    setIsSaving(true);
    try {
      // In this implementation, all images are auto-saved on generation
      // This is just updating local state
      setImages((prev) => prev.map((img) => ({ ...img, isSaved: true })));
      toast.success(`${unsaved.length} image(s) saved`);
    } finally {
      setIsSaving(false);
    }
  }, [images]);

  return (
    <div className="dark-room-container">
      {/* Header */}
      <DarkRoomHeader
        sessionCount={images.length}
        savedCount={savedCount}
        isSaving={isSaving}
        onSaveAll={handleSaveAll}
      />

      {/* Main Grid */}
      <div className="dark-room-grid">
        {/* Left Rail: Inputs & Controls */}
        <LeftRail
          selectedProduct={selectedProduct}
          onProductSelect={setSelectedProduct}
          productImage={productImage}
          onProductImageUpload={setProductImage}
          backgroundImage={backgroundImage}
          onBackgroundImageUpload={setBackgroundImage}
          styleReference={styleReference}
          onStyleReferenceUpload={setStyleReference}
          proSettings={proSettings}
          onProSettingsChange={setProSettings}
          isGenerating={isGenerating}
          canGenerate={canGenerate}
          onGenerate={handleGenerate}
          sessionCount={images.length}
          maxImages={MAX_IMAGES_PER_SESSION}
        />

        {/* Center Canvas: Preview & Results */}
        <CenterCanvas
          images={images}
          heroImage={heroImage}
          onSetHero={setHeroImageId}
          onSaveImage={handleSaveImage}
          onDeleteImage={handleDeleteImage}
          onDownloadImage={handleDownloadImage}
          onRefineImage={handleRefineImage}
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          isSaving={isSaving}
          canGenerate={canGenerate}
          proSettingsCount={proSettingsCount}
          maxImages={MAX_IMAGES_PER_SESSION}
        />

        {/* Right Panel: Madison Assistant */}
        <RightPanel
          suggestions={suggestions}
          onUseSuggestion={handleUseSuggestion}
          presets={DEFAULT_PRESETS}
          onApplyPreset={handleApplyPreset}
          history={history}
          onRestoreFromHistory={handleRestoreFromHistory}
          hasProduct={!!productImage}
          hasBackground={!!backgroundImage}
          hasStyle={!!styleReference}
          proSettingsCount={proSettingsCount}
        />
      </div>
    </div>
  );
}
