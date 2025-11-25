import { Search, Grid3x3, List, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { libraryContentTypes } from "@/config/libraryContentTypes";
import { SortOption } from "./SortDropdown";
import { cn } from "@/lib/utils";

interface LibraryFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedContentType: string;
  onContentTypeChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
}

const sortOptions = [
  { value: "recent", label: "Newest First" },
  { value: "alphabetical", label: "A-Z" },
  { value: "mostUsed", label: "Most Used" },
];

export function LibraryFilters({
  searchQuery,
  onSearchChange,
  selectedContentType,
  onContentTypeChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  showArchived,
  onShowArchivedChange,
}: LibraryFiltersProps) {
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-tooltip-target="library-search"
          placeholder="Search content by title or text..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card/50 border-border/20"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Content Type */}
        <Select value={selectedContentType} onValueChange={onContentTypeChange}>
          <SelectTrigger
            data-tooltip-target="content-type-filter"
            className="w-[180px] bg-card/50 border-border/20"
          >
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {libraryContentTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <SelectItem key={type.id} value={type.id}>
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-4 h-4" />
                    {type.name}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px] bg-card/50 border-border/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* View Mode Toggle */}
        <div className="flex items-center border border-border/20 rounded-lg bg-card/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "rounded-r-none",
              viewMode === "grid" && "bg-brass/20 text-brass hover:bg-brass/30"
            )}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "rounded-l-none border-l border-border/20",
              viewMode === "list" && "bg-brass/20 text-brass hover:bg-brass/30"
            )}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        {/* Show Archived */}
        <Button
          variant={showArchived ? "secondary" : "outline"}
          size="sm"
          onClick={() => onShowArchivedChange(!showArchived)}
          className="gap-2"
        >
          <Archive className="w-4 h-4" />
          Show Archived
        </Button>
      </div>
    </div>
  );
}
