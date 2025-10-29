import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Search, FileText, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

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

  const filteredContent = contents.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Select Content from Library</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
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
                    onClick={() => handleSelect(item)}
                    className="w-full p-4 text-left border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {item.image_url ? (
                        <ImageIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                      ) : (
                        <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">{item.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                          {item.content?.substring(0, 120) || "No content"}...
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(item.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
