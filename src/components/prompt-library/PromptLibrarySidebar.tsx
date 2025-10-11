import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Star, Clock, TrendingUp, ChevronDown, ChevronRight, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { cn } from "@/lib/utils";

interface PromptLibrarySidebarProps {
  onQuickAccessSelect: (type: "favorites" | "recently-used" | "most-used") => void;
  onCollectionSelect: (collection: string | null) => void;
  onCategorySelect: (category: string | null) => void;
  selectedQuickAccess: string | null;
  selectedCollection: string | null;
  selectedCategory: string | null;
}

const PromptLibrarySidebar = ({
  onQuickAccessSelect,
  onCollectionSelect,
  onCategorySelect,
  selectedQuickAccess,
  selectedCollection,
  selectedCategory,
}: PromptLibrarySidebarProps) => {
  const { currentOrganizationId } = useOnboarding();
  const [expandedSections, setExpandedSections] = useState({
    collections: true,
    categories: true,
  });

  // Fetch counts for each section
  const { data: counts } = useQuery({
    queryKey: ["prompt-counts", currentOrganizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompts")
        .select("collection, content_type, is_template, times_used, last_used_at")
        .eq("organization_id", currentOrganizationId!)
        .eq("is_archived", false);

      if (error) throw error;

      // Calculate Quick Access counts
      const favorites = data.filter(p => p.is_template).length;
      const recentlyUsed = data.filter(p => p.last_used_at).length;
      const mostUsed = data.filter(p => p.times_used > 0).length;

      // Count by collection
      const collectionCounts: Record<string, number> = {};
      data.forEach(p => {
        if (p.collection) {
          collectionCounts[p.collection] = (collectionCounts[p.collection] || 0) + 1;
        }
      });

      // Count by category (content_type)
      const categoryCounts: Record<string, number> = {};
      data.forEach(p => {
        if (p.content_type) {
          categoryCounts[p.content_type] = (categoryCounts[p.content_type] || 0) + 1;
        }
      });

      return {
        total: data.length,
        favorites,
        recentlyUsed,
        mostUsed,
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

  const collectionLabels: Record<string, { icon: string; label: string }> = {
    cadence: { icon: "🚀", label: "Product Launches" },
    reserve: { icon: "📱", label: "Social Media" },
    purity: { icon: "✉️", label: "Email Campaigns" },
    sacred_space: { icon: "🌸", label: "Seasonal Content" },
  };

  const categoryLabels: Record<string, string> = {
    product: "Product",
    email: "Email",
    social: "Social",
    blog: "Editorial",
    visual: "Visual",
  };

  return (
    <div className="w-80 border-r border-border bg-background h-screen flex flex-col">
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Quick Access */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-4 w-4 text-saffron-gold" />
                <h3 className="font-semibold text-sm">Quick Access</h3>
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => onQuickAccessSelect("favorites")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                    selectedQuickAccess === "favorites"
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    ⭐ Favorites
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {counts?.favorites || 0}
                  </Badge>
                </button>
                <button
                  onClick={() => onQuickAccessSelect("recently-used")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                    selectedQuickAccess === "recently-used"
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recently Used
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {counts?.recentlyUsed || 0}
                  </Badge>
                </button>
                <button
                  onClick={() => onQuickAccessSelect("most-used")}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                    selectedQuickAccess === "most-used"
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Most Used
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    {counts?.mostUsed || 0}
                  </Badge>
                </button>
              </div>
            </div>

            <Separator />

            {/* Collections */}
            <div>
              <button
                onClick={() => toggleSection("collections")}
                className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 text-muted-foreground">📁</div>
                  <h3 className="font-semibold text-sm">Collections</h3>
                </div>
                {expandedSections.collections ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedSections.collections && (
                <div className="space-y-1">
                  {Object.entries(collectionLabels).map(([key, { icon, label }]) => (
                    <button
                      key={key}
                      onClick={() => onCollectionSelect(selectedCollection === key ? null : key)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        selectedCollection === key
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {icon} {label}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {counts?.collections[key] || 0}
                      </Badge>
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
                    <Plus className="h-4 w-4" />
                    New Collection
                  </button>
                </div>
              )}
            </div>

            <Separator />

            {/* Categories */}
            <div>
              <button
                onClick={() => toggleSection("categories")}
                className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Categories</h3>
                </div>
                {expandedSections.categories ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
              {expandedSections.categories && (
                <div className="space-y-1">
                  <button
                    onClick={() => onCategorySelect(null)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                      selectedCategory === null
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    )}
                  >
                    <span>All Prompts</span>
                    <Badge variant="secondary" className="text-xs">
                      {counts?.total || 0}
                    </Badge>
                  </button>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => onCategorySelect(selectedCategory === key ? null : key)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors",
                        selectedCategory === key
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50"
                      )}
                    >
                      <span>{label}</span>
                      <Badge variant="secondary" className="text-xs">
                        {counts?.categories[key] || 0}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default PromptLibrarySidebar;
