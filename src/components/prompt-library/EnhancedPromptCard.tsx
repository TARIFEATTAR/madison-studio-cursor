import { useState } from "react";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@/pages/Templates";

interface EnhancedPromptCardProps {
  prompt: Prompt;
  onUse: () => void;
  onToggleFavorite?: () => void;
  isFavorite?: boolean;
}

const EnhancedPromptCard = ({
  prompt,
  onUse,
  onToggleFavorite,
  isFavorite = false,
}: EnhancedPromptCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const preview = prompt.prompt_text?.substring(0, 200) || "";
  const fullText = prompt.prompt_text || "";

  return (
    <Card className="p-6 hover:shadow-md transition-all duration-200 border border-border bg-background relative group">
      {/* Favorite Star */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-5 right-5 z-10 hover:scale-110 transition-transform"
      >
        <Star
          className={`h-5 w-5 ${
            isFavorite ? "fill-saffron-gold text-saffron-gold" : "text-muted-foreground/60 hover:text-saffron-gold"
          }`}
        />
      </button>

      <div className="space-y-5">
        {/* Title */}
        <div className="pr-10">
          <h3 className="text-xl font-semibold text-foreground mb-2 leading-tight">
            {prompt.title}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Content Type: {prompt.content_type || "N/A"}
          </p>
          {prompt.collection && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Collection: {prompt.collection}
            </p>
          )}
          {prompt.scent_family && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Scent Family: {prompt.scent_family}
            </p>
          )}
        </div>

        {/* Expandable Preview */}
        {fullText && (
          <div className="bg-muted/40 rounded-lg p-4 text-sm text-muted-foreground border border-border/50">
            <p className={isExpanded ? "" : "line-clamp-3 leading-relaxed"}>
              {fullText}
            </p>
            {fullText.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1.5 mt-3 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    Show more
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prompt.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs font-normal px-2.5 py-1"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Usage count + Use Template button */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-sm font-medium text-muted-foreground">
            Used {prompt.times_used || 0} times
          </span>
          <Button
            onClick={onUse}
            size="sm"
            className="gap-2 font-medium"
          >
            Use Template
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedPromptCard;
