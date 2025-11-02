import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, FileText, Image as ImageIcon, Calendar, SortDesc } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface Content {
  id: string;
  title: string;
  content: string | null;
  image_url?: string | null;
  created_at: string;
  source_table: string;
}

interface ContentPickerProps {
  onSelect: (content: { title: string; content: string; imageUrl?: string }) => void;
  organizationId: string;
}

export function ContentPicker({ onSelect, organizationId }: ContentPickerProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [contents, setContents] = useState<Content[]>([]);
  const [contentType, setContentType] = useState<"all" | "text" | "image">("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "title">("recent");
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);

  useEffect(() => {
    if (open && organizationId) {
      loadContent();
    }
  }, [open, organizationId]);

  const loadContent = async () => {
    setLoading(true);
    try {
      // Load from master_content
      const { data: masterData, error: masterError } = await supabase
        .from("master_content")
        .select("id, title, full_content, created_at")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (masterError) throw masterError;

      // Load from derivative_assets
      const { data: derivativeData, error: derivativeError } = await supabase
        .from("derivative_assets")
        .select("id, generated_content, created_at")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
        .order("created_at", { ascending: false })
        .limit(20);

      if (derivativeError) throw derivativeError;

      const allContent: Content[] = [
        ...(masterData || []).map((item) => ({
          id: item.id,
          title: item.title || "Untitled",
          content: item.full_content,
          created_at: item.created_at,
          source_table: "master_content",
        })),
        ...(derivativeData || []).map((item) => ({
          id: item.id,
          title: "Derivative Content",
          content: item.generated_content,
          created_at: item.created_at,
          source_table: "derivative_assets",
        })),
      ];

      allContent.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setContents(allContent);
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
    } finally {
      setLoading(false);
    }
  };

  let filteredContent = contents.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = contentType === "all" || 
      (contentType === "image" && item.image_url) ||
      (contentType === "text" && !item.image_url);
    
    return matchesSearch && matchesType;
  });

  // Apply sorting
  filteredContent = [...filteredContent].sort((a, b) => {
    if (sortBy === "recent") {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else {
      return a.title.localeCompare(b.title);
    }
  });

  const handleSelect = (content: Content) => {
    onSelect({
      title: content.title,
      content: content.content || "",
      imageUrl: content.image_url || undefined,
    });
    setOpen(false);
    toast.success("Content loaded into composer");
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2 text-xs md:text-sm">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Load from Library</span>
            <span className="sm:hidden">Load</span>
          </Button>
        </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Select Content from Library</DialogTitle>
          <DialogDescription>
            Choose existing content to load into the email composer
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedContent}>Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="image">With Images</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="title">By Title</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{filteredContent.length} items</span>
            </div>

            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              ) : filteredContent.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="text-muted-foreground">No content found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredContent.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedContent(item)}
                      onDoubleClick={() => handleSelect(item)}
                      className={`w-full p-4 text-left border rounded-lg transition-colors ${
                        selectedContent?.id === item.id 
                          ? 'bg-accent border-primary' 
                          : 'border-border hover:bg-accent/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {item.image_url ? (
                          <ImageIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                        ) : (
                          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
                            <Badge variant="outline" className="text-xs shrink-0">
                              {item.source_table === "master_content" ? "Master" : "Derivative"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {item.content?.substring(0, 120) || "No content"}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Calendar className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              {new Date(item.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedContent && (
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => setSelectedContent(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => handleSelect(selectedContent)}>
                  Load Content
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview" className="space-y-4">
            {selectedContent && (
              <div className="space-y-4">
                <div className="p-4 border border-border rounded-lg">
                  <h3 className="font-medium mb-2">{selectedContent.title}</h3>
                  {selectedContent.image_url && (
                    <img 
                      src={selectedContent.image_url} 
                      alt={selectedContent.title}
                      className="w-full max-h-[200px] object-cover rounded mb-4"
                    />
                  )}
                  <ScrollArea className="h-[300px]">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedContent.content || "No content available"}
                    </p>
                  </ScrollArea>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedContent(null)}>
                    Back
                  </Button>
                  <Button size="sm" onClick={() => handleSelect(selectedContent)}>
                    Load Content
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
