import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Archive, Trash2, Star } from "lucide-react";
import { getContentCategoryLabel, getContentSubtypeLabel } from "@/utils/contentSubtypeLabels";

interface OutputCardProps {
  output: {
    id: string;
    generated_content: string;
    quality_rating?: number;
    usage_context?: string;
    created_at: string;
    updated_at?: string;
    prompt_id?: string;
    image_urls?: any;
  };
  promptTitle?: string;
  contentType?: string;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function OutputCard({ 
  output, 
  promptTitle,
  contentType,
  onArchive, 
  onDelete,
  onClick 
}: OutputCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(output.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(output.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(output.id);
    }
  };

  const truncateText = (text?: string, maxLength: number = 200) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={handleCardClick}
    >
      {/* Two-Tier Badge System - Top Left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Category Badge */}
        <Badge variant="outline" className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600">
          {getContentCategoryLabel(contentType) || 'Content'}
        </Badge>
        {/* Subtype Tag */}
        {contentType && (
          <Badge variant="outline" className="bg-stone-50/60 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 text-xs">
            {getContentSubtypeLabel(contentType)}
          </Badge>
        )}
        {/* Item Type Badge */}
        <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/40 text-xs">
          Output
        </Badge>
      </div>
      
      <CardHeader className="pb-3 pt-12">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {promptTitle || "Generated Content"}
            </h3>
          </div>
          {(onArchive || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onArchive && (
                  <DropdownMenuItem onClick={handleArchive}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {output.quality_rating && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
              <Star className="mr-1 h-3 w-3 fill-current" />
              {output.quality_rating}/5
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateText(output.generated_content)}
        </p>
        {output.usage_context && (
          <p className="text-xs text-muted-foreground mt-2 italic">
            Context: {output.usage_context}
          </p>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground flex justify-between">
        <span>Updated {formatDate(output.updated_at || output.created_at)}</span>
        {output.image_urls && Array.isArray(output.image_urls) && output.image_urls.length > 0 && (
          <span className="flex items-center gap-1">
            📷 {output.image_urls.length} image{output.image_urls.length > 1 ? 's' : ''}
          </span>
        )}
      </CardFooter>
    </Card>
  );
}
