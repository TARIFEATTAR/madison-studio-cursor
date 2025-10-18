import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Star, Clock, TrendingUp, ChevronDown, ChevronRight, Plus, Hash, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { contentTypeMapping } from "@/utils/contentTypeMapping";
import { useCollections } from "@/hooks/useCollections";
import { getCollectionIcon, formatCollectionDisplay } from "@/utils/collectionIcons";

import { cn } from "@/lib/utils";

interface PromptLibrarySidebarProps {
  onQuickAccessSelect: (type: "favorites" | "recently-used" | "most-used") => void;
  onCollectionSelect: (collection: string | null) => void;
  onCategorySelect: (category: string | null) => void;
  selectedQuickAccess: string | null;
  selectedCollection: string | null;
  selectedCategory: string | null;
  onClearFilters?: () => void;
  className?: string;
}

const PromptLibrarySidebar = ({
  onQuickAccessSelect,
  onCollectionSelect,
  onCategorySelect,
  selectedQuickAccess,
  selectedCollection,
  selectedCategory,
  onClearFilters,
  className,
}: PromptLibrarySidebarProps) => {
  const { currentOrganizationId } = useOnboarding();
  const { collections } = useCollections();
  const [expandedSections, setExpandedSections] = useState({
    collections: true,
    categories: true,
  });

  // Fetch counts for each section
  const { data: counts } = useQuery({
    queryKey: ["prompt-counts", currentOrganizationId],
    queryFn: async () => {
      const { data: prompts } = await supabase
        .from("prompts")
        .select("content_type, collection, times_used, is_archived, meta_instructions")
        .eq("organization_id", currentOrganizationId)
        .eq("is_archived", false);

      if (!prompts) return { favorites: 0, recentlyUsed: 0, mostUsed: 0, collections: {}, categories: {} };

      // Count prompts by collection and category
      const collectionCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      prompts.forEach((prompt) => {
        // Collection counts
        if (prompt.collection) {
          collectionCounts[prompt.collection] = (collectionCounts[prompt.collection] || 0) + 1;
        }
        
        // Category counts - use meta_instructions.category if available, otherwise map from content_type
        const category = (prompt.meta_instructions as any)?.category;
        if (category) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        } else if (prompt.content_type) {
          // Map content_type to category for backwards compatibility
          const mapping = contentTypeMapping.find(m => m.keys.includes(prompt.content_type));
          if (mapping) {
            const categoryKey = mapping.name.toLowerCase();
            categoryCounts[categoryKey] = (categoryCounts[categoryKey] || 0) + 1;
          }
        }
      });

      return {
        favorites: 0,
        recentlyUsed: prompts.filter(p => p.times_used && p.times_used > 0).length,
        mostUsed: prompts.filter(p => p.times_used && p.times_used >= 5).length,
        collections: collectionCounts,
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
      {(selectedQuickAccess || selectedCollection || selectedCategory) && (
        <div className="flex items-center justify-between p-4 bg-warm-gray/5 rounded-md border border-charcoal/10">
          <span className="text-sm font-medium text-charcoal/70">
            {[selectedQuickAccess, selectedCollection, selectedCategory].filter(Boolean).length} filter(s) active
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

      {/* Collections Card */}
      <Card className="border border-charcoal/10 bg-card shadow-sm rounded-lg">
        <CardContent className="p-6">
          <button
            onClick={() => toggleSection("collections")}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
          >
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-aged-brass" />
              <h3 className="font-semibold text-base text-foreground">Collections</h3>
            </div>
            {expandedSections.collections ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {expandedSections.collections && (
            <div className="space-y-2 mt-4">
              {collections.map((collection) => {
                const count = counts?.collections?.[collection.name.toLowerCase().replace(/ /g, '_')] || 0;
                const isSelected = selectedCollection === collection.name.toLowerCase().replace(/ /g, '_');
                const CollectionIcon = getCollectionIcon(collection.name) || Layers;
                
                return (
                  <button
                    key={collection.id}
                    onClick={() => onCollectionSelect(isSelected ? null : collection.name.toLowerCase().replace(/ /g, '_'))}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                      isSelected
                        ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                        : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <CollectionIcon className="h-4 w-4" />
                      <span>{formatCollectionDisplay(collection.name)}</span>
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

      {/* Categories Card */}
      <Card className="border border-charcoal/10 bg-card shadow-sm rounded-lg">
        <CardContent className="p-6">
          <button
            onClick={() => toggleSection("categories")}
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
          >
            <div className="flex items-center gap-3">
              <Hash className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-base text-foreground">Categories</h3>
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
                <span>All Prompts</span>
                <Badge variant="secondary" className={cn(
                  "text-xs font-medium min-w-[36px] h-6 justify-center rounded-md",
                  selectedCategory === null ? "bg-aged-brass/20 text-aged-brass" : "bg-charcoal/5 text-charcoal/60"
                )}>
                  {Object.values(counts?.categories || {}).reduce((a, b) => a + b, 0)}
                </Badge>
              </button>

              {contentTypeMapping.map((type) => {
                const categoryKey = type.name.toLowerCase();
                const count = counts?.categories?.[categoryKey] || 0;
                const isSelected = selectedCategory === categoryKey;
                const Icon = type.icon;
                
                return (
                  <button
                    key={categoryKey}
                    onClick={() => onCategorySelect(isSelected ? null : categoryKey)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-md text-sm transition-all",
                      isSelected
                        ? "bg-aged-brass/10 text-aged-brass font-medium border border-aged-brass/20"
                        : "hover:bg-charcoal/5 text-charcoal/70 border border-transparent"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4" />
                      <span>{type.name}</span>
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
