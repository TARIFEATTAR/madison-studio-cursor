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
            <CardTitle>Madison's Knowledge Status</CardTitle>
            <CardDescription className="mt-1">
              Active brand knowledge that Madison references when generating content
            </CardDescription>
          </div>
          <Badge variant={activeCount > 0 ? "default" : "secondary"} className="text-base px-3 py-1">
            {activeCount} Active {activeCount === 1 ? 'Document' : 'Documents'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-3 bg-accent/5 rounded-lg border">
          <div className="flex items-center gap-2">
            {activeCount > 0 ? (
              <Check className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            <div>
              <div className="font-medium text-sm">Brand Context Loaded</div>
              <div className="text-xs text-muted-foreground">
                {formatBytes(totalSize)} of brand guidelines active
              </div>
            </div>
          </div>
        </div>

        {/* Individual Documents */}
        <div className="space-y-2">
          {knowledgeEntries.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No brand knowledge documents found. Upload brand documents to enable Madison's contextual understanding.
              </AlertDescription>
            </Alert>
          ) : (
            knowledgeEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {entry.is_active ? (
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      {entry.file_name || 'Unknown Document'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatKnowledgeType(entry.knowledge_type)} • {formatBytes(entry.content_size)}
                    </div>
                  </div>
                </div>
                <Badge variant={entry.is_active ? "default" : "outline"} className="ml-2 flex-shrink-0">
                  {entry.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            ))
          )}
        </div>

        {/* Help Text */}
        <p className="text-xs text-muted-foreground pt-2 border-t">
          💡 Madison can only reference documents marked as "Active" when generating content. 
          Inactive documents are stored but not used in AI prompts.
        </p>
      </CardContent>
    </Card>
  );
}
