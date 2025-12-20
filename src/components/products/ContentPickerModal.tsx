import { useState } from "react";
import {
  FileText,
  Search,
  Calendar,
  Tag,
  CheckCircle2,
  Loader2,
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
import { cn } from "@/lib/utils";
import { useLibraryContent } from "@/hooks/useLibraryContent";
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
}

// Content types that are relevant for product descriptions
const RELEVANT_CONTENT_TYPES = [
  "product_description",
  "blog_post",
  "long_form_article",
  "brand_story",
  "social_caption",
  "product_story",
  "about_page",
];

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function ContentPickerModal({
  open,
  onOpenChange,
  target,
  onSelect,
}: ContentPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const { data: libraryContent = [], isLoading } = useLibraryContent(false, 1, 100);

  // Filter content based on search and relevance
  const filteredContent = libraryContent.filter((item) => {
    // Search filter
    const matchesSearch = searchQuery.length === 0 || 
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  // Sort by relevance (product descriptions first, then by date)
  const sortedContent = [...filteredContent].sort((a, b) => {
    const aIsRelevant = RELEVANT_CONTENT_TYPES.includes(a.contentType);
    const bIsRelevant = RELEVANT_CONTENT_TYPES.includes(b.contentType);
    
    if (aIsRelevant && !bIsRelevant) return -1;
    if (!aIsRelevant && bIsRelevant) return 1;
    
    return b.createdAt.getTime() - a.createdAt.getTime();
  });

  const selectedItem = sortedContent.find((item) => item.id === selectedId);

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
            Import from Library
          </DialogTitle>
          <DialogDescription>
            Select content from your library to use as the {getTargetLabel().toLowerCase()}
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search your content..."
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
            ) : sortedContent.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No content found</p>
                {searchQuery && (
                  <p className="text-sm mt-1">Try a different search term</p>
                )}
              </div>
            ) : (
              sortedContent.map((item) => (
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
