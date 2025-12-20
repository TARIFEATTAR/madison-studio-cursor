import { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Calendar,
  Tag,
  CheckCircle2,
  Loader2,
  Package,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useLibraryContent } from "@/hooks/useLibraryContent";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ContentTarget = "short_description" | "long_description" | "tagline";

interface ContentPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ContentTarget;
  onSelect: (content: string) => void;
  productId?: string; // Optional - when provided, shows product-specific content
  productName?: string; // For display purposes
}

// Content types that match the target
const TARGET_CONTENT_TYPES: Record<ContentTarget, string[]> = {
  tagline: ["tagline", "headline", "social_caption", "ad_copy"],
  short_description: ["short_description", "product_description", "social_caption", "ad_copy"],
  long_description: ["long_description", "product_description", "blog_post", "long_form_article", "brand_story", "product_story", "about_page"],
};

// All relevant content types for product descriptions
const RELEVANT_CONTENT_TYPES = [
  "product_description",
  "blog_post",
  "long_form_article",
  "brand_story",
  "social_caption",
  "product_story",
  "about_page",
  "tagline",
  "headline",
  "ad_copy",
  "short_description",
  "long_description",
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ContentPickerModal({
  open,
  onOpenChange,
  target,
  onSelect,
  productId,
  productName,
}: ContentPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>(productId ? "product" : "all");
  
  const { data: libraryContent = [], isLoading: libraryLoading } = useLibraryContent(false, 1, 100);

  // Fetch outputs specifically for this product
  // Two approaches: 1) exact product_id match, 2) content mentions product name
  const { data: productOutputs = [], isLoading: productOutputsLoading } = useQuery({
    queryKey: ["product-outputs", productId, productName],
    queryFn: async () => {
      if (!productId && !productName) return [];

      const results: any[] = [];
      const seenIds = new Set<string>();

      // APPROACH 1: Get prompts with exact product_id match (most accurate)
      if (productId) {
        const { data: prompts, error: promptsError } = await supabase
          .from("prompts")
          .select("id, deliverable_format, title")
          .eq("product_id", productId);

        if (!promptsError && prompts && prompts.length > 0) {
          const promptIds = prompts.map(p => p.id);
          const promptInfo = new Map(prompts.map(p => [p.id, { format: p.deliverable_format, title: p.title }]));

          const { data: outputs, error: outputsError } = await supabase
            .from("outputs")
            .select("id, prompt_id, generated_content, quality_rating, created_at")
            .in("prompt_id", promptIds)
            .order("created_at", { ascending: false });

          if (!outputsError && outputs) {
            for (const output of outputs) {
              if (!seenIds.has(output.id)) {
                seenIds.add(output.id);
                const info = promptInfo.get(output.prompt_id);
                results.push({
                  id: output.id,
                  title: info?.title || `${info?.format?.replace(/_/g, " ") || "Content"} for ${productName || "Product"}`,
                  contentType: info?.format || "content",
                  content: output.generated_content,
                  createdAt: new Date(output.created_at),
                  rating: output.quality_rating,
                  isProductSpecific: true,
                  matchType: "exact", // Exact product_id match
                });
              }
            }
          }
        }
      }

      // APPROACH 2: Search for content that mentions the product name
      if (productName && productName.length > 2) {
        // Search master_content for product name mentions
        const { data: masterContent, error: masterError } = await supabase
          .from("master_content")
          .select("id, title, content_type, full_content, created_at, quality_rating")
          .or(`title.ilike.%${productName}%,full_content.ilike.%${productName}%`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!masterError && masterContent) {
          for (const item of masterContent) {
            const itemId = `master-${item.id}`;
            if (!seenIds.has(itemId)) {
              seenIds.add(itemId);
              results.push({
                id: itemId,
                title: item.title || "Untitled",
                contentType: item.content_type || "content",
                content: item.full_content,
                createdAt: new Date(item.created_at),
                rating: item.quality_rating,
                isProductSpecific: true,
                matchType: "name", // Matched by product name in content
              });
            }
          }
        }

        // Also search outputs for product name mentions
        const { data: outputsWithName, error: outputsNameError } = await supabase
          .from("outputs")
          .select("id, prompt_id, generated_content, quality_rating, created_at, prompts(title, deliverable_format)")
          .ilike("generated_content", `%${productName}%`)
          .order("created_at", { ascending: false })
          .limit(20);

        if (!outputsNameError && outputsWithName) {
          for (const output of outputsWithName) {
            if (!seenIds.has(output.id)) {
              seenIds.add(output.id);
              const prompt = output.prompts as any;
              results.push({
                id: output.id,
                title: prompt?.title || `${prompt?.deliverable_format?.replace(/_/g, " ") || "Content"} mentioning ${productName}`,
                contentType: prompt?.deliverable_format || "content",
                content: output.generated_content,
                createdAt: new Date(output.created_at),
                rating: output.quality_rating,
                isProductSpecific: true,
                matchType: "name", // Matched by product name in content
              });
            }
          }
        }
      }

      // Sort results: exact matches first, then by date
      return results.sort((a, b) => {
        if (a.matchType === "exact" && b.matchType !== "exact") return -1;
        if (a.matchType !== "exact" && b.matchType === "exact") return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    },
    enabled: !!(productId || productName) && open,
  });

  // Reset tab when product changes
  useEffect(() => {
    if (productId) {
      setActiveTab("product");
    } else {
      setActiveTab("all");
    }
  }, [productId]);

  // Get the relevant content types for this target
  const targetTypes = TARGET_CONTENT_TYPES[target] || [];

  // Filter content based on search and relevance
  const filterContent = (items: any[]) => {
    return items.filter((item) => {
      // Search filter
      const matchesSearch = searchQuery.length === 0 || 
        item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.content?.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  };

  // Sort by relevance (matching content types first, then by date)
  const sortContent = (items: any[]) => {
    return [...items].sort((a, b) => {
      // First: exact match for target type
      const aIsExactMatch = targetTypes.includes(a.contentType);
      const bIsExactMatch = targetTypes.includes(b.contentType);
      
      if (aIsExactMatch && !bIsExactMatch) return -1;
      if (!aIsExactMatch && bIsExactMatch) return 1;
      
      // Then: any relevant type
      const aIsRelevant = RELEVANT_CONTENT_TYPES.includes(a.contentType);
      const bIsRelevant = RELEVANT_CONTENT_TYPES.includes(b.contentType);
      
      if (aIsRelevant && !bIsRelevant) return -1;
      if (!aIsRelevant && bIsRelevant) return 1;
      
      // Finally: by date
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  };

  const filteredLibraryContent = sortContent(filterContent(libraryContent));
  const filteredProductContent = sortContent(filterContent(productOutputs));

  // Combine for "all" view, but prioritize product-specific content
  const combinedContent = productId 
    ? [...filteredProductContent, ...filteredLibraryContent.filter(lc => 
        !filteredProductContent.some(pc => pc.id === lc.id)
      )]
    : filteredLibraryContent;

  const displayContent = activeTab === "product" ? filteredProductContent : combinedContent;
  const isLoading = libraryLoading || productOutputsLoading;

  const selectedItem = displayContent.find((item) => item.id === selectedId);

  const handleConfirm = () => {
    if (selectedItem) {
      onSelect(selectedItem.content || "");
      onOpenChange(false);
      setSelectedId(null);
      setSearchQuery("");
    }
  };

  const getTargetLabel = () => {
    switch (target) {
      case "short_description": return "Short Description";
      case "long_description": return "Full Description";
      case "tagline": return "Tagline";
      default: return "Description";
    }
  };

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setSelectedId(null);
        setSearchQuery("");
      }
    }}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Import {getTargetLabel()}
          </DialogTitle>
          <DialogDescription>
            {productId ? (
              <>Select content created for <strong>{productName || "this product"}</strong> or browse all library content</>
            ) : (
              <>Select content from your library to use as the {getTargetLabel().toLowerCase()}</>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Tabs (only show if product-specific) */}
        {productId && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="product" className="gap-1.5">
                <Package className="w-3.5 h-3.5" />
                For This Product
                {filteredProductContent.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {filteredProductContent.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="all" className="gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                All Library
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab === "product" ? "product content" : "your library"}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Content List */}
        <ScrollArea className="flex-1 border border-border rounded-lg">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : displayContent.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                {activeTab === "product" && productId ? (
                  <>
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No content created for this product yet</p>
                    <p className="text-sm mt-1">
                      Create a {getTargetLabel().toLowerCase()} in the <strong>Create</strong> page with this product selected
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => setActiveTab("all")}
                    >
                      Browse All Library
                    </Button>
                  </>
                ) : (
                  <>
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No content found</p>
                    {searchQuery && (
                      <p className="text-sm mt-1">Try a different search term</p>
                    )}
                  </>
                )}
              </div>
            ) : (
              displayContent.map((item: any) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    "hover:bg-muted/50",
                    selectedId === item.id && "bg-primary/10 border border-primary/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.title || "Untitled"}</span>
                        {item.isProductSpecific && (
                          <Badge variant="default" className="text-xs bg-primary/20 text-primary">
                            <Sparkles className="w-3 h-3 mr-1" />
                            Product
                          </Badge>
                        )}
                        {selectedId === item.id && (
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {truncateContent(item.content || "")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      <Tag className="w-3 h-3 mr-1" />
                      {item.contentType?.replace(/_/g, " ") || "content"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                    </span>
                    {item.wordCount && item.wordCount > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {item.wordCount} words
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Preview & Actions */}
        {selectedItem && (
          <div className="border-t border-border pt-4 space-y-3">
            <div className="text-sm">
              <p className="font-medium text-muted-foreground mb-1">Preview:</p>
              <div className="bg-muted/50 rounded-lg p-3 max-h-32 overflow-y-auto text-foreground text-sm whitespace-pre-wrap">
                {selectedItem.content || "No content"}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedId}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Import to {getTargetLabel()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
