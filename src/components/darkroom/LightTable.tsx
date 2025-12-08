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
  X,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Detect touch device
const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window;

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
  const [activeImageId, setActiveImageId] = useState<string | null>(null); // For mobile tap-to-show-actions

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
      } else if (isTouchDevice) {
        // On mobile: tap to show actions for this image
        e.preventDefault();
        setActiveImageId(activeImageId === image.id ? null : image.id);
      } else {
        // Desktop: Single select - preview in canvas
        onSelectImage(image.id);
      }
    },
    [multiSelectMode, onSelectImage, activeImageId]
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
    setActiveImageId(null); // Clear mobile actions when toggling
  }, [multiSelectMode]);

  // Single image actions for mobile
  const handleSaveSingle = useCallback((id: string) => {
    onSaveSelected([id]);
    setActiveImageId(null);
  }, [onSaveSelected]);

  const handleDeleteSingle = useCallback((id: string) => {
    onDeleteSelected([id]);
    setActiveImageId(null);
  }, [onDeleteSelected]);

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
                {images.map((image, index) => {
                  const isActive = activeImageId === image.id;
                  const showMobileActions = isTouchDevice && isActive && !multiSelectMode;
                  
                  return (
                    <motion.div
                      key={image.id}
                      className={cn(
                        "light-table__thumbnail",
                        selectedImageId === image.id && "light-table__thumbnail--selected",
                        multiSelectMode &&
                          selectedIds.has(image.id) &&
                          "light-table__thumbnail--checked",
                        showMobileActions && "light-table__thumbnail--actions-visible"
                      )}
                      onClick={(e) => handleThumbnailClick(image, e)}
                      onDoubleClick={() => handleThumbnailDoubleClick(image)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={!isTouchDevice ? { scale: 1.02 } : {}}
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

                      {/* Desktop Hover Actions */}
                      {!multiSelectMode && !isTouchDevice && (
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
                            className="light-table__hover-btn opacity-50 cursor-not-allowed"
                            disabled
                            title="Video - Coming Soon"
                          >
                            <Film className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Mobile Tap Actions Overlay */}
                      <AnimatePresence>
                        {showMobileActions && (
                          <motion.div
                            className="light-table__mobile-actions"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Close button */}
                            <button
                              className="light-table__mobile-close"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveImageId(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </button>

                            {/* Action buttons */}
                            <div className="light-table__mobile-btns">
                              <button
                                className="light-table__mobile-btn"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenEditor(image);
                                  setActiveImageId(null);
                                }}
                              >
                                <Edit3 className="w-5 h-5" />
                                <span>Edit</span>
                              </button>
                              
                              {!image.isSaved && (
                                <button
                                  className="light-table__mobile-btn light-table__mobile-btn--save"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveSingle(image.id);
                                  }}
                                >
                                  <Save className="w-5 h-5" />
                                  <span>Save</span>
                                </button>
                              )}
                              
                              <button
                                className="light-table__mobile-btn light-table__mobile-btn--delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSingle(image.id);
                                }}
                              >
                                <Trash2 className="w-5 h-5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="light-table__empty">
                <p>No images yet</p>
                <span>Generated images will appear here</span>
              </div>
            )}

            {/* Quick Tip - different for mobile */}
            {images.length > 0 && !multiSelectMode && (
              <p className="light-table__tip">
                {isTouchDevice 
                  ? "Tap for actions • Double-tap to edit"
                  : "Click to preview • Double-click to edit • Hover for actions"
                }
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
