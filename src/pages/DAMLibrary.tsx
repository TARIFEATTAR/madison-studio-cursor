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
  Filter,
  FolderInput,
  Tag,
  Image,
  Video,
  FileText,
  Calendar,
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
  
  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [filterTags, setFilterTags] = useState<string[]>([]);
  
  // Bulk action dialogs
  const [bulkMoveDialogOpen, setBulkMoveDialogOpen] = useState(false);
  const [bulkTagDialogOpen, setBulkTagDialogOpen] = useState(false);
  const [bulkTagInput, setBulkTagInput] = useState("");
  
  // Smart folder dialog
  const [smartFolderDialogOpen, setSmartFolderDialogOpen] = useState(false);
  const [smartFolderName, setSmartFolderName] = useState("");

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
    renameFolder,
    deleteFolder,
    createSmartFolder,
    renameAsset,
    moveAsset,
    deleteAsset,
    toggleFavorite,
    updateTags,
    bulkUpdateTags,
    bulkMove,
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

  // Get all unique tags from assets
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    assets.forEach(a => a.tags?.forEach(t => tags.add(t)));
    return Array.from(tags).sort();
  }, [assets]);

  // Filter assets client-side
  const filteredAssets = useMemo(() => {
    let result = assets;
    
    // Filter by type
    if (filterType) {
      result = result.filter(a => {
        if (filterType === 'image') return a.file_type.startsWith('image/');
        if (filterType === 'video') return a.file_type.startsWith('video/');
        if (filterType === 'document') return a.file_type.includes('pdf') || a.file_type.includes('document');
        return true;
      });
    }
    
    // Filter by tags
    if (filterTags.length > 0) {
      result = result.filter(a => 
        filterTags.every(tag => a.tags?.includes(tag))
      );
    }
    
    return result;
  }, [assets, filterType, filterTags]);

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

  const handleBulkMove = useCallback((folderId: string | null) => {
    bulkMove.mutate({ assetIds: Array.from(selectedAssets), folderId });
    clearSelection();
    setBulkMoveDialogOpen(false);
  }, [selectedAssets, bulkMove, clearSelection]);

  const handleBulkTag = useCallback(() => {
    if (bulkTagInput.trim()) {
      const tags = bulkTagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      bulkUpdateTags.mutate({ assetIds: Array.from(selectedAssets), tags, mode: 'add' });
      clearSelection();
      setBulkTagDialogOpen(false);
      setBulkTagInput("");
    }
  }, [selectedAssets, bulkTagInput, bulkUpdateTags, clearSelection]);

  const clearFilters = useCallback(() => {
    setFilterType(null);
    setFilterTags([]);
  }, []);

  const hasActiveFilters = filterType || filterTags.length > 0;

  const handleCreateSmartFolder = useCallback(() => {
    if (!smartFolderName.trim() || !hasActiveFilters) return;
    
    const conditions: Array<{ field: string; operator: string; value: unknown }> = [];
    
    if (filterType) {
      conditions.push({
        field: 'file_type',
        operator: 'starts_with',
        value: filterType === 'document' ? 'application' : filterType,
      });
    }
    
    if (filterTags.length > 0) {
      filterTags.forEach(tag => {
        conditions.push({
          field: 'tags',
          operator: 'contains',
          value: tag,
        });
      });
    }
    
    createSmartFolder.mutate({
      name: smartFolderName.trim(),
      smartFilter: {
        conditions,
        match: 'all',
      },
    });
    
    setSmartFolderDialogOpen(false);
    setSmartFolderName("");
  }, [smartFolderName, hasActiveFilters, filterType, filterTags, createSmartFolder]);

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
          onRenameFolder={(folderId, name) => renameFolder.mutate({ folderId, name })}
          onDeleteFolder={(folderId) => deleteFolder.mutate(folderId)}
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

            <Separator orientation="vertical" className="h-6" />

            {/* Filters */}
            <Button
              variant={hasActiveFilters ? "default" : "outline"}
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                  {(filterType ? 1 : 0) + filterTags.length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  {/* Type filter */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Type:</span>
                    <div className="flex gap-1">
                      {[
                        { value: 'image', label: 'Images', icon: Image },
                        { value: 'video', label: 'Videos', icon: Video },
                        { value: 'document', label: 'Documents', icon: FileText },
                      ].map(({ value, label, icon: Icon }) => (
                        <Button
                          key={value}
                          variant={filterType === value ? "default" : "outline"}
                          size="sm"
                          className="h-7 gap-1.5"
                          onClick={() => setFilterType(filterType === value ? null : value)}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-6" />

                  {/* Tags filter */}
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-sm font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1">
                      {filterTags.map(tag => (
                        <Badge 
                          key={tag} 
                          variant="default" 
                          className="cursor-pointer"
                          onClick={() => setFilterTags(filterTags.filter(t => t !== tag))}
                        >
                          {tag}
                          <X className="w-3 h-3 ml-1" />
                        </Badge>
                      ))}
                      {allTags.length > 0 && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-6 px-2 text-xs">
                              + Add tag
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-60 overflow-y-auto">
                            {allTags
                              .filter(t => !filterTags.includes(t))
                              .map(tag => (
                                <DropdownMenuItem 
                                  key={tag} 
                                  onClick={() => setFilterTags([...filterTags, tag])}
                                >
                                  {tag}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1.5"
                        onClick={() => setSmartFolderDialogOpen(true)}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Save as Smart Folder
                      </Button>
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                      </Button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setBulkMoveDialogOpen(true)}>
                    <FolderInput className="w-4 h-4" />
                    Move
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => setBulkTagDialogOpen(true)}>
                    <Tag className="w-4 h-4" />
                    Tag
                  </Button>
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
            assets={filteredAssets}
            viewMode={viewMode}
            selectedAssets={selectedAssets}
            onToggleSelection={toggleSelection}
            onViewAsset={setSelectedAsset}
            onRenameAsset={handleRenameClick}
            onDeleteAsset={(id) => deleteAsset.mutate(id)}
            onToggleFavorite={(id) => toggleFavorite.mutate(id)}
            onMoveAsset={(id) => {
              // Select just this asset and open move dialog
              toggleSelection(id);
              setBulkMoveDialogOpen(true);
            }}
            isLoading={isLoading}
            emptyMessage={
              hasActiveFilters
                ? "No assets match your filters"
                : debouncedSearch
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
        onUpdateTags={(id, tags) => updateTags.mutate({ assetId: id, tags })}
        onPrevious={handlePreviousAsset}
        onNext={handleNextAsset}
        hasPrevious={currentAssetIndex > 0}
        hasNext={currentAssetIndex < filteredAssets.length - 1}
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

      {/* Bulk move dialog */}
      <Dialog open={bulkMoveDialogOpen} onOpenChange={setBulkMoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Move {selectedAssets.size} asset{selectedAssets.size > 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-2 max-h-80 overflow-y-auto">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => handleBulkMove(null)}
            >
              <FolderInput className="w-4 h-4" />
              Root (no folder)
            </Button>
            {folders
              .filter(f => f.folder_type === 'user' || f.folder_type === 'system')
              .map(folder => (
                <Button
                  key={folder.id}
                  variant="outline"
                  className="w-full justify-start gap-2"
                  onClick={() => handleBulkMove(folder.id)}
                >
                  <FolderInput className="w-4 h-4" />
                  {folder.name}
                </Button>
              ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkMoveDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk tag dialog */}
      <Dialog open={bulkTagDialogOpen} onOpenChange={setBulkTagDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add tags to {selectedAssets.size} asset{selectedAssets.size > 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (comma separated)</label>
              <Input
                placeholder="product, lifestyle, campaign..."
                value={bulkTagInput}
                onChange={(e) => setBulkTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBulkTag();
                }}
                autoFocus
              />
            </div>
            {allTags.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Existing tags (click to add)</label>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.slice(0, 20).map(tag => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => {
                        const current = bulkTagInput.split(',').map(t => t.trim()).filter(Boolean);
                        if (!current.includes(tag)) {
                          setBulkTagInput([...current, tag].join(', '));
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setBulkTagDialogOpen(false);
              setBulkTagInput("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleBulkTag} disabled={!bulkTagInput.trim()}>
              Add Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Smart folder dialog */}
      <Dialog open={smartFolderDialogOpen} onOpenChange={setSmartFolderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Save as Smart Folder
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder name</label>
              <Input
                placeholder="My saved search..."
                value={smartFolderName}
                onChange={(e) => setSmartFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateSmartFolder();
                }}
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">This folder will show:</label>
              <div className="flex flex-wrap gap-1.5">
                {filterType && (
                  <Badge variant="secondary">
                    Type: {filterType}
                  </Badge>
                )}
                {filterTags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    Tag: {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setSmartFolderDialogOpen(false);
              setSmartFolderName("");
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateSmartFolder} disabled={!smartFolderName.trim()}>
              Create Smart Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
