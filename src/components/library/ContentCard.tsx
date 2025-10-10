import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Star } from "lucide-react";
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
}

export function ContentCard({ content, onClick, viewMode = "grid" }: ContentCardProps) {
  const contentTypeInfo = contentTypes.find(ct => ct.id === content.contentType);
  const collectionInfo = collections.find(c => c.id === content.collection);
  
  const previewText = content.content.substring(0, 150) + (content.content.length > 150 ? "..." : "");
  const timeAgo = formatDistanceToNow(content.createdAt, { addSuffix: true });

  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:border-brass hover:shadow-lg bg-card/50 backdrop-blur-sm",
        "border-border/20",
        viewMode === "list" && "flex flex-row items-start gap-6",
        content.archived && "opacity-60"
      )}
      style={{
        backgroundImage: `
          repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px),
          repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,.02) 2px, rgba(0,0,0,.02) 4px)
        `
      }}
    >
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
