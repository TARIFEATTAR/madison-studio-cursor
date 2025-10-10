import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { ContentDetailModal } from "@/components/library/ContentDetailModal";
import { EmptyState } from "@/components/library/EmptyState";
import { SortOption } from "@/components/library/SortDropdown";
import { mockLibraryContent, LibraryContent } from "@/data/mockLibraryContent";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

export default function Library() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LibraryContent | null>(null);

  // Filtering and sorting logic
  const filteredContent = useMemo(() => {
    let filtered = [...mockLibraryContent];

    // Filter by archived status
    filtered = filtered.filter(c => showArchived ? c.archived : !c.archived);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.content.toLowerCase().includes(query)
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
  }, [searchQuery, selectedContentType, selectedCollection, sortBy, showArchived]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedContentType("all");
    setSelectedCollection("all");
    setShowArchived(false);
  };

  const hasFilters = searchQuery || selectedContentType !== "all" || selectedCollection !== "all";

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
              onClick={() => navigate("/forge")}
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
              />
            ))}
          </div>
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
          category="output"
          onUpdate={() => {
            // Refresh would happen here with real data
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
