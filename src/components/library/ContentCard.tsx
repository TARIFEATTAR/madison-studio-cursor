import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Star, Archive, ArchiveRestore } from "lucide-react";
import { contentTypes, collections } from "@/data/mockLibraryContent";
import { cn } from "@/lib/utils";

interface ContentCardProps {
  content: {
    id: string;
    title: string;
    contentType: string;
    collection: string;
    product?: string;
    content: string;
    createdAt: Date;
    wordCount: number;
    dipWeek?: number;
    rating?: number;
    archived: boolean;
  };
  onClick: () => void;
  viewMode?: "grid" | "list";
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: () => void;
  onArchive?: () => void;
}

export function ContentCard({ 
  content, 
  onClick, 
  viewMode = "grid",
  selectable = false,
  selected = false,
  onToggleSelect,
  onArchive
}: ContentCardProps) {
  const contentTypeInfo = contentTypes.find(ct => ct.id === content.contentType);
  const collectionInfo = collections.find(c => c.id === content.collection);
  
  const previewText = content.content.substring(0, 150) + (content.content.length > 150 ? "..." : "");
  const timeAgo = formatDistanceToNow(content.createdAt, { addSuffix: true });

  return (
    <Card
      onClick={(e) => {
        // Don't trigger card click if clicking checkbox
        if (!(e.target as HTMLElement).closest('input[type="checkbox"]')) {
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-brass hover:shadow-lg bg-card/50 backdrop-blur-sm",
        "border-border/20 relative",
        viewMode === "list" && "flex flex-row items-start gap-6",
        content.archived && "opacity-60",
        selected && "ring-2 ring-brass border-brass"
      )}
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px)
        `
      }}
    >
      {/* Action buttons - top right */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        {onArchive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onArchive();
            }}
            className="h-8 px-2 hover:bg-brass/10"
            title={content.archived ? "Unarchive" : "Archive"}
          >
            {content.archived ? (
              <ArchiveRestore className="w-4 h-4 text-muted-foreground hover:text-brass" />
            ) : (
              <Archive className="w-4 h-4 text-muted-foreground hover:text-brass" />
            )}
          </Button>
        )}
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className="w-5 h-5 rounded border-border text-brass focus:ring-brass cursor-pointer"
          />
        )}
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-3">
          <h3 className="font-serif text-xl text-foreground group-hover:text-brass transition-colors line-clamp-2">
            {content.title}
          </h3>
          
          <div className="flex flex-wrap gap-2">
            {contentTypeInfo && (
              <Badge 
                variant="secondary"
                className="text-xs"
                style={{ 
                  backgroundColor: `${contentTypeInfo.color}20`,
                  color: contentTypeInfo.color,
                  borderColor: contentTypeInfo.color
                }}
              >
                {contentTypeInfo.icon} {contentTypeInfo.name}
              </Badge>
            )}
            
            {collectionInfo && (
              <Badge variant="outline" className="text-xs border-border/40">
                {collectionInfo.icon} {collectionInfo.name}
              </Badge>
            )}

            {content.archived && (
              <Badge variant="destructive" className="text-xs">
                Archived
              </Badge>
            )}
          </div>
        </div>

        <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
          {previewText}
        </p>

        <div className="pt-4 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span>📅 {timeAgo}</span>
            <span>• {content.wordCount} words</span>
            {content.dipWeek && (
              <span>• Week {content.dipWeek}</span>
            )}
          </div>
          
          {content.rating && (
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={cn(
                    "w-3 h-3",
                    i < content.rating! ? "fill-brass text-brass" : "text-muted-foreground/20"
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
