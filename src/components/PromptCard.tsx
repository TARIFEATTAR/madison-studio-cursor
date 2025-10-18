import { Star, Calendar, BookOpen, MoreVertical, Archive, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getCollectionIcon, normalizeCollectionName, formatCollectionDisplay } from "@/utils/collectionIcons";
import { getContentCategoryLabel, getContentSubtypeLabel } from "@/utils/contentSubtypeLabels";

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    collection: string;
    scent_family: string | null;
    dip_week: number | null;
    content_type: string;
    prompt_text: string;
    created_at: string;
    updated_at?: string;
    version?: number;
  };
  onArchive?: (id: string) => void;
  onDelete?: (id: string) => void;
  onClick?: (id: string) => void;
}

const collectionColors: Record<string, string> = {
  Humanities: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30",
  Cadence: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30", // Legacy
  Reserve: "bg-golden-brown/20 text-golden-brown border-golden-brown/30",
  Purity: "bg-soft-ivory/80 text-deep-charcoal border-sandstone",
  Elemental: "bg-stone-beige/60 text-deep-charcoal border-sandstone",
  "Sacred Space": "bg-stone-beige/60 text-deep-charcoal border-sandstone", // Legacy
};

const scentFamilyIcons: Record<string, string> = {
  Warm: "Warm",
  Floral: "🌸",
  Fresh: "🍃",
  Woody: "🌲",
};

const dipWorlds: Record<number, string> = {
  1: "Silk Road",
  2: "Maritime Voyage",
  3: "Imperial Garden",
  4: "Royal Court",
};

const PromptCard = ({ prompt, onArchive, onDelete, onClick }: PromptCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const dipWorld = prompt.dip_week ? dipWorlds[prompt.dip_week] : null;
  const preview = prompt.prompt_text?.substring(0, 200) || "";

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
            {onArchive && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onArchive(prompt.id);
                }}
                className="cursor-pointer"
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Delete "${prompt.title}" permanently? This cannot be undone.`)) {
                    onDelete(prompt.id);
                  }
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Permanently
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Two-Tier Badge System - Top Left */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        {/* Category Badge */}
        <Badge variant="outline" className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600">
          {getContentCategoryLabel(prompt.content_type) || 'Content'}
        </Badge>
        {/* Subtype Tag */}
        <Badge variant="outline" className="bg-stone-50/60 dark:bg-stone-900/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700 text-xs">
          {getContentSubtypeLabel(prompt.content_type)}
        </Badge>
        {/* Item Type Badge */}
        <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/40 text-xs">
          Prompt
        </Badge>
      </div>

      {/* Card Content */}
      <div onClick={() => onClick?.(prompt.id)} className={onClick ? "cursor-pointer" : ""}>
        {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-4 mt-8">
        <Badge className={collectionColors[prompt.collection] || "bg-muted"}>
          {(() => {
            const CollectionIcon = getCollectionIcon(prompt.collection);
            return CollectionIcon ? (
              <span className="flex items-center gap-1.5">
                <CollectionIcon className="w-3 h-3" />
                {prompt.collection}
              </span>
            ) : prompt.collection;
          })()}
        </Badge>
        {prompt.scent_family && (
          <Badge variant="outline" className="border-border/60">
            {scentFamilyIcons[prompt.scent_family]} {prompt.scent_family}
          </Badge>
        )}
        {prompt.dip_week && dipWorld && (
          <Badge variant="outline" className="border-border/60">
            Week {prompt.dip_week}: {dipWorld}
          </Badge>
        )}
      </div>

      {/* Title */}
      <h3 className="text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
        {prompt.title}
      </h3>

      {/* Preview */}
      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-4 text-sm">
        {preview}
      </p>

        {/* Footer Metadata */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/40 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(prompt.updated_at || prompt.created_at)}</span>
            </div>
            {prompt.version && (
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>v{prompt.version}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PromptCard;
