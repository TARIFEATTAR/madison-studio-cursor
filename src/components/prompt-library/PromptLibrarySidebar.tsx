import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Star, Clock, TrendingUp, ChevronDown, ChevronRight, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";

interface PromptLibrarySidebarProps {
  onQuickAccessSelect: (type: "favorites" | "recently-used" | "most-used") => void;
  onCollectionSelect: (collection: string | null) => void;
  onCategorySelect: (category: string | null) => void;
  selectedQuickAccess: string | null;
  selectedCollection: string | null;
  selectedCategory: string | null;
  className?: string;
}

const PromptLibrarySidebar = ({
  onQuickAccessSelect,
  onCollectionSelect,
  onCategorySelect,
  selectedQuickAccess,
  selectedCollection,
  selectedCategory,
  className,
}: PromptLibrarySidebarProps) => {
  const { currentOrganizationId } = useOnboarding();
  const [expandedSections, setExpandedSections] = useState({
    collections: false,
    categories: false,
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
    <div className={cn("h-screen overflow-y-auto bg-white", className)}>
      <div className="p-6 space-y-6">
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

        {/* Collections Card - Collapsed by default */}
        <Card className="border-2 border-[#D4CFC8] bg-white shadow-md rounded-2xl">
          <CardContent className="p-6">
            <button
              onClick={() => toggleSection("collections")}
              className="w-full flex items-center justify-between hover:opacity-80 transition-opacity group"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">📁</div>
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
                {Object.entries(collectionLabels).map(([key, { icon, label }]) => (
                  <button
                    key={key}
                    onClick={() => onCollectionSelect(selectedCollection === key ? null : key)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                      selectedCollection === key
                        ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                        : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{icon}</span>
                      <span>{label}</span>
                    </span>
                    <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-[#D4CFC8] text-[#1A1816] rounded-lg">
                      {counts?.collections[key] || 0}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Categories Card - Collapsed by default */}
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
                    {counts?.total || 0}
                  </Badge>
                </button>
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => onCategorySelect(selectedCategory === key ? null : key)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all",
                      selectedCategory === key
                        ? "bg-[#F5F1E8] text-[#1A1816] font-semibold shadow-sm"
                        : "hover:bg-[#F5F1E8]/50 text-[#6B6560]"
                    )}
                  >
                    <span>{label}</span>
                    <Badge variant="secondary" className="text-xs font-bold min-w-[36px] h-7 justify-center bg-[#D4CFC8] text-[#1A1816] rounded-lg">
                      {counts?.categories[key] || 0}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PromptLibrarySidebar;
