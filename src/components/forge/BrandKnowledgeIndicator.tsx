import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Check, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BrandKnowledgeIndicatorProps {
  organizationId: string | null;
}

export function BrandKnowledgeIndicator({ organizationId }: BrandKnowledgeIndicatorProps) {
  const [activeCount, setActiveCount] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!organizationId) {
      setLoading(false);
      return;
    }

    loadBrandKnowledge();
  }, [organizationId]);

  const loadBrandKnowledge = async () => {
    if (!organizationId) return;

    try {
      const { data, error } = await supabase
        .from('brand_knowledge')
        .select('id, content, is_active')
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (error) {
        console.error('Error loading brand knowledge:', error);
        return;
      }

      setActiveCount(data?.length || 0);
      
      const size = data?.reduce((sum, entry) => {
        return sum + (entry.content ? JSON.stringify(entry.content).length : 0);
      }, 0) || 0;
      
      setTotalSize(size);
    } catch (error) {
      console.error('Error in loadBrandKnowledge:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) return null;

  if (activeCount === 0) {
    return (
      <Alert variant="default" className="mb-6 border-yellow-200 bg-yellow-50">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-sm text-yellow-800">
          <strong>No brand guidelines active.</strong> Madison will generate content without brand context. 
          Upload brand documents in Settings to improve accuracy.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="default" className="mb-6 border-green-200 bg-green-50">
      <Check className="h-4 w-4 text-green-600" />
      <AlertDescription className="text-sm text-green-800">
        <strong>Brand Guidelines Active</strong> — Madison has access to {activeCount} document{activeCount === 1 ? '' : 's'} ({formatBytes(totalSize)}) 
        and will reference your brand voice, vocabulary, and visual standards when generating content.
      </AlertDescription>
    </Alert>
  );
}
