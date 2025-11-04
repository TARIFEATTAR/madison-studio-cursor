import { Card } from "@/components/ui/card";
import { Archive, Trash2, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/pages/Templates";
import { CategoryBadge } from "./CategoryBadge";
import { getRecipeImageUrl } from "@/utils/imageRecipeHelpers";

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  imageUrl?: string | null; // Generated or uploaded image URL
}

export function PromptCard({ prompt, onClick, onArchive, onDelete, imageUrl }: PromptCardProps) {
  const recipeImageUrl = getRecipeImageUrl(prompt, imageUrl);
  const hasImage = !!recipeImageUrl;

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 group rounded-lg overflow-hidden",
        "hover:scale-[1.02] hover:shadow-lg border border-charcoal/10",
        "relative aspect-[4/3] bg-[#252220]"
      )}
      onClick={onClick}
    >
      {/* Actions Menu - only show on hover if handlers are provided */}
      {(onArchive || onDelete) && (
        <div 
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-20 flex gap-1" 
          onClick={(e) => e.stopPropagation()}
        >
          {onArchive && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(prompt.id);
              }}
              className="p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 transition-colors"
              title="Archive"
            >
              <Archive className="w-4 h-4" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`Delete "${prompt.title}" permanently? This cannot be undone.`)) {
                  onDelete(prompt.id);
                }
              }}
              className="p-1.5 rounded-md bg-black/60 backdrop-blur-sm text-white hover:bg-red-600/80 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Image Display */}
      {hasImage ? (
        <div className="relative w-full h-full">
          <img
            src={recipeImageUrl!}
            alt={prompt.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.parentElement?.querySelector('.image-placeholder');
              if (placeholder) {
                (placeholder as HTMLElement).style.display = 'flex';
              }
            }}
          />
          <div className="image-placeholder hidden absolute inset-0 items-center justify-center bg-[#252220]">
            <ImageIcon className="w-12 h-12 text-warm-gray/30" />
            <p className="text-xs text-warm-gray/50 mt-2">Image unavailable</p>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#252220]">
          <ImageIcon className="w-16 h-16 text-warm-gray/30" />
          <p className="text-xs text-warm-gray/50 mt-2">No image</p>
        </div>
      )}

      {/* Title Overlay - appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <h3 className="font-serif text-lg text-white line-clamp-2">
          {prompt.title}
        </h3>
      </div>

      {/* Category Badge - bottom-right corner */}
      <CategoryBadge prompt={prompt} />
    </Card>
  );
}
