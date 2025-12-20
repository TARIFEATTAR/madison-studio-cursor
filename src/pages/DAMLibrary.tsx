import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Grid3X3,
  List,
  LayoutGrid,
  SlidersHorizontal,
  Upload,
  FolderPlus,
  Trash2,
  Download,
  Star,
  ChevronDown,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  FolderSidebar,
  UploadDropzone,
  UploadCelebration,
  AssetGrid,
  AssetDetailModal,
  useDAM,
  useDAMUpload,
  SORT_OPTIONS,
  type DAMAsset,
  type DAMViewMode,
  type DAMSortOption,
} from "@/components/dam";

export default function DAMLibrary() {
  // State
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [viewMode, setViewMode] = useState<DAMViewMode>({ type: 'grid', size: 'medium' });
  const [sort, setSort] = useState<DAMSortOption>(SORT_OPTIONS[0]);
  const [showUploadZone, setShowUploadZone] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<DAMAsset | null>(null);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [assetToRename, setAssetToRename] = useState<string | null>(null);
  const [newAssetName, setNewAssetName] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // DAM hooks
  const {
    folders,
    folderTree,
    assets,
    isLoading,
    selectedAssets,
    toggleSelection,
    selectAll,
    clearSelection,
    createFolder,
    renameAsset,
    moveAsset,
    deleteAsset,
    toggleFavorite,
    refetch,
  } = useDAM({
    folderId: selectedFolderId,
    searchQuery: debouncedSearch,
    sort,
  });

  const { uploads, uploadFiles, clearUpload } = useDAMUpload();

  // Get current folder name
  const currentFolder = useMemo(() => {
    if (!selectedFolderId) return null;
    return folders.find(f => f.id === selectedFolderId);
  }, [selectedFolderId, folders]);

  // Navigation for asset modal
  const currentAssetIndex = useMemo(() => {
    if (!selectedAsset) return -1;
    return assets.findIndex(a => a.id === selectedAsset.id);
  }, [selectedAsset, assets]);

  const handlePreviousAsset = useCallback(() => {
    if (currentAssetIndex > 0) {
      setSelectedAsset(assets[currentAssetIndex - 1]);
    }
  }, [currentAssetIndex, assets]);

  const handleNextAsset = useCallback(() => {
    if (currentAssetIndex < assets.length - 1) {
      setSelectedAsset(assets[currentAssetIndex + 1]);
    }
  }, [currentAssetIndex, assets]);

  // Upload handler with celebration
  const handleUpload = useCallback(async (files: File[]) => {
    const results = await uploadFiles(files, selectedFolderId || undefined);
    const successCount = results.filter(Boolean).length;
    if (successCount > 0) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 1500);
    }
  }, [uploadFiles, selectedFolderId]);

  // Rename handler
  const handleRenameClick = useCallback((assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    if (asset) {
      setAssetToRename(assetId);
      setNewAssetName(asset.name);
      setRenameDialogOpen(true);
    }
  }, [assets]);

  const handleRenameSubmit = useCallback(() => {
    if (assetToRename && newAssetName.trim()) {
      renameAsset.mutate({ assetId: assetToRename, name: newAssetName.trim() });
      setRenameDialogOpen(false);
      setAssetToRename(null);
    }
  }, [assetToRename, newAssetName, renameAsset]);

  // Bulk actions
  const hasSelection = selectedAssets.size > 0;

  const handleBulkDelete = useCallback(() => {
    selectedAssets.forEach(id => deleteAsset.mutate(id));
    clearSelection();
  }, [selectedAssets, deleteAsset, clearSelection]);

  const handleBulkFavorite = useCallback(() => {
    selectedAssets.forEach(id => toggleFavorite.mutate(id));
    clearSelection();
  }, [selectedAssets, toggleFavorite, clearSelection]);

  return (
    <div className="flex h-full bg-background">
      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && <UploadCelebration show={showCelebration} />}
      </AnimatePresence>

      {/* Folder sidebar */}
      <div className="w-64 border-r border-border bg-card flex-shrink-0">
        <FolderSidebar
          folders={folders}
          selectedFolderId={selectedFolderId}
          onSelectFolder={setSelectedFolderId}
          onCreateFolder={(name, parentId) => createFolder.mutate({ name, parentId })}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-serif font-semibold">
                {currentFolder ? currentFolder.name : "All Assets"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {assets.length} asset{assets.length !== 1 ? 's' : ''}
                {debouncedSearch && ` matching "${debouncedSearch}"`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={refetch}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
              <Button
                className="gap-2"
                onClick={() => setShowUploadZone(!showUploadZone)}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>
            </div>
          </div>

          {/* Search and filters bar */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

            {/* Sort */}
            <Select
              value={`${sort.field}-${sort.direction}`}
              onValueChange={(value) => {
                const option = SORT_OPTIONS.find(o => `${o.field}-${o.direction}` === value);
                if (option) setSort(option);
              }}
            >
              <SelectTrigger className="w-40 h-9">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem 
                    key={`${option.field}-${option.direction}`} 
                    value={`${option.field}-${option.direction}`}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Separator orientation="vertical" className="h-6" />

            {/* View mode */}
            <div className="flex items-center border border-border rounded-md">
              <Button
                variant={viewMode.type === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-r-none"
                onClick={() => setViewMode({ type: 'grid', size: viewMode.size })}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode.type === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 px-2 rounded-l-none"
                onClick={() => setViewMode({ type: 'list', size: viewMode.size })}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* Grid size */}
            {viewMode.type === 'grid' && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1">
                    <LayoutGrid className="w-4 h-4" />
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setViewMode({ type: 'grid', size: 'small' })}>
                    Small thumbnails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode({ type: 'grid', size: 'medium' })}>
                    Medium thumbnails
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setViewMode({ type: 'grid', size: 'large' })}>
                    Large thumbnails
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Bulk actions bar */}
          <AnimatePresence>
            {hasSelection && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedAssets.size} selected
                  </span>
                  <Button variant="ghost" size="sm" onClick={selectAll}>
                    Select all
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearSelection}>
                    Clear
                  </Button>
                  <Separator orientation="vertical" className="h-5" />
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={handleBulkFavorite}>
                    <Star className="w-4 h-4" />
                    Favorite
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-1.5 text-destructive hover:text-destructive"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Upload dropzone */}
        <AnimatePresence>
          {showUploadZone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-b border-border bg-muted/30 px-6 py-4"
            >
              <UploadDropzone
                onUpload={handleUpload}
                uploads={uploads}
                onClearUpload={clearUpload}
                folderId={selectedFolderId || undefined}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Asset grid */}
        <div className="flex-1 overflow-y-auto p-6">
          <AssetGrid
            assets={assets}
            viewMode={viewMode}
            selectedAssets={selectedAssets}
            onToggleSelection={toggleSelection}
            onViewAsset={setSelectedAsset}
            onRenameAsset={handleRenameClick}
            onDeleteAsset={(id) => deleteAsset.mutate(id)}
            onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            onMoveAsset={(id) => {/* TODO: Move dialog */}}
            isLoading={isLoading}
            emptyMessage={
              debouncedSearch
                ? `No assets found for "${debouncedSearch}"`
                : currentFolder
                  ? `No assets in ${currentFolder.name}`
                  : "No assets yet. Upload some files to get started!"
            }
          />
        </div>
      </div>

      {/* Asset detail modal */}
      <AssetDetailModal
        asset={selectedAsset}
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        onRename={(id, name) => renameAsset.mutate({ assetId: id, name })}
        onDelete={(id) => {
          deleteAsset.mutate(id);
          setSelectedAsset(null);
        }}
        onToggleFavorite={(id) => toggleFavorite.mutate(id)}
        onPrevious={handlePreviousAsset}
        onNext={handleNextAsset}
        hasPrevious={currentAssetIndex > 0}
        hasNext={currentAssetIndex < assets.length - 1}
      />

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Asset</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="New name"
              value={newAssetName}
              onChange={(e) => setNewAssetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRenameSubmit();
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRenameSubmit} disabled={!newAssetName.trim()}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
