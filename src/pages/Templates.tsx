import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Plus, Filter, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { contentTypeMapping } from "@/utils/contentTypeMapping";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { ViewDensityToggle, ViewMode } from "@/components/library/ViewDensityToggle";

import PromptLibrarySidebar from "@/components/prompt-library/PromptLibrarySidebar";

import { PromptCard } from "@/components/prompt-library/PromptCard";
import PromptDetailModal from "@/components/prompt-library/PromptDetailModal";
import { QuickStartModal } from "@/components/prompt-library/QuickStartModal";
import { PromptWizard, WizardData } from "@/components/prompt-library/PromptWizard";
import { TemplatePicker } from "@/components/prompt-library/TemplatePicker";
import { ImportDialog } from "@/components/prompt-library/ImportDialog";
import { OrganizationGuide } from "@/components/prompt-library/OrganizationGuide";
import { MadisonPanel } from "@/components/prompt-library/MadisonPanel";
import { PlaceholderReplacementDialog } from "@/components/prompt-library/PlaceholderReplacementDialog";
import { ImageUploadDialog } from "@/components/prompt-library/ImageUploadDialog";
import { usePromptCounts } from "@/hooks/usePromptCounts";
import { getRecipeImageUrl } from "@/utils/imageRecipeHelpers";
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
  meta_instructions?: any;
  additional_context?: any;
  category?: string | null; // Image type category: product, lifestyle, ecommerce, social, editorial, creative, flat_lay
  // Image fields
  image_url?: string | null;
  image_source?: 'generated' | 'uploaded' | null;
  generated_image_id?: string | null;
}

type SortOption = "recent" | "most-used" | "highest-rated" | "effectiveness";

const TemplatesContent = () => {
  const { user } = useAuth();
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedQuickAccess, setSelectedQuickAccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("comfortable");

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedQuickAccess(null);
    setSelectedCategory(null);
  };

  // Modal states
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showWizard, setShowWizard] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showMadison, setShowMadison] = useState(false);
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<Prompt | null>(null);
  const [wizardInitialData, setWizardInitialData] = useState<any>(null);
  
  // Map to store generated image URLs for each prompt
  const [promptImageMap, setPromptImageMap] = useState<Map<string, string>>(new Map());

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
        .eq("deliverable_format", "image_prompt")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as Prompt[];
    },
    enabled: !!currentOrganizationId,
  });

  // Fetch generated images for prompts that have generated_image_id
  useQuery({
    queryKey: ["prompt-generated-images", currentOrganizationId, allPrompts],
    queryFn: async () => {
      const promptsWithGeneratedImages = allPrompts.filter(
        (p) => (p as any).generated_image_id
      );

      if (promptsWithGeneratedImages.length === 0) {
        return new Map<string, string>();
      }

      const generatedImageIds = promptsWithGeneratedImages.map(
        (p) => (p as any).generated_image_id
      );

      const { data: generatedImages, error } = await supabase
        .from("generated_images")
        .select("id, image_url")
        .in("id", generatedImageIds);

      if (error) {
        console.error("Error fetching generated images:", error);
        return new Map<string, string>();
      }

      const imageMap = new Map<string, string>();
      generatedImages?.forEach((img) => {
        promptsWithGeneratedImages.forEach((prompt) => {
          if ((prompt as any).generated_image_id === img.id) {
            imageMap.set(prompt.id, img.image_url);
          }
        });
      });

      setPromptImageMap(imageMap);
      return imageMap;
    },
    enabled: !!currentOrganizationId && allPrompts.length > 0,
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

    // Category filter - use category field first, fallback to additional_context for backward compatibility
    if (selectedCategory) {
      filtered = filtered.filter(p => {
        const category = p.category || (p.additional_context as any)?.category || (p.additional_context as any)?.image_type;
        return category === selectedCategory;
      });
    }

    return filtered;
  }, [allPrompts, selectedQuickAccess, selectedCategory]);

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
    // Phase 5: Client-side validation
    const validContentTypes = ['product', 'email', 'social', 'visual', 'blog'];
    if (!validContentTypes.includes(wizardData.contentType)) {
      toast({
        title: "Invalid Content Type",
        description: `Please select one of: ${validContentTypes.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Use refined prompt if available, fallback to generated
    const promptText = wizardData.refinedPrompt || generatePromptFromWizard(wizardData);
    
    // Extract a smarter title from the refined prompt if possible
    const titlePrefix = wizardData.contentType.charAt(0).toUpperCase() + wizardData.contentType.slice(1);
    const titleSuffix = wizardData.purpose.substring(0, 40);
    const generatedTitle = `${titlePrefix}: ${titleSuffix}${titleSuffix.length >= 40 ? '...' : ''}`;
    
    try {
      const { data: insertedData, error } = await supabase
        .from("prompts")
        .insert([{
          title: generatedTitle,
          prompt_text: promptText,
          content_type: wizardData.contentType as any,
          collection: wizardData.collection || "General",
          organization_id: currentOrganizationId!,
          created_by: user?.id,
          is_template: true,
          meta_instructions: {
            wizard_defaults: {
              content_type: wizardData.contentType,
              purpose: wizardData.purpose,
              tone: wizardData.tone,
              key_elements: wizardData.keyElements,
              constraints: wizardData.constraints,
              collection: wizardData.collection,
              category: wizardData.category,
            },
            refinement_timestamp: new Date().toISOString(),
          } as any,
        }])
        .select()
        .single();

      if (error) {
        // Phase 3: Improved error messaging
        let errorMessage = "Failed to create prompt";
        
        if (error.message.includes("violates foreign key constraint")) {
          errorMessage = `Collection "${wizardData.collection}" doesn't exist. Please create it in Settings first.`;
        } else if (error.message.includes("violates row-level security")) {
          errorMessage = "You don't have permission to create prompts in this organization.";
        } else if (error.message.includes("content_type")) {
          errorMessage = `Invalid content type "${wizardData.contentType}". Please choose: Blog, Email, Social, Product, or Visual.`;
        } else if (error.message.includes("collection")) {
          errorMessage = `Invalid collection name. Please select a valid collection.`;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (error.message) {
          errorMessage = error.message;
        }

        throw new Error(errorMessage);
      }

      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });

      // Show success toast based on whether collection was selected
      const skippedCollection = !wizardData.collection;
      toast({
        title: "Template saved!",
        description: skippedCollection 
          ? "Prompt saved! Organize it later from the library."
          : `Prompt saved to ${wizardData.collection}! Customize it to create content.`,
      });

      // Auto-navigate: Open placeholder dialog then go to Create page
      if (insertedData) {
        setPendingPrompt(insertedData as Prompt);
        setShowPlaceholderDialog(true);
      }
    } catch (error: any) {
      console.error("Error creating prompt:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create prompt",
        variant: "destructive",
      });
    }
  };

  const generatePromptFromWizard = (data: WizardData): string => {
    // Generate prompt with placeholders PRESERVED for reusability
    const parts = [];
    
    parts.push(`Create {{CONTENT_TYPE}} content with the following specifications:`);
    parts.push(`\nPurpose: {{PURPOSE}}`);
    parts.push(`\nTone: {{TONE}}`);
    parts.push(`\nKey Elements to Include: {{KEY_ELEMENTS}}`);
    
    if (data.constraints) {
      parts.push(`\nConstraints: {{CONSTRAINTS}}`);
    }
    
    // Return template with placeholders intact
    // Default values are stored in meta_instructions.wizard_defaults
    return parts.join("\n");
  };

  const handleUsePrompt = async (promptId: string) => {
    const prompt = allPrompts.find(p => p.id === promptId);
    if (!prompt) return;

    // Check if prompt contains placeholders
    const hasPlaceholders = /\{\{[A-Z_]+\}\}/.test(prompt.prompt_text);
    
    if (hasPlaceholders) {
      // Show placeholder dialog first
      setPendingPrompt(prompt);
      setShowPlaceholderDialog(true);
    } else {
      // No placeholders, proceed directly
      await proceedWithPrompt(prompt, prompt.prompt_text);
    }
  };

  const handlePlaceholderConfirm = async (replacedText: string, placeholderValues: Record<string, string>) => {
    if (!pendingPrompt) return;

    await proceedWithPrompt(pendingPrompt, replacedText);
    setPendingPrompt(null);
  };

  const proceedWithPrompt = async (prompt: Prompt, finalPromptText: string) => {
    try {
      // Update usage tracking
      await supabase
        .from("prompts")
        .update({
          times_used: (prompt.times_used || 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", prompt.id);

      // Invalidate query to refresh data
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });

      // Check if prompt has field mappings
      const fieldMappings = (prompt.meta_instructions as any)?.field_mappings;

      // Navigate to Create with prompt data and field mappings
      navigate("/create", {
        state: { 
          prompt: {
            ...prompt,
            prompt_text: finalPromptText // Use the customized version
          },
          fieldMappings: fieldMappings || null
        },
      });

      toast({
        title: "Template loaded",
        description: fieldMappings ? "Form fields auto-populated from template" : "Ready to generate content in Create.",
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
      queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });

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
      queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });

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
      queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });

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
    <div className="flex h-screen bg-vellum-cream overflow-hidden">
      {/* MIDDLE PANEL - Collections & Categories (Fixed width: 280px) */}
      {!isMobile && (
        <aside className="w-[280px] border-r border-charcoal/10 bg-parchment-white flex-shrink-0 overflow-y-auto">
          <PromptLibrarySidebar
            onQuickAccessSelect={setSelectedQuickAccess}
            onCategorySelect={setSelectedCategory}
            selectedQuickAccess={selectedQuickAccess}
            selectedCategory={selectedCategory}
            onClearFilters={clearAllFilters}
          />
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER SECTION */}
        <header className="bg-parchment-white border-b border-charcoal/10 px-8 py-6 flex-shrink-0">
          <div className="max-w-full">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-serif text-foreground font-semibold mb-2">
                  Image Recipe Library
                </h1>
                <p className="text-muted-foreground text-sm">
                  Save and reuse your best image prompts for consistent visual content
                </p>
              </div>
              <div className="flex gap-3">
                {/* Mobile: Filters Button */}
                {isMobile && (
                  <Drawer open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" size="icon">
                        <Filter className="w-5 h-5" />
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[85vh]">
                      <div className="overflow-y-auto h-full">
                        <PromptLibrarySidebar
                          onQuickAccessSelect={(value) => {
                            setSelectedQuickAccess(value);
                            setMobileFiltersOpen(false);
                          }}
                          onCategorySelect={(value) => {
                            setSelectedCategory(value);
                            setMobileFiltersOpen(false);
                          }}
                          selectedQuickAccess={selectedQuickAccess}
                          selectedCategory={selectedCategory}
                          onClearFilters={clearAllFilters}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowGuide(true)}
                  className="rounded-full text-muted-foreground hover:text-brass"
                >
                  <HelpCircle className="w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImageUpload(true)}
                  className="gap-2 mr-2"
                >
                  <Plus className="w-4 h-4" />
                  Upload Image
                </Button>
                <Button
                  onClick={() => setShowQuickStart(true)}
                  className="gap-2 bg-ink-black hover:bg-charcoal text-parchment-white border-0"
                >
                  <Plus className="w-4 h-4" />
                  New Prompt
                </Button>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="Search prompts by title, description, tags, or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white border border-charcoal/10 focus:border-aged-brass px-4 py-2.5 text-ink-black placeholder:text-charcoal/50 transition-all"
              />
            </div>
          </div>
        </header>

        {/* PROMPTS GRID - Scrollable main content */}
        <main className="flex-1 overflow-y-auto px-8 py-6 bg-vellum-cream">
          {/* Active Filters Display (Mobile) */}
          {isMobile && (selectedQuickAccess || selectedCategory) && (
            <div className="mb-4 flex gap-2 flex-wrap">
              {selectedQuickAccess && (
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm">
                  <span>{selectedQuickAccess}</span>
                  <button onClick={() => setSelectedQuickAccess(null)} className="hover:text-destructive">
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

          {/* Prompts Count */}
          <div className="mb-6">
            <p className="text-sm font-medium text-muted-foreground">
              {displayedPrompts.length} {displayedPrompts.length === 1 ? "prompt" : "prompts"}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-border border-t-brass rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading prompts...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && displayedPrompts.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <FileText className="w-16 h-16 mx-auto mb-4 text-border" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No image recipes saved yet</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery ? "Try adjusting your search or filters" : "Generate images in the Image Studio to automatically save your prompts here"}
                </p>
                <Button
                  onClick={() => setShowQuickStart(true)}
                  className="bg-gradient-to-r from-brass to-brass-dark hover:from-brass-dark hover:to-brass text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Prompt
                </Button>
              </div>
            </div>
          )}

          {/* 3-COLUMN GRID LAYOUT */}
          {!isLoading && displayedPrompts.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {displayedPrompts.map((prompt) => {
                const generatedImageUrl = promptImageMap.get(prompt.id) || null;
                const imageUrl = getRecipeImageUrl(prompt, generatedImageUrl);
                return (
                  <PromptCard
                    key={prompt.id}
                    prompt={prompt}
                    onClick={() => setSelectedPrompt(prompt)}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                    imageUrl={imageUrl}
                  />
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <QuickStartModal
        open={showQuickStart}
        onOpenChange={setShowQuickStart}
        onStartWizard={(templateData) => {
          setShowQuickStart(false);
          setWizardInitialData(templateData || null);
          setShowWizard(true);
        }}
        onShowTemplates={() => {
          setShowQuickStart(false);
          setShowTemplatePicker(true);
        }}
        onShowImport={() => {
          setShowQuickStart(false);
          setShowImport(true);
        }}
      />

      <TemplatePicker
        open={showTemplatePicker}
        onOpenChange={setShowTemplatePicker}
        onPick={(templateData) => {
          setWizardInitialData(templateData);
          setShowWizard(true);
        }}
      />

      <PromptWizard
        open={showWizard}
        onOpenChange={(open) => {
          setShowWizard(open);
          if (!open) {
            setWizardInitialData(null);
          }
        }}
        onComplete={handleWizardComplete}
        initialData={wizardInitialData}
      />

      <ImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImport={(prompts) => {
          console.log("Imported prompts:", prompts);
        }}
      />

      <OrganizationGuide open={showGuide} onOpenChange={setShowGuide} />

      <MadisonPanel open={showMadison} onOpenChange={setShowMadison} />

      {/* Placeholder Replacement Dialog */}
      {pendingPrompt && (
        <PlaceholderReplacementDialog
          open={showPlaceholderDialog}
          onOpenChange={setShowPlaceholderDialog}
          promptText={pendingPrompt.prompt_text}
          wizardDefaults={(pendingPrompt.meta_instructions as any)?.wizard_defaults}
          onConfirm={handlePlaceholderConfirm}
        />
      )}

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        open={showImageUpload}
        onOpenChange={setShowImageUpload}
        onUploadComplete={async (imageUrl, promptText, title) => {
          // Create a new prompt with the uploaded image
          try {
            // Build the insert data - include image fields if migration has been applied
            const insertData: any = {
              title: title || `Image Recipe ${new Date().toLocaleDateString()}`,
              prompt_text: promptText || "",
              content_type: "visual" as any,
              collection: "General",
              organization_id: currentOrganizationId!,
              created_by: user?.id,
              is_template: true,
              deliverable_format: "image_prompt",
              additional_context: {
                image_type: null, // Can be set later
                image_url: imageUrl, // Store in additional_context as fallback
              },
            };

            // Try to include image_url and image_source if migration has been applied
            try {
              insertData.image_url = imageUrl;
              insertData.image_source = "uploaded" as any;
            } catch {
              // Migration not applied yet - will use additional_context fallback
            }

            const { data: newPrompt, error } = await supabase
              .from("prompts")
              .insert([insertData])
              .select()
              .single();

            if (error) {
              console.error("Database insert error:", error);
              // If error is about missing columns, try without them
              if (error.message?.includes("column") && (error.message?.includes("image_url") || error.message?.includes("image_source"))) {
                console.warn("Image fields migration not applied yet. Storing image URL in additional_context.");
                // Retry without image_url and image_source
                const { data: retryData, error: retryError } = await supabase
                  .from("prompts")
                  .insert([{
                    title: title || `Image Recipe ${new Date().toLocaleDateString()}`,
                    prompt_text: promptText || "",
                    content_type: "visual" as any,
                    collection: "General",
                    organization_id: currentOrganizationId!,
                    created_by: user?.id,
                    is_template: true,
                    deliverable_format: "image_prompt",
                    additional_context: {
                      image_type: null,
                      image_url: imageUrl, // Store in additional_context as fallback
                    },
                  }])
                  .select()
                  .single();
                
                if (retryError) throw retryError;
                queryClient.invalidateQueries({ queryKey: ["templates"] });
                queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });
                toast({
                  title: "Image uploaded",
                  description: "Your image has been added to the recipe library (note: please apply database migration for full functionality)",
                });
                return;
              }
              throw error;
            }

            queryClient.invalidateQueries({ queryKey: ["templates"] });
            queryClient.invalidateQueries({ queryKey: ["prompt-counts", currentOrganizationId] });

            toast({
              title: "Image uploaded",
              description: "Your image has been added to the recipe library",
            });
          } catch (error: any) {
            console.error("Error creating prompt from upload:", error);
            toast({
              title: "Error",
              description: error.message || "Failed to save image recipe",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Detail Modal */}
      {selectedPrompt && (
        <PromptDetailModal
          prompt={selectedPrompt}
          open={!!selectedPrompt}
          onClose={() => setSelectedPrompt(null)}
          onUse={() => handleUsePrompt(selectedPrompt.id)}
          onUpdate={() => {
            queryClient.invalidateQueries({ queryKey: ["templates"] });
            setSelectedPrompt(null);
          }}
          imageUrl={getRecipeImageUrl(
            selectedPrompt,
            promptImageMap.get(selectedPrompt.id) || null
          )}
        />
      )}
    </div>
  );
};

const Templates = () => {
  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 bg-[#F5F1E8]">
          <h2 className="text-2xl font-serif text-brand-ink">Unable to load Prompt Library</h2>
          <p className="text-[#6B6560] text-center max-w-md">
            There was an error loading your prompts. Please refresh the page or try again later.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </div>
      }
    >
      <TemplatesContent />
    </ErrorBoundary>
  );
};

export default Templates;
