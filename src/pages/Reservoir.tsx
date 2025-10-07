import { useState, useEffect, useMemo } from "react";
import { Archive, Search, X, RotateCcw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LibrarySidebar } from "@/components/LibrarySidebar";
import PromptCard from "@/components/PromptCard";
import { OutputCard } from "@/components/OutputCard";
import { MasterContentCard } from "@/components/MasterContentCard";
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

type ContentTab = "prompts" | "outputs" | "masterContent" | "derivatives";

const initialFilters = {
  collection: null as string | null,
  contentType: null as string | null,
  dipWeek: null as number | null,
  quickAccess: null as "favorites" | "recent" | null,
};

const Reservoir = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ContentTab>("prompts");
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [outputs, setOutputs] = useState<any[]>([]);
  const [masterContent, setMasterContent] = useState<any[]>([]);
  const [derivatives, setDerivatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [sidebarFilters, setSidebarFilters] = useState<typeof initialFilters>(initialFilters);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: ContentTab | 'derivative' } | null>(null);

  const getCurrentData = () => {
    switch (activeTab) {
      case "prompts":
        return prompts;
      case "outputs":
        return outputs;
      case "masterContent":
        return masterContent;
      case "derivatives":
        return derivatives;
      default:
        return [];
    }
  };

  const counts = useMemo(() => {
    const calculateCounts = (data: any[]) => {
      const collectionCounts: Record<string, number> = {};
      const contentTypeCounts: Record<string, number> = {};
      const dipWeekCounts: Record<number, number> = {};
      
      data.forEach((item: any) => {
        if (item.collection) {
          collectionCounts[item.collection] = (collectionCounts[item.collection] || 0) + 1;
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

  const handleArchiveItem = async (id: string, type: ContentTab | 'derivative') => {
    try {
      const isCurrentlyArchived = showArchived;
      const table = type === "prompts" ? "prompts" : 
                    type === "outputs" ? "outputs" : 
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
      if (type === "prompts") fetchPrompts();
      if (type === "outputs") fetchOutputs();
      if (type === "masterContent") fetchMasterContent();
      if (type === "derivative") fetchDerivatives();

      toast({
        title: showArchived ? "Restored successfully" : "Archived successfully",
        description: `Your ${type === "masterContent" ? "master content" : type === "derivative" ? "derivative" : type.slice(0, -1)} has been ${showArchived ? "restored" : "archived"}.`,
      });
    } catch (error: any) {
      toast({
        title: showArchived ? "Error restoring" : "Error archiving",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string, type: ContentTab | 'derivative') => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const table = itemToDelete.type === "prompts" ? "prompts" : 
                    itemToDelete.type === "outputs" ? "outputs" : 
                    itemToDelete.type === "derivative" ? "derivative_assets" :
                    "master_content";
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', itemToDelete.id);

      if (error) throw error;

      // Refetch data
      if (itemToDelete.type === "prompts") fetchPrompts();
      if (itemToDelete.type === "outputs") fetchOutputs();
      if (itemToDelete.type === "masterContent") fetchMasterContent();
      if (itemToDelete.type === "derivative") fetchDerivatives();

      toast({
        title: "Deleted successfully",
        description: `Your ${itemToDelete.type === "masterContent" ? "master content" : itemToDelete.type === "derivative" ? "derivative" : itemToDelete.type.slice(0, -1)} has been permanently deleted.`,
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
      filtered = filtered.filter((item: any) => item.collection === sidebarFilters.collection);
    }

    if (sidebarFilters.contentType) {
      filtered = filtered.filter((item: any) => 
        (item.content_type === sidebarFilters.contentType) || 
        (item.asset_type === sidebarFilters.contentType)
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

    return filtered;
  };

  const filteredData = filterData(getCurrentData());
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
                    <SidebarTrigger />
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

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all duration-300 text-base focus:shadow-lg focus:-translate-y-0.5"
                  />
                </div>

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

            {/* Content Area */}
            <div className="max-w-7xl mx-auto px-8 py-8">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ContentTab)}>
                <TabsList className="mb-6">
                  <TabsTrigger value="prompts">Prompts ({counts.prompts.total})</TabsTrigger>
                  <TabsTrigger value="outputs">Outputs ({counts.outputs.total})</TabsTrigger>
                  <TabsTrigger value="masterContent">Master Content ({counts.masterContent.total})</TabsTrigger>
                  <TabsTrigger value="derivatives">Derivatives ({derivatives.length})</TabsTrigger>
                </TabsList>

                {/* Prompts Tab */}
                <TabsContent value="prompts" className="space-y-6">
                  {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredData.map((prompt: any) => (
                        <PromptCard
                          key={prompt.id}
                          prompt={prompt}
                          onArchive={() => handleArchiveItem(prompt.id, "prompts")}
                          onDelete={() => handleDeleteItem(prompt.id, "prompts")}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        {showArchived ? "No archived prompts" : "No prompts found"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {showArchived ? "Archive some prompts to see them here" : "Try adjusting your filters or create new prompts"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Outputs Tab */}
                <TabsContent value="outputs" className="space-y-6">
                  {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredData.map((output: any) => (
                        <OutputCard
                          key={output.id}
                          output={output}
                          onArchive={() => handleArchiveItem(output.id, "outputs")}
                          onDelete={() => handleDeleteItem(output.id, "outputs")}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        {showArchived ? "No archived outputs" : "No outputs found"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {showArchived ? "Archive some outputs to see them here" : "Try adjusting your filters or generate new outputs"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Master Content Tab */}
                <TabsContent value="masterContent" className="space-y-6">
                  {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredData.map((content: any) => (
                        <MasterContentCard
                          key={content.id}
                          content={content}
                          onArchive={() => handleArchiveItem(content.id, "masterContent")}
                          onDelete={() => handleDeleteItem(content.id, "masterContent")}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        {showArchived ? "No archived master content" : "No master content found"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {showArchived ? "Archive some content to see it here" : "Try adjusting your filters or create new master content"}
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* Derivatives Tab */}
                <TabsContent value="derivatives" className="space-y-6">
                  {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredData.map((derivative: any) => (
                        <Card key={derivative.id} className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-border/40">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-serif text-lg mb-2 text-foreground">{derivative.asset_type}</h3>
                                {derivative.master_content && (
                                  <p className="text-sm text-muted-foreground">
                                    From: {derivative.master_content.title}
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm line-clamp-3 text-foreground/80">{derivative.generated_content}</p>
                            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleArchiveItem(derivative.id, "derivative")}
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
                                onClick={() => handleDeleteItem(derivative.id, "derivative")}
                                className="text-xs hover:text-destructive"
                              >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground text-lg">
                        {showArchived ? "No archived derivatives" : "No derivatives found"}
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        {showArchived ? "Archive some derivatives to see them here" : "Create derivatives from master content"}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
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
      </div>
    </SidebarProvider>
  );
};

export default Reservoir;
