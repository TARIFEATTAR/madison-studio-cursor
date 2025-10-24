import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Star, Clock, TrendingUp, ChevronDown, ChevronRight, Hash, Package, Sparkles, ShoppingBag, Users, Camera, Palette, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Image-specific categories for the prompt library
const IMAGE_CATEGORIES = [
  { key: "product", label: "Product Photography", icon: Package },
  { key: "lifestyle", label: "Lifestyle", icon: Sparkles },
  { key: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { key: "social", label: "Social Media", icon: Users },
  { key: "editorial", label: "Editorial", icon: Camera },
  { key: "creative", label: "Creative & Artistic", icon: Palette },
  { key: "flat_lay", label: "Flat Lay", icon: Grid3x3 },
];

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
        .select("times_used, is_archived, is_template, last_used_at, additional_context, deliverable_format")
        .eq("organization_id", currentOrganizationId)
        .eq("is_archived", false)
        .eq("deliverable_format", "image_prompt");

      if (!prompts) return { favorites: 0, recentlyUsed: 0, mostUsed: 0, categories: {} };

      // Count prompts by image category
      const categoryCounts: Record<string, number> = {};

      prompts.forEach((prompt) => {
        // Extract category from additional_context
        const imageType = (prompt.additional_context as any)?.image_type;
        if (imageType) {
          categoryCounts[imageType] = (categoryCounts[imageType] || 0) + 1;
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
    <div className={cn("h-screen overflow-y-auto bg-white", className)}>
      <div className="p-6 space-y-6">
        {/* Active Filters Summary */}
      {(selectedQuickAccess || selectedCategory) && (
        <div className="flex items-center justify-between p-4 bg-warm-gray/5 rounded-md border border-charcoal/10">
          <span className="text-sm font-medium text-charcoal/70">
            {[selectedQuickAccess, selectedCategory].filter(Boolean).length} filter(s) active
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 text-xs text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5"
          >
            Clear All
          </Button>
        </div>
      )}

      {/* Quick Access Card */}
      <Card className="border border-charcoal/10 bg-card shadow-sm rounded-lg">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <Star className="h-5 w-5 text-aged-brass" />
            <h3 className="font-semibold text-base text-foreground">Quick Access</h3>
          </div>
          <div className="space-y-2">
            <button
              onClick={() => onQuickAccessSelect("favorites")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                selectedQuickAccess === "favorites"
                  ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                  : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Star className="h-4 w-4" />
                Favorites
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-medium min-w-[36px] h-6 justify-center rounded-md",
                selectedQuickAccess === "favorites" 
                  ? "bg-aged-brass/20 text-aged-brass" 
                  : "bg-charcoal/5 text-charcoal/60"
              )}>
                {counts?.favorites || 0}
              </Badge>
            </button>
            <button
              onClick={() => onQuickAccessSelect("recently-used")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                selectedQuickAccess === "recently-used"
                  ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                  : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <Clock className="h-4 w-4" />
                Recently Used
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-medium min-w-[36px] h-6 justify-center rounded-md",
                selectedQuickAccess === "recently-used" 
                  ? "bg-aged-brass/20 text-aged-brass" 
                  : "bg-charcoal/5 text-charcoal/60"
              )}>
                {counts?.recentlyUsed || 0}
              </Badge>
            </button>
            <button
              onClick={() => onQuickAccessSelect("most-used")}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                selectedQuickAccess === "most-used"
                  ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                  : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
              )}
            >
              <span className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4" />
                Most Used
              </span>
              <Badge variant="secondary" className={cn(
                "text-xs font-medium min-w-[36px] h-6 justify-center rounded-md",
                selectedQuickAccess === "most-used" 
                  ? "bg-aged-brass/20 text-aged-brass" 
                  : "bg-charcoal/5 text-charcoal/60"
              )}>
                {counts?.mostUsed || 0}
              </Badge>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Image Categories Card */}
      <Card className="border border-charcoal/10 bg-card shadow-sm rounded-lg">
        <CardContent className="p-6">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
          >
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-aged-brass" />
              <h3 className="font-semibold text-base text-foreground">Image Types</h3>
            </div>
            {expandedSections.categories ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSections.categories && (
            <div className="space-y-2 mt-4">
              <button
                onClick={() => onCategorySelect(null)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                  selectedCategory === null
                    ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                    : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
                )}
              >
                <span>All Types</span>
                <Badge variant="secondary" className={cn(
                  "text-xs font-medium min-w-[36px] h-6 justify-center rounded-md",
                  selectedCategory === null ? "bg-aged-brass/20 text-aged-brass" : "bg-charcoal/5 text-charcoal/60"
                )}>
                  {Object.values(counts?.categories || {}).reduce((a, b) => a + b, 0)}
                </Badge>
              </button>

              {IMAGE_CATEGORIES.map((category) => {
                const count = counts?.categories?.[category.key] || 0;
                const isSelected = selectedCategory === category.key;
                const Icon = category.icon;
                
                return (
                  <button
                    key={category.key}
                    onClick={() => onCategorySelect(isSelected ? null : category.key)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                      isSelected
                        ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                        : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{category.label}</span>
                    </span>
                    <Badge variant="secondary" className={cn(
                      "text-xs font-medium min-w-[36px] h-6 justify-center rounded-md",
                      isSelected 
                        ? "bg-aged-brass/20 text-aged-brass" 
                        : "bg-charcoal/5 text-charcoal/60"
                    )}>
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
