/**
 * LightTable - Session Image Review Panel
 * 
 * Displays all images generated in the current Dark Room session as a
 * contact sheet for quick review. Users can:
 * - View thumbnails of all session images
 * - Click to select/preview an image
 * - Double-click to open in Editor modal
 * - Multi-select for batch operations
 * - Save selected to library
 * 
 * Follows the photography workflow: Dark Room → Light Table → Editor → Library
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Check,
  CheckSquare,
  Square,
  Save,
  Trash2,
  Download,
  Film,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LightTableImage {
  id: string;
  imageUrl: string;
  prompt: string;
  timestamp: number;
  isSaved: boolean;
  isHero?: boolean;
}

interface LightTableProps {
  images: LightTableImage[];
  selectedImageId: string | null;
  onSelectImage: (id: string) => void;
  onOpenEditor: (image: LightTableImage) => void;
  onSaveSelected: (ids: string[]) => void;
  onDeleteSelected: (ids: string[]) => void;
  onCreateVideo: (image: LightTableImage) => void;
  isSaving?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function LightTable({
  images,
  selectedImageId,
  onSelectImage,
  onOpenEditor,
  onSaveSelected,
  onDeleteSelected,
  onCreateVideo,
  isSaving = false,
  isCollapsed = false,
  onToggleCollapse,
}: LightTableProps) {
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleThumbnailClick = useCallback(
    (image: LightTableImage, e: React.MouseEvent) => {
      if (multiSelectMode) {
        // Toggle selection
        setSelectedIds((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(image.id)) {
            newSet.delete(image.id);
          } else {
            newSet.add(image.id);
          }
          return newSet;
        });
      } else {
        // Single select - preview in canvas
        onSelectImage(image.id);
      }
    },
    [multiSelectMode, onSelectImage]
  );

  const handleThumbnailDoubleClick = useCallback(
    (image: LightTableImage) => {
      if (!multiSelectMode) {
        onOpenEditor(image);
      }
    },
    [multiSelectMode, onOpenEditor]
  );

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === images.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(images.map((img) => img.id)));
    }
  }, [images, selectedIds.size]);

  const handleSaveSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length > 0) {
      onSaveSelected(ids);
      setSelectedIds(new Set());
      setMultiSelectMode(false);
    }
  }, [selectedIds, onSaveSelected]);

  const handleDeleteSelected = useCallback(() => {
    const ids = Array.from(selectedIds);
    if (ids.length > 0) {
      onDeleteSelected(ids);
      setSelectedIds(new Set());
      setMultiSelectMode(false);
    }
  }, [selectedIds, onDeleteSelected]);

  const toggleMultiSelect = useCallback(() => {
    setMultiSelectMode((prev) => !prev);
    if (multiSelectMode) {
      setSelectedIds(new Set());
    }
  }, [multiSelectMode]);

  const unsavedCount = images.filter((img) => !img.isSaved).length;

  return (
    <div className={cn("light-table", isCollapsed && "light-table--collapsed")}>
      {/* Header */}
      <div className="light-table__header" onClick={onToggleCollapse}>
        <div className="light-table__title-section">
          <h3 className="light-table__title">Light Table</h3>
          <span className="light-table__count">
            {images.length} image{images.length !== 1 ? "s" : ""}
            {unsavedCount > 0 && (
              <span className="light-table__unsaved"> • {unsavedCount} unsaved</span>
            )}
          </span>
        </div>
        <button className="light-table__collapse-btn">
          {isCollapsed ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            className="light-table__content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Toolbar */}
            {images.length > 0 && (
              <div className="light-table__toolbar">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMultiSelect}
                  className={cn(
                    "light-table__select-btn",
                    multiSelectMode && "light-table__select-btn--active"
                  )}
                >
                  {multiSelectMode ? (
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  Select
                </Button>

                {multiSelectMode && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSelectAll}
                      className="light-table__action-btn"
                    >
                      {selectedIds.size === images.length ? "Deselect All" : "Select All"}
                    </Button>
                    <div className="light-table__toolbar-divider" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveSelected}
                      disabled={selectedIds.size === 0 || isSaving}
                      className="light-table__action-btn"
                    >
                      {isSaving ? (
                        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Save ({selectedIds.size})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={selectedIds.size === 0}
                      className="light-table__action-btn light-table__action-btn--danger"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* Image Grid */}
            {images.length > 0 ? (
              <div className="light-table__grid">
                {images.map((image, index) => (
                  <motion.div
                    key={image.id}
                    className={cn(
                      "light-table__thumbnail",
                      selectedImageId === image.id && "light-table__thumbnail--selected",
                      multiSelectMode &&
                        selectedIds.has(image.id) &&
                        "light-table__thumbnail--checked"
                    )}
                    onClick={(e) => handleThumbnailClick(image, e)}
                    onDoubleClick={() => handleThumbnailDoubleClick(image)}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    <img
                      src={image.imageUrl}
                      alt={`Session image ${index + 1}`}
                      className="light-table__image"
                    />

                    {/* Index Badge */}
                    <div className="light-table__index">{index + 1}</div>

                    {/* Saved Indicator */}
                    {image.isSaved && (
                      <div className="light-table__saved-badge">
                        <Check className="w-3 h-3" />
                      </div>
                    )}

                    {/* Multi-select Checkbox */}
                    {multiSelectMode && (
                      <div
                        className={cn(
                          "light-table__checkbox",
                          selectedIds.has(image.id) && "light-table__checkbox--checked"
                        )}
                      >
                        {selectedIds.has(image.id) && <Check className="w-3 h-3" />}
                      </div>
                    )}

                    {/* Hover Actions (only in non-multiselect mode) */}
                    {!multiSelectMode && (
                      <div className="light-table__hover-actions">
                        <button
                          className="light-table__hover-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenEditor(image);
                          }}
                          title="Open in Editor"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="light-table__hover-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateVideo(image);
                          }}
                          title="Create Video"
                        >
                          <Film className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="light-table__empty">
                <p>No images yet</p>
                <span>Generated images will appear here</span>
              </div>
            )}

            {/* Quick Tip */}
            {images.length > 0 && !multiSelectMode && (
              <p className="light-table__tip">
                Click to preview • Double-click to edit • Hover for actions
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
