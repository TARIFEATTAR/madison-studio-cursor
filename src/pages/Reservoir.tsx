import { useState, useEffect, useMemo, useRef } from "react";
import { Archive, Search, X, RotateCcw, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LibrarySidebar } from "@/components/LibrarySidebar";
import PromptCard from "@/components/PromptCard";
import { OutputCard } from "@/components/OutputCard";
import { MasterContentCard } from "@/components/MasterContentCard";
import { ContentDetailModal } from "@/components/library/ContentDetailModal";
import { ViewDensityToggle, ViewMode } from "@/components/library/ViewDensityToggle";
import { SortDropdown, SortOption } from "@/components/library/SortDropdown";
import { DateGroupHeader } from "@/components/library/DateGroupHeader";
import { EmptyState } from "@/components/library/EmptyState";
import { ContentGrid } from "@/components/library/ContentGrid";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { groupByDate, DateGroup } from "@/utils/dateGrouping";
import { useProducts } from "@/hooks/useProducts";
import { contentTypeMapping } from "@/utils/contentTypeMapping";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ContentCategory = "prompt" | "output" | "master" | "derivative";

const initialFilters = {
  collection: null as string | null,
  contentType: null as string | null,
  dipWeek: null as number | null,
  quickAccess: null as "favorites" | "recent" | null,
  scentFamily: null as string | null,
};

const Reservoir = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [outputs, setOutputs] = useState<any[]>([]);
  const [masterContent, setMasterContent] = useState<any[]>([]);
  const [derivatives, setDerivatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<typeof initialFilters>(initialFilters);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: ContentCategory } | null>(null);
  
  // Content detail modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);
  
  // New state for ADHD-friendly features
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('libraryViewMode') as ViewMode) || 'gallery';
  });
  const [sortOption, setSortOption] = useState<SortOption>(() => {
    const saved = localStorage.getItem('librarySortOption');
    return (saved as SortOption) || 'recent';
  });
  const [groupByDateEnabled, setGroupByDateEnabled] = useState(false); // Disabled by default since we group by content type
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Combine all content into one unified array with category tags
  const getAllContent = () => {
    return [
      ...prompts.map(p => ({ ...p, contentCategory: 'prompt' as ContentCategory })),
      ...outputs.map(o => ({ ...o, contentCategory: 'output' as ContentCategory })),
      ...masterContent.map(m => ({ ...m, contentCategory: 'master' as ContentCategory })),
      ...derivatives.map(d => ({ ...d, contentCategory: 'derivative' as ContentCategory }))
    ];
  };

  const counts = useMemo(() => {
    const calculateCounts = (data: any[]) => {
      const collectionCounts: Record<string, number> = {};
      const contentTypeCounts: Record<string, number> = {};
      const dipWeekCounts: Record<number, number> = {};
      
      data.forEach((item: any) => {
        // Normalize collection name to lowercase with underscores
        if (item.collection) {
          const normalizedCollection = item.collection.toLowerCase().replace(/\s+/g, '_').replace(/_collection$/, '');
          collectionCounts[normalizedCollection] = (collectionCounts[normalizedCollection] || 0) + 1;
        }
        
        const contentType = item.content_type || item.asset_type;
        if (contentType) {
          contentTypeCounts[contentType] = (contentTypeCounts[contentType] || 0) + 1;
        }
        
        if (item.dip_week) {
          dipWeekCounts[item.dip_week] = (dipWeekCounts[item.dip_week] || 0) + 1;
        }
      });

      return { byCollection: collectionCounts, byContentType: contentTypeCounts, byDipWeek: dipWeekCounts };
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const allData = [...prompts, ...outputs, ...masterContent, ...derivatives];
    const recentCount = allData.filter((item: any) => 
      new Date(item.created_at) > sevenDaysAgo
    ).length;

    const favoritesCount = allData.filter((item: any) => 
      item.is_favorite === true
    ).length;

    return {
      prompts: { total: prompts.length, ...calculateCounts(prompts) },
      outputs: { total: outputs.length, ...calculateCounts(outputs) },
      masterContent: { total: masterContent.length, ...calculateCounts(masterContent) },
      derivatives: { total: derivatives.length, ...calculateCounts(derivatives) },
      favorites: favoritesCount,
      recent: recentCount,
    };
  }, [prompts, outputs, masterContent, derivatives]);

  useEffect(() => {
    if (user) {
      fetchPrompts();
      fetchOutputs();
      fetchMasterContent();
      fetchDerivatives();
    }
  }, [user, showArchived]);

  const fetchDerivatives = async () => {
    try {
      const { data, error } = await supabase
        .from('derivative_assets')
        .select('*, master_content(title)')
        .eq('created_by', user?.id)
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDerivatives(data || []);
    } catch (error) {
      console.error('Error fetching derivatives:', error);
      toast({
        title: "Error loading derivatives",
        description: "Failed to fetch derivative assets.",
        variant: "destructive",
      });
    }
  };

  const fetchPrompts = async () => {
    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('created_by', user?.id)
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast({
        title: "Error loading prompts",
        description: "Failed to fetch prompts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputs = async () => {
    try {
      const { data, error } = await supabase
        .from('outputs')
        .select('*, prompts(title)')
        .eq('created_by', user?.id)
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutputs(data || []);
    } catch (error) {
      console.error('Error fetching outputs:', error);
      toast({
        title: "Error loading outputs",
        description: "Failed to fetch outputs.",
        variant: "destructive",
      });
    }
  };

  const fetchMasterContent = async () => {
    try {
      const { data, error} = await supabase
        .from('master_content')
        .select('*')
        .eq('created_by', user?.id)
        .eq('is_archived', showArchived)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMasterContent(data || []);
    } catch (error) {
      console.error('Error fetching master content:', error);
      toast({
        title: "Error loading master content",
        description: "Failed to fetch master content.",
        variant: "destructive",
      });
    }
  };

  const handleArchiveItem = async (id: string, type: ContentCategory) => {
    try {
      const isCurrentlyArchived = showArchived;
      const table = type === "prompt" ? "prompts" : 
                    type === "output" ? "outputs" : 
                    type === "derivative" ? "derivative_assets" :
                    "master_content";
      
      const { error } = await supabase
        .from(table)
        .update({ 
          is_archived: !isCurrentlyArchived, 
          archived_at: isCurrentlyArchived ? null : new Date().toISOString() 
        })
        .eq('id', id);

      if (error) throw error;

      // Refetch data
      if (type === "prompt") fetchPrompts();
      if (type === "output") fetchOutputs();
      if (type === "master") fetchMasterContent();
      if (type === "derivative") fetchDerivatives();

      toast({
        title: showArchived ? "Restored successfully" : "Archived successfully",
        description: `Your ${type === "master" ? "master content" : type} has been ${showArchived ? "restored" : "archived"}.`,
      });
    } catch (error: any) {
      toast({
        title: showArchived ? "Error restoring" : "Error archiving",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string, type: ContentCategory) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const table = itemToDelete.type === "prompt" ? "prompts" : 
                    itemToDelete.type === "output" ? "outputs" : 
                    itemToDelete.type === "derivative" ? "derivative_assets" :
                    "master_content";
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // Refetch data
      if (itemToDelete.type === "prompt") fetchPrompts();
      if (itemToDelete.type === "output") fetchOutputs();
      if (itemToDelete.type === "master") fetchMasterContent();
      if (itemToDelete.type === "derivative") fetchDerivatives();

      toast({
        title: "Deleted successfully",
        description: `Your ${itemToDelete.type === "master" ? "master content" : itemToDelete.type} has been permanently deleted.`,
      });
    } catch (error: any) {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleContentClick = (content: any, category: ContentCategory) => {
    setSelectedContent(content);
    setSelectedCategory(category);
    setDetailModalOpen(true);
  };

  const handleRepurpose = (contentId: string) => {
    navigate(`/multiply?id=${contentId}`);
  };

  const refetchData = () => {
    fetchPrompts();
    fetchOutputs();
    fetchMasterContent();
    fetchDerivatives();
  };

  const handleFilterChange = (filters: typeof sidebarFilters) => {
    setSidebarFilters(filters);
  };

  const clearAllFilters = () => {
    setSidebarFilters(initialFilters);
    setSearchQuery("");
  };

  const getActiveFilterChips = () => {
    const chips = [];
    if (sidebarFilters.collection) {
      chips.push({ key: 'collection', label: `Collection: ${sidebarFilters.collection}` });
    }
    if (sidebarFilters.contentType) {
      chips.push({ key: 'contentType', label: `Type: ${sidebarFilters.contentType}` });
    }
    if (sidebarFilters.dipWeek) {
      chips.push({ key: 'dipWeek', label: `Week: ${sidebarFilters.dipWeek}` });
    }
    if (sidebarFilters.quickAccess) {
      chips.push({ key: 'quickAccess', label: sidebarFilters.quickAccess === 'favorites' ? 'Favorites' : 'Recent' });
    }
    return chips;
  };

  const removeFilter = (key: string) => {
    setSidebarFilters(prev => ({
      ...prev,
      [key]: null
    }));
  };

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('libraryViewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('librarySortOption', sortOption);
  }, [sortOption]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSearchFocus: () => searchInputRef.current?.focus(),
    onEscape: () => {
      setSearchQuery("");
      setSidebarFilters(initialFilters);
    },
  });

  const sortData = (data: any[]) => {
    const sorted = [...data];
    
    switch (sortOption) {
      case "recent":
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "alphabetical":
        return sorted.sort((a, b) => {
          const aTitle = a.title || a.full_content?.substring(0, 50) || "";
          const bTitle = b.title || b.full_content?.substring(0, 50) || "";
          return aTitle.localeCompare(bTitle);
        });
      case "mostUsed":
        return sorted.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));
      default:
        return sorted;
    }
  };

  const filterData = (data: any[]) => {
    let filtered = [...data];

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter((item: any) => {
        const searchFields = [
          item.title,
          item.prompt_text,
          item.generated_content,
          item.full_content,
          item.content_type,
          item.asset_type,
          item.collection,
        ];
        return searchFields.some(field => 
          field?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    // Apply filters
    if (sidebarFilters.collection) {
      filtered = filtered.filter((item: any) => {
        // Normalize both the item's collection and the filter for comparison
        const itemCollection = item.collection?.toLowerCase().replace(/\s+/g, '_').replace(/_collection$/, '');
        const filterCollection = sidebarFilters.collection?.toLowerCase().replace(/\s+/g, '_');
        
        if (itemCollection !== filterCollection) return false;
        
        // If a scent family is selected, filter by products in that scent family
        if (sidebarFilters.scentFamily) {
          const productsInFamily = products.filter(p => 
            p.collection?.toLowerCase().replace(/\s+/g, '_') === sidebarFilters.collection &&
            p.scentFamily === sidebarFilters.scentFamily
          );
          // Check if the item references any product in this scent family
          // This is a placeholder - adjust based on how items reference products
          return true; // For now, keep all items from the collection
        }
        
        return true;
      });
    }

    if (sidebarFilters.contentType) {
      // Support multi-key content type matching
      const matchingMapping = contentTypeMapping.find(m => m.keys.includes(sidebarFilters.contentType!));
      const keysToMatch = matchingMapping?.keys || [sidebarFilters.contentType];
      
      filtered = filtered.filter((item: any) => 
        keysToMatch.includes(item.content_type) || 
        keysToMatch.includes(item.asset_type)
      );
    }

    if (sidebarFilters.dipWeek) {
      filtered = filtered.filter((item: any) => item.dip_week === sidebarFilters.dipWeek);
    }

    if (sidebarFilters.quickAccess === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filtered = filtered.filter((item: any) => new Date(item.created_at) > sevenDaysAgo);
    }

    if (sidebarFilters.quickAccess === 'favorites') {
      filtered = filtered.filter((item: any) => item.is_favorite === true);
    }

    return sortData(filtered);
  };

  const filteredData = filterData(getAllContent());
  
  // Group by content type for visual separators
  const contentByType = useMemo(() => {
    const grouped = new Map<string, any[]>();
    
    filteredData.forEach(item => {
      const contentType = item.content_type || item.asset_type || 'other';
      const categoryLabel = contentTypeMapping.find(m => m.keys.includes(contentType))?.name || 'Other';
      
      if (!grouped.has(categoryLabel)) {
        grouped.set(categoryLabel, []);
      }
      grouped.get(categoryLabel)!.push(item);
    });
    
    return grouped;
  }, [filteredData]);
  
  const activeFilters = getActiveFilterChips();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-lg">Loading your library...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <LibrarySidebar
          onFilterChange={handleFilterChange}
          activeFilters={sidebarFilters}
          counts={counts}
        />

        <div className="flex-1 flex flex-col min-h-screen">
          <div className="flex-1 overflow-auto">
            {/* Header with Search and Status Toggle */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/40 px-8 py-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div>
                      <h1 className="text-foreground mb-2">Library</h1>
                      <p className="text-muted-foreground text-lg">
                        {showArchived ? "Archived content" : "Active content vault"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Status Toggle */}
                  <div className="flex items-center gap-2 bg-card/50 backdrop-blur-sm rounded-lg p-1 border border-border/40">
                    <Button
                      variant={!showArchived ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowArchived(false)}
                      className="px-4 transition-all duration-300"
                    >
                      Active
                    </Button>
                    <Button
                      variant={showArchived ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setShowArchived(true)}
                      className="px-4 transition-all duration-300"
                    >
                      Archived
                    </Button>
                  </div>
                </div>

                {/* Search Bar with View Controls */}
                <div className="flex gap-3 items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search library... (Press / to focus)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all duration-300 text-base focus:shadow-lg focus:-translate-y-0.5"
                    />
                  </div>
                  <ViewDensityToggle viewMode={viewMode} onChange={setViewMode} />
                  <SortDropdown value={sortOption} onChange={setSortOption} />
                </div>

                {/* Result Count */}
                {(searchQuery || activeFilters.length > 0) && (
                  <div className="text-sm text-muted-foreground mt-2">
                    {filteredData.length} {filteredData.length === 1 ? 'result' : 'results'} found
                  </div>
                )}

                {/* Active Filters */}
                {activeFilters.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap mt-4">
                    <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
                    {activeFilters.map((filter) => (
                      <Badge
                        key={filter.key}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
                        onClick={() => removeFilter(filter.key)}
                      >
                        {filter.label}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-xs"
                    >
                      Clear all
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Content Area - Unified Grid Sorted by Content Type */}
            <div className="max-w-7xl mx-auto px-8 py-8">
              {filteredData.length > 0 ? (
                <div className="space-y-12">
                  {Array.from(contentByType.entries()).map(([categoryName, items]) => (
                    <div key={categoryName} className="space-y-4">
                      {/* Visual Separator with Content Type Header */}
                      <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider px-4">
                          {categoryName}
                        </h2>
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border/60 to-transparent" />
                      </div>
                      
                      {/* Content Grid for this type */}
                      <ContentGrid viewMode={viewMode}>
                        {items.map((item: any) => {
                          if (item.contentCategory === 'prompt') {
                            return (
                              <PromptCard
                                key={item.id}
                                prompt={item}
                                onArchive={() => handleArchiveItem(item.id, "prompt")}
                                onDelete={() => handleDeleteItem(item.id, "prompt")}
                                onClick={() => handleContentClick(item, "prompt")}
                              />
                            );
                          } else if (item.contentCategory === 'output') {
                            return (
                              <OutputCard
                                key={item.id}
                                output={item}
                                onArchive={() => handleArchiveItem(item.id, "output")}
                                onDelete={() => handleDeleteItem(item.id, "output")}
                                onClick={() => handleContentClick(item, "output")}
                              />
                            );
                          } else if (item.contentCategory === 'master') {
                            return (
                              <MasterContentCard
                                key={item.id}
                                content={item}
                                onArchive={() => handleArchiveItem(item.id, "master")}
                                onDelete={() => handleDeleteItem(item.id, "master")}
                                onClick={() => handleContentClick(item, "master")}
                              />
                            );
                          } else if (item.contentCategory === 'derivative') {
                            return (
                              <Card 
                                key={item.id} 
                                className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border/40 relative group"
                                onClick={() => handleContentClick(item, "derivative")}
                              >
                                {/* Two-Tier Badge System */}
                                <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                                  <Badge variant="outline" className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600">
                                    {item.asset_type || 'Derivative'}
                                  </Badge>
                                  <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/40 text-xs">
                                    Derivative
                                  </Badge>
                                </div>
                                
                                <div className="space-y-3 mt-8">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h3 className="font-serif text-lg mb-2 text-foreground">{item.asset_type}</h3>
                                      {item.master_content && (
                                        <p className="text-sm text-muted-foreground">
                                          From: {item.master_content.title}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <p className="text-sm line-clamp-3 text-foreground/80">{item.generated_content}</p>
                                  <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleArchiveItem(item.id, "derivative");
                                      }}
                                      className="text-xs"
                                    >
                                      {showArchived ? (
                                        <>
                                          <RotateCcw className="w-3 h-3 mr-1" />
                                          Restore
                                        </>
                                      ) : (
                                        <>
                                          <Archive className="w-3 h-3 mr-1" />
                                          Archive
                                        </>
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteItem(item.id, "derivative");
                                      }}
                                      className="text-xs hover:text-destructive"
                                    >
                                      <Trash2 className="w-3 h-3 mr-1" />
                                      Delete
                                    </Button>
                                  </div>
                                </div>
                              </Card>
                            );
                          }
                          return null;
                        })}
                      </ContentGrid>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  hasSearch={!!searchQuery}
                  hasFilters={activeFilters.length > 0}
                  onClearFilters={clearAllFilters}
                  contentType="content"
                />
              )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this item.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Content Detail Modal */}
        {selectedContent && selectedCategory && (
          <ContentDetailModal
            open={detailModalOpen}
            onOpenChange={setDetailModalOpen}
            content={selectedContent}
            category={selectedCategory}
            onUpdate={refetchData}
            onRepurpose={handleRepurpose}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default Reservoir;
