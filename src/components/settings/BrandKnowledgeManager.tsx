import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "sonner";
import { Edit2, History, Power, PowerOff, Plus, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { format } from "date-fns";

interface BrandKnowledge {
  id: string;
  knowledge_type: string;
  content: any;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function BrandKnowledgeManager() {
  const { currentOrganizationId } = useOnboarding();
  const [knowledgeItems, setKnowledgeItems] = useState<BrandKnowledge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['core_identity']));

  useEffect(() => {
    loadBrandKnowledge();
  }, [currentOrganizationId]);

  const loadBrandKnowledge = async () => {
    if (!currentOrganizationId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .order('knowledge_type', { ascending: true })
        .order('version', { ascending: false });

      if (error) throw error;
      setKnowledgeItems(data || []);
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

  // Group items by knowledge_type
  const groupedItems = knowledgeItems.reduce((acc, item) => {
    if (!acc[item.knowledge_type]) {
      acc[item.knowledge_type] = [];
    }
    acc[item.knowledge_type].push(item);
    return acc;
  }, {} as Record<string, BrandKnowledge[]>);

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
          Brand Knowledge Management
        </CardTitle>
        <CardDescription>
          View, edit, and manage all brand knowledge entries from "Ask Madison"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(groupedItems).length === 0 ? (
          <div className="text-center py-12 text-warm-gray">
            <p className="mb-2">No brand knowledge saved yet</p>
            <p className="text-sm">Use "Ask Madison" in Brand Health to generate suggestions</p>
          </div>
        ) : (
          Object.entries(groupedItems).map(([knowledgeType, items]) => {
            const activeItem = items.find(item => item.is_active);
            const olderVersions = items.filter(item => !item.is_active);
            const isExpanded = expandedSections.has(knowledgeType);

            return (
              <Collapsible
                key={knowledgeType}
                open={isExpanded}
                onOpenChange={() => toggleSection(knowledgeType)}
              >
                <Card className="bg-parchment-white border-cream-dark">
                  <CollapsibleTrigger className="w-full">
                    <CardHeader className="cursor-pointer hover:bg-aged-brass/5 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-brass" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-brass" />
                          )}
                          <CardTitle className="text-lg text-charcoal">
                            {formatKnowledgeType(knowledgeType)}
                          </CardTitle>
                          {activeItem && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              v{activeItem.version}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {olderVersions.length > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {olderVersions.length} older version{olderVersions.length > 1 ? 's' : ''}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      {/* Active Version */}
                      {activeItem && (
                        <div className="p-4 bg-paper rounded-lg border border-cream-dark">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Active
                              </Badge>
                              <span className="text-xs text-warm-gray">
                                Updated {format(new Date(activeItem.updated_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {editingId === activeItem.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                    disabled={isSaving}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveEdit(activeItem)}
                                    disabled={isSaving}
                                    className="bg-brass hover:bg-brass-light text-charcoal"
                                  >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save as New Version'}
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleEdit(activeItem)}
                                    className="border-brass/40 text-brass hover:bg-brass/10"
                                  >
                                    <Edit2 className="w-3 h-3 mr-1" />
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleToggleActive(activeItem)}
                                    className="border-red-300 text-red-600 hover:bg-red-50"
                                  >
                                    <PowerOff className="w-3 h-3 mr-1" />
                                    Deactivate
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          {renderContentFields(activeItem, editingId === activeItem.id)}
                        </div>
                      )}

                      {/* Older Versions */}
                      {olderVersions.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-charcoal">Version History</h4>
                          {olderVersions.map((item) => (
                            <div
                              key={item.id}
                              className="p-3 bg-warm-gray/5 rounded border border-warm-gray/20"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    v{item.version}
                                  </Badge>
                                  <span className="text-xs text-warm-gray">
                                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleToggleActive(item)}
                                  className="text-xs border-green-300 text-green-600 hover:bg-green-50"
                                >
                                  <Power className="w-3 h-3 mr-1" />
                                  Reactivate
                                </Button>
                              </div>
                              <div className="text-xs text-warm-gray/70">
                                {renderContentFields(item, false)}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
