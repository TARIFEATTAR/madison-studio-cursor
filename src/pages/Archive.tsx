import { useState, useEffect } from "react";
import { Search, Star, Calendar, Bookmark } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ArchivedPrompt {
  id: string;
  title: string;
  collection: string;
  content_type: string;
  scent_family: string | null;
  dip_week: number | null;
  prompt_text: string;
  created_at: string;
  output: {
    generated_content: string;
    image_urls: string[] | null;
    quality_rating: number | null;
    usage_context: string | null;
  } | null;
}

const Archive = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [archives, setArchives] = useState<ArchivedPrompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchArchives();
    }
  }, [user]);

  const fetchArchives = async () => {
    try {
      const { data: prompts, error: promptsError } = await supabase
        .from('prompts')
        .select(`
          id,
          title,
          collection,
          content_type,
          scent_family,
          dip_week,
          prompt_text,
          created_at
        `)
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (promptsError) throw promptsError;

      // Fetch outputs for each prompt
      const archivesWithOutputs = await Promise.all(
        (prompts || []).map(async (prompt) => {
          const { data: output } = await supabase
            .from('outputs')
            .select('generated_content, image_urls, quality_rating, usage_context')
            .eq('prompt_id', prompt.id)
            .single();

          return {
            ...prompt,
            output: output ? {
              ...output,
              image_urls: (output.image_urls as string[]) || null,
            } : null,
          };
        })
      );

      setArchives(archivesWithOutputs);
    } catch (error) {
      console.error('Error fetching archives:', error);
      toast({
        title: "This vessel requires refinement",
        description: "Failed to fetch archived prompts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredArchives = archives.filter((archive) => {
    const matchesSearch = searchQuery === "" || 
      archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (archive.output?.generated_content || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = !selectedRating || archive.output?.quality_rating === selectedRating;
    
    return matchesSearch && matchesRating;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-muted-foreground text-lg">Loading archives...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto codex-spacing">
        {/* Header */}
        <div className="fade-enter">
          <h1 className="text-foreground mb-3">The Archive</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your curated collection of crafted prompts and generated outputs, each a testament to the Confident Whisper.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="fade-enter space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search archived vessels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-colors text-base"
            />
          </div>

          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground font-medium">Quality:</span>
            {[1, 2, 3, 4, 5].map((rating) => (
              <Badge
                key={rating}
                variant={selectedRating === rating ? "default" : "outline"}
                className="cursor-pointer transition-all hover:scale-105"
                onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
              >
                {rating} {rating === 1 ? "Star" : "Stars"}
              </Badge>
            ))}
          </div>
        </div>

        {/* Archive Grid */}
        {filteredArchives.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 fade-enter">
            {filteredArchives.map((archive) => (
              <div
                key={archive.id}
                className="card-matte p-8 rounded-lg border border-border/40 hover:border-primary/30 transition-all"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left: Prompt */}
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-serif text-foreground mb-2">
                          {archive.title}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="bg-saffron-gold/10 border-saffron-gold/30">
                            {archive.collection}
                          </Badge>
                          <Badge variant="outline">
                            {archive.content_type}
                          </Badge>
                          {archive.dip_week && (
                            <Badge variant="outline">
                              Week {archive.dip_week}
                            </Badge>
                          )}
                          {archive.scent_family && (
                            <Badge variant="outline">
                              {archive.scent_family}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formatDate(archive.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-background/50 rounded-md p-4 border border-border/30">
                      <p className="text-sm font-mono text-foreground leading-relaxed whitespace-pre-wrap">
                        {archive.prompt_text}
                      </p>
                    </div>
                  </div>

                  {/* Right: Output */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-serif">Generated Output</h4>
                      {archive.output?.quality_rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < archive.output!.quality_rating!
                                  ? "fill-saffron-gold text-saffron-gold"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          {archive.output.quality_rating === 5 && (
                            <Badge variant="outline" className="ml-2 bg-saffron-gold/10 border-saffron-gold/30">
                              Master Vessel
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Image Gallery */}
                    {archive.output?.image_urls && archive.output.image_urls.length > 0 ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-3">
                          {archive.output.image_urls.map((url, idx) => (
                            <div key={idx} className="bg-background/50 rounded-md p-2 border border-border/30">
                              <a href={url} target="_blank" rel="noopener noreferrer">
                                <img 
                                  src={url} 
                                  alt={`Generated image ${idx + 1}`}
                                  className="w-full rounded-md hover:opacity-90 transition-opacity"
                                  onError={(e) => {
                                    // If image fails to load, show the URL as text
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const parent = target.parentElement;
                                    if (parent) {
                                      const textDiv = document.createElement('div');
                                      textDiv.className = 'text-sm text-muted-foreground p-2';
                                      textDiv.textContent = url;
                                      parent.appendChild(textDiv);
                                    }
                                  }}
                                />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      /* Text Content */
                      <div className="bg-background/50 rounded-md p-4 border border-border/30 min-h-[200px]">
                        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                          {archive.output?.generated_content || "No output generated"}
                        </p>
                      </div>
                    )}

                    {archive.output?.usage_context && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Bookmark className="w-3 h-3" />
                        <span>{archive.output.usage_context}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 fade-enter">
            <p className="text-2xl font-serif text-muted-foreground">The Archive awaits</p>
            <p className="text-muted-foreground mt-2">
              {searchQuery || selectedRating
                ? "No vessels match your refined criteria"
                : "Craft and archive your first prompt in The Forge"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
