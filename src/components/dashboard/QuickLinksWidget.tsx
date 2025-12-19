/**
 * QuickLinksWidget - Collapsible widget for quick access links
 * 
 * Supports:
 * - YouTube embeds
 * - Google Meet links
 * - NotebookLM links
 * - Any other URL with favicon preview
 */

import { useState, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  X, 
  ExternalLink, 
  Youtube, 
  Video,
  BookOpen,
  Link2,
  GripVertical,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "@/hooks/useOrganization";

interface QuickLink {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "meet" | "notebooklm" | "generic";
  order: number;
}

// Helper to detect link type
function detectLinkType(url: string): QuickLink["type"] {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("meet.google.com")) return "meet";
  if (url.includes("notebooklm.google.com")) return "notebooklm";
  return "generic";
}

// Helper to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/,
    /youtube\.com\/shorts\/([^&\s?]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get icon for link type
function getLinkIcon(type: QuickLink["type"]) {
  switch (type) {
    case "youtube":
      return <Youtube className="w-4 h-4 text-red-500" />;
    case "meet":
      return <Video className="w-4 h-4 text-green-500" />;
    case "notebooklm":
      return <BookOpen className="w-4 h-4 text-blue-500" />;
    default:
      return <Link2 className="w-4 h-4 text-muted-foreground" />;
  }
}

// Get display name for link type
function getLinkTypeName(type: QuickLink["type"]) {
  switch (type) {
    case "youtube":
      return "YouTube";
    case "meet":
      return "Google Meet";
    case "notebooklm":
      return "NotebookLM";
    default:
      return "Link";
  }
}

const MAX_LINKS = 4;

export function QuickLinksWidget() {
  const { toast } = useToast();
  const { organizationId } = useOrganization();
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [links, setLinks] = useState<QuickLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<QuickLink | null>(null);
  const [expandedEmbed, setExpandedEmbed] = useState<string | null>(null);
  
  // Form state
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  
  // Load saved links from database
  useEffect(() => {
    const loadLinks = async () => {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('organizations')
          .select('settings')
          .eq('id', organizationId)
          .single();
        
        if (error) {
          console.error("Error loading quick links:", error);
        } else if (data?.settings && typeof data.settings === 'object') {
          const settings = data.settings as Record<string, any>;
          if (Array.isArray(settings.quickLinks)) {
            setLinks(settings.quickLinks);
          }
        }
      } catch (e) {
        console.error("Error loading quick links:", e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadLinks();
  }, [organizationId]);
  
  // Save links to database
  const saveLinks = async (newLinks: QuickLink[]) => {
    setLinks(newLinks);
    
    if (!organizationId) return;
    
    try {
      // First get current settings
      const { data: orgData } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();
      
      const currentSettings = (orgData?.settings && typeof orgData.settings === 'object') 
        ? orgData.settings as Record<string, any>
        : {};
      
      // Merge quick links into settings
      const updatedSettings = {
        ...currentSettings,
        quickLinks: newLinks,
      };
      
      const { error } = await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', organizationId);
      
      if (error) {
        console.error("Error saving quick links:", error);
        toast({
          title: "Failed to save",
          description: "Your links couldn't be saved. Please try again.",
          variant: "destructive",
        });
      }
    } catch (e) {
      console.error("Error saving quick links:", e);
    }
  };
  
  // Add or edit link
  const handleSaveLink = () => {
    if (!newUrl.trim()) return;
    
    const type = detectLinkType(newUrl);
    const defaultTitle = getLinkTypeName(type);
    
    if (editingLink) {
      // Update existing
      const updated = links.map(link => 
        link.id === editingLink.id 
          ? { ...link, url: newUrl, title: newTitle || defaultTitle, type }
          : link
      );
      saveLinks(updated);
      toast({ title: "Link updated" });
    } else {
      // Add new
      if (links.length >= MAX_LINKS) {
        toast({ 
          title: "Maximum links reached", 
          description: `You can only have ${MAX_LINKS} quick links.`,
          variant: "destructive"
        });
        return;
      }
      
      const newLink: QuickLink = {
        id: Date.now().toString(),
        url: newUrl,
        title: newTitle || defaultTitle,
        type,
        order: links.length,
      };
      saveLinks([...links, newLink]);
      toast({ title: "Link added" });
    }
    
    // Reset form
    setNewUrl("");
    setNewTitle("");
    setEditingLink(null);
    setIsAddDialogOpen(false);
  };
  
  // Remove link
  const handleRemoveLink = (id: string) => {
    const updated = links.filter(link => link.id !== id);
    saveLinks(updated);
    toast({ title: "Link removed" });
  };
  
  // Open edit dialog
  const handleEditLink = (link: QuickLink) => {
    setEditingLink(link);
    setNewUrl(link.url);
    setNewTitle(link.title);
    setIsAddDialogOpen(true);
  };
  
  // Render YouTube embed
  const renderYouTubeEmbed = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    if (!videoId) return null;
    
    return (
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 w-full h-full"
        />
      </div>
    );
  };
  
  return (
    <>
      <Card className="bg-card border border-border shadow-level-1 transition-all duration-300">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" />
                Quick Links
              </CardTitle>
              <div className="flex items-center gap-1">
                {links.length < MAX_LINKS && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setEditingLink(null);
                      setNewUrl("");
                      setNewTitle("");
                      setIsAddDialogOpen(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                )}
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>
          </CardHeader>
          
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-2">
              {isLoading ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Loading links...</p>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-2">No links added yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsAddDialogOpen(true)}
                    className="gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add your first link
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link.id} className="group">
                      {/* Link Item */}
                      <div 
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (link.type === "youtube") {
                            setExpandedEmbed(expandedEmbed === link.id ? null : link.id);
                          } else {
                            window.open(link.url, "_blank");
                          }
                        }}
                      >
                        {getLinkIcon(link.type)}
                        <span className="flex-1 text-sm font-medium truncate">
                          {link.title}
                        </span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditLink(link);
                            }}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveLink(link.id);
                            }}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                          {link.type !== "youtube" && (
                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      
                      {/* YouTube Embed (expandable) */}
                      {link.type === "youtube" && expandedEmbed === link.id && (
                        <div className="mt-2 px-2">
                          {renderYouTubeEmbed(link.url)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Add/Edit Link Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingLink ? "Edit Link" : "Add Quick Link"}
            </DialogTitle>
            <DialogDescription>
              Add a link to YouTube, Google Meet, NotebookLM, or any other URL.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              {newUrl && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {getLinkIcon(detectLinkType(newUrl))}
                  <span>Detected: {getLinkTypeName(detectLinkType(newUrl))}</span>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={newUrl ? getLinkTypeName(detectLinkType(newUrl)) : "My Link"}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLink} disabled={!newUrl.trim()}>
              {editingLink ? "Save" : "Add Link"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
