import { useState } from "react";
import { Search, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MasterContentCard } from "./MasterContentCard";
import { Badge } from "@/components/ui/badge";

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
  word_count: number;
  collection: string | null;
  created_at: string;
}

interface MasterContentSwitcherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterContents: MasterContent[];
  selectedMasterId: string | null;
  onSelectMaster: (master: MasterContent) => void;
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
  derivativeCounts: Record<string, number>;
}

export function MasterContentSwitcher({
  open,
  onOpenChange,
  masterContents,
  selectedMasterId,
  onSelectMaster,
  onArchive,
  onDelete,
  derivativeCounts,
}: MasterContentSwitcherProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const handleSelect = (master: MasterContent) => {
    onSelectMaster(master);
    onOpenChange(false);
    setSearchQuery("");
  };

  // Get unique content types
  const contentTypes = Array.from(new Set(masterContents.map(m => m.content_type))).sort();

  // Filter and sort
  const filteredContent = masterContents
    .filter(master => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        master.title.toLowerCase().includes(query) ||
        master.content_type.toLowerCase().includes(query) ||
        (master.collection?.toLowerCase() || "").includes(query);
      
      const matchesType = typeFilter === "all" || master.content_type === typeFilter;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case "oldest": 
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "title": 
          return a.title.localeCompare(b.title);
        case "type": 
          return a.content_type.localeCompare(b.content_type);
        default: // "newest"
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-full sm:max-w-2xl p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border/20">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-serif">Switch Master Content</SheetTitle>
            <Badge variant="outline" className="text-xs">
              {masterContents.length} total
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Select which master content to view derivatives for
          </p>
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/20">
            <p className="text-xs text-muted-foreground">
              <strong>Master Content</strong> = Original long-form pieces you create (blog posts, newsletters, product stories).
              <br />
              <strong>Derivatives</strong> = Shorter platform-specific versions generated from master content (emails, social posts, product descriptions).
            </p>
          </div>
        </SheetHeader>

        {/* Filters */}
        <div className="px-6 py-4 space-y-3 border-b border-border/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, type, or collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="all">All Types</SelectItem>
                {contentTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background">
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="title">A-Z</SelectItem>
                <SelectItem value="type">By Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredContent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-16 w-16 text-muted-foreground opacity-40 mb-4" />
              <h3 className="text-lg font-medium mb-2">No content found</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || typeFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first master content in Create"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContent.map((content) => (
                <div
                  key={content.id}
                  className={selectedMasterId === content.id ? "ring-2 ring-primary/20 rounded-lg" : ""}
                >
                  <MasterContentCard
                    content={content}
                    isSelected={selectedMasterId === content.id}
                    onClick={() => handleSelect(content)}
                    onArchive={() => onArchive(content.id)}
                    onDelete={() => onDelete(content.id)}
                    derivativeCount={derivativeCounts[content.id] || 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
