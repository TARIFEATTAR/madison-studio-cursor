import { Star, Calendar, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
}

const collectionColors: Record<string, string> = {
  Cadence: "bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30",
  Reserve: "bg-golden-brown/20 text-golden-brown border-golden-brown/30",
  Purity: "bg-soft-ivory/80 text-deep-charcoal border-sandstone",
  "Sacred Space": "bg-stone-beige/60 text-deep-charcoal border-sandstone",
};

const scentFamilyIcons: Record<string, string> = {
  Warm: "🔥",
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

const PromptCard = ({ prompt }: PromptCardProps) => {
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
    <Card className="card-matte p-6 hover:shadow-elegant transition-all duration-300 cursor-pointer border border-border/40 group">
      {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={collectionColors[prompt.collection] || "bg-muted"}>
          {prompt.collection}
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
        <Badge variant="outline" className="border-border/60 capitalize">
          {prompt.content_type}
        </Badge>
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
    </Card>
  );
};

export default PromptCard;
