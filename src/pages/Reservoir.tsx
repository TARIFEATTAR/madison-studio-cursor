import { useState } from "react";
import { Search, Filter, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PromptCard from "@/components/PromptCard";

const mockPrompts: any[] = [];

const Reservoir = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);

  const collections = ["Cadence", "Reserve", "Purity", "Sacred Space"];
  const contentTypes = ["Product", "Email", "Social", "Visual"];

  return (
    <div className="min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto codex-spacing">
        {/* Header */}
        <div className="fade-enter">
          <h1 className="text-foreground mb-3">The Reservoir</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your curated collection of brand-aligned prompts, each a vessel of the Confident Whisper.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="fade-enter space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search prompts, lexicon, or allegorical terms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-colors text-base"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Collection:</span>
              {collections.map((collection) => (
                <Badge
                  key={collection}
                  variant={selectedCollection === collection ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedCollection(selectedCollection === collection ? null : collection)}
                >
                  {collection}
                </Badge>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground font-medium">Content:</span>
              {contentTypes.map((type) => (
                <Badge
                  key={type}
                  variant={selectedContentType === type ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedContentType(selectedContentType === type ? null : type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Prompt Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 fade-enter">
          {mockPrompts
            .filter((prompt) => {
              const matchesSearch = searchQuery === "" || 
                prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                prompt.preview.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesCollection = !selectedCollection || prompt.collection === selectedCollection;
              const matchesContentType = !selectedContentType || prompt.contentType === selectedContentType;
              return matchesSearch && matchesCollection && matchesContentType;
            })
            .map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
        </div>

        {/* Empty State */}
        {mockPrompts.filter((prompt) => {
          const matchesSearch = searchQuery === "" || 
            prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            prompt.preview.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesCollection = !selectedCollection || prompt.collection === selectedCollection;
          const matchesContentType = !selectedContentType || prompt.contentType === selectedContentType;
          return matchesSearch && matchesCollection && matchesContentType;
        }).length === 0 && (
          <div className="text-center py-16 fade-enter">
            <p className="text-2xl font-serif text-muted-foreground">The Reservoir awaits</p>
            <p className="text-muted-foreground mt-2">No prompts match your refined criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservoir;
