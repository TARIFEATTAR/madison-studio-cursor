import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Archive, Trash2, FileText, Sparkles } from "lucide-react";
import { getCollectionIcon, normalizeCollectionName, formatCollectionDisplay } from "@/utils/collectionIcons";
import { getContentCategoryLabel, getContentSubtypeLabel } from "@/utils/contentSubtypeLabels";

interface MasterContentCardProps {
  content: {
    id: string;
    title: string;
    content_type: string;
    full_content: string;
    word_count?: number;
    collection?: string;
    dip_week?: number;
    pillar_focus?: string;
    created_at: string;
    updated_at?: string;
  };
  derivativeCount?: number;
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
  onGenerateDerivatives?: (id: string) => void;
}

const collectionColors: Record<string, string> = {
  humanities: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20",
  cadence: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20", // Legacy
  reserve: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20",
  purity: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20",
  elemental: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20",
  sacred_space: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20", // Legacy
  "sacred space": "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20", // Legacy
};

const dipWorlds: Record<number, string> = {
  1: "World 1: Foundation",
  2: "World 2: Exploration",
  3: "World 3: Innovation",
  4: "World 4: Mastery",
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function MasterContentCard({ 
  content, 
  derivativeCount = 0,
  onArchive, 
  onDelete,
  onClick,
  onGenerateDerivatives
}: MasterContentCardProps) {
  const handleCardClick = () => {
    if (onClick) {
      onClick(content.id);
    }
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onArchive) {
      onArchive(content.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(content.id);
    }
  };

  const handleGenerateDerivatives = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onGenerateDerivatives) {
      onGenerateDerivatives(content.id);
    }
  };

  const truncateText = (text?: string, maxLength: number = 150) => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const normalizedCollection = normalizeCollectionName(content.collection);
  const collectionColorClass = collectionColors[normalizedCollection] || collectionColors.humanities;
  const displayCollection = formatCollectionDisplay(content.collection);
  const CollectionIcon = getCollectionIcon(content.collection);

  return (
    <Card 
      className="hover:shadow-md transition-shadow cursor-pointer group relative"
      onClick={handleCardClick}
    >
      {/* Two-Tier Badge System - Top Left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Category Badge */}
        <Badge variant="outline" className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600">
          {getContentCategoryLabel(content.content_type) || 'Content'}
        </Badge>
        {/* Subtype Tag */}
        {content.content_type && (
          <Badge variant="outline" className="bg-stone-50/60 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 text-xs">
            {getContentSubtypeLabel(content.content_type)}
          </Badge>
        )}
        {/* Item Type Badge */}
        <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/40 text-xs">
          Master
        </Badge>
      </div>
      
      <CardHeader className="pb-3 pt-12">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">
              {content.title}
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
          <Badge variant="outline" className={collectionColorClass}>
            {CollectionIcon && (
              <span className="flex items-center gap-1.5">
                <CollectionIcon className="w-3 h-3" />
                {displayCollection}
              </span>
            )}
            {!CollectionIcon && displayCollection}
          </Badge>
          {content.dip_week && (
            <Badge variant="outline">
              {dipWorlds[content.dip_week] || `Week ${content.dip_week}`}
            </Badge>
          )}
          {content.word_count && (
            <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400">
              <FileText className="mr-1 h-3 w-3" />
              {content.word_count.toLocaleString()} words
            </Badge>
          )}
          {derivativeCount > 0 && (
            <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
              {derivativeCount} derivative{derivativeCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateText(content.full_content)}
        </p>
          {content.pillar_focus && (
            <p className="text-xs text-muted-foreground mt-2">
              Pillar: <span className="font-medium">{(content.pillar_focus || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
            </p>
          )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          Updated {formatDate(content.updated_at || content.created_at)}
        </span>
        {onGenerateDerivatives && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleGenerateDerivatives}
            className="h-8 gap-1"
          >
            <Sparkles className="h-3 w-3" />
            Generate Derivatives
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
