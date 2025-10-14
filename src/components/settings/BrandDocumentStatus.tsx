import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FileText, CheckCircle, Clock, XCircle, RefreshCw, Eye } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BrandDocumentStatusProps {
  organizationId: string;
  documents: any[];
  onRetry: () => void;
}

export function BrandDocumentStatus({ organizationId, documents, onRetry }: BrandDocumentStatusProps) {
  const { toast } = useToast();
  const [retrying, setRetrying] = useState<string | null>(null);
  const [resetting, setResetting] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);

  const handleRetryDocument = async (documentId: string) => {
    setRetrying(documentId);
    try {
      // Reset status to pending
      const { error: updateError } = await supabase
        .from('brand_documents')
        .update({ 
          processing_status: 'pending',
          processing_stage: null,
          content_preview: null
        })
        .eq('id', documentId);

      if (updateError) throw updateError;

      // Trigger reprocessing
      const { data: invokeData, error: functionError } = await supabase.functions.invoke('process-brand-document', {
        body: { documentId }
      });

      if (functionError) {
        // Mark as failed if invocation fails
        await supabase
          .from('brand_documents')
          .update({ 
            processing_status: 'failed',
            content_preview: `Invocation error: ${functionError.message}`
          })
          .eq('id', documentId);
        
        // Try to fetch error details saved by the function
        const { data: doc } = await supabase
          .from('brand_documents')
          .select('content_preview')
          .eq('id', documentId)
          .maybeSingle();
        
        const details = doc?.content_preview || functionError.message;
        throw new Error(details);
      }

      toast({
        title: "Document reprocessing",
        description: "Your document is being processed. This may take a few minutes.",
      });
      
      onRetry();
    } catch (error: any) {
      toast({
        title: "Retry failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRetrying(null);
    }
  };

  const handleForceReset = async (documentId: string) => {
    setResetting(documentId);
    try {
      const { error } = await supabase
        .from('brand_documents')
        .update({ 
          processing_status: 'failed',
          processing_stage: null,
          content_preview: 'Processing timeout - please retry'
        })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: "Document reset",
        description: "You can now retry processing this document.",
      });
      
      onRetry();
    } catch (error: any) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setResetting(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string, stage?: string | null) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">Processed</Badge>;
      case 'processing':
        return (
          <div className="flex flex-col items-end gap-1">
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-300">Processing...</Badge>
            {stage && (
              <span className="text-xs text-muted-foreground">
                {stage === 'downloading' && '📥 Downloading'}
                {stage === 'extracting_text' && '📄 Reading PDF'}
                {stage === 'extracting_knowledge' && '🧠 Analyzing'}
                {stage === 'saving' && '💾 Saving'}
              </span>
            )}
          </div>
        );
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const isStuckProcessing = (doc: any) => {
    if (doc.processing_status !== 'processing') return false;
    const twoMinutesAgo = Date.now() - (2 * 60 * 1000);
    const updatedTime = new Date(doc.updated_at).getTime();
    return updatedTime < twoMinutesAgo;
  };

  const completedDocs = documents.filter(d => d.processing_status === 'completed');
  const pendingDocs = documents.filter(d => d.processing_status === 'pending' || d.processing_status === 'processing');
  const failedDocs = documents.filter(d => d.processing_status === 'failed');

  return (
    <>
      <Card className="bg-paper-light border-cream-dark">
        <CardHeader>
          <CardTitle className="text-charcoal flex items-center gap-2">
            <FileText className="h-5 w-5 text-brass" />
            Brand Knowledge Status
          </CardTitle>
          <CardDescription>
            Track your uploaded brand documents and their processing status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-900 dark:text-green-100">{completedDocs.length} Processed</span>
              </div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">{pendingDocs.length} Pending</span>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-900 dark:text-red-100">{failedDocs.length} Failed</span>
              </div>
            </div>
          </div>

          {/* Document List */}
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
              {documents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <p className="text-sm mt-1">Upload brand documents above to get started</p>
                </div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-start gap-3 p-3 bg-parchment-white rounded-lg border border-cream-dark">
                    {getStatusIcon(doc.processing_status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-charcoal truncate">{doc.file_name}</p>
                          <p className="text-xs text-warm-gray mt-1">
                            {new Date(doc.created_at).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {getStatusBadge(doc.processing_status, doc.processing_stage)}
                          {doc.processing_status === 'completed' && doc.extracted_content && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setPreviewDoc(doc)}
                              className="h-7 px-2"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {doc.processing_status === 'failed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryDocument(doc.id)}
                              disabled={retrying === doc.id}
                              className="h-7 px-2"
                            >
                              <RefreshCw className={`h-3 w-3 ${retrying === doc.id ? 'animate-spin' : ''}`} />
                            </Button>
                          )}
                          {isStuckProcessing(doc) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleForceReset(doc.id)}
                              disabled={resetting === doc.id}
                              className="h-7 px-2 text-orange-600 border-orange-300"
                              title="Force reset stuck document"
                            >
                              <XCircle className={`h-3 w-3 ${resetting === doc.id ? 'animate-spin' : ''}`} />
                            </Button>
                          )}
                        </div>
                      </div>
                      {doc.processing_status === 'failed' && doc.content_preview && (
                        <p className="text-xs text-red-600 mt-2">{doc.content_preview}</p>
                      )}
                      {doc.processing_status === 'completed' && doc.content_preview && (
                        <p className="text-xs text-warm-gray mt-2 line-clamp-2">{doc.content_preview}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewDoc?.file_name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
              {previewDoc?.extracted_content || previewDoc?.content_preview}
            </pre>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}