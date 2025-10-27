import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BrandKnowledgeDebugPanelProps {
  organizationId: string;
}

interface KnowledgeEntry {
  id: string;
  knowledge_type: string;
  is_active: boolean;
  version: number;
  content: any;
  created_at: string;
  updated_at: string;
  file_name?: string;
}

export function BrandKnowledgeDebugPanel({ organizationId }: BrandKnowledgeDebugPanelProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [aiContext, setAiContext] = useState<string>("");

  useEffect(() => {
    loadKnowledgeEntries();
  }, [organizationId]);

  const loadKnowledgeEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select(`
          id,
          knowledge_type,
          is_active,
          version,
          content,
          created_at,
          updated_at,
          brand_documents!inner(file_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data?.map(entry => ({
        ...entry,
        file_name: (entry as any).brand_documents?.file_name
      })) || [];

      setEntries(mapped);
    } catch (error) {
      console.error('Error loading knowledge entries:', error);
      toast({
        title: "Error",
        description: "Failed to load brand knowledge entries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewContext = (entry: KnowledgeEntry) => {
    setSelectedEntry(entry);
    
    // Build a simplified AI context preview
    const contextParts = [];
    contextParts.push('═══════════════════════════════════════════════════════════');
    contextParts.push('   MADISON\'S VIEW OF THIS DOCUMENT');
    contextParts.push('═══════════════════════════════════════════════════════════\n');
    
    contextParts.push(`📄 File: ${entry.file_name}`);
    contextParts.push(`📋 Type: ${formatKnowledgeType(entry.knowledge_type)}`);
    contextParts.push(`🔢 Version: ${entry.version}`);
    contextParts.push(`📊 Status: ${entry.is_active ? '✓ Active (Madison can see this)' : '✗ Inactive (Madison cannot see this)'}`);
    contextParts.push(`💾 Size: ${formatBytes(JSON.stringify(entry.content).length)}\n`);
    
    contextParts.push('─────────────────────────────────────────────────────────');
    contextParts.push('CONTENT STRUCTURE:');
    contextParts.push('─────────────────────────────────────────────────────────\n');
    
    // Show content structure
    if (entry.content) {
      if (entry.content.raw_document) {
        contextParts.push(`📝 Raw Document Length: ${entry.content.raw_document.length} characters\n`);
        contextParts.push('─────────────────────────────────────────────────────────');
        contextParts.push('DOCUMENT PREVIEW (First 2000 characters):');
        contextParts.push('─────────────────────────────────────────────────────────\n');
        contextParts.push(entry.content.raw_document.substring(0, 2000));
        if (entry.content.raw_document.length > 2000) {
          contextParts.push('\n\n... [truncated] ...\n');
          contextParts.push(`\nTotal: ${entry.content.raw_document.length} characters`);
        }
      } else {
        contextParts.push(JSON.stringify(entry.content, null, 2));
      }
    }
    
    setAiContext(contextParts.join('\n'));
    setPreviewOpen(true);
  };

  const toggleActive = async (entryId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('brand_knowledge')
        .update({ 
          is_active: !currentState,
          updated_at: new Date().toISOString()
        })
        .eq('id', entryId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `Document ${!currentState ? 'activated' : 'deactivated'} successfully`,
      });

      loadKnowledgeEntries();
    } catch (error) {
      console.error('Error toggling active state:', error);
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive"
      });
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatKnowledgeType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Brand Knowledge Debug Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading debug information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Brand Knowledge Debug Panel
          </CardTitle>
          <CardDescription>
            View and manage individual brand knowledge entries. Preview exactly what Madison sees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No brand knowledge entries found</p>
              </div>
            ) : (
              entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {entry.is_active ? (
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm truncate">
                        {entry.file_name || 'Unknown Document'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {formatKnowledgeType(entry.knowledge_type)}
                      </Badge>
                      <span>v{entry.version}</span>
                      <span>•</span>
                      <span>{formatBytes(JSON.stringify(entry.content).length)}</span>
                      <span>•</span>
                      <span>Updated {new Date(entry.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreviewContext(entry)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button
                      variant={entry.is_active ? "outline" : "default"}
                      size="sm"
                      onClick={() => toggleActive(entry.id, entry.is_active)}
                    >
                      {entry.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Madison's Context View</DialogTitle>
            <DialogDescription>
              This is exactly what Madison sees when referencing this document
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {aiContext}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
