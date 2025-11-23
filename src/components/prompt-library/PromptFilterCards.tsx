import { Star, Folder, Hash, ChevronDown, Plus, Clock, TrendingUp } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface PromptFilterCardsProps {
  counts: {
    total: number;
    favorites: number;
    recentlyUsed: number;
    mostUsed: number;
    collections: Record<string, number>;
    categories: Record<string, number>;
  };
  selectedQuickAccess: string | null;
  selectedCollection: string | null;
  selectedCategory: string | null;
  onQuickAccessSelect: (type: string | null) => void;
  onCollectionSelect: (collection: string | null) => void;
  onCategorySelect: (category: string | null) => void;
}

const collectionLabels: Record<string, { label: string; icon: string }> = {
  product_launches: { label: "Product Launches", icon: "Rocket" },
  social_media: { label: "Social Media", icon: "Share2" },
  email_campaigns: { label: "Email Campaigns", icon: "Mail" },
  seasonal_content: { label: "Seasonal Content", icon: "Sparkles" },
  customer_stories: { label: "Customer Stories", icon: "Heart" },
};

const categoryLabels: Record<string, string> = {
  all: "All Prompts",
  product: "Product",
  blog: "Editorial",
  email: "Email",
  social: "Social",
  visual: "Visual",
};

export default function PromptFilterCards({
  counts,
  selectedQuickAccess,
  selectedCollection,
  selectedCategory,
  onQuickAccessSelect,
  onCollectionSelect,
  onCategorySelect,
}: PromptFilterCardsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Quick Access Card */}
      <Collapsible defaultOpen={true}>
        <div className="bg-brand-parchment border border-brand-stone rounded-xl p-6">
          <CollapsibleTrigger className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-brand-charcoal" />
              <h3 className="font-semibold text-base text-brand-ink">Quick Access</h3>
            </div>
            <ChevronDown className="w-4 h-4 text-brand-charcoal" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-2">
              <button
                onClick={() => onQuickAccessSelect(selectedQuickAccess === "favorites" ? null : "favorites")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  selectedQuickAccess === "favorites"
                    ? "bg-brand-brass text-white"
                    : "hover:bg-brand-vellum text-brand-charcoal"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  <span className="font-medium text-sm">Favorites</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    selectedQuickAccess === "favorites"
                      ? "bg-white/20 text-white"
                      : "bg-brand-stone text-brand-ink"
                  }`}
                >
                  {counts.favorites}
                </span>
              </button>

              <button
                onClick={() => onQuickAccessSelect(selectedQuickAccess === "recently_used" ? null : "recently_used")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  selectedQuickAccess === "recently_used"
                    ? "bg-brand-brass text-white"
                    : "hover:bg-brand-vellum text-brand-charcoal"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium text-sm">Recently Used</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    selectedQuickAccess === "recently_used"
                      ? "bg-white/20 text-white"
                      : "bg-brand-stone text-brand-ink"
                  }`}
                >
                  {counts.recentlyUsed}
                </span>
              </button>

              <button
                onClick={() => onQuickAccessSelect(selectedQuickAccess === "most_used" ? null : "most_used")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                  selectedQuickAccess === "most_used"
                    ? "bg-brand-brass text-white"
                    : "hover:bg-brand-vellum text-brand-charcoal"
                }`}
              >
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-medium text-sm">Most Used</span>
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    selectedQuickAccess === "most_used"
                      ? "bg-white/20 text-white"
                      : "bg-brand-stone text-brand-ink"
                  }`}
                >
                  {counts.mostUsed}
                </span>
              </button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Collections Card */}
      <Collapsible defaultOpen={true}>
        <div className="bg-brand-parchment border border-brand-stone rounded-xl p-6">
          <CollapsibleTrigger className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Folder className="w-5 h-5 text-brand-charcoal" />
              <h3 className="font-semibold text-base text-brand-ink">Collections</h3>
            </div>
            <ChevronDown className="w-4 h-4 text-brand-charcoal" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-2">
              {Object.entries(collectionLabels).map(([key, { label, icon }]) => (
                <button
                  key={key}
                  onClick={() => onCollectionSelect(selectedCollection === key ? null : key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    selectedCollection === key
                      ? "bg-brand-brass text-white"
                      : "hover:bg-brand-vellum text-brand-charcoal"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{icon}</span>
                    <span className="font-medium text-sm">{label}</span>
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedCollection === key
                        ? "bg-white/20 text-white"
                        : "bg-brand-stone text-brand-ink"
                    }`}
                  >
                    {counts.collections[key] || 0}
                  </span>
                </button>
              ))}

              <Button
                variant="ghost"
                className="w-full justify-start text-brand-brass hover:text-brand-brass hover:bg-brand-vellum/50 mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Collection
              </Button>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Categories Card */}
      <Collapsible defaultOpen={true}>
        <div className="bg-brand-parchment border border-brand-stone rounded-xl p-6">
          <CollapsibleTrigger className="w-full flex items-center justify-between mb-4 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-2">
              <Hash className="w-5 h-5 text-brand-charcoal" />
              <h3 className="font-semibold text-base text-brand-ink">Categories</h3>
            </div>
            <ChevronDown className="w-4 h-4 text-brand-charcoal" />
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => onCategorySelect(selectedCategory === key ? null : key)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                    selectedCategory === key
                      ? "bg-brand-brass text-white"
                      : "hover:bg-brand-vellum text-brand-charcoal"
                  }`}
                >
                  <span className="font-medium text-sm">{label}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedCategory === key
                        ? "bg-white/20 text-white"
                        : "bg-brand-stone text-brand-ink"
                    }`}
                  >
                    {counts.categories[key] || 0}
                  </span>
                </button>
              ))}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
