import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import { Edit2, History, Power, PowerOff, Plus, ChevronDown, ChevronRight, Loader2, AlertTriangle, RefreshCw, CheckCircle, XCircle, Eye } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BrandKnowledge {
  id: string;
  knowledge_type: string;
  content: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  document_id?: string;
  document?: {
    file_name: string;
    created_at: string;
  };
}

export function BrandKnowledgeManager() {
  const { currentOrganizationId } = useOnboarding();
  const [knowledgeItems, setKnowledgeItems] = useState<BrandKnowledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core_identity']));
  const [duplicates, setDuplicates] = useState<string[]>([]);
  const [consolidating, setConsolidating] = useState(false);
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);
  const [lastConsolidation, setLastConsolidation] = useState<{ status: 'success' | 'error'; message: string } | null>(null);
  const [viewingDuplicates, setViewingDuplicates] = useState<string | null>(null);
  const [duplicateEntries, setDuplicateEntries] = useState<BrandKnowledge[]>([]);
  const [showAllVersions, setShowAllVersions] = useState(false);
  const [allVersions, setAllVersions] = useState<Record<string, BrandKnowledge[]>>({});

  
  useEffect(() => {
    loadBrandKnowledge();
  }, [currentOrganizationId]);

  const rescanForDuplicates = async () => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .eq('is_active', true);

      if (error) throw error;

      const typeCounts: Record<string, number> = {};
      (data || []).forEach((k: BrandKnowledge) => {
        typeCounts[k.knowledge_type] = (typeCounts[k.knowledge_type] || 0) + 1;
      });
      const dupes = Object.keys(typeCounts).filter(type => typeCounts[type] > 1);
      setDuplicates(dupes);
      setLastScanAt(new Date());
      
      toast.success(`Scan complete. Found ${dupes.length} knowledge type(s) with duplicates`);
    } catch (error) {
      console.error('Error scanning for duplicates:', error);
      toast.error('Failed to scan for duplicates');
    }
  };

  const handleConsolidateDuplicates = async () => {
    if (!currentOrganizationId) {
      toast.error("Organization not found");
      return;
    }

    // Force a fresh scan first
    await rescanForDuplicates();

    if (duplicates.length === 0) {
      setLastConsolidation({ status: 'success', message: '✓ No duplicates found - your brand knowledge is clean!' });
      toast.success("✓ No duplicates found - your brand knowledge is clean!");
      return;
    }

    setConsolidating(true);
    setLastConsolidation(null);
    
    try {
      let totalConsolidated = 0;
      
      // For each duplicate knowledge type, keep only the latest version
      for (const knowledgeType of duplicates) {
        const items = knowledgeItems
          .filter(k => k.knowledge_type === knowledgeType && k.is_active)
          .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        // Keep the first (latest), deactivate the rest
        const toDeactivate = items.slice(1);
        
        for (const item of toDeactivate) {
          const { error } = await supabase
            .from("brand_knowledge")
            .update({ is_active: false })
            .eq("id", item.id);

          if (error) throw error;
          totalConsolidated++;
        }
      }

      const successMessage = `✓ Successfully consolidated ${duplicates.length} knowledge type(s), removed ${totalConsolidated} duplicate entries`;
      setLastConsolidation({ status: 'success', message: successMessage });
      toast.success(successMessage);
      
      await loadBrandKnowledge();
      await rescanForDuplicates(); // Rescan to verify cleanup worked
    } catch (error) {
      console.error("Error consolidating duplicates:", error);
      const errorMessage = "✗ Failed to consolidate duplicates. Please try again.";
      setLastConsolidation({ status: 'error', message: errorMessage });
      toast.error(errorMessage);
    } finally {
      setConsolidating(false);
    }
  };

  const handleViewDuplicates = async (knowledgeType: string) => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .eq('knowledge_type', knowledgeType)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDuplicateEntries(data || []);
      setViewingDuplicates(knowledgeType);
    } catch (error) {
      console.error('Error fetching duplicate entries:', error);
      toast.error('Failed to load duplicate entries');
    }
  };

  const handleKeepVersion = async (keepId: string, knowledgeType: string) => {
    if (!currentOrganizationId) return;

    try {
      // Deactivate all other versions of this knowledge type except the one we're keeping
      const { error } = await supabase
        .from('brand_knowledge')
        .update({ is_active: false })
        .eq('organization_id', currentOrganizationId)
        .eq('knowledge_type', knowledgeType)
        .neq('id', keepId);

      if (error) throw error;

      toast.success(`Kept selected version and removed duplicates for ${formatKnowledgeType(knowledgeType)}`);
      setViewingDuplicates(null);
      setDuplicateEntries([]);
      await loadBrandKnowledge();
      await rescanForDuplicates();
    } catch (error) {
      console.error('Error keeping version:', error);
      toast.error('Failed to consolidate duplicates');
    }
  };

  const loadAllVersions = async () => {
    if (!currentOrganizationId) return;

    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select(`
          *,
          document:brand_documents(file_name, created_at)
        `)
        .eq('organization_id', currentOrganizationId)
        .order('knowledge_type', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to handle the document relationship
      const transformedData = (data || []).map(item => ({
        ...item,
        document: Array.isArray(item.document) ? item.document[0] : item.document
      }));

      // Group by knowledge type
      const grouped = transformedData.reduce((acc, item) => {
        if (!acc[item.knowledge_type]) {
          acc[item.knowledge_type] = [];
        }
        acc[item.knowledge_type].push(item);
        return acc;
      }, {} as Record<string, BrandKnowledge[]>);

      setAllVersions(grouped);
      setShowAllVersions(true);
    } catch (error) {
      console.error('Error loading all versions:', error);
      toast.error('Failed to load version history');
    }
  };

  const loadBrandKnowledge = async () => {
    if (!currentOrganizationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select(`
          *,
          document:brand_documents(file_name, created_at)
        `)
        .eq('organization_id', currentOrganizationId)
        .order('knowledge_type', { ascending: true })
        .order('version', { ascending: false });

      if (error) throw error;
      
      // Transform the data to handle the document relationship
      const transformedData = (data || []).map(item => ({
        ...item,
        document: Array.isArray(item.document) ? item.document[0] : item.document
      }));
      
      setKnowledgeItems(transformedData);

      // Check for duplicates
      const typeCounts: Record<string, number> = {};
      const activeKnowledge = (data || []).filter(k => k.is_active);
      activeKnowledge.forEach((k: BrandKnowledge) => {
        typeCounts[k.knowledge_type] = (typeCounts[k.knowledge_type] || 0) + 1;
      });
      const dupes = Object.keys(typeCounts).filter(type => typeCounts[type] > 1);
      setDuplicates(dupes);
    } catch (error) {
      console.error('Error loading brand knowledge:', error);
      toast.error("Failed to load brand knowledge");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: BrandKnowledge) => {
    setEditingId(item.id);
    setEditContent(item.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent({});
  };

  const handleSaveEdit = async (item: BrandKnowledge) => {
    if (!currentOrganizationId) return;

    setIsSaving(true);
    try {
      // Create a new version by marking the old one inactive
      const { error: deactivateError } = await supabase
        .from('brand_knowledge')
        .update({ is_active: false })
        .eq('id', item.id);

      if (deactivateError) throw deactivateError;

      // Insert new version
      const { error: insertError } = await supabase
        .from('brand_knowledge')
        .insert({
          organization_id: currentOrganizationId,
          knowledge_type: item.knowledge_type,
          content: editContent,
          version: item.version + 1,
          is_active: true,
        });

      if (insertError) throw insertError;

      toast.success("Brand knowledge updated successfully");
      setEditingId(null);
      setEditContent({});
      loadBrandKnowledge();
    } catch (error) {
      console.error('Error saving:', error);
      toast.error("Failed to update brand knowledge");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (item: BrandKnowledge) => {
    try {
      const { error } = await supabase
        .from('brand_knowledge')
        .update({ is_active: !item.is_active })
        .eq('id', item.id);

      if (error) throw error;

      toast.success(item.is_active ? "Deactivated successfully" : "Activated successfully");
      loadBrandKnowledge();
    } catch (error) {
      console.error('Error toggling active:', error);
      toast.error("Failed to update status");
    }
  };

  const toggleSection = (knowledgeType: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(knowledgeType)) {
      newExpanded.delete(knowledgeType);
    } else {
      newExpanded.add(knowledgeType);
    }
    setExpandedSections(newExpanded);
  };

  const formatKnowledgeType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const renderContentFields = (item: BrandKnowledge, isEditing: boolean) => {
    const content = isEditing ? editContent : item.content;
    const knowledgeType = item.knowledge_type;

    if (knowledgeType === 'core_identity') {
      return (
        <div className="space-y-4">
          {['mission', 'vision', 'values', 'personality'].map((field) => (
            <div key={field}>
              <Label className="text-sm font-medium text-charcoal capitalize mb-2 block">
                {field}
              </Label>
              {isEditing ? (
                <Textarea
                  value={content[field] || ''}
                  onChange={(e) => setEditContent({ ...editContent, [field]: e.target.value })}
                  className="min-h-[80px] bg-paper border-cream-dark"
                />
              ) : (
                <p className="text-sm text-warm-gray bg-parchment-white p-3 rounded border border-cream-dark">
                  {content[field] || 'Not set'}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (knowledgeType === 'voice_tone') {
      return (
        <div className="space-y-4">
          {['voice_guidelines', 'tone_spectrum'].map((field) => (
            <div key={field}>
              <Label className="text-sm font-medium text-charcoal mb-2 block">
                {field === 'voice_guidelines' ? 'Voice Guidelines' : 'Tone Spectrum'}
              </Label>
              {isEditing ? (
                <Textarea
                  value={content[field] || ''}
                  onChange={(e) => setEditContent({ ...editContent, [field]: e.target.value })}
                  className="min-h-[100px] bg-paper border-cream-dark"
                />
              ) : (
                <p className="text-sm text-warm-gray bg-parchment-white p-3 rounded border border-cream-dark whitespace-pre-wrap">
                  {content[field] || 'Not set'}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    // Generic content with description field
    if (content.description) {
      return (
        <div>
          <Label className="text-sm font-medium text-charcoal mb-2 block">
            Content
          </Label>
          {isEditing ? (
            <Textarea
              value={content.description || ''}
              onChange={(e) => setEditContent({ ...editContent, description: e.target.value })}
              className="min-h-[150px] bg-paper border-cream-dark"
            />
          ) : (
            <p className="text-sm text-warm-gray bg-parchment-white p-3 rounded border border-cream-dark whitespace-pre-wrap">
              {content.description || 'Not set'}
            </p>
          )}
        </div>
      );
    }

    // Fallback for unknown structure - show raw JSON
    return (
      <div>
        {isEditing ? (
          <Textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try {
                setEditContent(JSON.parse(e.target.value));
              } catch {}
            }}
            className="min-h-[150px] font-mono text-xs bg-paper border-cream-dark"
          />
        ) : (
          <pre className="text-xs text-warm-gray bg-parchment-white p-3 rounded border border-cream-dark overflow-x-auto">
            {JSON.stringify(content, null, 2)}
          </pre>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-paper-light border-cream-dark">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-brass" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-paper-light border-cream-dark">
      <CardHeader>
        <CardTitle className="text-charcoal flex items-center gap-2">
          <History className="w-5 h-5" />
          Your Brand Knowledge Base
        </CardTitle>
        <CardDescription>
          Madison uses only <strong>your brand's active knowledge</strong> when creating content. Other organizations cannot see or access this information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Group knowledge by document source */}
        {(() => {
          const documentGroups: Record<string, { items: typeof knowledgeItems, fileName: string }> = {};
          
          knowledgeItems.forEach(item => {
            if (!item.is_active) return; // Only show active knowledge
            const docKey = item.document?.file_name || 'manual';
            if (!documentGroups[docKey]) {
              documentGroups[docKey] = {
                items: [],
                fileName: item.document?.file_name || 'Manually Created'
              };
            }
            documentGroups[docKey].items.push(item);
          });

          return Object.entries(documentGroups).map(([docKey, group]) => (
            <Card key={docKey} className="bg-white border-brass/20">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base text-charcoal flex items-center gap-2">
                      📄 {group.fileName}
                    </CardTitle>
                    <p className="text-xs text-warm-gray mt-1">
                      {group.items.length} active knowledge {group.items.length === 1 ? 'type' : 'types'}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <Badge 
                      key={item.id} 
                      variant="outline" 
                      className="bg-brass/5 text-charcoal border-brass/20"
                    >
                      {formatKnowledgeType(item.knowledge_type)}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ));
        })()}

        {/* Maintenance Tools - Collapsed by default */}
        {duplicates.length > 0 && (
          <Alert className="bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex items-center justify-between">
              <span className="text-amber-900 flex-1">
                ⚠️ Found {duplicates.length} knowledge type(s) with duplicates
              </span>
              <Button
                onClick={handleConsolidateDuplicates}
                disabled={consolidating}
                size="sm"
                className="ml-4 bg-amber-600 hover:bg-amber-700 text-white shrink-0"
              >
                {consolidating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                Auto-Fix Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Advanced Tools - Collapsed */}
        <Collapsible>
          <Card className="bg-slate-50 border-slate-200">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-slate-100/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-slate-600" />
                    <CardTitle className="text-sm text-slate-700">
                      Advanced Knowledge Tools
                    </CardTitle>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={loadAllVersions}
                    variant="outline"
                    size="sm"
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    <History className="w-3 h-3 mr-1" />
                    View All Versions
                  </Button>
                  <Button
                    onClick={rescanForDuplicates}
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Scan for Issues
                  </Button>
                </div>
                {lastScanAt && (
                  <p className="text-xs text-slate-500">
                    Last scan: {format(lastScanAt, 'MMM d, h:mm a')}
                  </p>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
        
        {knowledgeItems.length === 0 && (
          <div className="text-center py-12 text-warm-gray">
            <p className="mb-2">No brand knowledge saved yet</p>
            <p className="text-sm">Upload brand documents in Settings → Brand Guidelines</p>
          </div>
        )}
      </CardContent>

      {/* All Versions Dialog */}
      <Dialog open={showAllVersions} onOpenChange={setShowAllVersions}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Complete Version History
            </DialogTitle>
            <DialogDescription>
              All versions of brand knowledge across all types. Green = Active, Gray = Inactive.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 pr-4">
              {Object.entries(allVersions).length === 0 ? (
                <div className="text-center py-8 text-warm-gray">
                  <p>No brand knowledge found</p>
                </div>
              ) : (
                Object.entries(allVersions).map(([knowledgeType, versions]) => (
                  <Card key={knowledgeType} className="bg-parchment-white border-cream-dark">
                    <CardHeader>
                      <CardTitle className="text-lg text-charcoal">
                        {formatKnowledgeType(knowledgeType)}
                      </CardTitle>
                      <CardDescription>
                        {versions.length} version{versions.length > 1 ? 's' : ''} total
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {versions.map((version) => (
                        <div
                          key={version.id}
                          className={`p-4 rounded-lg border ${
                            version.is_active
                              ? 'bg-green-50 border-green-200'
                              : 'bg-warm-gray/5 border-warm-gray/20'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  version.is_active
                                    ? 'bg-green-100 text-green-800 border-green-200'
                                    : 'bg-warm-gray/20 text-warm-gray'
                                }
                              >
                                {version.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                v{version.version}
                              </Badge>
                              <span className="text-xs text-warm-gray">
                                {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleToggleActive(version)}
                              className={
                                version.is_active
                                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                                  : 'border-green-300 text-green-600 hover:bg-green-50'
                              }
                            >
                              {version.is_active ? (
                                <>
                                  <PowerOff className="w-3 h-3 mr-1" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <Power className="w-3 h-3 mr-1" />
                                  Activate
                                </>
                              )}
                            </Button>
                          </div>
                          <div className="bg-white p-3 rounded border border-cream-dark max-h-48 overflow-y-auto">
                            <pre className="text-xs text-warm-gray whitespace-pre-wrap">
                              {typeof version.content === 'string'
                                ? version.content
                                : JSON.stringify(version.content, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Duplicate Comparison Dialog */}
      <Dialog open={!!viewingDuplicates} onOpenChange={(open) => !open && setViewingDuplicates(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Compare Duplicate Entries: {viewingDuplicates && formatKnowledgeType(viewingDuplicates)}</DialogTitle>
            <DialogDescription>
              Review each version below and select which one to keep. All other versions will be deactivated.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              {duplicateEntries.map((entry, index) => (
                <Card key={entry.id} className="bg-slate-50 border-slate-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          Version {entry.version}
                          <Badge variant="outline" className="text-xs">
                            {index === 0 ? 'Most Recent' : `${index + 1} versions old`}
                          </Badge>
                        </CardTitle>
                        <p className="text-xs text-slate-500 mt-1">
                          Created: {format(new Date(entry.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <Button
                        onClick={() => handleKeepVersion(entry.id, entry.knowledge_type)}
                        variant="outline"
                        size="sm"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Keep This Version
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white p-4 rounded border border-slate-200 max-h-64 overflow-y-auto">
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                        {typeof entry.content === 'string' 
                          ? entry.content 
                          : JSON.stringify(entry.content, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
