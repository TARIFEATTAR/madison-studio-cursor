import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Plus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import PromptLibrarySidebar from "@/components/prompt-library/PromptLibrarySidebar";
import PromptFilterCards from "@/components/prompt-library/PromptFilterCards";
import EnhancedPromptCard from "@/components/prompt-library/EnhancedPromptCard";
import PromptDetailModal from "@/components/prompt-library/PromptDetailModal";
import { QuickStartModal } from "@/components/prompt-library/QuickStartModal";
import { PromptWizard, WizardData } from "@/components/prompt-library/PromptWizard";
import { ImportDialog } from "@/components/prompt-library/ImportDialog";
import { OrganizationGuide } from "@/components/prompt-library/OrganizationGuide";
import { MadisonPanel } from "@/components/prompt-library/MadisonPanel";
import { usePromptCounts } from "@/hooks/usePromptCounts";
export interface Prompt {
  id: string;
  title: string;
  collection: string;
  scent_family: string | null;
  content_type: string;
  prompt_text: string;
  created_at: string;
  updated_at?: string;
  version?: number;
  times_used: number;
  last_used_at: string | null;
  avg_quality_rating: number | null;
  tags: string[] | null;
  is_template: boolean;
  effectiveness_score: number | null;
}

type SortOption = "recent" | "most-used" | "highest-rated" | "effectiveness";

const TemplatesContent = () => {
  const { user } = useAuth();
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { open } = useSidebar();
  const isMobile = useIsMobile();
  const isSidebarCollapsed = !open;

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuickAccess, setSelectedQuickAccess] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Modal states
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showMadison, setShowMadison] = useState(false);

  // Get counts for filter cards
  const { data: counts } = usePromptCounts(currentOrganizationId);


  // Fetch prompts
  const { data: allPrompts = [], isLoading } = useQuery({
    queryKey: ["templates", currentOrganizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("*")
        .eq("organization_id", currentOrganizationId!)
        .eq("is_archived", false)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!currentOrganizationId,
  });

  // Apply filters based on sidebar selections
  const filteredPrompts = useMemo(() => {
    let filtered = allPrompts;

    // Quick Access filters
    if (selectedQuickAccess === "favorites") {
      filtered = filtered.filter(p => p.is_template);
    } else if (selectedQuickAccess === "recently-used") {
      filtered = filtered.filter(p => p.last_used_at).sort((a, b) => 
        new Date(b.last_used_at!).getTime() - new Date(a.last_used_at!).getTime()
      );
    } else if (selectedQuickAccess === "most-used") {
      filtered = filtered.filter(p => p.times_used > 0).sort((a, b) => 
        (b.times_used || 0) - (a.times_used || 0)
      );
    }

    // Collection filter
    if (selectedCollection) {
      filtered = filtered.filter(p => p.collection === selectedCollection);
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.content_type === selectedCategory);
    }

    return filtered;
  }, [allPrompts, selectedQuickAccess, selectedCollection, selectedCategory]);

  // Filter prompts by search query
  const displayedPrompts = useMemo(() => {
    if (!searchQuery.trim()) return filteredPrompts;
    const query = searchQuery.toLowerCase();
    return filteredPrompts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.prompt_text.toLowerCase().includes(query) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [filteredPrompts, searchQuery]);

  const handleWizardComplete = async (wizardData: WizardData) => {
    // Generate prompt from wizard data
    const generatedPrompt = generatePromptFromWizard(wizardData);
    
    try {
      const { error } = await supabase.from("prompts").insert({
        title: `${wizardData.contentType} - ${wizardData.tone}`,
        prompt_text: generatedPrompt,
        content_type: wizardData.contentType as any,
        collection: "cadence" as any,
        organization_id: currentOrganizationId!,
        created_by: user?.id,
        is_template: false,
      });

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast({
        title: "Prompt created",
        description: "Your custom prompt has been generated successfully!",
      });
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to create prompt",
        variant: "destructive",
      });
    }
  };

  const generatePromptFromWizard = (data: WizardData): string => {
    const parts = [];
    
    parts.push(`Create ${data.contentType} content with the following specifications:`);
    parts.push(`\nPurpose: ${data.purpose}`);
    parts.push(`\nTone: ${data.tone}`);
    parts.push(`\nKey Elements to Include: ${data.keyElements}`);
    
    if (data.constraints) {
      parts.push(`\nConstraints: ${data.constraints}`);
    }
    
    return parts.join("\n");
  };

  const handleUsePrompt = async (promptId: string) => {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;

    try {
      // Update usage tracking
      await supabase
        .from("prompts")
        .update({
          times_used: (prompt.times_used || 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", promptId);

      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["templates"] });

      // Navigate to Create with prompt data
      navigate("/create", {
        state: { prompt },
      });

      toast({
        title: "Template loaded",
        description: "Ready to generate content in Create.",
      });
    } catch (error) {
      console.error("Error using prompt:", error);
      toast({
        title: "Error",
        description: "Failed to load prompt. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleArchive = async (promptId: string) => {
    try {
      await supabase
        .from("prompts")
        .update({ is_archived: true })
        .eq("id", promptId);

      queryClient.invalidateQueries({ queryKey: ["templates"] });

      toast({
        title: "Template archived",
        description: "The template has been moved to the archive.",
      });
    } catch (error) {
      console.error("Error archiving prompt:", error);
      toast({
        title: "Error",
        description: "Failed to archive prompt.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (promptId: string) => {
    try {
      await supabase.from("prompts").delete().eq("id", promptId);

      queryClient.invalidateQueries({ queryKey: ["templates"] });

      toast({
        title: "Template deleted",
        description: "The template has been permanently deleted.",
      });
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete prompt.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async (promptId: string) => {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;

    try {
      await supabase
        .from("prompts")
        .update({ is_template: !prompt.is_template })
        .eq("id", promptId);

      queryClient.invalidateQueries({ queryKey: ["templates"] });

      toast({
        title: prompt.is_template ? "Removed from favorites" : "Added to favorites",
      });
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-[#F5F1E8]">
      {/* Mobile Filter Drawer */}
      {isMobile && (
        <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <DrawerContent className="h-[85vh]">
            <div className="overflow-y-auto h-full">
              <PromptLibrarySidebar
                onQuickAccessSelect={(value) => {
                  setSelectedQuickAccess(value);
                  setMobileFiltersOpen(false);
                }}
                onCollectionSelect={(value) => {
                  setSelectedCollection(value);
                  setMobileFiltersOpen(false);
                }}
                onCategorySelect={(value) => {
                  setSelectedCategory(value);
                  setMobileFiltersOpen(false);
                }}
                selectedQuickAccess={selectedQuickAccess}
                selectedCollection={selectedCollection}
                selectedCategory={selectedCategory}
              />
            </div>
          </DrawerContent>
        </Drawer>
      )}

      {/* HEADER SECTION - Full width */}
      <div className="bg-[#FFFCF5] border-b-2 border-[#D4CFC8] px-8 py-6">
        <div className="max-w-full mx-auto">
          {/* Title Row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-serif text-[#1A1816] font-semibold">
                Prompt Library
              </h1>
              <p className="text-[#6B6560] font-sans mt-1">
                Your prompts, perfectly organized • No more scattered spreadsheets
              </p>
            </div>
            <div className="flex gap-3">
              {/* Mobile: Filters Button */}
              {isMobile && (
                <DrawerTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <Filter className="w-5 h-5" />
                  </Button>
                </DrawerTrigger>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowGuide(true)}
                className="rounded-full text-[#6B6560] hover:text-[#B8956A]"
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setShowQuickStart(true)}
                className="gap-2 bg-gradient-to-r from-[#B8956A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8956A] text-white border-0"
              >
                <Plus className="w-4 h-4" />
                New Prompt
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <Input
            type="text"
            placeholder="Search prompts by title, description, tags, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-[#D4CFC8] focus:border-[#B8956A] rounded-lg px-4 py-3 text-[#2F2A26] placeholder:text-[#A8A39E] transition-all"
          />
        </div>
      </div>

      {/* PAGE CONTENT AREA - Flex layout with filter panel and main content */}
      <div className="flex">
        {/* FILTER PANEL - 300px fixed width, completely separate from global nav */}
        {!isMobile && (
          <div className="w-[300px] flex-shrink-0 bg-[#F5F1E8] px-6 py-8">
            <PromptLibrarySidebar
              onQuickAccessSelect={setSelectedQuickAccess}
              onCollectionSelect={setSelectedCollection}
              onCategorySelect={setSelectedCategory}
              selectedQuickAccess={selectedQuickAccess}
              selectedCollection={selectedCollection}
              selectedCategory={selectedCategory}
            />
          </div>
        )}

        {/* MAIN CONTENT - Flexible width */}
        <div className="flex-1 px-8 py-8">
          {/* Active Filters Display (Mobile) */}
          {isMobile && (selectedQuickAccess || selectedCollection || selectedCategory) && (
            <div className="mb-4 flex gap-2 flex-wrap">
              {selectedQuickAccess && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                  <span>{selectedQuickAccess}</span>
                  <button onClick={() => setSelectedQuickAccess(null)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedCollection && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                  <span>{selectedCollection}</span>
                  <button onClick={() => setSelectedCollection(null)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {selectedCategory && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                  <span>{selectedCategory}</span>
                  <button onClick={() => setSelectedCategory(null)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Prompt count */}
          <div className="mb-6">
            <p className="text-[#2F2A26] font-sans text-lg">
              {displayedPrompts.length} prompt{displayedPrompts.length !== 1 ? "s" : ""}
            </p>
          </div>
          
          {/* Prompts Grid - 2 columns */}
          {isLoading ? (
            <div className="text-center py-12 text-[#6B6560]">
              Loading prompts...
            </div>
          ) : displayedPrompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B6560] mb-4">No prompts found</p>
              <Button 
                onClick={() => setShowQuickStart(true)}
                className="bg-gradient-to-r from-[#B8956A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8956A] text-white"
              >
                Create Your First Prompt
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayedPrompts.map((prompt) => (
                <EnhancedPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onUse={() => handleUsePrompt(prompt.id)}
                  onToggleFavorite={() => handleToggleFavorite(prompt.id)}
                  isFavorite={prompt.is_template}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <QuickStartModal
        open={showQuickStart}
        onOpenChange={setShowQuickStart}
        onStartWizard={() => {
          setShowQuickStart(false);
          setShowWizard(true);
        }}
        onShowTemplates={() => {
          setShowQuickStart(false);
          // Templates are already shown on main page
        }}
        onShowImport={() => {
          setShowQuickStart(false);
          setShowImport(true);
        }}
      />

      <PromptWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={handleWizardComplete}
      />

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImport={(prompts) => {
          // TODO: Handle imported prompts
          console.log("Imported prompts:", prompts);
        }}
      />

      <OrganizationGuide open={showGuide} onOpenChange={setShowGuide} />

      <MadisonPanel open={showMadison} onOpenChange={setShowMadison} />

      {/* Detail Modal */}
      {selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          open={!!selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onUse={() => handleUsePrompt(selectedPrompt.id)}
          />
        )}
    </div>
  );
};

const Templates = () => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <TemplatesContent />
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Templates;
