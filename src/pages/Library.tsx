import { useState, useMemo } from "react";
import { Plus, Trash2, X, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryFilters } from "@/components/library/LibraryFilters";
import { ContentCard } from "@/components/library/ContentCard";
import { ContentDetailModal } from "@/components/library/ContentDetailModal";
import { ImageSessionCard } from "@/components/library/ImageSessionCard";
import { ImageSessionModal } from "@/components/library/ImageSessionModal";
import { EmptyState } from "@/components/library/EmptyState";
import { SortOption } from "@/components/library/SortDropdown";
import { useLibraryContent, LibraryContentItem } from "@/hooks/useLibraryContent";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ScheduleModal } from "@/components/calendar/ScheduleModal";
import { MadisonSplitEditor } from "@/components/library/MadisonSplitEditor";

export default function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groupBySessions, setGroupBySessions] = useState(false);
  const { data: libraryContent = [], isLoading, refetch } = useLibraryContent(groupBySessions);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContentType, setSelectedContentType] = useState("all");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showArchived, setShowArchived] = useState(false);
  const [selectedContent, setSelectedContent] = useState<LibraryContentItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Session modal state
  const [selectedSession, setSelectedSession] = useState<{
    sessionId: string;
    sessionName: string;
    images: any[];
    archived: boolean;
  } | null>(null);
  
  // Schedule modal states
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [derivativeAssetForSchedule, setDerivativeAssetForSchedule] = useState<any>(null);
  const [masterForSchedule, setMasterForSchedule] = useState<any>(null);

  // Madison split editor state
  const [madisonOpen, setMadisonOpen] = useState(false);
  const [madisonContext, setMadisonContext] = useState<{
    id: string;
    category: "master" | "output" | "derivative";
    initialText: string;
    title?: string;
  } | null>(null);

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

  const handleBulkArchive = async () => {
    if (selectedItems.size === 0) return;

    setIsDeleting(true);
    try {
      const itemsByTable = {
        master_content: [] as string[],
        outputs: [] as string[],
        derivative_assets: [] as string[],
        generated_images: [] as string[]
      };

      selectedItems.forEach(id => {
        const item = libraryContent.find(c => c.id === id);
        if (item) {
          itemsByTable[item.sourceTable as keyof typeof itemsByTable].push(id);
        }
      });

      const updatePromises = [];

      if (itemsByTable.master_content.length > 0) {
        updatePromises.push(
          supabase
            .from('master_content')
            .update({ is_archived: !showArchived, archived_at: !showArchived ? new Date().toISOString() : null })
            .in('id', itemsByTable.master_content)
        );
      }

      if (itemsByTable.outputs.length > 0) {
        updatePromises.push(
          supabase
            .from('outputs')
            .update({ is_archived: !showArchived, archived_at: !showArchived ? new Date().toISOString() : null })
            .in('id', itemsByTable.outputs)
        );
      }

      if (itemsByTable.derivative_assets.length > 0) {
        updatePromises.push(
          supabase
            .from('derivative_assets')
            .update({ is_archived: !showArchived, archived_at: !showArchived ? new Date().toISOString() : null })
            .in('id', itemsByTable.derivative_assets)
        );
      }

      if (itemsByTable.generated_images.length > 0) {
        updatePromises.push(
          supabase
            .from('generated_images')
            .update({ is_archived: !showArchived, archived_at: !showArchived ? new Date().toISOString() : null })
            .in('id', itemsByTable.generated_images)
        );
      }

      await Promise.all(updatePromises);

      toast({
        title: showArchived ? "Items unarchived" : "Items archived",
        description: `Successfully ${showArchived ? 'unarchived' : 'archived'} ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}`,
      });

      setSelectedItems(new Set());
      refetch();
    } catch (error) {
      console.error('Error archiving items:', error);
      toast({
        title: "Archive failed",
        description: "Failed to archive selected items. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    // Check if all selected items are archived
    const selectedContentItems = Array.from(selectedItems).map(id => 
      libraryContent.find(c => c.id === id)
    ).filter(Boolean);

    const hasNonArchivedItems = selectedContentItems.some(item => !item?.archived);

    if (hasNonArchivedItems) {
      toast({
        title: "Cannot delete",
        description: "Only archived items can be deleted. Please archive items first before deleting.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);
    
    const deletionResults = {
      successful: 0,
      failed: 0,
      errors: [] as string[]
    };

    try {
      // Group items by source table
      const itemsByTable = {
        master_content: [] as string[],
        outputs: [] as string[],
        derivative_assets: [] as string[],
        generated_images: [] as string[]
      };

      selectedItems.forEach(id => {
        const item = libraryContent.find(c => c.id === id);
        if (item) {
          itemsByTable[item.sourceTable as keyof typeof itemsByTable].push(id);
        }
      });

      // Delete from each table with CASCADE handling dependencies automatically
      // Order: derivative_assets, master_content, outputs, generated_images
      
      // Delete derivative assets first (they may reference master_content)
      if (itemsByTable.derivative_assets.length > 0) {
        const { error } = await supabase
          .from('derivative_assets')
          .delete()
          .in('id', itemsByTable.derivative_assets);
        
        if (error) {
          console.error('Error deleting derivatives:', error);
          deletionResults.failed += itemsByTable.derivative_assets.length;
          deletionResults.errors.push(`Derivatives: ${error.message}`);
        } else {
          deletionResults.successful += itemsByTable.derivative_assets.length;
        }
      }

      // Delete master content (CASCADE will handle related derivatives and scheduled content)
      if (itemsByTable.master_content.length > 0) {
        const { error } = await supabase
          .from('master_content')
          .delete()
          .in('id', itemsByTable.master_content);
        
        if (error) {
          console.error('Error deleting master content:', error);
          deletionResults.failed += itemsByTable.master_content.length;
          deletionResults.errors.push(`Master content: ${error.message}`);
        } else {
          deletionResults.successful += itemsByTable.master_content.length;
        }
      }

      // Delete outputs
      if (itemsByTable.outputs.length > 0) {
        const { error } = await supabase
          .from('outputs')
          .delete()
          .in('id', itemsByTable.outputs);
        
        if (error) {
          console.error('Error deleting outputs:', error);
          deletionResults.failed += itemsByTable.outputs.length;
          deletionResults.errors.push(`Outputs: ${error.message}`);
        } else {
          deletionResults.successful += itemsByTable.outputs.length;
        }
      }

      // Delete generated images
      if (itemsByTable.generated_images.length > 0) {
        const { error } = await supabase
          .from('generated_images')
          .delete()
          .in('id', itemsByTable.generated_images);
        
        if (error) {
          console.error('Error deleting images:', error);
          deletionResults.failed += itemsByTable.generated_images.length;
          deletionResults.errors.push(`Images: ${error.message}`);
        } else {
          deletionResults.successful += itemsByTable.generated_images.length;
        }
      }

      // Show results to user
      if (deletionResults.failed === 0) {
        toast({
          title: "Deletion successful",
          description: `Successfully deleted ${deletionResults.successful} item${deletionResults.successful > 1 ? 's' : ''}`,
        });
      } else if (deletionResults.successful > 0) {
        toast({
          title: "Partial deletion",
          description: `Deleted ${deletionResults.successful} items. ${deletionResults.failed} failed: ${deletionResults.errors.join('; ')}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Deletion failed",
          description: `All deletions failed: ${deletionResults.errors.join('; ')}`,
          variant: "destructive"
        });
      }

      setSelectedItems(new Set());
      refetch();
    } catch (error) {
      console.error('Critical error during deletion:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
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
              <p className="text-muted-foreground">Your editorial repository</p>
            </div>
            <Button
              onClick={() => navigate("/create")}
              variant="brassGradient"
              size="lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Content
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center justify-between gap-4">
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
            
            {/* Group by Sessions Toggle */}
            <Button
              variant={groupBySessions ? "brass" : "outline"}
              size="sm"
              onClick={() => setGroupBySessions(!groupBySessions)}
              className="flex-shrink-0"
            >
              {groupBySessions ? "Showing Sessions" : "Group by Session"}
            </Button>
          </div>
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
                      variant="outline"
                      size="sm"
                      onClick={handleBulkArchive}
                      disabled={isDeleting}
                      className="gap-2"
                    >
                      <Archive className="w-4 h-4" />
                      {isDeleting ? 'Processing...' : `${showArchived ? 'Unarchive' : 'Archive'} ${selectedItems.size} item${selectedItems.size > 1 ? 's' : ''}`}
                    </Button>
                    {showArchived && (
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
                    )}
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
            {filteredContent.map((content) => {
              // Render session card for grouped image sessions
              if (groupBySessions && content.contentType === "image-session") {
                return (
                  <ImageSessionCard
                    key={content.id}
                    sessionId={content.id}
                    sessionName={content.title}
                    heroImageUrl={content.imageUrl || content.content}
                    imageCount={content.wordCount || 0}
                    createdAt={content.createdAt}
                    archived={content.archived}
                    onClick={async () => {
                      // Fetch all images for this session
                      const { data: images } = await supabase
                        .from('generated_images')
                        .select('*')
                        .eq('session_id', content.id)
                        .order('image_order', { ascending: true });
                      
                      if (images) {
                        setSelectedSession({
                          sessionId: content.id,
                          sessionName: content.title,
                          images: images.map(img => ({
                            id: img.id,
                            imageUrl: img.image_url,
                            finalPrompt: img.final_prompt,
                            createdAt: new Date(img.created_at),
                            isHero: img.is_hero_image || false
                          })),
                          archived: content.archived
                        });
                      }
                    }}
                  />
                );
              }
              
              // Render regular content card
              return (
                <ContentCard
                  key={content.id}
                  content={content}
                  onClick={() => setSelectedContent(content)}
                  viewMode={viewMode}
                  selectable={true}
                  selected={selectedItems.has(content.id)}
                  onToggleSelect={() => handleToggleSelection(content.id)}
                  onArchive={async () => {
                    try {
                      const table = content.sourceTable;
                      const { error } = await supabase
                        .from(table)
                        .update({ 
                          is_archived: !content.archived,
                          archived_at: !content.archived ? new Date().toISOString() : null
                        })
                        .eq('id', content.id);

                      if (error) throw error;

                      toast({
                        title: content.archived ? "Item unarchived" : "Item archived",
                        description: `Successfully ${content.archived ? 'unarchived' : 'archived'} "${content.title}"`,
                      });

                      refetch();
                    } catch (error) {
                      console.error('Error archiving item:', error);
                      toast({
                        title: "Archive failed",
                        description: "Failed to archive item. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}
                />
              );
            })}
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
            asset_type: selectedContent.contentType,
            full_content: selectedContent.content,
            generated_content: selectedContent.content,
            created_at: selectedContent.createdAt.toISOString(),
            word_count: selectedContent.wordCount,
            quality_rating: selectedContent.rating,
            collection: selectedContent.collection,
            organization_id: selectedContent.sourceTable,
          }}
          category={selectedContent.sourceTable === "master_content" ? "master" : selectedContent.sourceTable === "outputs" ? "output" : "derivative"}
          onUpdate={() => {
            refetch();
            setSelectedContent(null);
          }}
          onRepurpose={(id) => {
            navigate(`/multiply?id=${id}`);
          }}
          onSchedule={async (content, category) => {
            setSelectedContent(null);
            
            if (category === "derivative") {
              // Fetch derivative asset with master content
              const { data: derivative } = await supabase
                .from('derivative_assets')
                .select('*, master_content(id, title, full_content)')
                .eq('id', content.id)
                .single();
              
              if (derivative) {
                setDerivativeAssetForSchedule(derivative);
                setMasterForSchedule(derivative.master_content);
                setScheduleOpen(true);
              }
            } else if (category === "master") {
              // Fetch master content
              const { data: master } = await supabase
                .from('master_content')
                .select('*')
                .eq('id', content.id)
                .single();
              
              if (master) {
                setMasterForSchedule(master);
                setDerivativeAssetForSchedule(null);
                setScheduleOpen(true);
              }
            } else {
              // For outputs, treat as generic content
              setMasterForSchedule({
                id: content.id,
                title: content.title,
                full_content: content.generated_content,
              });
              setDerivativeAssetForSchedule(null);
              setScheduleOpen(true);
            }
          }}
        />
      )}

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        derivativeAsset={derivativeAssetForSchedule}
        masterContent={masterForSchedule}
        onSuccess={() => {
          setScheduleOpen(false);
          setDerivativeAssetForSchedule(null);
          setMasterForSchedule(null);
          refetch();
        }}
      />

      {/* Madison Split Editor */}
      {madisonContext && (
        <MadisonSplitEditor
          open={madisonOpen}
          title={madisonContext.title}
          initialContent={madisonContext.initialText}
          onSave={async (newContent) => {
            try {
              const table = madisonContext.category === 'master' 
                ? 'master_content' 
                : madisonContext.category === 'derivative'
                ? 'derivative_assets'
                : 'outputs';
              
              const field = madisonContext.category === 'master' 
                ? 'full_content' 
                : 'generated_content';

              const { error } = await supabase
                .from(table)
                .update({ [field]: newContent })
                .eq('id', madisonContext.id);

              if (error) throw error;

              toast({
                title: "Content saved",
                description: "Your changes have been saved successfully.",
              });
              
              setMadisonOpen(false);
              setMadisonContext(null);
              refetch();
            } catch (error: any) {
              toast({
                title: "Save failed",
                description: error.message,
                variant: "destructive",
              });
            }
          }}
          onClose={() => {
            setMadisonOpen(false);
            setMadisonContext(null);
          }}
        />
      )}
      
      {/* Image Session Modal */}
      {selectedSession && (
        <ImageSessionModal
          sessionId={selectedSession.sessionId}
          sessionName={selectedSession.sessionName}
          images={selectedSession.images}
          archived={selectedSession.archived}
          open={!!selectedSession}
          onClose={() => setSelectedSession(null)}
          onUpdate={() => {
            refetch();
            setSelectedSession(null);
          }}
        />
      )}
    </div>
  );
}
