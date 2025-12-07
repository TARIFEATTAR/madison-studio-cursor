import { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ scale: 1.01 }}
    >
      {/* Drag Handle */}
      <div className="scene-drag-handle">
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Scene Number */}
      <div className="scene-number">
        {index + 1}
      </div>

      {/* Image Preview */}
      <div
        className={cn(
          "scene-image-preview",
          !scene.imageUrl && "scene-image-preview--empty"
        )}
        onClick={(e) => {
          e.stopPropagation();
          setShowImagePicker(true);
        }}
      >
        {scene.imageUrl ? (
          <img src={scene.imageUrl} alt={`Scene ${index + 1}`} />
        ) : (
          <div className="scene-image-placeholder">
            <ImageIcon className="w-5 h-5" />
            <span>Add Image</span>
          </div>
        )}
      </div>

      {/* Scene Controls */}
      <div className="scene-controls">
        {/* Motion Selector */}
        <Select
          value={scene.motion}
          onValueChange={(value) => onUpdate({ motion: value as VideoScene["motion"] })}
        >
          <SelectTrigger className="scene-control-select" onClick={(e) => e.stopPropagation()}>
            <MotionIcon className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOTION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="w-3 h-3" />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Duration Selector */}
        <Select
          value={scene.duration.toString()}
          onValueChange={(value) => onUpdate({ duration: parseInt(value) })}
        >
          <SelectTrigger className="scene-control-select scene-control-select--duration" onClick={(e) => e.stopPropagation()}>
            <Clock className="w-3 h-3 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DURATION_OPTIONS.map((duration) => (
              <SelectItem key={duration} value={duration.toString()}>
                {duration}s
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Text Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "scene-control-btn",
            scene.text && "scene-control-btn--active"
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
          <Type className="w-4 h-4" />
        </Button>

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="scene-control-btn scene-control-btn--delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Text Editor (if text is enabled) */}
      {scene.text && (
        <motion.div
          className="scene-text-editor"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="text"
            placeholder="Headline"
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
            className="scene-text-input scene-text-input--small"
          />
        </motion.div>
      )}

      {/* Image Picker Modal would go here */}
      {/* For now, we'll use a simple URL input in the future */}
    </motion.div>
  );
}
