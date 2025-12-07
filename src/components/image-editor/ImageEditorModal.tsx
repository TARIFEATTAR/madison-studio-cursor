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
import * as DialogPrimitive from "@radix-ui/react-dialog";
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
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";

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
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        {/* Custom overlay without the conflicting default close button */}
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <DialogPrimitive.Content className={cn(
          // Base styles
          "fixed z-[1101] bg-[#1a1816] border border-[rgba(184,149,106,0.2)] shadow-2xl",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          // Desktop: Centered modal with constrained size
          "md:left-[50%] md:top-[50%] md:translate-x-[-50%] md:translate-y-[-50%] md:w-[95vw] md:max-w-[1000px] md:max-h-[90vh] md:rounded-2xl",
          "md:data-[state=closed]:zoom-out-95 md:data-[state=open]:zoom-in-95",
          // Mobile: Full screen for better UX
          "inset-0 w-full h-full max-h-full rounded-none",
          "md:inset-auto md:h-auto"
        )}>
          <div className="flex flex-col h-full md:h-auto md:max-h-[90vh]">
            {/* Custom Header */}
            <div className="shrink-0 flex items-center justify-between px-4 md:px-5 py-3 md:py-4 bg-[#252220] border-b border-[rgba(184,149,106,0.15)]">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-[rgba(245,240,230,0.7)] hover:text-[#f5f0e6] hover:bg-[rgba(184,149,106,0.1)] text-xs md:text-sm"
              >
                <ArrowLeft className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Back to {source === "library" ? "Library" : "Dark Room"}</span>
                <span className="sm:hidden">Back</span>
              </Button>
              
              <DialogPrimitive.Title className="font-serif text-lg md:text-xl font-medium text-[#f5f0e6] absolute left-1/2 -translate-x-1/2">
                Image Editor
              </DialogPrimitive.Title>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-[rgba(245,240,230,0.5)] hover:text-[#f5f0e6] hover:bg-[rgba(184,149,106,0.1)]"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_320px] min-h-0 overflow-hidden">
            {/* Main Image Preview */}
            <div className="flex flex-col p-3 md:p-6 bg-[#0f0e0d] md:border-r border-b md:border-b-0 border-[rgba(184,149,106,0.1)] overflow-hidden min-h-[200px] md:min-h-0">
              <motion.div
                className="relative flex-1 flex items-center justify-center bg-[#0a0908] rounded-xl overflow-hidden min-h-0"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <img
                  src={displayedImage}
                  alt="Selected image"
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                
                {/* Text Overlay Preview (if set) */}
                {textOverlay.headline && (
                  <div className={cn(
                    "absolute left-0 right-0 px-4 md:px-6 py-3 md:py-4 text-center pointer-events-none",
                    textOverlay.position === "top" && "top-0 bg-gradient-to-b from-black/70 to-transparent",
                    textOverlay.position === "center" && "top-1/2 -translate-y-1/2 bg-black/50",
                    textOverlay.position === "bottom" && "bottom-0 bg-gradient-to-t from-black/70 to-transparent"
                  )}>
                    {textOverlay.headline && (
                      <h2 className="font-serif text-xl md:text-2xl font-semibold text-white drop-shadow-lg">
                        {textOverlay.headline}
                      </h2>
                    )}
                    {textOverlay.subtext && (
                      <p className="text-sm md:text-base text-white/85 drop-shadow-md mt-1">
                        {textOverlay.subtext}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Quick Actions - Stack on mobile, row on desktop */}
              <div className="grid grid-cols-3 md:flex md:flex-wrap md:justify-center gap-2 md:gap-3 mt-3 md:mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyPrompt}
                  className="h-10 md:h-9 border border-[rgba(184,149,106,0.4)] bg-transparent text-[#f5f0e6] hover:bg-[rgba(184,149,106,0.15)] hover:text-[#f5f0e6] hover:border-[#b8956a] text-xs md:text-sm"
                >
                  <Copy className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Copy Prompt</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDownload}
                  className="h-10 md:h-9 border border-[rgba(184,149,106,0.4)] bg-transparent text-[#f5f0e6] hover:bg-[rgba(184,149,106,0.15)] hover:text-[#f5f0e6] hover:border-[#b8956a] text-xs md:text-sm"
                >
                  <Download className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Download</span>
                </Button>
                <Button
                  variant="brass"
                  size="sm"
                  onClick={handleCreateVideo}
                  className="h-10 md:h-9 text-xs md:text-sm"
                >
                  <Film className="w-4 h-4 md:mr-2" />
                  <span className="hidden md:inline">Create Video</span>
                </Button>
              </div>
            </div>

            {/* Editor Panel */}
            <div className="flex flex-col bg-[#1a1816] overflow-hidden min-h-0">
              {/* Tabs */}
              <div className="shrink-0 flex border-b border-[rgba(184,149,106,0.15)]">
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 px-2 text-xs md:text-sm transition-all",
                    activeTab === "refine"
                      ? "text-[#b8956a] bg-[rgba(184,149,106,0.1)] shadow-[inset_0_-2px_0_#b8956a]"
                      : "text-[rgba(245,240,230,0.5)] hover:text-[rgba(245,240,230,0.8)] hover:bg-[rgba(184,149,106,0.05)]"
                  )}
                  onClick={() => setActiveTab("refine")}
                >
                  <Wand2 className="w-4 h-4" />
                  <span>Refine</span>
                </button>
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 px-2 text-xs md:text-sm transition-all",
                    activeTab === "variations"
                      ? "text-[#b8956a] bg-[rgba(184,149,106,0.1)] shadow-[inset_0_-2px_0_#b8956a]"
                      : "text-[rgba(245,240,230,0.5)] hover:text-[rgba(245,240,230,0.8)] hover:bg-[rgba(184,149,106,0.05)]"
                  )}
                  onClick={() => setActiveTab("variations")}
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>Variations</span>
                </button>
                <button
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-3 md:py-3.5 px-2 text-xs md:text-sm transition-all",
                    activeTab === "text"
                      ? "text-[#b8956a] bg-[rgba(184,149,106,0.1)] shadow-[inset_0_-2px_0_#b8956a]"
                      : "text-[rgba(245,240,230,0.5)] hover:text-[rgba(245,240,230,0.8)] hover:bg-[rgba(184,149,106,0.05)]"
                  )}
                  onClick={() => setActiveTab("text")}
                >
                  <Type className="w-4 h-4" />
                  <span>Text</span>
                </button>
              </div>

              {/* Tab Content - Scrollable */}
              <div className="flex-1 overflow-y-auto p-4 md:p-5 min-h-0">
                {/* Refine Tab */}
                {activeTab === "refine" && (
                  <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <label className="text-sm font-medium text-[rgba(245,240,230,0.7)]">
                      Describe what you'd like to change
                    </label>
                    <Textarea
                      value={refinementPrompt}
                      onChange={(e) => setRefinementPrompt(e.target.value)}
                      placeholder="e.g., Make the lighting warmer, add more shadows, zoom in on the product..."
                      className="bg-[rgba(26,24,22,0.8)] border-[rgba(184,149,106,0.2)] text-[#f5f0e6] placeholder:text-[rgba(245,240,230,0.4)] focus:border-[#b8956a] focus:ring-1 focus:ring-[rgba(184,149,106,0.2)] resize-none"
                      rows={4}
                    />
                    <Button
                      variant="brass"
                      onClick={handleRefine}
                      disabled={isGenerating || !refinementPrompt.trim()}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4 mr-2" />
                      )}
                      {isGenerating ? "Generating..." : "Refine Image"}
                    </Button>

                    {/* Original Prompt Display */}
                    <div className="mt-2 p-3 bg-[rgba(26,24,22,0.5)] rounded-lg border border-[rgba(184,149,106,0.1)]">
                      <span className="text-[0.65rem] uppercase tracking-wider text-[rgba(184,149,106,0.6)]">
                        Original prompt:
                      </span>
                      <p className="text-[0.75rem] text-[rgba(245,240,230,0.6)] mt-1 leading-relaxed">
                        {image.prompt}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Variations Tab */}
                {activeTab === "variations" && (
                  <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-[#f5f0e6]">Style Variations</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateVariations}
                        disabled={isGenerating}
                        className="border border-[rgba(184,149,106,0.4)] bg-transparent text-[#f5f0e6] hover:bg-[rgba(184,149,106,0.15)] hover:text-[#f5f0e6] hover:border-[#b8956a]"
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
                    <div className="grid grid-cols-2 gap-3">
                      {/* Original Image */}
                      <button
                        className={cn(
                          "relative aspect-square rounded-lg overflow-hidden border-2 bg-[#0f0e0d] cursor-pointer transition-all",
                          !selectedVariationId
                            ? "border-[#b8956a] shadow-[0_0_0_2px_rgba(184,149,106,0.2)]"
                            : "border-transparent hover:border-[rgba(184,149,106,0.3)]"
                        )}
                        onClick={() => setSelectedVariationId(null)}
                      >
                        <img src={image.imageUrl} alt="Original" className="w-full h-full object-cover" />
                        {!selectedVariationId && (
                          <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-[#b8956a] rounded-full">
                            <Check className="w-4 h-4 text-[#1a1816]" />
                          </div>
                        )}
                        <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                          Original
                        </span>
                      </button>

                      {/* Generated Variations */}
                      {variations.map((variation, index) => (
                        <button
                          key={variation.id}
                          className={cn(
                            "relative aspect-square rounded-lg overflow-hidden border-2 bg-[#0f0e0d] cursor-pointer transition-all",
                            selectedVariationId === variation.id
                              ? "border-[#b8956a] shadow-[0_0_0_2px_rgba(184,149,106,0.2)]"
                              : "border-transparent hover:border-[rgba(184,149,106,0.3)]"
                          )}
                          onClick={() => !variation.isGenerating && setSelectedVariationId(variation.id)}
                          disabled={variation.isGenerating}
                        >
                          {variation.isGenerating ? (
                            <div className="w-full h-full flex items-center justify-center text-[#b8956a]">
                              <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <img src={variation.imageUrl} alt={`Variation ${index + 1}`} className="w-full h-full object-cover" />
                              {selectedVariationId === variation.id && (
                                <div className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-[#b8956a] rounded-full">
                                  <Check className="w-4 h-4 text-[#1a1816]" />
                                </div>
                              )}
                            </>
                          )}
                          <span className="absolute bottom-2 left-2 text-[0.65rem] font-semibold text-white bg-black/60 px-1.5 py-0.5 rounded">
                            {variation.isGenerating ? "Generating..." : `V${index + 1}`}
                          </span>
                        </button>
                      ))}
                    </div>

                    {variations.length === 0 && !isGenerating && (
                      <p className="text-sm text-[rgba(245,240,230,0.4)] text-center py-8">
                        Click "Generate" to create style variations of this image
                      </p>
                    )}
                  </motion.div>
                )}

                {/* Text Tab */}
                {activeTab === "text" && (
                  <motion.div
                    className="flex flex-col gap-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.75rem] font-medium text-[rgba(245,240,230,0.7)]">Headline</label>
                      <input
                        type="text"
                        value={textOverlay.headline}
                        onChange={(e) => setTextOverlay((prev) => ({ ...prev, headline: e.target.value }))}
                        placeholder="Enter headline text..."
                        className="bg-[rgba(26,24,22,0.8)] border border-[rgba(184,149,106,0.2)] rounded-lg px-3.5 py-2.5 text-[#f5f0e6] text-sm placeholder:text-[rgba(245,240,230,0.4)] focus:outline-none focus:border-[#b8956a] focus:ring-1 focus:ring-[rgba(184,149,106,0.2)] transition-all"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.75rem] font-medium text-[rgba(245,240,230,0.7)]">Subtext</label>
                      <input
                        type="text"
                        value={textOverlay.subtext}
                        onChange={(e) => setTextOverlay((prev) => ({ ...prev, subtext: e.target.value }))}
                        placeholder="Enter subtext..."
                        className="bg-[rgba(26,24,22,0.8)] border border-[rgba(184,149,106,0.2)] rounded-lg px-3.5 py-2.5 text-[#f5f0e6] text-sm placeholder:text-[rgba(245,240,230,0.4)] focus:outline-none focus:border-[#b8956a] focus:ring-1 focus:ring-[rgba(184,149,106,0.2)] transition-all"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[0.75rem] font-medium text-[rgba(245,240,230,0.7)]">Position</label>
                      <div className="flex gap-2">
                        {(["top", "center", "bottom"] as const).map((pos) => (
                          <button
                            key={pos}
                            className={cn(
                              "flex-1 py-2 px-3 bg-[rgba(26,24,22,0.8)] border rounded-md text-[0.75rem] transition-all",
                              textOverlay.position === pos
                                ? "border-[#b8956a] bg-[rgba(184,149,106,0.15)] text-[#b8956a]"
                                : "border-[rgba(184,149,106,0.2)] text-[rgba(245,240,230,0.6)] hover:border-[rgba(184,149,106,0.4)] hover:text-[rgba(245,240,230,0.8)]"
                            )}
                            onClick={() => setTextOverlay((prev) => ({ ...prev, position: pos }))}
                          >
                            {pos.charAt(0).toUpperCase() + pos.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-[0.7rem] text-[rgba(245,240,230,0.4)] mt-2">
                      Text will be rendered on the image when you export
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer Actions - Stack on mobile */}
              <div className="shrink-0 flex flex-col sm:flex-row gap-2 sm:gap-3 px-4 md:px-5 py-3 md:py-4 border-t border-[rgba(184,149,106,0.15)] bg-[#252220]">
                {!image.isSaved && (
                  <Button
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 h-11 sm:h-10 border border-[rgba(184,149,106,0.4)] bg-transparent text-[#f5f0e6] hover:bg-[rgba(184,149,106,0.15)] hover:text-[#f5f0e6] hover:border-[#b8956a]"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save to Library
                  </Button>
                )}
                <Button variant="brass" onClick={handleDownload} className="flex-1 h-11 sm:h-10">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
