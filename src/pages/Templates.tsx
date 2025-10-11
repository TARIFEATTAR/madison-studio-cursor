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
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    collection: null as string | null,
    contentType: null as string | null,
    scentFamily: null as string | null,
    templatesOnly: false,
  });

  // Modal states
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showMadison, setShowMadison] = useState(false);

  // Fetch prompts
  const { data: prompts = [], isLoading } = useQuery({
    queryKey: ["templates", currentOrganizationId, filters],
    queryFn: async () => {
      let query = supabase
        .from("prompts")
        .select("*")
        .eq("organization_id", currentOrganizationId!)
        .eq("is_archived", false);

      if (filters.collection) {
        query = query.eq("collection", filters.collection as any);
      }
      if (filters.contentType) {
        query = query.eq("content_type", filters.contentType as any);
      }
      if (filters.scentFamily) {
        query = query.eq("scent_family", filters.scentFamily as any);
      }
      if (filters.templatesOnly) {
        query = query.eq("is_template", true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!currentOrganizationId,
  });

  // Filter prompts by search query
  const searchFilteredPrompts = useMemo(() => {
    if (!searchQuery.trim()) return prompts;
    const query = searchQuery.toLowerCase();
    return prompts.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.prompt_text.toLowerCase().includes(query) ||
        p.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  }, [prompts, searchQuery]);

  // Sort prompts
  const sortedPrompts = useMemo(() => {
    const sorted = [...searchFilteredPrompts];
    
    switch (sortBy) {
      case "most-used":
        return sorted.sort((a, b) => (b.times_used || 0) - (a.times_used || 0));
      case "highest-rated":
        return sorted.sort((a, b) => (b.avg_quality_rating || 0) - (a.avg_quality_rating || 0));
      case "effectiveness":
        return sorted.sort((a, b) => (b.effectiveness_score || 0) - (a.effectiveness_score || 0));
      case "recent":
      default:
        return sorted.sort((a, b) => 
          new Date(b.updated_at || b.created_at).getTime() - 
          new Date(a.updated_at || a.created_at).getTime()
        );
    }
  }, [searchFilteredPrompts, sortBy]);

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
    const prompt = prompts.find(p => p.id === promptId);
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

  const sortOptions = [
    { value: "recent", label: "Recently Updated", icon: Clock },
    { value: "most-used", label: "Most Used", icon: TrendingUp },
    { value: "highest-rated", label: "Highest Rated", icon: Star },
    { value: "effectiveness", label: "Most Effective", icon: Sparkles },
  ];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        <PromptLibrarySidebar
          filters={filters}
          onFilterChange={setFilters}
          promptCount={sortedPrompts.length}
        />

        <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl font-serif mb-2 text-foreground">Prompt Library</h1>
                <p className="text-muted-foreground">
                  Your prompts, perfectly organized • No more scattered spreadsheets
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowGuide(true)}
                  className="gap-2"
                >
                  <HelpCircle className="w-4 h-4" />
                  How it Works
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowMadison(true)}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Ask Madison
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
              className="max-w-2xl"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <div className="flex gap-2">
              {sortOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={sortBy === option.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option.value as SortOption)}
                  className="gap-2"
                >
                  <option.icon className="h-4 w-4" />
                  {option.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompts Grid */}
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading prompts...
            </div>
          ) : sortedPrompts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No templates found yet</p>
              <Button onClick={() => navigate("/create")}>
                Create Content & Save as Template
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedPrompts.map((prompt) => (
                <EnhancedPromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onUse={() => handleUsePrompt(prompt.id)}
                  onViewDetails={() => setSelectedPrompt(prompt)}
                  onArchive={() => handleArchive(prompt.id)}
                  onDelete={() => handleDelete(prompt.id)}
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
