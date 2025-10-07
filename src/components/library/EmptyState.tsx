import { Search, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  hasSearch: boolean;
  hasFilters: boolean;
  onClearFilters: () => void;
  contentType: string;
}

export function EmptyState({ hasSearch, hasFilters, onClearFilters, contentType }: EmptyStateProps) {
  if (hasSearch || hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Search className="w-16 h-16 text-muted-foreground/40 mb-4" />
        <h3 className="text-xl font-medium text-foreground mb-2">No results found</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-md">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Button onClick={onClearFilters} variant="outline">
          Clear all filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Inbox className="w-16 h-16 text-muted-foreground/40 mb-4" />
      <h3 className="text-xl font-medium text-foreground mb-2">No {contentType} yet</h3>
      <p className="text-muted-foreground text-center max-w-md">
        Start creating content to see it appear here.
      </p>
    </div>
  );
}
