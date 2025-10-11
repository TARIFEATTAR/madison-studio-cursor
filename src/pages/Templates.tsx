import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import PromptLibrarySidebar from "@/components/prompt-library/PromptLibrarySidebar";
import EnhancedPromptCard from "@/components/prompt-library/EnhancedPromptCard";
import PromptDetailModal from "@/components/prompt-library/PromptDetailModal";

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
  const [filters, setFilters] = useState({
    collection: null as string | null,
    contentType: null as string | null,
    scentFamily: null as string | null,
    templatesOnly: false,
  });

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

  // Sort prompts
  const sortedPrompts = useMemo(() => {
    const sorted = [...prompts];
    
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
  }, [prompts, sortBy]);

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
            <h1 className="text-4xl font-serif mb-2 text-foreground">Templates</h1>
            <p className="text-muted-foreground">
              Your collection of saved templates, ready to use in Create
            </p>
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
