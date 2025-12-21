import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Download,
  Trash2,
  Star,
  Pencil,
  FolderInput,
  Copy,
  ExternalLink,
  Clock,
  FileText,
  Tag,
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";
import type { DAMAsset } from "./types";
import { formatFileSize, getFileTypeCategory } from "./types";
import { formatDistanceToNow, format } from "date-fns";

interface AssetDetailModalProps {
  asset: DAMAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onUpdateTags?: (id: string, tags: string[]) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export function AssetDetailModal({
  asset,
  isOpen,
  onClose,
  onRename,
  onDelete,
  onToggleFavorite,
  onUpdateTags,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: AssetDetailModalProps) {
  const { toast } = useToast();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState("");
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [newTag, setNewTag] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  const handleAddTag = useCallback(() => {
    if (asset && newTag.trim() && onUpdateTags) {
      const cleanTag = newTag.trim().toLowerCase();
      if (!asset.tags.includes(cleanTag)) {
        onUpdateTags(asset.id, [...asset.tags, cleanTag]);
      }
      setNewTag("");
      setIsAddingTag(false);
    }
  }, [asset, newTag, onUpdateTags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (asset && onUpdateTags) {
      onUpdateTags(asset.id, asset.tags.filter(t => t !== tagToRemove));
    }
  }, [asset, onUpdateTags]);

  const handleAddSuggestedTag = useCallback((tag: string) => {
    if (asset && onUpdateTags) {
      const cleanTag = tag.toLowerCase();
      if (!asset.tags.includes(cleanTag)) {
        onUpdateTags(asset.id, [...asset.tags, cleanTag]);
        toast({ title: "Tag added", description: `"${tag}" added to asset` });
      }
    }
  }, [asset, onUpdateTags, toast]);

  const typeCategory = asset ? getFileTypeCategory(asset.file_type) : 'default';
  const isImage = typeCategory === 'image';
  const isVideo = typeCategory === 'video';
  const isPDF = typeCategory === 'application/pdf';

  const handleRename = useCallback(() => {
    if (asset && newName.trim() && newName !== asset.name) {
      onRename(asset.id, newName.trim());
      setIsRenaming(false);
    }
  }, [asset, newName, onRename]);

  const handleCopyUrl = useCallback(async () => {
    if (asset) {
      await navigator.clipboard.writeText(asset.file_url);
      toast({ title: "Copied!", description: "URL copied to clipboard" });
    }
  }, [asset, toast]);

  const handleDownload = useCallback(() => {
    if (asset) {
      const link = document.createElement('a');
      link.href = asset.file_url;
      link.download = asset.name;
      link.click();
    }
  }, [asset]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
      onPrevious();
    } else if (e.key === 'ArrowRight' && hasNext && onNext) {
      onNext();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [hasPrevious, hasNext, onPrevious, onNext, onClose]);

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl h-[90vh] p-0 gap-0 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Visually hidden title for accessibility */}
        <VisuallyHidden.Root>
          <DialogTitle>Asset Details: {asset.name}</DialogTitle>
          <DialogDescription>View and manage asset details, tags, and AI analysis</DialogDescription>
        </VisuallyHidden.Root>

        <div className="flex h-full">
          {/* Preview area */}
          <div className="flex-1 bg-muted/30 relative flex items-center justify-center overflow-hidden">
            {/* Navigation arrows */}
            {hasPrevious && onPrevious && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 z-10"
                onClick={onPrevious}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            {hasNext && onNext && (
              <Button
                variant="secondary"
                size="sm"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/90 z-10"
                onClick={onNext}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}

            {/* Close button */}
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/90 z-10"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Zoom controls for images */}
            {isImage && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/90 rounded-full px-3 py-1.5 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setZoom(z => Math.max(0.25, z - 0.25))}
                  disabled={zoom <= 0.25}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-xs font-medium w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setZoom(z => Math.min(4, z + 0.25))}
                  disabled={zoom >= 4}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-4 bg-border mx-1" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setRotation(r => (r + 90) % 360)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Preview content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="max-w-full max-h-full p-8"
              >
                {isImage ? (
                  <img
                    src={asset.file_url}
                    alt={asset.name}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-lg transition-transform"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                    }}
                  />
                ) : isVideo ? (
                  <video
                    src={asset.file_url}
                    controls
                    className="max-w-full max-h-[70vh] rounded-lg shadow-lg"
                  />
                ) : isPDF ? (
                  <iframe
                    src={asset.file_url}
                    className="w-full h-[70vh] rounded-lg shadow-lg bg-white"
                    title={asset.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-12 bg-background rounded-lg shadow-lg">
                    <FileText className="w-20 h-20 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium">{asset.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Preview not available
                    </p>
                    <Button className="mt-4" onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download to view
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Details sidebar */}
          <div className="w-80 border-l border-border bg-card flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-border">
              {isRenaming ? (
                <div className="flex gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename();
                      if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    autoFocus
                    className="h-8"
                  />
                  <Button size="sm" onClick={handleRename}>
                    <CheckCircle2 className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold text-lg break-words line-clamp-2">
                    {asset.name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 flex-shrink-0"
                    onClick={() => {
                      setNewName(asset.name);
                      setIsRenaming(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}

              {/* Quick actions */}
              <div className="flex items-center gap-2 mt-3">
                <Button
                  variant={asset.is_favorite ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => onToggleFavorite(asset.id)}
                >
                  <Star className={cn("w-4 h-4", asset.is_favorite && "fill-current")} />
                  {asset.is_favorite ? "Favorited" : "Favorite"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="details" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-4">
                <TabsTrigger value="details" className="data-[state=active]:bg-transparent">
                  Details
                </TabsTrigger>
                <TabsTrigger value="ai" className="data-[state=active]:bg-transparent">
                  AI Analysis
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                {/* File info */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">File Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span>{asset.file_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size</span>
                      <span>{formatFileSize(asset.file_size)}</span>
                    </div>
                    {asset.metadata?.dimensions && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dimensions</span>
                        <span>{asset.metadata.dimensions.width} × {asset.metadata.dimensions.height}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Uploaded</span>
                      <span title={format(new Date(asset.created_at), 'PPpp')}>
                        {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {asset.usage_count > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Used</span>
                        <span>{asset.usage_count} time{asset.usage_count !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h3>
                    {onUpdateTags && !isAddingTag && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => setIsAddingTag(true)}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    )}
                  </div>

                  {/* Add tag input */}
                  {isAddingTag && (
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Enter tag..."
                        className="h-7 text-xs"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddTag();
                          if (e.key === 'Escape') {
                            setIsAddingTag(false);
                            setNewTag("");
                          }
                        }}
                      />
                      <Button size="sm" className="h-7 px-2" onClick={handleAddTag}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => {
                          setIsAddingTag(false);
                          setNewTag("");
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}

                  {asset.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {asset.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs group pr-1 flex items-center gap-1"
                        >
                          {tag}
                          {onUpdateTags && (
                            <button
                              className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {isAddingTag ? "Type a tag and press Enter" : "No tags yet"}
                    </p>
                  )}
                </div>

                {/* Categories */}
                {asset.categories.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {asset.categories.map((cat) => (
                        <Badge key={cat} variant="outline" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* URL */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">URL</h3>
                  <div className="flex items-center gap-2">
                    <Input
                      value={asset.file_url}
                      readOnly
                      className="text-xs h-8"
                    />
                    <Button variant="outline" size="sm" className="h-8 px-2" onClick={handleCopyUrl}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="ai" className="flex-1 overflow-y-auto p-4 space-y-4 mt-0">
                {asset.ai_analysis ? (
                  <>
                    {/* Description */}
                    {asset.ai_analysis.description && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          AI Description
                        </h3>
                        <p className="text-sm">{asset.ai_analysis.description}</p>
                      </div>
                    )}

                    {/* Quality score */}
                    {asset.ai_analysis.quality_score && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Quality Score</h3>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                asset.ai_analysis.quality_score >= 80 ? "bg-green-500" :
                                  asset.ai_analysis.quality_score >= 60 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${asset.ai_analysis.quality_score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{asset.ai_analysis.quality_score}</span>
                        </div>
                      </div>
                    )}

                    {/* Detected objects */}
                    {asset.ai_analysis.detected_objects && asset.ai_analysis.detected_objects.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Detected Objects</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {asset.ai_analysis.detected_objects.map((obj) => (
                            <Badge key={obj} variant="outline" className="text-xs">
                              {obj}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dominant colors */}
                    {asset.ai_analysis.dominant_colors && asset.ai_analysis.dominant_colors.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Dominant Colors</h3>
                        <div className="flex gap-2">
                          {asset.ai_analysis.dominant_colors.map((color) => (
                            <div
                              key={color}
                              className="w-8 h-8 rounded-md border border-border shadow-sm"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sentiment */}
                    {asset.ai_analysis.sentiment && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Mood/Sentiment</h3>
                        <Badge variant="secondary">{asset.ai_analysis.sentiment}</Badge>
                      </div>
                    )}

                    {/* Suggested tags */}
                    {asset.ai_analysis.suggested_tags && asset.ai_analysis.suggested_tags.length > 0 && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">
                          Suggested Tags
                          {onUpdateTags && <span className="font-normal ml-1">(click to add)</span>}
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                          {asset.ai_analysis.suggested_tags
                            .filter(tag => !asset.tags.includes(tag.toLowerCase()))
                            .map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className={cn(
                                  "text-xs bg-primary/5",
                                  onUpdateTags && "cursor-pointer hover:bg-primary/10 transition-colors"
                                )}
                                onClick={() => onUpdateTags && handleAddSuggestedTag(tag)}
                              >
                                <Plus className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          {asset.ai_analysis.suggested_tags.every(tag =>
                            asset.tags.includes(tag.toLowerCase())
                          ) && (
                              <p className="text-xs text-muted-foreground">All suggestions already added</p>
                            )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Sparkles className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      AI analysis not available
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Analysis runs automatically on upload
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Footer actions */}
            <div className="p-4 border-t border-border">
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => {
                  onDelete(asset.id);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Asset
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
