import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Video,
  FileText,
  File,
  MoreVertical,
  Star,
  Download,
  Trash2,
  Eye,
  Pencil,
  Copy,
  FolderInput,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { DAMAsset, DAMViewMode } from "./types";
import { formatFileSize, getFileTypeCategory, FILE_TYPE_COLORS } from "./types";
import { formatDistanceToNow } from "date-fns";

interface AssetGridProps {
  assets: DAMAsset[];
  viewMode: DAMViewMode;
  selectedAssets: Set<string>;
  onToggleSelection: (id: string) => void;
  onViewAsset: (asset: DAMAsset) => void;
  onRenameAsset: (id: string) => void;
  onDeleteAsset: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onMoveAsset: (id: string) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  image: ImageIcon,
  video: Video,
  'application/pdf': FileText,
  document: FileText,
  default: File,
};

export function AssetGrid({
  assets,
  viewMode,
  selectedAssets,
  onToggleSelection,
  onViewAsset,
  onRenameAsset,
  onDeleteAsset,
  onToggleFavorite,
  onMoveAsset,
  isLoading,
  emptyMessage = "No assets yet",
}: AssetGridProps) {
  const gridClass = viewMode.type === 'list' 
    ? 'flex flex-col gap-2'
    : cn(
        'grid gap-4',
        viewMode.size === 'small' && 'grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
        viewMode.size === 'medium' && 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        viewMode.size === 'large' && 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
      );

  if (isLoading) {
    return (
      <div className={gridClass}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded mt-2 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-1">
          {emptyMessage}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          Drag and drop files here, or click the upload button to add your first assets.
        </p>
      </div>
    );
  }

  return (
    <div className={gridClass}>
      <AnimatePresence mode="popLayout">
        {assets.map((asset, index) => (
          viewMode.type === 'list' ? (
            <AssetListItem
              key={asset.id}
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              onToggleSelection={() => onToggleSelection(asset.id)}
              onView={() => onViewAsset(asset)}
              onRename={() => onRenameAsset(asset.id)}
              onDelete={() => onDeleteAsset(asset.id)}
              onToggleFavorite={() => onToggleFavorite(asset.id)}
              onMove={() => onMoveAsset(asset.id)}
              index={index}
            />
          ) : (
            <AssetGridItem
              key={asset.id}
              asset={asset}
              isSelected={selectedAssets.has(asset.id)}
              onToggleSelection={() => onToggleSelection(asset.id)}
              onView={() => onViewAsset(asset)}
              onRename={() => onRenameAsset(asset.id)}
              onDelete={() => onDeleteAsset(asset.id)}
              onToggleFavorite={() => onToggleFavorite(asset.id)}
              onMove={() => onMoveAsset(asset.id)}
              size={viewMode.size}
              index={index}
            />
          )
        ))}
      </AnimatePresence>
    </div>
  );
}

interface AssetItemProps {
  asset: DAMAsset;
  isSelected: boolean;
  onToggleSelection: () => void;
  onView: () => void;
  onRename: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onMove: () => void;
  index: number;
}

interface AssetGridItemProps extends AssetItemProps {
  size: 'small' | 'medium' | 'large';
}

function AssetGridItem({
  asset,
  isSelected,
  onToggleSelection,
  onView,
  onRename,
  onDelete,
  onToggleFavorite,
  onMove,
  size,
  index,
}: AssetGridItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const typeCategory = getFileTypeCategory(asset.file_type);
  const IconComponent = FILE_TYPE_ICONS[typeCategory] || File;
  const isImage = typeCategory === 'image';
  const isVideo = typeCategory === 'video';
  const isProcessing = asset.status === 'processing';

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = asset.file_url;
    link.download = asset.name;
    link.click();
  }, [asset]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "group relative rounded-lg border bg-card overflow-hidden transition-all cursor-pointer",
        isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50",
        isHovered && "shadow-level-2"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onView}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {isImage && asset.thumbnail_url ? (
          <img
            src={asset.thumbnail_url || asset.file_url}
            alt={asset.name}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : isVideo ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50">
            <Video className="w-12 h-12 text-purple-400" />
          </div>
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            FILE_TYPE_COLORS[typeCategory] || FILE_TYPE_COLORS.default
          )}>
            <IconComponent className="w-12 h-12 opacity-50" />
          </div>
        )}

        {/* Processing overlay */}
        {isProcessing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <span className="text-xs mt-1 text-muted-foreground">Processing...</span>
            </div>
          </div>
        )}

        {/* Selection checkbox */}
        <div
          className={cn(
            "absolute top-2 left-2 transition-opacity",
            isSelected || isHovered ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleSelection();
          }}
        >
          <Checkbox
            checked={isSelected}
            className="bg-background/80 border-2"
          />
        </div>

        {/* Favorite badge */}
        {asset.is_favorite && (
          <div className="absolute top-2 right-2">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          </div>
        )}

        {/* Hover actions */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-2 right-2 flex gap-1"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 p-0 bg-background/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Preview</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-7 w-7 p-0 bg-background/90"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onRename}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onToggleFavorite}>
                    <Star className={cn("w-4 h-4 mr-2", asset.is_favorite && "fill-amber-400")} />
                    {asset.is_favorite ? "Remove from favorites" : "Add to favorites"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMove}>
                    <FolderInput className="w-4 h-4 mr-2" />
                    Move to folder
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="text-sm font-medium truncate" title={asset.name}>
          {asset.name}
        </p>
        {size !== 'small' && (
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{formatFileSize(asset.file_size)}</span>
            {asset.metadata?.dimensions && (
              <>
                <span>•</span>
                <span>{asset.metadata.dimensions.width}×{asset.metadata.dimensions.height}</span>
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AssetListItem({
  asset,
  isSelected,
  onToggleSelection,
  onView,
  onRename,
  onDelete,
  onToggleFavorite,
  onMove,
  index,
}: AssetItemProps) {
  const typeCategory = getFileTypeCategory(asset.file_type);
  const IconComponent = FILE_TYPE_ICONS[typeCategory] || File;
  const isImage = typeCategory === 'image';

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = asset.file_url;
    link.download = asset.name;
    link.click();
  }, [asset]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.02 }}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-lg border bg-card transition-all cursor-pointer",
        isSelected ? "ring-2 ring-primary border-primary" : "border-border hover:border-primary/50"
      )}
      onClick={onView}
    >
      {/* Checkbox */}
      <div onClick={(e) => e.stopPropagation()}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggleSelection}
        />
      </div>

      {/* Thumbnail */}
      <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
        {isImage && asset.thumbnail_url ? (
          <img
            src={asset.thumbnail_url || asset.file_url}
            alt={asset.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center",
            FILE_TYPE_COLORS[typeCategory] || FILE_TYPE_COLORS.default
          )}>
            <IconComponent className="w-6 h-6 opacity-50" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{asset.name}</p>
          {asset.is_favorite && (
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{formatFileSize(asset.file_size)}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(asset.created_at), { addSuffix: true })}
          </span>
          {asset.tags.length > 0 && (
            <span className="truncate max-w-32">
              {asset.tags.slice(0, 3).join(', ')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            e.stopPropagation();
            handleDownload();
          }}
        >
          <Download className="w-4 h-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onRename}>
              <Pencil className="w-4 h-4 mr-2" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleFavorite}>
              <Star className={cn("w-4 h-4 mr-2", asset.is_favorite && "fill-amber-400")} />
              {asset.is_favorite ? "Remove from favorites" : "Add to favorites"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onMove}>
              <FolderInput className="w-4 h-4 mr-2" />
              Move to folder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}
