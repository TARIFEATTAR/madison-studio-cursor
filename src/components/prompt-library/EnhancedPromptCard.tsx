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
    <Card className="p-6 hover:shadow-lg hover:border-[#B8956A] transition-all duration-200 border border-[#D4CFC8] bg-[#FFFCF5] relative group cursor-pointer">
      {/* Favorite Star */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite?.();
        }}
        className="absolute top-5 right-5 z-10 hover:scale-110 transition-transform"
      >
        <Star
          className={`h-5 w-5 ${
            isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4CFC8] hover:text-[#B8956A]"
          }`}
        />
      </button>

      <div className="space-y-4">
        {/* Title & Description */}
        <div className="pr-10">
          <h3 className="text-xl font-serif text-[#1A1816] mb-3 leading-tight">
            {prompt.title}
          </h3>
          <p className="text-sm text-[#6B6560] leading-relaxed">
            {prompt.content_type === 'product' ? 'Sophisticated product launch content for new fragrance releases' :
             prompt.content_type === 'blog' ? 'Editorial content about the creation process and craftsmanship' :
             prompt.content_type === 'email' ? 'Monthly newsletter format with collection highlights' :
             prompt.content_type === 'social' ? 'Instagram-optimized captions with storytelling elements' :
             `${prompt.content_type} content template`}
          </p>
        </div>

        {/* Prompt Preview */}
        {fullText && (
          <div className="bg-[#F5F1E8] rounded-lg p-4">
            <pre className="font-mono text-sm text-[#1A1816] leading-relaxed whitespace-pre-wrap {isExpanded ? '' : 'line-clamp-3'}">
              {fullText}
            </pre>
            {fullText.length > 200 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="flex items-center gap-1.5 mt-3 text-xs font-medium text-[#B8956A] hover:text-[#D4AF37] transition-colors"
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

        {/* Footer: Tags + Usage */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs border-[#D4CFC8] text-[#6B6560] bg-transparent">
              {prompt.content_type === 'product' ? 'Product' :
               prompt.content_type === 'blog' ? 'Editorial' :
               prompt.content_type === 'email' ? 'Email' :
               prompt.content_type === 'social' ? 'Social' :
               prompt.content_type}
            </Badge>
            {prompt.tags?.slice(0, 2).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-[#D4CFC8] text-[#6B6560] bg-transparent"
              >
                #{tag}
              </Badge>
            ))}
          </div>
          <span className="text-xs text-[#A8A39E]">
            Used {prompt.times_used || 0} times
          </span>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedPromptCard;
