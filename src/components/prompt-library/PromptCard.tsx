import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Prompt } from "@/pages/Templates";

interface PromptCardProps {
  prompt: Prompt;
  onClick: () => void;
}

export function PromptCard({ prompt, onClick }: PromptCardProps) {
  const previewText = prompt.prompt_text.substring(0, 150) + (prompt.prompt_text.length > 150 ? "..." : "");
  
  // Extract tags from prompt (first 3 tags if available)
  const displayTags = prompt.tags?.slice(0, 3) || [];

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-brass hover:shadow-lg",
        "bg-card/50 backdrop-blur-sm border-border/20 relative p-6"
      )}
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px)
        `
      }}
    >
      <div className="space-y-4">
        {/* Title */}
        <h3 className="font-serif text-xl text-foreground hover:text-brass transition-colors line-clamp-2">
          {prompt.title}
        </h3>
        
        {/* Short description - extract from meta or use first line */}
        <p className="text-sm text-muted-foreground line-clamp-1">
          {(prompt.meta_instructions as any)?.description || "Prompt template"}
        </p>

        {/* Prompt preview */}
        <div className="bg-[#FAF8F3] rounded-lg border border-border/30 p-3">
          <p className="text-sm text-foreground/80 line-clamp-3 leading-relaxed">
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
