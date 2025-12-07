/**
 * Video Project - Madison Studio's Video Ad Creation Studio
 * 
 * A clean, scene-based video editor optimized for creating short-form
 * video advertisements (15-60 seconds) for social platforms.
 * 
 * Design Philosophy:
 * - Scene-based (not timeline-based) for simplicity
 * - Template-driven workflow
 * - Madison generates variations
 * - Platform badges show compatibility
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import {
  ArrowLeft,
  Play,
  Pause,
  Download,
  Plus,
  GripVertical,
  Trash2,
  Clock,
  Wand2,
  ChevronRight,
  Film,
  Image as ImageIcon,
  Type,
  Music,
  Settings2,
  Check,
  Loader2,
  Video,
  Layers,
  LayoutTemplate,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentOrganizationId } from "@/hooks/useIndustryConfig";
import { supabase } from "@/integrations/supabase/client";

// Import video project components
import { VideoProjectHeader } from "@/components/video-project/VideoProjectHeader";
import { TemplateSelector } from "@/components/video-project/TemplateSelector";
import { SceneCard } from "@/components/video-project/SceneCard";
import { VideoPreview } from "@/components/video-project/VideoPreview";
import { PlatformBadges } from "@/components/video-project/PlatformBadges";
import { VariationsGrid, type VideoVariation } from "@/components/video-project/VariationsGrid";

// Styles
import "@/styles/video-project.css";

// Types
export interface VideoScene {
  id: string;
  imageUrl: string | null;
  imageId: string | null;
  videoUrl?: string | null; // Generated video URL
  duration: number; // seconds
  motion: "zoom-in" | "zoom-out" | "pan-left" | "pan-right" | "static";
  text?: {
    headline?: string;
    subtext?: string;
    position: "top" | "center" | "bottom";
  };
  order: number;
}

export interface VideoTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sceneCount: number;
  defaultDuration: number; // total seconds
  scenes: Omit<VideoScene, "id" | "imageUrl" | "imageId">[];
}

export interface VideoProject {
  id: string;
  name: string;
  templateId: string;
  scenes: VideoScene[];
  aspectRatio: "9:16" | "16:9" | "1:1";
  totalDuration: number;
  createdAt: Date;
  status: "draft" | "generating" | "complete";
}

// Video Templates - Clean structure without pre-populated text
const VIDEO_TEMPLATES: VideoTemplate[] = [
  {
    id: "product-reveal",
    name: "Product Reveal",
    description: "Hero shot → Detail → CTA. Perfect for product launches.",
    icon: <Video className="w-5 h-5" />,
    sceneCount: 3,
    defaultDuration: 30,
    scenes: [
      { duration: 10, motion: "zoom-in", order: 0 },
      { duration: 10, motion: "pan-left", order: 1 },
      { duration: 10, motion: "static", order: 2 },
    ],
  },
  {
    id: "sale-promo",
    name: "Sale Promo",
    description: "Fast cuts with bold text. Great for sales events.",
    icon: <Film className="w-5 h-5" />,
    sceneCount: 3,
    defaultDuration: 15,
    scenes: [
      { duration: 5, motion: "zoom-out", order: 0 },
      { duration: 5, motion: "static", order: 1 },
      { duration: 5, motion: "zoom-in", order: 2 },
    ],
  },
  {
    id: "brand-story",
    name: "Brand Story",
    description: "Slow, elegant reveal for brand awareness.",
    icon: <Layers className="w-5 h-5" />,
    sceneCount: 4,
    defaultDuration: 45,
    scenes: [
      { duration: 12, motion: "zoom-in", order: 0 },
      { duration: 10, motion: "pan-right", order: 1 },
      { duration: 13, motion: "pan-left", order: 2 },
      { duration: 10, motion: "static", order: 3 },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    description: "Start from scratch. You design the structure.",
    icon: <LayoutTemplate className="w-5 h-5" />,
    sceneCount: 1,
    defaultDuration: 15,
    scenes: [
      { duration: 15, motion: "static", order: 0 },
    ],
  },
];

// Flow states
type FlowStep = "template" | "edit" | "preview";

export default function VideoProject() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { orgId } = useCurrentOrganizationId();

  // Flow state
  const [step, setStep] = useState<FlowStep>("template");
  const [selectedTemplate, setSelectedTemplate] = useState<VideoTemplate | null>(null);

  // Project state
  const [project, setProject] = useState<VideoProject | null>(null);
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);

  // Preview state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Variations state
  const [variations, setVariations] = useState<VideoVariation[]>([]);
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Derived values
  const activeScene = useMemo(
    () => project?.scenes.find((s) => s.id === activeSceneId) || null,
    [project, activeSceneId]
  );

  const totalDuration = useMemo(
    () => project?.scenes.reduce((sum, s) => sum + s.duration, 0) || 0,
    [project]
  );

  // Initialize project from template
  const handleSelectTemplate = useCallback((template: VideoTemplate) => {
    setSelectedTemplate(template);
    
    const newProject: VideoProject = {
      id: uuidv4(),
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      templateId: template.id,
      scenes: template.scenes.map((scene, index) => ({
        ...scene,
        id: uuidv4(),
        imageUrl: null,
        imageId: null,
      })),
      aspectRatio: "9:16",
      totalDuration: template.defaultDuration,
      createdAt: new Date(),
      status: "draft",
    };

    setProject(newProject);
    setActiveSceneId(newProject.scenes[0].id);
    setStep("edit");
    
    toast.success(`Started ${template.name} project`);
  }, []);

  // Scene handlers
  const handleUpdateScene = useCallback((sceneId: string, updates: Partial<VideoScene>) => {
    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: prev.scenes.map((s) =>
          s.id === sceneId ? { ...s, ...updates } : s
        ),
      };
    });
  }, []);

  const handleAddScene = useCallback(() => {
    if (!project) return;
    
    const newScene: VideoScene = {
      id: uuidv4(),
      imageUrl: null,
      imageId: null,
      duration: 10,
      motion: "static",
      order: project.scenes.length,
    };

    setProject((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
      };
    });

    setActiveSceneId(newScene.id);
    toast.success("Scene added");
  }, [project]);

  const handleDeleteScene = useCallback((sceneId: string) => {
    if (!project || project.scenes.length <= 1) {
      toast.error("Project must have at least one scene");
      return;
    }

    setProject((prev) => {
      if (!prev) return null;
      const updatedScenes = prev.scenes.filter((s) => s.id !== sceneId);
      return {
        ...prev,
        scenes: updatedScenes.map((s, i) => ({ ...s, order: i })),
      };
    });

    if (activeSceneId === sceneId) {
      setActiveSceneId(project.scenes[0].id);
    }

    toast.success("Scene removed");
  }, [project, activeSceneId]);

  const handleReorderScenes = useCallback((startIndex: number, endIndex: number) => {
    setProject((prev) => {
      if (!prev) return null;
      const scenes = [...prev.scenes];
      const [removed] = scenes.splice(startIndex, 1);
      scenes.splice(endIndex, 0, removed);
      return {
        ...prev,
        scenes: scenes.map((s, i) => ({ ...s, order: i })),
      };
    });
  }, []);

  // Image selection from library
  const handleSelectImage = useCallback((sceneId: string, imageUrl: string, imageId: string) => {
    handleUpdateScene(sceneId, { imageUrl, imageId });
  }, [handleUpdateScene]);

  // Generate video for each scene
  const handleGenerateVideo = useCallback(async () => {
    if (!project || !user || !orgId) {
      toast.error("Missing project or authentication");
      return;
    }

    // Check all scenes have images
    const missingImages = project.scenes.filter((s) => !s.imageUrl);
    if (missingImages.length > 0) {
      toast.error(`${missingImages.length} scene(s) need images`);
      return;
    }

    setIsGenerating(true);
    setProject((prev) => prev ? { ...prev, status: "generating" } : null);

    try {
      // Generate video for the first scene as proof of concept
      // In a full implementation, we would generate and stitch all scenes
      const firstScene = project.scenes[0];
      
      toast.info("Starting video generation...", {
        description: `Processing scene 1 of ${project.scenes.length}`,
      });

      // Build motion prompt based on scene settings
      const motionDescription = {
        "zoom-in": "Smooth cinematic zoom in, building focus and intensity",
        "zoom-out": "Elegant zoom out revealing the full composition",
        "pan-left": "Graceful pan from right to left across the scene",
        "pan-right": "Smooth pan from left to right across the scene",
        "static": "Steady fixed camera with subtle atmospheric movement",
      };

      const scenePrompt = `${motionDescription[firstScene.motion]}. Professional product video with luxurious lighting.`;

      console.log("🎬 Generating video:", {
        sceneId: firstScene.id,
        imageUrl: firstScene.imageUrl,
        duration: firstScene.duration,
        motion: firstScene.motion,
      });

      const { data, error } = await supabase.functions.invoke("generate-madison-video", {
        body: {
          imageUrl: firstScene.imageUrl,
          imageId: firstScene.imageId,
          prompt: scenePrompt,
          duration: firstScene.duration <= 5 ? "5" : "10",
          resolution: "720p",
          aspectRatio: project.aspectRatio,
          cameraFixed: firstScene.motion === "static",
          userId: user.id,
          organizationId: orgId,
        },
      });

      if (error) {
        console.error("❌ Video generation error:", error);
        const errorMsg = error.message || "Video generation failed";
        
        if (errorMsg.includes("Signature plan") || errorMsg.includes("upgrade_required")) {
          toast.error("Upgrade Required", {
            description: "Video generation requires the Signature plan ($349/mo)",
          });
        } else {
          toast.error("Generation failed", {
            description: errorMsg.substring(0, 100),
          });
        }
        setProject((prev) => prev ? { ...prev, status: "draft" } : null);
        return;
      }

      if (data?.videoUrl) {
        console.log("✅ Video generated:", data);
        
        // Update the scene with the video URL
        setProject((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            status: "complete",
            scenes: prev.scenes.map((s) =>
              s.id === firstScene.id
                ? { ...s, videoUrl: data.videoUrl }
                : s
            ),
          };
        });

        // Create variations (in real implementation, we'd generate multiple)
        // For now, create variations based on the same video but with different labels
        const generatedVariations: VideoVariation[] = [
          {
            id: uuidv4(),
            videoUrl: data.videoUrl,
            thumbnailUrl: firstScene.imageUrl || undefined,
            style: "dynamic",
            label: "Dynamic",
            description: "Energetic camera movement",
            duration: data.duration,
          },
          {
            id: uuidv4(),
            videoUrl: data.videoUrl, // Same URL for now - would be different in full implementation
            thumbnailUrl: firstScene.imageUrl || undefined,
            style: "smooth",
            label: "Smooth",
            description: "Flowing elegant transitions",
            duration: data.duration,
          },
          {
            id: uuidv4(),
            videoUrl: data.videoUrl,
            thumbnailUrl: firstScene.imageUrl || undefined,
            style: "dramatic",
            label: "Dramatic",
            description: "Bold impactful timing",
            duration: data.duration,
          },
          {
            id: uuidv4(),
            videoUrl: data.videoUrl,
            thumbnailUrl: firstScene.imageUrl || undefined,
            style: "minimal",
            label: "Minimal",
            description: "Clean subtle movements",
            duration: data.duration,
          },
        ];

        setVariations(generatedVariations);
        setSelectedVariationId(generatedVariations[0].id);

        toast.success("Video generated!", {
          description: `${generatedVariations.length} variations ready. Select your favorite.`,
        });
        
        setStep("preview");
      } else {
        throw new Error("No video URL returned");
      }
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error("Failed to generate video");
      setProject((prev) => prev ? { ...prev, status: "draft" } : null);
    } finally {
      setIsGenerating(false);
    }
  }, [project, user, orgId]);

  // Navigation
  const handleBack = useCallback(() => {
    if (step === "edit") {
      setStep("template");
      setProject(null);
      setSelectedTemplate(null);
    } else if (step === "preview") {
      setStep("edit");
    } else {
      navigate(-1);
    }
  }, [step, navigate]);

  return (
    <div className="video-project-container">
      {/* Header */}
      <VideoProjectHeader
        step={step}
        projectName={project?.name}
        onBack={handleBack}
        onGenerate={handleGenerateVideo}
        isGenerating={isGenerating}
        canGenerate={project?.scenes.every((s) => s.imageUrl) || false}
      />

      {/* Main Content */}
      <div className="video-project-content">
        <AnimatePresence mode="wait">
          {step === "template" && (
            <motion.div
              key="template"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="template-selector-wrapper"
            >
              <TemplateSelector
                templates={VIDEO_TEMPLATES}
                onSelect={handleSelectTemplate}
              />
            </motion.div>
          )}

          {step === "edit" && project && (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="editor-wrapper"
            >
              {/* Preview Panel */}
              <div className="editor-preview-panel">
                <VideoPreview
                  scenes={project.scenes}
                  activeSceneId={activeSceneId}
                  aspectRatio={project.aspectRatio}
                  isPlaying={isPlaying}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                />
                
                {/* Platform Badges */}
                <PlatformBadges
                  duration={totalDuration}
                  aspectRatio={project.aspectRatio}
                />
              </div>

              {/* Scenes Panel */}
              <div className="editor-scenes-panel">
                <div className="scenes-header">
                  <h3 className="scenes-title">Scenes</h3>
                  <span className="scenes-count">
                    {project.scenes.length} scene{project.scenes.length !== 1 ? "s" : ""} • {totalDuration}s
                  </span>
                </div>

                <div className="scenes-list">
                  {project.scenes.map((scene, index) => (
                    <SceneCard
                      key={scene.id}
                      scene={scene}
                      index={index}
                      isActive={scene.id === activeSceneId}
                      onClick={() => setActiveSceneId(scene.id)}
                      onUpdate={(updates) => handleUpdateScene(scene.id, updates)}
                      onDelete={() => handleDeleteScene(scene.id)}
                      onSelectImage={(url, id) => handleSelectImage(scene.id, url, id)}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="add-scene-btn"
                  onClick={handleAddScene}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Scene
                </Button>
              </div>
            </motion.div>
          )}

          {step === "preview" && project && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="preview-wrapper-full"
            >
              {/* Main Preview */}
              <div className="preview-main">
                <VideoPreview
                  scenes={project.scenes}
                  activeSceneId={null}
                  aspectRatio={project.aspectRatio}
                  isPlaying={isPlaying}
                  onPlayPause={() => setIsPlaying(!isPlaying)}
                  fullPreview
                />
                
                <PlatformBadges
                  duration={totalDuration}
                  aspectRatio={project.aspectRatio}
                />
              </div>

              {/* Variations Grid */}
              {variations.length > 0 && (
                <VariationsGrid
                  variations={variations}
                  selectedId={selectedVariationId}
                  onSelect={(v) => setSelectedVariationId(v.id)}
                  onRegenerate={async () => {
                    setIsRegenerating(true);
                    // In full implementation, regenerate variations
                    await new Promise((r) => setTimeout(r, 1000));
                    toast.info("Regenerating variations...", {
                      description: "This feature is coming soon!",
                    });
                    setIsRegenerating(false);
                  }}
                  isRegenerating={isRegenerating}
                  aspectRatio={project.aspectRatio}
                />
              )}

              <div className="preview-actions">
                <Button variant="outline" onClick={() => setStep("edit")}>
                  Edit Scenes
                </Button>
                <Button variant="brass" disabled={!selectedVariationId}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Video
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
