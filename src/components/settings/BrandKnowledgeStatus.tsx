import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BrandKnowledgeStatusProps {
  organizationId: string;
}

interface KnowledgeEntry {
  id: string;
  knowledge_type: string;
  is_active: boolean;
  content_size: number;
  file_name?: string;
  created_at: string;
}

export function BrandKnowledgeStatus({ organizationId }: BrandKnowledgeStatusProps) {
  const [knowledgeEntries, setKnowledgeEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKnowledgeStatus();
  }, [organizationId]);

  const loadKnowledgeStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select(`
          id,
          knowledge_type,
          is_active,
          content,
          created_at,
          brand_documents!inner(file_name)
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const entries = data?.map(entry => ({
        id: entry.id,
        knowledge_type: entry.knowledge_type,
        is_active: entry.is_active,
        content_size: entry.content ? JSON.stringify(entry.content).length : 0,
        file_name: (entry as any).brand_documents?.file_name,
        created_at: entry.created_at
      })) || [];

      setKnowledgeEntries(entries);
    } catch (error) {
      console.error('Error loading knowledge status:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCount = knowledgeEntries.filter(e => e.is_active).length;
  const totalSize = knowledgeEntries
    .filter(e => e.is_active)
    .reduce((sum, e) => sum + e.content_size, 0);

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
          <CardTitle>Madison's Knowledge Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Brand Knowledge</CardTitle>
            <CardDescription className="mt-1">
              Madison uses only <strong>your organization's</strong> active knowledge when creating content
            </CardDescription>
          </div>
          <Badge variant={activeCount > 0 ? "default" : "secondary"} className="text-base px-3 py-1 bg-brass text-charcoal">
            {activeCount} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2">
            {activeCount > 0 ? (
              <Check className="h-5 w-5 text-green-600" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <div className="font-medium text-sm text-green-900">Your Brand Context Loaded</div>
              <div className="text-xs text-green-700">
                {formatBytes(totalSize)} • Private to your organization
              </div>
            </div>
          </div>
        </div>

        {/* Group by document */}
        <div className="space-y-3">
          {knowledgeEntries.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No brand knowledge found. Upload brand documents in Settings → Brand Guidelines.
              </AlertDescription>
            </Alert>
          ) : (
            (() => {
              // Group active entries by document
              const docGroups: Record<string, KnowledgeEntry[]> = {};
              knowledgeEntries.filter(e => e.is_active).forEach(entry => {
                const docKey = entry.file_name || 'Manual';
                if (!docGroups[docKey]) docGroups[docKey] = [];
                docGroups[docKey].push(entry);
              });

              return Object.entries(docGroups).map(([docName, entries]) => (
                <div
                  key={docName}
                  className="p-3 border border-brass/20 rounded-lg bg-paper-light"
                >
                  <div className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-charcoal truncate">
                        📄 {docName}
                      </div>
                      <div className="text-xs text-warm-gray mt-1 flex flex-wrap gap-1">
                        {entries.map(entry => (
                          <Badge key={entry.id} variant="outline" className="bg-brass/5 text-charcoal border-brass/20 text-xs">
                            {formatKnowledgeType(entry.knowledge_type)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ));
            })()
          )}
        </div>

        {/* Help Text */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs text-blue-900">
            🔒 <strong>Privacy:</strong> Your brand knowledge is private to your organization. 
            Madison only references active knowledge types when generating your content.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
