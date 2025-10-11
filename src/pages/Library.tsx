import { useState, useMemo } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { ContentDetailModal } from "@/components/library/ContentDetailModal";
import { EmptyState } from "@/components/library/EmptyState";
import { SortOption } from "@/components/library/SortDropdown";
import { useLibraryContent, LibraryContentItem } from "@/hooks/useLibraryContent";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: libraryContent = [], isLoading, refetch } = useLibraryContent();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LibraryContentItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtering and sorting logic
  const filteredContent = useMemo(() => {
    let filtered = [...libraryContent];

    // Filter by archived status
    filtered = filtered.filter(c => showArchived ? c.archived : !c.archived);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        (c.content && c.content.toLowerCase().includes(query))
      );
    }

    // Filter by content type
    if (selectedContentType !== "all") {
      filtered = filtered.filter(c => c.contentType === selectedContentType);
    }

    // Filter by collection
    if (selectedCollection !== "all") {
      filtered = filtered.filter(c => c.collection === selectedCollection);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "dipWeek":
          return (b.dipWeek || 0) - (a.dipWeek || 0);
        case "mostUsed":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [libraryContent, searchQuery, selectedContentType, selectedCollection, sortBy, showArchived]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedContentType("all");
    setSelectedCollection("all");
    setShowArchived(false);
  };

  const handleToggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredContent.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredContent.map(c => c.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    setIsDeleting(true);
    try {
      // Group items by source table
      const itemsByTable = {
        master_content: [] as string[],
        outputs: [] as string[],
        derivative_assets: [] as string[]
      };

      selectedItems.forEach(id => {
        const item = libraryContent.find(c => c.id === id);
        if (item) {
          itemsByTable[item.sourceTable as keyof typeof itemsByTable].push(id);
        }
      });

      // Delete from each table
      const deletePromises = [];

      if (itemsByTable.master_content.length > 0) {
        deletePromises.push(
          supabase
            .from('master_content')
            .delete()
            .in('id', itemsByTable.master_content)
        );
      }

      if (itemsByTable.outputs.length > 0) {
        deletePromises.push(
          supabase
            .from('outputs')
            .delete()
            .in('id', itemsByTable.outputs)
        );
      }

      if (itemsByTable.derivative_assets.length > 0) {
        deletePromises.push(
          supabase
            .from('derivative_assets')
            .delete()
            .in('id', itemsByTable.derivative_assets)
        );
      }

      await Promise.all(deletePromises);

      toast({
        title: "Items deleted",
        description: `Successfully deleted ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}`,
      });

      setSelectedItems(new Set());
      refetch();
    } catch (error) {
      console.error('Error deleting items:', error);
      toast({
        title: "Delete failed",
        description: "Failed to delete selected items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters = !!searchQuery || selectedContentType !== "all" || selectedCollection !== "all";

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div 
        className="border-b border-border/20 bg-card/30 backdrop-blur-sm sticky top-0 z-10"
        style={{
          backgroundImage: `
            repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
            repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px)
          `
        }}
      >
        <div className="container mx-auto px-6 py-8 space-y-6">
          {/* Title Row */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="font-serif text-4xl text-foreground mb-2">The Archives</h1>
              <p className="text-muted-foreground">Your content library and repository</p>
            </div>
            <Button
              onClick={() => navigate("/create")}
              className="bg-gradient-to-r from-brass to-brass-dark text-foreground hover:opacity-90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Content
            </Button>
          </div>

          {/* Filters */}
          <LibraryFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedContentType={selectedContentType}
            onContentTypeChange={setSelectedContentType}
            selectedCollection={selectedCollection}
            onCollectionChange={setSelectedCollection}
            sortBy={sortBy}
            onSortChange={setSortBy}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            showArchived={showArchived}
            onShowArchivedChange={setShowArchived}
          />
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading your content...</div>
          </div>
        ) : (
          <>
            {/* Bulk Actions Toolbar - Always available when there's content */}
            {filteredContent.length > 0 && (
              <div className="mb-6 flex items-center justify-between gap-4 p-4 bg-card/80 backdrop-blur-sm border border-border/40 rounded-lg">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === filteredContent.length && filteredContent.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-border text-brass focus:ring-brass"
                    />
                    <span className="text-sm text-muted-foreground">
                      {selectedItems.size > 0 
                        ? `${selectedItems.size} selected` 
                        : 'Select all'}
                    </span>
                  </label>
                </div>

                {selectedItems.size > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedItems(new Set())}
                      className="gap-2"
                    >
                      <X className="w-4 h-4" />
                      Clear
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Deleting...' : `Delete ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}`}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Result Count */}
            {filteredContent.length > 0 && (
              <p className="text-sm text-muted-foreground mb-6">
                {filteredContent.length} {filteredContent.length === 1 ? "piece" : "pieces"} of content
              </p>
            )}

            {/* Content Display */}
            {filteredContent.length === 0 ? (
          <EmptyState
            hasSearch={!!searchQuery}
            hasFilters={hasFilters}
            onClearFilters={handleClearFilters}
            contentType="content"
          />
        ) : (
          <div
            className={cn(
              "grid gap-6 transition-all duration-300",
              viewMode === "grid" && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
              viewMode === "list" && "grid-cols-1"
            )}
          >
            {filteredContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={() => setSelectedContent(content)}
                viewMode={viewMode}
                selectable={true}
                selected={selectedItems.has(content.id)}
                onToggleSelect={() => handleToggleSelection(content.id)}
              />
            ))}
          </div>
        )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContent && (
        <ContentDetailModal
          open={!!selectedContent}
          onOpenChange={(open) => !open && setSelectedContent(null)}
          content={{
            id: selectedContent.id,
            title: selectedContent.title,
            content_type: selectedContent.contentType,
            full_content: selectedContent.content,
            generated_content: selectedContent.content,
            created_at: selectedContent.createdAt.toISOString(),
            word_count: selectedContent.wordCount,
            dip_week: selectedContent.dipWeek,
            quality_rating: selectedContent.rating,
            collection: selectedContent.collection,
          }}
          category={selectedContent.sourceTable === "master_content" ? "master" : selectedContent.sourceTable === "outputs" ? "output" : "derivative"}
          onUpdate={() => {
            refetch();
            setSelectedContent(null);
          }}
          onRepurpose={(id) => {
            navigate(`/repurpose?content=${id}`);
          }}
        />
      )}
    </div>
  );
}
