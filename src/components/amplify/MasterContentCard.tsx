import { FileText, MoreVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
  word_count: number;
  collection: string | null;
  dip_week: number | null;
  pillar_focus: string | null;
  created_at: string;
}

interface MasterContentCardProps {
  content: MasterContent;
  isSelected: boolean;
  onClick: () => void;
  onArchive: () => void;
  onDelete: () => void;
  derivativeCount?: number;
}

const CONTENT_TYPE_COLORS: Record<string, string> = {
  blog_post: "bg-blue-500/10 border-blue-500/20",
  brand_announcement: "bg-purple-500/10 border-purple-500/20",
  email_newsletter: "bg-green-500/10 border-green-500/20",
  product_story: "bg-orange-500/10 border-orange-500/20",
};

export function MasterContentCard({
  content,
  isSelected,
  onClick,
  onArchive,
  onDelete,
  derivativeCount = 0,
}: MasterContentCardProps) {
  const colorClass = CONTENT_TYPE_COLORS[content.content_type] || "bg-muted/20 border-muted";
  
  return (
    <Card
      className={`group relative p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-glow ${
        isSelected ? "border-primary shadow-glow ring-2 ring-primary/20" : colorClass
      }`}
      onClick={onClick}
    >
      {/* Top: Icon + Type Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <FileText className="h-5 w-5 text-foreground" />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="text-destructive"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h3 className="font-medium text-sm leading-snug mb-3 line-clamp-2 min-h-[2.5rem]">
        {content.title}
      </h3>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        <Badge variant="outline" className="text-xs">
          {(content.content_type || "").replace(/_/g, " ") || "Content"}
        </Badge>
        {content.dip_week && (
          <Badge variant="secondary" className="text-xs">
            Week {content.dip_week}
          </Badge>
        )}
        {derivativeCount > 0 && (
          <Badge variant="default" className="text-xs bg-primary/90">
            {derivativeCount} {derivativeCount === 1 ? 'derivative' : 'derivatives'}
          </Badge>
        )}
      </div>

      {/* Footer: Word count + Date */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
        <span>{content.word_count || 0} words</span>
        <span>{new Date(content.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
      )}
    </Card>
  );
}
