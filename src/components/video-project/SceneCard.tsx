import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical,
  Trash2,
  Clock,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  MoveHorizontal,
  Square,
  Type,
  ChevronDown,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { VideoScene } from "@/pages/VideoProject";

interface SceneCardProps {
  scene: VideoScene;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<VideoScene>) => void;
  onDelete: () => void;
  onSelectImage: (url: string, id: string) => void;
}

const MOTION_OPTIONS = [
  { value: "zoom-in", label: "Zoom In", icon: ZoomIn },
  { value: "zoom-out", label: "Zoom Out", icon: ZoomOut },
  { value: "pan-left", label: "Pan Left", icon: MoveHorizontal },
  { value: "pan-right", label: "Pan Right", icon: MoveHorizontal },
  { value: "static", label: "Static", icon: Square },
] as const;

const DURATION_OPTIONS = [5, 10, 15, 20, 30];

export function SceneCard({
  scene,
  index,
  isActive,
  onClick,
  onUpdate,
  onDelete,
  onSelectImage,
}: SceneCardProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);

  const motionOption = MOTION_OPTIONS.find((m) => m.value === scene.motion);
  const MotionIcon = motionOption?.icon || Square;

  return (
    <motion.div
      className={cn("scene-card", isActive && "scene-card--active")}
      onClick={onClick}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Main Row: Drag + Number + Thumbnail + Info */}
      <div className="scene-card-main">
        {/* Left: Drag Handle */}
        <div className="scene-drag-handle">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Scene Number Badge */}
        <div className="scene-number">{index + 1}</div>

        {/* Thumbnail */}
        <div
          className={cn(
            "scene-thumbnail",
            !scene.imageUrl && "scene-thumbnail--empty"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setShowImagePicker(true);
          }}
        >
          {scene.imageUrl ? (
            <>
              <img src={scene.imageUrl} alt={`Scene ${index + 1}`} />
              <div className="scene-thumbnail-overlay">
                <Play className="w-4 h-4" />
              </div>
            </>
          ) : (
            <div className="scene-thumbnail-placeholder">
              <ImageIcon className="w-5 h-5" />
              <span>Add</span>
            </div>
          )}
        </div>

        {/* Scene Info & Controls */}
        <div className="scene-info">
          {/* Settings Row */}
          <div className="scene-settings">
            {/* Motion */}
            <Select
              value={scene.motion}
              onValueChange={(value) => onUpdate({ motion: value as VideoScene["motion"] })}
            >
              <SelectTrigger 
                className="scene-select" 
                onClick={(e) => e.stopPropagation()}
              >
                <MotionIcon className="w-3.5 h-3.5" />
                <span className="scene-select-label">{motionOption?.label}</span>
              </SelectTrigger>
              <SelectContent>
                {MOTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="w-3.5 h-3.5" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Duration */}
            <Select
              value={scene.duration.toString()}
              onValueChange={(value) => onUpdate({ duration: parseInt(value) })}
            >
              <SelectTrigger 
                className="scene-select scene-select--compact" 
                onClick={(e) => e.stopPropagation()}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{scene.duration}s</span>
              </SelectTrigger>
              <SelectContent>
                {DURATION_OPTIONS.map((duration) => (
                  <SelectItem key={duration} value={duration.toString()}>
                    {duration} seconds
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="scene-actions">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "scene-action-btn",
                scene.text && "scene-action-btn--active"
              )}
              onClick={(e) => {
                e.stopPropagation();
                if (scene.text) {
                  onUpdate({ text: undefined });
                } else {
                  onUpdate({
                    text: { headline: "", subtext: "", position: "center" },
                  });
                }
              }}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="scene-action-btn scene-action-btn--delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Text Editor (expandable) */}
      <AnimatePresence>
        {scene.text && (
          <motion.div
            className="scene-text-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Headline text..."
              value={scene.text.headline || ""}
              onChange={(e) =>
                onUpdate({
                  text: { ...scene.text!, headline: e.target.value },
                })
              }
              className="scene-text-input"
            />
            <input
              type="text"
              placeholder="Subtext (optional)"
              value={scene.text.subtext || ""}
              onChange={(e) =>
                onUpdate({
                  text: { ...scene.text!, subtext: e.target.value },
                })
              }
              className="scene-text-input scene-text-input--secondary"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
