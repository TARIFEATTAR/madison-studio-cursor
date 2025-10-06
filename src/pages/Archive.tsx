import { useState, useEffect } from "react";
import { Search, Star, Calendar, Bookmark, RotateCcw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useCollections } from "@/hooks/useCollections";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { stripMarkdown } from "@/utils/forgeHelpers";

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

interface MasterContent {
  id: string;
  title: string;
  content_type: string;
  full_content: string;
  archived_at: string;
  created_at: string;
}

interface DerivativeAsset {
  id: string;
  master_content_id: string;
  asset_type: string;
  generated_content: string;
  archived_at: string;
  created_at: string;
  master_content?: { title: string };
}

const Archive = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { collections } = useCollections();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [archives, setArchives] = useState<ArchivedPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedMasters, setArchivedMasters] = useState<MasterContent[]>([]);
  const [archivedDerivatives, setArchivedDerivatives] = useState<DerivativeAsset[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'master' | 'derivative' | 'prompt', id: string, title: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchArchives();
      fetchArchivedContent();
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
        .eq('is_archived', true)
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
      console.error("Error fetching archives:", error);
      toast({
        title: "Error loading portfolio",
        description: "Failed to fetch archived prompts.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedContent = async () => {
    try {
      // Fetch archived master content
      const { data: masters, error: mastersError } = await supabase
        .from('master_content')
        .select('*')
        .eq('created_by', user?.id)
        .eq('is_archived', true)
        .order('archived_at', { ascending: false });

      if (mastersError) throw mastersError;
      setArchivedMasters(masters || []);

      // Fetch archived derivatives with master content info
      const { data: derivatives, error: derivativesError } = await supabase
        .from('derivative_assets')
        .select('*, master_content(title)')
        .eq('created_by', user?.id)
        .eq('is_archived', true)
        .order('archived_at', { ascending: false });

      if (derivativesError) throw derivativesError;
      setArchivedDerivatives(derivatives || []);
    } catch (error) {
      console.error('Error fetching archived content:', error);
    }
  };

  const handleRestoreMaster = async (id: string) => {
    try {
      const { error } = await supabase
        .from('master_content')
        .update({ is_archived: false, archived_at: null })
        .eq('id', id);

      if (error) throw error;

      setArchivedMasters(prev => prev.filter(m => m.id !== id));
      toast({
        title: "Master content restored",
        description: "Content has been restored to Repurpose page.",
      });
    } catch (error: any) {
      toast({
        title: "Error restoring content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRestoreDerivative = async (id: string) => {
    try {
      const { error } = await supabase
        .from('derivative_assets')
        .update({ is_archived: false, archived_at: null })
        .eq('id', id);

      if (error) throw error;

      setArchivedDerivatives(prev => prev.filter(d => d.id !== id));
      toast({
        title: "Derivative restored",
        description: "Asset has been restored to Repurpose page.",
      });
    } catch (error: any) {
      toast({
        title: "Error restoring asset",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRestorePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_archived: false, archived_at: null })
        .eq('id', id);

      if (error) throw error;

      setArchives(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Prompt restored",
        description: "Prompt has been restored to Library.",
      });
    } catch (error: any) {
      toast({
        title: "Error restoring prompt",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmDelete = (type: 'master' | 'derivative' | 'prompt', id: string, title: string) => {
    setItemToDelete({ type, id, title });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'master') {
        const { error } = await supabase
          .from('master_content')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setArchivedMasters(prev => prev.filter(m => m.id !== itemToDelete.id));
        
        toast({
          title: "Master content deleted",
          description: "Content has been permanently deleted.",
        });
      } else if (itemToDelete.type === 'derivative') {
        const { error } = await supabase
          .from('derivative_assets')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setArchivedDerivatives(prev => prev.filter(d => d.id !== itemToDelete.id));
        
        toast({
          title: "Derivative deleted",
          description: "Asset has been permanently deleted.",
        });
      } else if (itemToDelete.type === 'prompt') {
        const { error } = await supabase
          .from('prompts')
          .delete()
          .eq('id', itemToDelete.id);

        if (error) throw error;
        setArchives(prev => prev.filter(p => p.id !== itemToDelete.id));
        
        toast({
          title: "Prompt deleted",
          description: "Prompt has been permanently deleted.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error deleting",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const filteredArchives = archives.filter((archive) => {
    const matchesSearch = searchQuery === "" || 
      archive.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      archive.prompt_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (archive.output?.generated_content || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRating = !selectedRating || archive.output?.quality_rating === selectedRating;
    const matchesContentType = !selectedContentType || archive.content_type === selectedContentType;
    const matchesCollection = !selectedCollection || archive.collection === selectedCollection;
    
    return matchesSearch && matchesRating && matchesContentType && matchesCollection;
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
          <h1 className="text-foreground mb-3">Portfolio</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Your body of work
          </p>
        </div>

        <Tabs defaultValue="prompts" className="fade-enter">
          <TabsList className="mb-6">
            <TabsTrigger value="prompts">Archived Prompts ({archives.length})</TabsTrigger>
            <TabsTrigger value="masters">Master Content ({archivedMasters.length})</TabsTrigger>
            <TabsTrigger value="derivatives">Derivatives ({archivedDerivatives.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search Portfolio..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-card/50 backdrop-blur-sm border-border focus:border-primary transition-all duration-300 text-base focus:shadow-lg focus:-translate-y-0.5"
                />
              </div>

              {/* Content Type Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Bookmark className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Type:</span>
                {[
                  { value: 'product', label: 'Product' },
                  { value: 'email', label: 'Email' },
                  { value: 'social', label: 'Social' },
                  { value: 'visual', label: 'Visual' }
                ].map((type) => (
                  <Badge
                    key={type.value}
                    variant={selectedContentType === type.value ? "default" : "outline"}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
                    onClick={() => setSelectedContentType(selectedContentType === type.value ? null : type.value)}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>

              {/* Collection Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Collection:</span>
                {collections.map((collection) => {
                  const collectionKey = collection.name.toLowerCase().replace(/\s+/g, '_');
                  return (
                    <Badge
                      key={collection.id}
                      variant={selectedCollection === collectionKey ? "default" : "outline"}
                      className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
                      onClick={() => setSelectedCollection(selectedCollection === collectionKey ? null : collectionKey)}
                    >
                      {collection.name}
                    </Badge>
                  );
                })}
              </div>

              {/* Quality Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-medium">Quality:</span>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Badge
                    key={rating}
                    variant={selectedRating === rating ? "default" : "outline"}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-sm active:scale-95"
                    onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
                  >
                    {rating} {rating === 1 ? "Star" : "Stars"}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Archive Grid */}
            {filteredArchives.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
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
                              {stripMarkdown(archive.output?.generated_content || "No output generated")}
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

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-border/30">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestorePrompt(archive.id)}
                        className="gap-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => confirmDelete('prompt', archive.id, archive.title)}
                        className="gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-2xl font-serif text-muted-foreground">Your Portfolio Begins Here</p>
                <p className="text-muted-foreground mt-2">
                  {searchQuery || selectedRating || selectedContentType || selectedCollection
                    ? "No content matches your search criteria"
                    : "Finished works will appear as you create"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="masters" className="space-y-6">
            {archivedMasters.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {archivedMasters.map((master) => (
                  <Card key={master.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif text-foreground mb-2">{master.title}</h3>
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline">{master.content_type}</Badge>
                          <Badge variant="secondary">
                            Archived {new Date(master.archived_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{master.full_content}</p>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleRestoreMaster(master.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => confirmDelete('master', master.id, master.title)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-2xl font-serif text-muted-foreground">No archived master content</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="derivatives" className="space-y-6">
            {archivedDerivatives.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {archivedDerivatives.map((derivative) => (
                  <Card key={derivative.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-serif text-foreground mb-2">
                          {derivative.asset_type.charAt(0).toUpperCase() + derivative.asset_type.slice(1)}
                        </h3>
                        {derivative.master_content && (
                          <p className="text-sm text-muted-foreground mb-2">
                            From: {derivative.master_content.title}
                          </p>
                        )}
                        <div className="flex gap-2 mb-3">
                          <Badge variant="outline">{derivative.asset_type}</Badge>
                          <Badge variant="secondary">
                            Archived {new Date(derivative.archived_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="bg-muted/50 p-4 rounded-md">
                          <p className="text-sm text-foreground line-clamp-3 whitespace-pre-wrap">
                            {stripMarkdown(derivative.generated_content)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleRestoreDerivative(derivative.id)}>
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => confirmDelete('derivative', derivative.id, derivative.asset_type)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-2xl font-serif text-muted-foreground">No archived derivatives</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete "{itemToDelete?.title}". This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirmed} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Archive;
