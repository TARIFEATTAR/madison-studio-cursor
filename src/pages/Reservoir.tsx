import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { LibrarySidebar } from "@/components/LibrarySidebar";
import PromptCard from "@/components/PromptCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
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

const Reservoir = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarFilters, setSidebarFilters] = useState<{
    collection?: string;
    scentFamily?: string;
    contentType?: string;
    dipWeek?: number;
    quickFilter?: string;
  }>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null);
  
  // Calculate dynamic counts from actual prompts data
  const counts = useMemo(() => {
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
    let archived = 0;
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    prompts.forEach(prompt => {
      // Count by collection and scent family
      const collection = prompt.collection || 'cadence';
      if (byCollection[collection]) {
        byCollection[collection].total++;
        const family = prompt.scent_family || 'warm';
        if (byCollection[collection].families[family] !== undefined) {
          byCollection[collection].families[family]++;
        }
      }
      
      // Count by content type
      const contentType = prompt.content_type || 'other';
      byContentType[contentType] = (byContentType[contentType] || 0) + 1;
      
      // Count by DIP week
      if (prompt.dip_week) {
        byDipWeek[prompt.dip_week] = (byDipWeek[prompt.dip_week] || 0) + 1;
      }
      
      // Count recent (last 7 days)
      if (prompt.created_at && new Date(prompt.created_at) > sevenDaysAgo) {
        recent++;
      }
    });
    
    return {
      byCollection,
      byContentType,
      byDipWeek,
      favorites,
      recent,
      archived,
    };
  }, [prompts]);

  useEffect(() => {
    if (user) {
      fetchPrompts();
    }
  }, [user]);

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
        description: "Failed to load prompts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleArchivePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from("prompts")
        .update({ is_archived: true })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Prompt Archived",
        description: "The prompt has been moved to The Archive.",
      });

      fetchPrompts();
    } catch (error) {
      console.error("Error archiving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to archive prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePrompt = (id: string) => {
    setPromptToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!promptToDelete) return;

    try {
      const { error } = await supabase
        .from("prompts")
        .delete()
        .eq("id", promptToDelete);

      if (error) throw error;

      toast({
        title: "Prompt Deleted",
        description: "The prompt has been permanently deleted.",
      });

      fetchPrompts();
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPromptToDelete(null);
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
    
    if (sidebarFilters.quickFilter) {
      chips.push({
        label: sidebarFilters.quickFilter,
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

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch =
      searchQuery === "" ||
      prompt.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.prompt_text?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCollection =
      !sidebarFilters.collection || prompt.collection === sidebarFilters.collection;

    const matchesScentFamily =
      !sidebarFilters.scentFamily || prompt.scent_family === sidebarFilters.scentFamily;

    const matchesContentType =
      !sidebarFilters.contentType || prompt.content_type === sidebarFilters.contentType;

    const matchesDipWeek =
      !sidebarFilters.dipWeek || prompt.dip_week === sidebarFilters.dipWeek;

    // Quick filters would need additional logic based on your data structure
    const matchesQuickFilter = !sidebarFilters.quickFilter || true;

    return (
      matchesSearch &&
      matchesCollection &&
      matchesScentFamily &&
      matchesContentType &&
      matchesDipWeek &&
      matchesQuickFilter
    );
  });

  const activeChips = getActiveFilterChips();

  return (
    <div className="pt-20">
      <SidebarProvider>
        <div className="flex min-h-[calc(100vh-5rem)] w-full bg-background">
          {/* Sidebar */}
          <LibrarySidebar
            onFilterChange={handleFilterChange}
            activeFilters={sidebarFilters}
            counts={counts}
          />

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Sidebar Toggle */}
            <div className="sticky top-20 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40">
            <div className="flex items-center gap-4 px-6 py-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex-1">
                <h1 className="text-2xl font-serif text-foreground">The Reservoir</h1>
                <p className="text-sm text-muted-foreground">
                  Your curated collection of brand-aligned prompts
                </p>
              </div>
            </div>
          </div>

          <div className="py-8 px-6 md:px-12">
            <div className="max-w-7xl mx-auto codex-spacing">
              {/* Search Bar */}
              <div className="fade-enter mb-6">
                <div className="relative max-w-2xl">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="🔍 Search prompts, content, campaigns..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all duration-300"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active Filter Chips */}
              {activeChips.length > 0 && (
                <div className="fade-enter flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground font-medium">Active filters:</span>
                  {activeChips.map((chip) => (
                    <Badge
                      key={`${chip.key}-${chip.value}`}
                      variant="secondary"
                      className="bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30 gap-2 pr-1"
                    >
                      {chip.label}
                      <button
                        onClick={() => removeFilter(chip.key)}
                        className="hover:bg-saffron-gold/30 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-16">
                  <p className="text-muted-foreground">Loading prompts...</p>
                </div>
              )}

              {/* Prompt Grid */}
              {!loading && filteredPrompts.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-enter">
                  {filteredPrompts.map((prompt) => (
                    <PromptCard
                      key={prompt.id}
                      prompt={prompt}
                      onArchive={handleArchivePrompt}
                      onDelete={handleDeletePrompt}
                    />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredPrompts.length === 0 && (
                <div className="text-center py-16 fade-enter">
                  <p className="text-2xl font-serif text-muted-foreground">The Reservoir awaits</p>
                  <p className="text-muted-foreground mt-2">
                    {prompts.length === 0
                      ? "No prompts have been created yet"
                      : "No prompts match your refined criteria"}
                  </p>
                  {activeChips.length > 0 && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={clearAllFilters}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          </main>
        </div>
      </SidebarProvider>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt Permanently?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the prompt from your collection.
              Consider archiving instead to preserve it for future reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Reservoir;
