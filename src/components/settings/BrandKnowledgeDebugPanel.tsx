import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Eye, FileText, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Filter, PlayCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

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
  document_id?: string;
}

interface GroupedEntries {
  [documentName: string]: {
    entries: KnowledgeEntry[];
    allActive: boolean;
    someActive: boolean;
    documentId: string;
  };
}

export function BrandKnowledgeDebugPanel({ organizationId }: BrandKnowledgeDebugPanelProps) {
  const { toast } = useToast();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
  const [aiContext, setAiContext] = useState<string>("");
  const [filterView, setFilterView] = useState<"all" | "active" | "inactive">("all");
  const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set());
  
  // Test Extraction State
  const [testText, setTestText] = useState("Our brand voice is sophisticated and warm. We use sensory language to describe our fragrances. Never use words like 'cheap' or 'bargain'.");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    loadKnowledgeEntries();
  }, [organizationId]);

  const handleTestExtraction = async () => {
    if (!testText) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('extract-brand-knowledge', {
        body: {
          extractedText: testText,
          organizationId: organizationId,
          documentName: 'Test Extraction',
          detectVisualStandards: true
        }
      });

      if (error) {
        // Parse the error body if possible
        let details = error.message;
        try {
            // If error has a context with response, try to read it
            if (error.context && error.context.json) {
                const json = await error.context.json();
                details = JSON.stringify(json, null, 2);
            }
        } catch (e) {
            console.log("Could not parse error details", e);
        }
        throw new Error(details);
      }

      setTestResult(data);
      toast({ title: "Extraction Complete", description: "Check the raw JSON result below." });
    } catch (error: any) {
      console.error('Test failed:', error);
      setTestResult({ error: error.message || 'Unknown error' });
      toast({ title: "Extraction Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsTesting(false);
    }
  };

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
          document_id,
          brand_documents!inner(file_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped = data?.map(entry => ({
        ...entry,
        file_name: (entry as any).brand_documents?.file_name,
        document_id: entry.document_id
      })) || [];

      setEntries(mapped);
      
      // Auto-expand active documents
      const activeDocs = new Set(
        mapped
          .filter(e => e.is_active)
          .map(e => e.file_name || 'Unknown')
      );
      setExpandedDocs(activeDocs);
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

  const toggleDocumentExpanded = (docName: string) => {
    setExpandedDocs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(docName)) {
        newSet.delete(docName);
      } else {
        newSet.add(docName);
      }
      return newSet;
    });
  };

  const toggleAllEntriesInDocument = async (documentId: string, activate: boolean) => {
    try {
      const { error } = await supabase
        .from('brand_knowledge')
        .update({ 
          is_active: activate,
          updated_at: new Date().toISOString()
        })
        .eq('document_id', documentId);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `All entries ${activate ? 'activated' : 'deactivated'} successfully`,
      });

      loadKnowledgeEntries();
    } catch (error) {
      console.error('Error toggling document entries:', error);
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive"
      });
    }
  };

  // Group entries by document
  const groupedEntries: GroupedEntries = entries.reduce((acc, entry) => {
    const docName = entry.file_name || 'Unknown Document';
    if (!acc[docName]) {
      acc[docName] = {
        entries: [],
        allActive: true,
        someActive: false,
        documentId: entry.document_id || ''
      };
    }
    acc[docName].entries.push(entry);
    if (!entry.is_active) acc[docName].allActive = false;
    if (entry.is_active) acc[docName].someActive = true;
    return acc;
  }, {} as GroupedEntries);

  // Filter entries based on view
  const filteredGroupedEntries = Object.entries(groupedEntries).filter(([_, group]) => {
    if (filterView === "active") return group.someActive;
    if (filterView === "inactive") return !group.allActive;
    return true;
  });

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
            Advanced Knowledge Inspector
          </CardTitle>
          <CardDescription>
            Deep dive into individual knowledge entries by document source. Preview exactly what Madison sees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Main Tabs */}
          <Tabs defaultValue="inspector" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="inspector">Knowledge Inspector</TabsTrigger>
              <TabsTrigger value="test">Test AI Extraction</TabsTrigger>
            </TabsList>

            <TabsContent value="inspector">
              {/* Filter Tabs */}
              <Tabs value={filterView} onValueChange={(v) => setFilterView(v as any)} className="mb-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">
                    All ({entries.length})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({entries.filter(e => e.is_active).length})
                  </TabsTrigger>
                  <TabsTrigger value="inactive">
                    Inactive ({entries.filter(e => !e.is_active).length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-3">
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No brand knowledge entries found</p>
                  </div>
                ) : filteredGroupedEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No {filterView} entries found</p>
                  </div>
                ) : (
                  filteredGroupedEntries.map(([docName, group]) => {
                    const isExpanded = expandedDocs.has(docName);
                    const activeCount = group.entries.filter(e => e.is_active).length;
                    
                    return (
                      <Collapsible
                        key={docName}
                        open={isExpanded}
                        onOpenChange={() => toggleDocumentExpanded(docName)}
                      >
                        <div className="border rounded-lg">
                          {/* Document Header */}
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 hover:bg-accent/5 transition-colors">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                                <div className="text-left">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span className="font-medium text-sm">{docName}</span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge 
                                      variant={group.allActive ? "default" : group.someActive ? "secondary" : "outline"}
                                      className="text-xs"
                                    >
                                      {activeCount} / {group.entries.length} Active
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {group.entries.length} knowledge {group.entries.length === 1 ? 'type' : 'types'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {!isExpanded && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleDocumentExpanded(docName);
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </CollapsibleTrigger>

                          {/* Document Entries */}
                          <CollapsibleContent>
                            <div className="border-t">
                              <div className="p-3 bg-muted/30 flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                  Knowledge entries from this document:
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAllEntriesInDocument(group.documentId, true)}
                                    disabled={group.allActive}
                                  >
                                    Activate All
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => toggleAllEntriesInDocument(group.documentId, false)}
                                    disabled={!group.someActive}
                                  >
                                    Deactivate All
                                  </Button>
                                </div>
                              </div>
                              <div className="p-3 space-y-2">
                                {group.entries.map((entry) => (
                                  <div
                                    key={entry.id}
                                    className="flex items-center justify-between p-3 border rounded hover:bg-accent/5 transition-colors"
                                  >
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        {entry.is_active ? (
                                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                                        )}
                                        <span className="text-sm font-medium">
                                          {formatKnowledgeType(entry.knowledge_type)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground ml-5">
                                        <span>v{entry.version}</span>
                                        <span>•</span>
                                        <span>{formatBytes(JSON.stringify(entry.content).length)}</span>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handlePreviewContext(entry)}
                                      >
                                        <Eye className="h-3.5 w-3.5 mr-1" />
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
                                ))}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="test">
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                  <h3 className="font-medium mb-2">Test Brand Extraction Logic</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Paste sample text here to test if Madison's AI can successfully extract brand guidelines.
                    This calls the exact same function as the document uploader.
                  </p>
                  
                  <div className="space-y-2">
                    <Textarea
                      value={testText}
                      onChange={(e) => setTestText(e.target.value)}
                      placeholder="Paste brand text here..."
                      className="min-h-[150px] font-mono text-sm"
                    />
                    <Button 
                      onClick={handleTestExtraction} 
                      disabled={isTesting || !testText}
                      className="w-full"
                    >
                      {isTesting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Extracting...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-4 h-4 mr-2" />
                          Test Extraction
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {testResult && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Raw AI Response:</h4>
                    <ScrollArea className="h-[300px] w-full rounded-md border p-4 bg-slate-950 text-slate-50">
                      <pre className="text-xs font-mono whitespace-pre-wrap">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
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
