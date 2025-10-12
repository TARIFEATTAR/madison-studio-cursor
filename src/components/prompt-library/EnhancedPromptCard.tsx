import { useState } from "react";
import { Star, Copy, Edit, Trash2, FileText, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Prompt } from "@/pages/Templates";
import { useToast } from "@/hooks/use-toast";
import { getContentTypeDisplayName } from "@/utils/contentTypeMapping";
import { getContentCategoryLabel } from "@/utils/contentSubtypeLabels";
import { ViewMode } from "@/components/library/ViewDensityToggle";

interface EnhancedPromptCardProps {
  prompt: Prompt;
  onUse: () => void;
  onToggleFavorite?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isFavorite?: boolean;
  viewMode?: ViewMode;
}

const EnhancedPromptCard = ({
  prompt,
  onUse,
  onToggleFavorite,
  onEdit,
  onDelete,
  isFavorite = false,
  viewMode = "comfortable",
}: EnhancedPromptCardProps) => {
  const { toast } = useToast();

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(prompt.prompt_text);
    toast({
      title: "Copied to clipboard",
      description: "Prompt template copied successfully",
    });
  };

  // Get category and content type labels
  const category = (prompt.meta_instructions as any)?.category || getContentCategoryLabel(prompt.content_type);
  const contentTypeLabel = getContentTypeDisplayName(prompt.content_type);

  // Compact mode for gallery and list views
  const isCompact = viewMode === "gallery" || viewMode === "list";
  const truncatedText = isCompact && prompt.prompt_text.length > 150 
    ? prompt.prompt_text.substring(0, 150) + "..." 
    : prompt.prompt_text;

  return (
    <Card 
      className="bg-white border-2 border-[#D4CFC8] hover:border-[#B8956A] transition-all duration-200 overflow-hidden group cursor-pointer"
      onClick={onEdit}
    >
      <div className={isCompact ? "p-4" : "p-6"}>
        {/* Header: Title + Star */}
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-serif font-bold text-[#1A1816] leading-tight flex-1 pr-4 ${
            isCompact ? "text-lg" : "text-2xl"
          }`}>
            {prompt.title}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.();
            }}
            className={`flex-shrink-0 rounded-lg border-2 border-[#D4CFC8] hover:border-[#D4AF37] transition-colors ${
              isCompact ? "p-1" : "p-2"
            }`}
          >
            <Star
              className={`${isCompact ? "h-4 w-4" : "h-5 w-5"} ${
                isFavorite ? "fill-[#D4AF37] text-[#D4AF37]" : "text-[#D4CFC8]"
              }`}
            />
          </button>
        </div>

        {/* Category and Content Type Badges */}
        <div className={`flex items-center gap-2 ${isCompact ? "mb-2" : "mb-4"}`}>
          {category && (
            <Badge variant="outline" className={`border-[#D4CFC8] text-[#1A1816] bg-white font-medium ${
              isCompact ? "text-xs" : "text-sm"
            }`}>
              {category}
            </Badge>
          )}
          {category && contentTypeLabel && (
            <ArrowRight className="h-3 w-3 text-[#6B6560]" />
          )}
          {contentTypeLabel && (
            <Badge variant="outline" className={`border-[#B8956A] text-[#1A1816] bg-[#F5F1E8] font-medium ${
              isCompact ? "text-xs" : "text-sm"
            }`}>
              {contentTypeLabel}
            </Badge>
          )}
        </div>

        {/* Prompt Template Section */}
        <div className={isCompact ? "mb-3" : "mb-6"}>
          <h4 className={`font-semibold text-[#6B6560] mb-2 ${isCompact ? "text-xs" : "text-sm"}`}>
            Prompt Template
          </h4>
          <div className={`bg-[#F5F1E8] rounded-lg border border-[#D4CFC8] ${isCompact ? "p-3" : "p-4"}`}>
            <p className={`text-[#1A1816] leading-relaxed font-sans ${isCompact ? "text-xs line-clamp-3" : "text-sm whitespace-pre-wrap"}`}>
              {truncatedText}
            </p>
            {isCompact && prompt.prompt_text.length > 150 && (
              <span className="text-xs text-[#B8956A] mt-1 inline-block">Click to view full prompt</span>
            )}
          </div>
        </div>

        {/* Usage Count */}
        {!isCompact && (
          <div className="flex justify-end mb-4">
            <div className="text-right">
              <div className="text-sm font-medium text-[#6B6560]">Usage Count</div>
              <div className="text-lg font-semibold text-[#1A1816]">{prompt.times_used || 0} times</div>
            </div>
          </div>
        )}

        {/* Tags */}
        {!isCompact && prompt.tags && prompt.tags.length > 0 && (
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

        <div className={`h-px bg-[#D4CFC8] ${isCompact ? "my-3" : "my-6"}`} />

        {/* Action Buttons */}
        <div className={`flex gap-2 ${isCompact ? "flex-wrap" : "flex-wrap gap-3"}`}>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onUse();
            }}
            size={isCompact ? "sm" : "default"}
            className={`bg-gradient-to-r from-[#B8956A] to-[#D4AF37] hover:from-[#D4AF37] hover:to-[#B8956A] text-white font-medium gap-2 ${
              isCompact ? "flex-1" : "flex-1 min-w-[140px]"
            }`}
          >
            <FileText className={isCompact ? "h-3 w-3" : "h-4 w-4"} />
            {isCompact ? "Use" : "Use Template"}
          </Button>
          <Button
            onClick={handleCopy}
            size={isCompact ? "sm" : "default"}
            variant="outline"
            className={`border-2 border-[#D4CFC8] text-[#1A1816] hover:bg-[#F5F1E8] font-medium gap-2 ${
              isCompact ? "" : ""
            }`}
          >
            <Copy className={isCompact ? "h-3 w-3" : "h-4 w-4"} />
            {!isCompact && "Copy"}
          </Button>
          {!isCompact && onEdit && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              variant="outline"
              className="border-2 border-[#D4CFC8] text-[#1A1816] hover:bg-[#F5F1E8] font-medium gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}
          {!isCompact && onDelete && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              variant="outline"
              className="border-2 border-[#D4CFC8] text-[#DC2626] hover:bg-red-50 font-medium gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
          {isCompact && (
            <div className="flex items-center gap-1 ml-auto">
              <span className="text-xs text-[#6B6560]">{prompt.times_used || 0} uses</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedPromptCard;
