import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Clock, Star, Plus, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarProvider } from "@/components/ui/sidebar";
import PromptLibrarySidebar from "@/components/prompt-library/PromptLibrarySidebar";
import EnhancedPromptCard from "@/components/prompt-library/EnhancedPromptCard";
import PromptDetailModal from "@/components/prompt-library/PromptDetailModal";
import { QuickStartModal } from "@/components/prompt-library/QuickStartModal";
import { PromptWizard, WizardData } from "@/components/prompt-library/PromptWizard";
import { ImportDialog } from "@/components/prompt-library/ImportDialog";
import { OrganizationGuide } from "@/components/prompt-library/OrganizationGuide";
import { MadisonPanel } from "@/components/prompt-library/MadisonPanel";

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

const Templates = () => {
  const { user } = useAuth();
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuickAccess, setSelectedQuickAccess] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Modal states
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showMadison, setShowMadison] = useState(false);

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
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <PromptLibrarySidebar
          onQuickAccessSelect={setSelectedQuickAccess}
          onCollectionSelect={setSelectedCollection}
          onCategorySelect={setSelectedCategory}
          selectedQuickAccess={selectedQuickAccess}
          selectedCollection={selectedCollection}
          selectedCategory={selectedCategory}
        />

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-serif mb-2 text-foreground">Prompt Library</h1>
                  <p className="text-muted-foreground">
                    Your prompts, perfectly organized • No more scattered spreadsheets
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowGuide(true)}
                    className="rounded-full"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={() => setShowQuickStart(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    New Prompt
                  </Button>
                </div>
              </div>

              {/* Search Bar */}
              <Input
                placeholder="Search prompts by title, description, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Prompt count */}
            <p className="text-sm text-muted-foreground mb-6">
              {displayedPrompts.length} prompt{displayedPrompts.length !== 1 ? "s" : ""}
            </p>

            {/* Prompts Grid */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading prompts...
              </div>
            ) : displayedPrompts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No prompts found</p>
                <Button onClick={() => setShowQuickStart(true)}>
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
        </main>

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
    </SidebarProvider>
  );
};

export default Templates;
