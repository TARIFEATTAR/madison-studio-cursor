import { useState } from "react";
import { Star, Copy, Edit, Trash2, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@/pages/Templates";
import { useToast } from "@/hooks/use-toast";
import { getContentTypeDisplayName } from "@/utils/contentTypeMapping";
import { getContentCategoryLabel } from "@/utils/contentSubtypeLabels";

interface EnhancedPromptCardProps {
  prompt: Prompt;
  onUse: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isFavorite?: boolean;
}

const EnhancedPromptCard = ({
  prompt,
  onUse,
  onToggleFavorite,
  onEdit,
  onDelete,
  isFavorite = false,
}: EnhancedPromptCardProps) => {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(prompt.prompt_text);
    toast({
      title: "Copied to clipboard",
      description: "Prompt template copied successfully",
    });
  };

  // Get category and content type labels
  const category = (prompt.meta_instructions as any)?.category || getContentCategoryLabel(prompt.content_type);
  const contentTypeLabel = getContentTypeDisplayName(prompt.content_type);

  return (
    <Card 
      className="bg-white border-2 border-[#D4CFC8] hover:border-[#B8956A] transition-all duration-200 overflow-hidden group cursor-pointer"
      onClick={onEdit}
    >
      <div className="p-6">
        {/* Header: Title + Star */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-2xl font-serif font-bold text-[#1A1816] leading-tight flex-1 pr-4">
            {prompt.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className="flex-shrink-0 p-2 rounded-lg border-2 border-[#D4CFC8] hover:border-[#D4AF37] transition-colors"
          >
            <Star
              className={`h-5 w-5 ${
                isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4CFC8]"
              }`}
            />
          </button>
        </div>

        {/* Category and Content Type Badges */}
        <div className="flex items-center gap-2 mb-4">
          {category && (
            <Badge variant="outline" className="text-sm border-[#D4CFC8] text-[#1A1816] bg-white font-medium">
              {category}
            </Badge>
          )}
          {category && contentTypeLabel && (
            <ArrowRight className="h-3 w-3 text-[#6B6560]" />
          )}
          {contentTypeLabel && (
            <Badge variant="outline" className="text-sm border-[#B8956A] text-[#1A1816] bg-[#F5F1E8] font-medium">
              {contentTypeLabel}
            </Badge>
          )}
        </div>

        {/* Prompt Template Section */}
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-[#6B6560] mb-2">Prompt Template</h4>
          <div className="bg-[#F5F1E8] rounded-lg p-4 border border-[#D4CFC8]">
            <p className="text-sm text-[#1A1816] leading-relaxed whitespace-pre-wrap font-sans">
              {prompt.prompt_text}
            </p>
          </div>
        </div>

        {/* Usage Count */}
        <div className="flex justify-end mb-4">
          <div className="text-right">
            <div className="text-sm font-medium text-[#6B6560]">Usage Count</div>
            <div className="text-lg font-semibold text-[#1A1816]">{prompt.times_used || 0} times</div>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="mb-6">
            <h4 className="text-sm font-medium text-[#6B6560] mb-2">Tags</h4>
            <div className="flex gap-2 flex-wrap">
              {prompt.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-sm border-[#D4CFC8] text-[#6B6560] bg-white font-normal"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="h-px bg-[#D4CFC8] my-6" />

        {/* Action Buttons */}
        <div className="flex gap-3 flex-wrap">
          <Button
            onClick={onUse}
            className="bg-gradient-to-r from-[#B8956A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8956A] text-white font-medium gap-2 flex-1 min-w-[140px]"
          >
            <FileText className="h-4 w-4" />
            Use Template
          </Button>
          <Button
            onClick={handleCopy}
            variant="outline"
            className="border-2 border-[#D4CFC8] text-[#1A1816] hover:bg-[#F5F1E8] font-medium gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy Prompt
          </Button>
          {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              className="border-2 border-[#D4CFC8] text-[#1A1816] hover:bg-[#F5F1E8] font-medium gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button
              onClick={onDelete}
              variant="outline"
              className="border-2 border-[#D4CFC8] text-[#DC2626] hover:bg-red-50 font-medium gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedPromptCard;
