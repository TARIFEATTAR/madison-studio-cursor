import { Search, Inbox, Pen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoldButton } from "@/components/ui/gold-button";
import { Link } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="mb-6 p-6 rounded-full bg-[hsl(var(--aged-brass))]/10 border border-[hsl(var(--aged-brass))]/20">
        <Pen className="w-12 h-12 text-[hsl(var(--aged-brass))]" strokeWidth={1.5} />
      </div>
      
      <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">
        Your Archive Awaits
      </h2>
      
      <p className="text-muted-foreground text-center max-w-md mb-8 text-base leading-relaxed">
        Begin your editorial journey by crafting your first piece of content with Madison's assistance.
      </p>
      
      <Link to="/create">
        <GoldButton>
          Create Your First Piece
        </GoldButton>
      </Link>
    </div>
  );
}
