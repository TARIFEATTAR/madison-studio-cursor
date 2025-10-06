import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Archive, Trash2, Star } from "lucide-react";

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
  collection?: string;
  contentType?: string;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

const collectionColors: Record<string, string> = {
  'Cadence': 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  'Rhythm': 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
  'Pulse': 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
  'Tempo': 'bg-green-500/10 text-green-700 dark:text-green-400',
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function OutputCard({ 
  output, 
  promptTitle,
  collection, 
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

  const truncateText = (text: string, maxLength: number = 200) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
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
        <div className="flex flex-wrap gap-2 mt-2">
          {collection && (
            <Badge variant="outline" className={collectionColors[collection] || 'bg-muted'}>
              {collection}
            </Badge>
          )}
          {contentType && (
            <Badge variant="secondary">
              {contentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          )}
          {output.quality_rating && (
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
              <Star className="mr-1 h-3 w-3 fill-current" />
              {output.quality_rating}/5
            </Badge>
          )}
        </div>
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
