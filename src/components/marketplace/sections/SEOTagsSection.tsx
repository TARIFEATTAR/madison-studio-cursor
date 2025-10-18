import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface SEOTagsSectionProps {
  tags: string[];
  onUpdate: (tags: string[]) => void;
}

export function SEOTagsSection({ tags, onUpdate }: SEOTagsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const maxTags = 13;

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      
      if (newTag && !tags.includes(newTag) && tags.length < maxTags) {
        onUpdate([...tags, newTag]);
        setInputValue("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onUpdate(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-aged-brass/20">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-parchment-white/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-aged-brass/10 flex items-center justify-center">
                  <Tag className="w-5 h-5 text-aged-brass" />
                </div>
                <CardTitle className="text-lg">SEO & Tags</CardTitle>
              </div>
              <ChevronDown className={`w-5 h-5 text-charcoal/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-charcoal/60">
                  {tags.length} / {maxTags}
                </span>
              </div>
              
              <Input
                id="tags"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type a tag and press Enter or comma..."
                disabled={tags.length >= maxTags}
              />
              
              <p className="text-xs text-charcoal/60 mt-1">
                Max {maxTags} tags. Use long-tail keywords (e.g., "luxury perfume oil", "artisan fragrance").
              </p>
            </div>

            {/* Tag Display */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary"
                    className="bg-aged-brass/10 text-ink-black hover:bg-aged-brass/20"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
