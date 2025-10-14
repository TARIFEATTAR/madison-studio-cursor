import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/pages/Templates";

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PromptCard({ prompt, onClick, onArchive, onDelete }: PromptCardProps) {
  const previewText = prompt.prompt_text.substring(0, 150) + (prompt.prompt_text.length > 150 ? "..." : "");
  
  // Extract tags from prompt (first 3 tags if available)
  const displayTags = prompt.tags?.slice(0, 3) || [];

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-aged-brass/40",
        "bg-parchment-white border border-charcoal/10 relative p-6 group"
      )}
    >
      <div className="space-y-4" onClick={onClick}>
        {/* Actions Menu - only show if handlers are provided */}
        {(onArchive || onDelete) && (
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1">
              {onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(prompt.id);
                  }}
                  className="p-2 rounded-md hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  title="Archive"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="21 8 21 21 3 21 3 8"></polyline>
                    <rect x="1" y="3" width="22" height="5"></rect>
                    <line x1="10" y1="12" x2="14" y2="12"></line>
                  </svg>
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
                  className="p-2 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Title */}
        <h3 className="font-serif text-xl text-ink-black hover:text-aged-brass transition-colors line-clamp-2">
          {prompt.title}
        </h3>
        
        {/* Short description - extract from meta or use first line */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {(prompt.meta_instructions as any)?.description || "Prompt template"}
        </p>

        {/* Prompt preview */}
        <div className="bg-vellum-cream border border-charcoal/10 p-3">
          <p className="text-sm text-charcoal/80 line-clamp-3 leading-relaxed">
            {previewText}
          </p>
        </div>

        {/* Footer: Tags and Usage Count */}
        <div className="flex items-center justify-between pt-2">
          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            {displayTags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs bg-background/60 border-border/40 text-muted-foreground"
              >
                #{tag}
              </Badge>
            ))}
          </div>

          {/* Usage count with arrow */}
          <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
            <ArrowUpRight className="w-4 h-4" />
            <span>{prompt.times_used || 0}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
