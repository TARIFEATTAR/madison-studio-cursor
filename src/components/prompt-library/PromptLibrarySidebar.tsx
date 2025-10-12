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
          <div className="flex items-center justify-between p-4 bg-[#F5F1E8] rounded-xl border-2 border-[#D4CFC8]">
            <span className="text-sm font-medium text-[#6B6560]">
              {[selectedQuickAccess, selectedCollection, selectedCategory].filter(Boolean).length} filter(s) active
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="h-8 text-xs text-[#B8956A] hover:text-[#D4AF37] hover:bg-transparent"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Quick Access Card */}
        <Card className="border-2 border-[#D4CFC8] bg-white shadow-md rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <Star className="h-6 w-6 text-[#D4AF37]" fill="#D4AF37" />
              <h3 className="font-semibold text-lg text-[#1A1816]">Quick Access</h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => onQuickAccessSelect("favorites")}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                  selectedQuickAccess === "favorites"
                    ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                    : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                )}
              >
                <span className="flex items-center gap-3">
                  <Star className="h-4 w-4" />
                  Favorites
                </span>
                <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-gradient-to-r from-[#B8956A] to-[#D4AF37] text-white rounded-lg">
                  {counts?.favorites || 0}
                </Badge>
              </button>
              <button
                onClick={() => onQuickAccessSelect("recently-used")}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                  selectedQuickAccess === "recently-used"
                    ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                    : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                )}
              >
                <span className="flex items-center gap-3">
                  <Clock className="h-4 w-4" />
                  Recently Used
                </span>
                <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-[#D4CFC8] text-[#1A1816] rounded-lg">
                  {counts?.recentlyUsed || 0}
                </Badge>
              </button>
              <button
                onClick={() => onQuickAccessSelect("most-used")}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                  selectedQuickAccess === "most-used"
                    ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                    : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                )}
              >
                <span className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4" />
                  Most Used
                </span>
                <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-[#D4CFC8] text-[#1A1816] rounded-lg">
                  {counts?.mostUsed || 0}
                </Badge>
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Collections Card */}
        <Card className="border-2 border-[#D4CFC8] bg-white shadow-md rounded-2xl">
          <CardContent className="p-6">
            <button
              onClick={() => toggleSection("collections")}
              className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-[#B8956A]" />
                <h3 className="font-semibold text-lg text-[#1A1816]">Collections</h3>
              </div>
              {expandedSections.collections ? (
                <ChevronDown className="h-5 w-5 text-[#6B6560]" />
              ) : (
                <ChevronRight className="h-5 w-5 text-[#6B6560]" />
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
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                        isSelected
                          ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                          : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <CollectionIcon className={cn("h-4 w-4", isSelected ? "text-[#B8956A]" : "text-[#6B6560]")} />
                        <span>{formatCollectionDisplay(collection.name)}</span>
                      </span>
                      <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-[#D4CFC8] text-[#1A1816] rounded-lg">
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
        <Card className="border-2 border-[#D4CFC8] bg-white shadow-md rounded-2xl">
          <CardContent className="p-6">
            <button
              onClick={() => toggleSection("categories")}
              className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
            >
              <div className="flex items-center gap-3">
                <Hash className="h-6 w-6 text-[#6B6560]" />
                <h3 className="font-semibold text-lg text-[#1A1816]">Categories</h3>
              </div>
              {expandedSections.categories ? (
                <ChevronDown className="h-5 w-5 text-[#6B6560]" />
              ) : (
                <ChevronRight className="h-5 w-5 text-[#6B6560]" />
              )}
            </button>
            {expandedSections.categories && (
              <div className="space-y-2 mt-4">
                <button
                  onClick={() => onCategorySelect(null)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all",
                    selectedCategory === null
                      ? "bg-gradient-to-r from-[#B8956A] to-[#D4AF37] text-white shadow-md"
                      : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                  )}
                >
                  <span>All Prompts</span>
                  <Badge variant="secondary" className={cn(
                    "text-xs font-bold min-w-[36px] h-7 justify-center rounded-lg",
                    selectedCategory === null ? "bg-white/20 text-white" : "bg-[#D4CFC8] text-[#1A1816]"
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
                        "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                        isSelected
                          ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                          : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <Icon className={cn("h-4 w-4", isSelected ? "text-[#B8956A]" : "text-[#6B6560]")} />
                        <span>{type.name}</span>
                      </span>
                      <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-[#D4CFC8] text-[#1A1816] rounded-lg">
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
