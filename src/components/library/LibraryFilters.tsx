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
      {/* Search Bar - Enhanced with animated icon */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors duration-300 group-focus-within:text-brand-brass" />
        <Input
          data-tooltip-target="library-search"
          placeholder="Search content by title or text..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-brand-parchment border border-brand-stone rounded-md font-sans text-base text-foreground placeholder:text-muted-foreground/50 transition-all duration-300 ease-in-out shadow-sm focus:border-brand-brass focus:ring-2 focus:ring-brand-brass/20 focus:shadow-level-2 hover:border-brand-brass/40 hover:ring-1 hover:ring-brand-brass/10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Content Type - Enhanced dropdown */}
        <Select value={selectedContentType} onValueChange={onContentTypeChange}>
          <SelectTrigger
            data-tooltip-target="content-type-filter"
            className="w-[180px] bg-brand-parchment border border-brand-stone rounded-md font-sans text-base transition-all duration-300 ease-in-out shadow-sm focus:border-brand-brass focus:ring-2 focus:ring-brand-brass/20 focus:shadow-level-2 hover:border-brand-brass/40 hover:ring-1 hover:ring-brand-brass/10"
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

        {/* Sort - Enhanced dropdown */}
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <SelectTrigger className="w-[180px] bg-brand-parchment border border-brand-stone rounded-md font-sans text-base transition-all duration-300 ease-in-out shadow-sm focus:border-brand-brass focus:ring-2 focus:ring-brand-brass/20 focus:shadow-level-2 hover:border-brand-brass/40 hover:ring-1 hover:ring-brand-brass/10">
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
