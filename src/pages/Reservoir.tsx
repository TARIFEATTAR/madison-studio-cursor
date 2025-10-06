import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Edit, FileText, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LibrarySidebar } from "@/components/LibrarySidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromptCard from "@/components/PromptCard";
import { OutputCard } from "@/components/OutputCard";
import { MasterContentCard } from "@/components/MasterContentCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

type ContentTab = 'prompts' | 'outputs' | 'master';

const Reservoir = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ContentTab>('prompts');
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [outputs, setOutputs] = useState<any[]>([]);
  const [masterContent, setMasterContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedCount, setArchivedCount] = useState(0);
  const [sidebarFilters, setSidebarFilters] = useState<{
    collection?: string;
    scentFamily?: string;
    contentType?: string;
    dipWeek?: number;
    quickFilter?: string;
  }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: ContentTab } | null>(null);
  
  // Get current data array based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'prompts': return prompts;
      case 'outputs': return outputs;
      case 'master': return masterContent;
    }
  };

  // Calculate dynamic counts from current tab data
  const counts = useMemo(() => {
    const currentData = getCurrentData();
    
    const byCollection: Record<string, { total: number; families: Record<string, number> }> = {
      cadence: { total: 0, families: { warm: 0, floral: 0, fresh: 0, woody: 0 } },
      reserve: { total: 0, families: { warm: 0, floral: 0, fresh: 0, woody: 0 } },
      purity: { total: 0, families: { warm: 0, floral: 0, fresh: 0, woody: 0 } },
      sacred_space: { total: 0, families: { warm: 0, floral: 0, fresh: 0, woody: 0 } },
    };
    
    const byContentType: Record<string, number> = {};
    const byDipWeek: Record<number, number> = {};
    let favorites = 0;
    let recent = 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    currentData.forEach(item => {
      // Handle different data structures
      const collection = item.collection || (item.prompts && item.prompts[0]?.collection) || 'cadence';
      const contentType = item.content_type || (item.prompts && item.prompts[0]?.content_type) || 'other';
      const scentFamily = item.scent_family || 'warm';
      const dipWeek = item.dip_week;
      
      // Count by collection and scent family
      if (byCollection[collection]) {
        byCollection[collection].total++;
        if (byCollection[collection].families[scentFamily] !== undefined) {
          byCollection[collection].families[scentFamily]++;
        }
      }
      
      // Count by content type
      byContentType[contentType] = (byContentType[contentType] || 0) + 1;
      
      // Count by DIP week
      if (dipWeek) {
        byDipWeek[dipWeek] = (byDipWeek[dipWeek] || 0) + 1;
      }
      
      // Count recent (last 7 days)
      if (item.created_at && new Date(item.created_at) > sevenDaysAgo) {
        recent++;
      }
    });
    
    return {
      byCollection,
      byContentType,
      byDipWeek,
      favorites,
      recent,
      archived: archivedCount,
    };
  }, [activeTab, prompts, outputs, masterContent, archivedCount]);

  useEffect(() => {
    if (user) {
      fetchPrompts();
      fetchOutputs();
      fetchMasterContent();
      fetchArchivedCount();
    }
  }, [user]);

  const fetchArchivedCount = async () => {
    if (!user) return;
    
    try {
      const { count, error } = await supabase
        .from("prompts")
        .select("*", { count: 'exact', head: true })
        .eq("created_by", user.id)
        .eq("is_archived", true);

      if (error) throw error;
      setArchivedCount(count || 0);
    } catch (error) {
      console.error("Error fetching archived count:", error);
    }
  };

  const fetchPrompts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrompts(data || []);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchOutputs = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("outputs")
        .select(`
          *,
          prompts(title, collection, content_type)
        `)
        .eq("created_by", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOutputs(data || []);
    } catch (error) {
      console.error("Error fetching outputs:", error);
      toast({
        title: "Error",
        description: "Failed to load outputs",
        variant: "destructive",
      });
    }
  };

  const fetchMasterContent = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from("master_content")
        .select("*")
        .eq("created_by", user.id)
        .eq("is_archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMasterContent(data || []);
    } catch (error) {
      console.error("Error fetching master content:", error);
      toast({
        title: "Error",
        description: "Failed to load master content",
        variant: "destructive",
      });
    }
  };

  const handleArchiveItem = async (id: string, type: ContentTab) => {
    try {
      const tableName = type === 'prompts' ? 'prompts' : type === 'outputs' ? 'outputs' : 'master_content';
      
      const { error } = await supabase
        .from(tableName)
        .update({ is_archived: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Content Archived",
        description: "The content has been moved to Archive.",
      });

      if (type === 'prompts') fetchPrompts();
      else if (type === 'outputs') fetchOutputs();
      else fetchMasterContent();
      fetchArchivedCount();
    } catch (error) {
      console.error("Error archiving content:", error);
      toast({
        title: "Error",
        description: "Failed to archive content",
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = (id: string) => {
    setItemToDelete({ id, type: activeTab });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const tableName = itemToDelete.type === 'prompts' ? 'prompts' : 
                        itemToDelete.type === 'outputs' ? 'outputs' : 'master_content';
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      toast({
        title: "Content Deleted",
        description: `The ${itemToDelete.type.slice(0, -1)} has been permanently deleted.`,
      });

      if (itemToDelete.type === 'prompts') fetchPrompts();
      else if (itemToDelete.type === 'outputs') fetchOutputs();
      else fetchMasterContent();
      
    } catch (error) {
      console.error("Error deleting content:", error);
      toast({
        title: "Error",
        description: "Failed to delete content",
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
    setSidebarFilters({});
    setSearchQuery("");
  };

  const getActiveFilterChips = () => {
    const chips: { label: string; key: string; value: any }[] = [];
    
    if (sidebarFilters.collection) {
      chips.push({
        label: `Collection: ${sidebarFilters.collection}`,
        key: "collection",
        value: sidebarFilters.collection,
      });
    }
    
    if (sidebarFilters.scentFamily) {
      chips.push({
        label: `Family: ${sidebarFilters.scentFamily}`,
        key: "scentFamily",
        value: sidebarFilters.scentFamily,
      });
    }
    
    if (sidebarFilters.contentType) {
      chips.push({
        label: `Type: ${sidebarFilters.contentType}`,
        key: "contentType",
        value: sidebarFilters.contentType,
      });
    }
    
    if (sidebarFilters.dipWeek) {
      chips.push({
        label: `Week ${sidebarFilters.dipWeek}`,
        key: "dipWeek",
        value: sidebarFilters.dipWeek,
      });
    }
    
    if (sidebarFilters.quickFilter === "favorites") {
      chips.push({
        label: "Favorites",
        key: "quickFilter",
        value: sidebarFilters.quickFilter,
      });
    }
    
    if (sidebarFilters.quickFilter === "recent") {
      chips.push({
        label: "Recent",
        key: "quickFilter",
        value: sidebarFilters.quickFilter,
      });
    }
    
    return chips;
  };

  const removeFilter = (key: string) => {
    const newFilters = { ...sidebarFilters };
    delete newFilters[key as keyof typeof sidebarFilters];
    setSidebarFilters(newFilters);
  };

  const filterData = (data: any[]) => {
    return data.filter((item) => {
      // Handle different data structures for prompts vs outputs
      const itemTitle = item.title || (item.prompts && item.prompts[0]?.title) || '';
      const itemContent = item.prompt_text || item.generated_content || item.full_content || '';
      const itemCollection = item.collection || (item.prompts && item.prompts[0]?.collection);
      const itemContentType = item.content_type || (item.prompts && item.prompts[0]?.content_type);
      
      const matchesSearch =
        searchQuery === "" ||
        itemTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        itemContent.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCollection =
        !sidebarFilters.collection || itemCollection === sidebarFilters.collection;

      const matchesScentFamily =
        !sidebarFilters.scentFamily || item.scent_family === sidebarFilters.scentFamily;

      const matchesContentType =
        !sidebarFilters.contentType || itemContentType === sidebarFilters.contentType;

      const matchesDipWeek =
        !sidebarFilters.dipWeek || item.dip_week === sidebarFilters.dipWeek;

      let matchesQuickFilter = true;
      if (sidebarFilters.quickFilter === "recent") {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        matchesQuickFilter = item.created_at && new Date(item.created_at) > sevenDaysAgo;
      } else if (sidebarFilters.quickFilter === "favorites") {
        matchesQuickFilter = item.is_favorite === true;
      }

      return (
        matchesSearch &&
        matchesCollection &&
        matchesScentFamily &&
        matchesContentType &&
        matchesDipWeek &&
        matchesQuickFilter
      );
    });
  };

  const filteredPrompts = filterData(prompts);
  const filteredOutputs = filterData(outputs);
  const filteredMasterContent = filterData(masterContent);

  const activeChips = getActiveFilterChips();

  // Get tab counts
  const tabCounts = {
    prompts: prompts.length,
    outputs: outputs.length,
    master: masterContent.length,
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <LibrarySidebar 
          onFilterChange={handleFilterChange}
          activeFilters={sidebarFilters}
          counts={counts}
        />
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <h1 className="text-4xl font-bold">Library</h1>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ContentTab)} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="prompts" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Prompts
                  <Badge variant="secondary" className="ml-1">{tabCounts.prompts}</Badge>
                </TabsTrigger>
                <TabsTrigger value="outputs" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Single Assets
                  <Badge variant="secondary" className="ml-1">{tabCounts.outputs}</Badge>
                </TabsTrigger>
                <TabsTrigger value="master" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Master Content
                  <Badge variant="secondary" className="ml-1">{tabCounts.master}</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Search and Filters */}
            <div className="mb-6">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab === 'prompts' ? 'prompts' : activeTab === 'outputs' ? 'outputs' : 'master content'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Active filter chips */}
              {activeChips.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  {activeChips.map((chip) => (
                    <Badge
                      key={chip.key}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      onClick={() => removeFilter(chip.key)}
                    >
                      {chip.label}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-7"
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>

            {/* Content Area */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : (
              <TabsContent value="prompts">
                {filteredPrompts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <Edit className="h-16 w-16 text-muted-foreground/50" />
                    <p className="text-lg text-muted-foreground">No prompts found</p>
                    <Button onClick={() => navigate('/forge')}>Create Your First Prompt</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPrompts.map((prompt) => (
                      <PromptCard
                        key={prompt.id}
                        prompt={prompt}
                        onArchive={(id) => handleArchiveItem(id, 'prompts')}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="outputs">
              {filteredOutputs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <FileText className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-lg text-muted-foreground">No single assets found</p>
                  <Button onClick={() => navigate('/forge')}>Create Your First Asset</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOutputs.map((output) => (
                    <OutputCard
                      key={output.id}
                      output={output}
                      promptTitle={output.prompts?.[0]?.title}
                      collection={output.prompts?.[0]?.collection}
                      contentType={output.prompts?.[0]?.content_type}
                      onArchive={(id) => handleArchiveItem(id, 'outputs')}
                      onDelete={handleDeleteItem}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="master">
              {filteredMasterContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                  <p className="text-lg text-muted-foreground">No master content found</p>
                  <Button onClick={() => navigate('/forge')}>Create Your First Master Content</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMasterContent.map((content) => (
                    <MasterContentCard
                      key={content.id}
                      content={content}
                      onArchive={(id) => handleArchiveItem(id, 'master')}
                      onDelete={handleDeleteItem}
                      onGenerateDerivatives={(id) => navigate(`/repurpose?masterContentId=${id}`)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the content.
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
    </SidebarProvider>
  );
};

export default Reservoir;
