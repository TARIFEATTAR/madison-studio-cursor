import { Star, Calendar, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    collection: string;
    scentFamily: string | null;
    dipWeek: number;
    dipWorld: string;
    contentType: string;
    preview: string;
    lastUsed: string;
    version: string;
    rating: number;
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
  return (
    <Card className="card-matte p-6 hover:shadow-elegant transition-all duration-300 cursor-pointer border border-border/40 group">
      {/* Header Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={collectionColors[prompt.collection] || "bg-muted"}>
          {prompt.collection}
        </Badge>
        {prompt.scentFamily && (
          <Badge variant="outline" className="border-border/60">
            {scentFamilyIcons[prompt.scentFamily]} {prompt.scentFamily}
          </Badge>
        )}
        <Badge variant="outline" className="border-border/60">
          Week {prompt.dipWeek}: {prompt.dipWorld}
        </Badge>
      </div>

      {/* Title */}
      <h3 className="text-xl mb-3 text-foreground group-hover:text-primary transition-colors">
        {prompt.title}
      </h3>

      {/* Preview */}
      <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-4 text-sm">
        {prompt.preview}
      </p>

      {/* Footer Metadata */}
      <div className="flex items-center justify-between text-sm text-muted-foreground border-t border-border/40 pt-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>{prompt.lastUsed}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" />
            <span>v{prompt.version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < prompt.rating
                  ? "fill-saffron-gold text-saffron-gold"
                  : "text-border"
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PromptCard;
