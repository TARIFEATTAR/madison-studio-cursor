import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Star, Clock, TrendingUp, ChevronDown, ChevronRight, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { BROAD_IMAGE_CATEGORIES, getImageCategoryByKey } from "@/data/imageCategories";

interface PromptLibrarySidebarProps {
  onQuickAccessSelect: (type: "favorites" | "recently-used" | "most-used") => void;
  onCategorySelect: (category: string | null) => void;
  selectedQuickAccess: string | null;
  selectedCategory: string | null;
  onClearFilters?: () => void;
  className?: string;
}

const PromptLibrarySidebar = ({
  onQuickAccessSelect,
  onCategorySelect,
  selectedQuickAccess,
  selectedCategory,
  onClearFilters,
  className,
}: PromptLibrarySidebarProps) => {
  const { currentOrganizationId } = useOnboarding();
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
  });

  // Fetch counts for each section
  const { data: counts } = useQuery({
    queryKey: ["image-prompt-counts", currentOrganizationId],
    queryFn: async () => {
      const { data: prompts } = await supabase
        .from("prompts")
        .select("times_used, is_archived, is_template, last_used_at, additional_context, deliverable_format, category")
        .eq("organization_id", currentOrganizationId)
        .eq("is_archived", false)
        .eq("deliverable_format", "image_prompt");

      if (!prompts) return { favorites: 0, recentlyUsed: 0, mostUsed: 0, categories: {} };

      // Count prompts by image category
      const categoryCounts: Record<string, number> = {};
      // Initialize counts for all broad categories
      BROAD_IMAGE_CATEGORIES.forEach(cat => {
        categoryCounts[cat.key] = 0;
      });

      prompts.forEach((prompt) => {
        // 1. Try direct category column
        let categoryKey = (prompt as any).category;
        
        // 2. Fallback to additional_context
        if (!categoryKey) {
          categoryKey = (prompt.additional_context as any)?.category || (prompt.additional_context as any)?.image_type;
        }

        // 3. Resolve to broad category if it's a specific shot type
        if (categoryKey) {
          // Check if it's already a broad category
          const isBroad = BROAD_IMAGE_CATEGORIES.some(c => c.key === categoryKey);
          
          if (isBroad) {
            categoryCounts[categoryKey] = (categoryCounts[categoryKey] || 0) + 1;
          } else {
            // Try to find the specific shot type and map it
            const specificCategory = getImageCategoryByKey(categoryKey);
            if (specificCategory) {
              const broadKey = specificCategory.broadCategory;
              categoryCounts[broadKey] = (categoryCounts[broadKey] || 0) + 1;
            }
          }
        }
      });

      return {
        favorites: prompts.filter(p => p.is_template).length,
        recentlyUsed: prompts.filter(p => p.last_used_at).length,
        mostUsed: prompts.filter(p => p.times_used && p.times_used >= 5).length,
        categories: categoryCounts,
      };
    },
    enabled: !!currentOrganizationId,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className={cn("h-screen overflow-y-auto bg-brand-parchment", className)}>
      <div className="p-6 space-y-6">
        {/* Active Filters Summary */}
      {(selectedQuickAccess || selectedCategory) && (
        <div className="flex items-center justify-between p-4 bg-brand-vellum rounded-md border border-brand-stone/30">
          <span className="text-sm font-medium text-muted-foreground">
            {[selectedQuickAccess, selectedCategory].filter(Boolean).length} filter(s) active
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs text-muted-foreground hover:text-brand-brass hover:bg-brand-brass/5"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Quick Access Card */}
      <Card className="border border-brand-stone/30 bg-card shadow-level-1 rounded-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Star className="h-5 w-5 text-brand-brass" />
            <h3 className="font-serif text-lg font-semibold text-foreground">Quick Access</h3>
          </div>
          <div className="space-y-1">
            <button
              onClick={() => onQuickAccessSelect("favorites")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                selectedQuickAccess === "favorites"
                  ? "bg-brand-brass/10 text-brand-brass font-medium border-l-2 border-brand-brass"
                  : "hover:bg-brand-vellum text-muted-foreground hover:text-brand-brass"
              )}
            >
              <span className="flex items-center gap-3">
                <Star className="h-4 w-4" />
                Favorites
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-medium min-w-[32px] h-5 justify-center rounded-full",
                selectedQuickAccess === "favorites" 
                  ? "bg-brand-brass/20 text-brand-brass" 
                  : "bg-muted text-muted-foreground"
              )}>
                {counts?.favorites || 0}
              </Badge>
            </button>
            <button
              onClick={() => onQuickAccessSelect("recently-used")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                selectedQuickAccess === "recently-used"
                  ? "bg-brand-brass/10 text-brand-brass font-medium border-l-2 border-brand-brass"
                  : "hover:bg-brand-vellum text-muted-foreground hover:text-brand-brass"
              )}
            >
              <span className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                Recently Used
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-medium min-w-[32px] h-5 justify-center rounded-full",
                selectedQuickAccess === "recently-used" 
                  ? "bg-brand-brass/20 text-brand-brass" 
                  : "bg-muted text-muted-foreground"
              )}>
                {counts?.recentlyUsed || 0}
              </Badge>
            </button>
            <button
              onClick={() => onQuickAccessSelect("most-used")}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                selectedQuickAccess === "most-used"
                  ? "bg-brand-brass/10 text-brand-brass font-medium border-l-2 border-brand-brass"
                  : "hover:bg-brand-vellum text-muted-foreground hover:text-brand-brass"
              )}
            >
              <span className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4" />
                Most Used
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-medium min-w-[32px] h-5 justify-center rounded-full",
                selectedQuickAccess === "most-used" 
                  ? "bg-brand-brass/20 text-brand-brass" 
                  : "bg-muted text-muted-foreground"
              )}>
                {counts?.mostUsed || 0}
              </Badge>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Image Categories Card */}
      <Card className="border border-brand-stone/30 bg-card shadow-level-1 rounded-lg">
        <CardContent className="p-6">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
          >
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-brand-brass" />
              <h3 className="font-serif text-lg font-semibold text-foreground">Image Types</h3>
            </div>
            {expandedSections.categories ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
            )}
          </button>
          {expandedSections.categories && (
            <div className="space-y-1 mt-4">
              <button
                onClick={() => onCategorySelect(null)}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                  selectedCategory === null
                    ? "bg-brand-brass/10 text-brand-brass font-medium border-l-2 border-brand-brass"
                    : "hover:bg-brand-vellum text-muted-foreground hover:text-brand-brass"
                )}
              >
                <span>All Types</span>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-xs font-medium min-w-[32px] h-5 justify-center rounded-full",
                    selectedCategory === null
                      ? "bg-brand-brass/20 text-brand-brass"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {counts?.categories?.all ?? 0}
                </Badge>
              </button>

              {BROAD_IMAGE_CATEGORIES.map((category) => {
                const count = counts?.categories?.[category.key] || 0;
                const isSelected = selectedCategory === category.key;
                const Icon = category.icon;
                
                return (
                  <button
                    key={category.key}
                    onClick={() => onCategorySelect(isSelected ? null : category.key)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                      isSelected
                        ? "bg-brand-brass/10 text-brand-brass font-medium border-l-2 border-brand-brass"
                        : "hover:bg-brand-vellum text-muted-foreground hover:text-brand-brass"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs font-medium min-w-[32px] h-5 justify-center rounded-full",
                        isSelected
                          ? "bg-brand-brass/20 text-brand-brass"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </Badge>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default PromptLibrarySidebar;
