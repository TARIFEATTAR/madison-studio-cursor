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
    <Card className="p-6 hover:shadow-md transition-all duration-200 border border-border bg-background relative">
      {/* Favorite Star */}
      <button
        onClick={onToggleFavorite}
        className="absolute top-4 right-4 z-10 hover:scale-110 transition-transform"
      >
        <Star
          className={`h-5 w-5 ${
            isFavorite ? "fill-saffron-gold text-saffron-gold" : "text-muted-foreground hover:text-saffron-gold"
          }`}
        />
      </button>

      <div className="space-y-4">
        {/* Title */}
        <div className="pr-8">
          <h3 className="text-lg font-medium text-foreground mb-1">
            {prompt.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {prompt.prompt_text?.substring(0, 100) || "No description"}
          </p>
        </div>

        {/* Expandable Preview */}
        {fullText && (
          <div className="bg-muted/30 rounded-md p-3 text-sm text-muted-foreground border border-border/40">
            <p className={isExpanded ? "" : "line-clamp-3"}>
              {fullText}
            </p>
            {fullText.length > 200 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 mt-2 text-xs text-primary hover:underline"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="h-3 w-3" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3 w-3" />
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
                className="text-xs font-normal"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Footer: Usage count + Use Template button */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm text-muted-foreground">
            Used {prompt.times_used || 0} times
          </span>
          <Button
            onClick={onUse}
            size="sm"
            className="gap-2"
          >
            Use Template
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedPromptCard;
