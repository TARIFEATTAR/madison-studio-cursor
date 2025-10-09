import { Star, TrendingUp, Sparkles, Clock, MoreVertical, Archive, Trash2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCollectionIcon } from "@/utils/collectionIcons";
import type { Prompt } from "@/pages/Templates";

interface EnhancedPromptCardProps {
  prompt: Prompt;
  onUse: () => void;
  onViewDetails: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
}

const collectionColors: Record<string, string> = {
  cadence: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30",
  reserve: "bg-golden-brown/20 text-golden-brown border-golden-brown/30",
  purity: "bg-soft-ivory/80 text-deep-charcoal border-sandstone",
  sacred_space: "bg-stone-beige/60 text-deep-charcoal border-sandstone",
};

const EnhancedPromptCard = ({
  prompt,
  onUse,
  onViewDetails,
  onArchive,
  onDelete,
}: EnhancedPromptCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const preview = prompt.prompt_text?.substring(0, 150) || "";
  const CollectionIcon = getCollectionIcon(prompt.collection);

  return (
    <Card className="card-matte p-6 hover:shadow-elegant transition-all duration-300 border border-border/40 group relative">
      {/* Actions Menu */}
      <div className="absolute top-4 right-4 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onViewDetails} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
            {onArchive && (
              <DropdownMenuItem onClick={onArchive} className="cursor-pointer">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={onDelete}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pr-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={collectionColors[prompt.collection] || "bg-muted"}>
                {CollectionIcon && <CollectionIcon className="w-3 h-3 mr-1" />}
                {prompt.collection.replace("_", " ")}
              </Badge>
              {prompt.is_template && (
                <Badge variant="outline" className="border-primary/50 text-primary">
                  <Star className="w-3 h-3 mr-1 fill-primary" />
                  Template
                </Badge>
              )}
            </div>
            <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors truncate">
              {prompt.title}
            </h3>
          </div>
        </div>

        {/* Preview */}
        <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
          {preview}...
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {prompt.times_used > 0 && (
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{prompt.times_used} uses</span>
            </div>
          )}
          {prompt.avg_quality_rating && (
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{prompt.avg_quality_rating.toFixed(1)}</span>
            </div>
          )}
          {prompt.effectiveness_score && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{prompt.effectiveness_score}%</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatDate(prompt.last_used_at || prompt.updated_at || prompt.created_at)}</span>
          </div>
        </div>

        {/* Tags */}
        {prompt.tags && prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {prompt.tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-xs border-border/40 text-muted-foreground"
              >
                {tag}
              </Badge>
            ))}
            {prompt.tags.length > 3 && (
              <Badge
                variant="outline"
                className="text-xs border-border/40 text-muted-foreground"
              >
                +{prompt.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Use Now Button */}
        <Button
          onClick={onUse}
          className="w-full gap-2"
          variant="default"
        >
          <Sparkles className="w-4 h-4" />
          Use Template
        </Button>
      </div>
    </Card>
  );
};

export default EnhancedPromptCard;
