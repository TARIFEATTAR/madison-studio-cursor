/**
 * Import from Sanity Canvas Component
 *
 * Allows users to pull content from Sanity Canvas documents into Madison
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, XCircle, Download, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CanvasDocument {
  _id: string;
  _type: string;
  title?: string;
  name?: string;
  blocks?: any[];
  content?: any;
}

interface ImportFromCanvasProps {
  onImportComplete?: (content: string, title: string, metadata?: any) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  buttonText?: string;
}

export function ImportFromCanvas({
  onImportComplete,
  variant = "outline",
  size = "sm",
  buttonText = "Import from Canvas",
}: ImportFromCanvasProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [canvasDocuments, setCanvasDocuments] = useState<CanvasDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    content?: string;
    title?: string;
    error?: string;
  } | null>(null);

  // Fetch available Canvas documents
  const fetchCanvasDocuments = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("canvas-sync", {
        body: {
          action: "list",
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setCanvasDocuments(data?.documents || []);
    } catch (error: any) {
      console.error("Error fetching Canvas documents:", error);
      toast({
        title: "Failed to fetch Canvas documents",
        description: error.message || "Unable to load Canvas documents",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCanvasDocuments();
    }
  }, [open]);

  const handleImport = async () => {
    if (!selectedDocumentId) {
      toast({
        title: "Select a document",
        description: "Please choose a Canvas document to import",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setImportStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke("canvas-sync", {
        body: {
          action: "import",
          documentId: selectedDocumentId,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setImportStatus({
        success: true,
        content: data.content,
        title: data.title,
      });

      // Call completion handler
      if (onImportComplete && data.content) {
        onImportComplete(data.content, data.title || "Imported from Canvas", data.metadata);
      }

      toast({
        title: "✅ Imported from Canvas",
        description: `Content successfully imported from Canvas document`,
      });

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setOpen(false);
        setImportStatus(null);
      }, 2000);
    } catch (error: any) {
      console.error("Error importing from Canvas:", error);
      setImportStatus({
        success: false,
        error: error.message || "Failed to import from Canvas",
      });

      toast({
        title: "❌ Failed to import",
        description: error.message || "Unable to import content from Canvas",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDocument = canvasDocuments.find((doc) => doc._id === selectedDocumentId);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className="gap-2"
      >
        <Download className="w-4 h-4" />
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import from Sanity Canvas</DialogTitle>
            <DialogDescription>
              Select a Canvas document to import into Madison. The content will be converted to Madison format and loaded into the editor.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Document Selection */}
            <div className="space-y-2">
              <Label htmlFor="canvas-doc">Canvas Document</Label>
              <Select
                value={selectedDocumentId}
                onValueChange={setSelectedDocumentId}
                disabled={isLoading || isFetching}
              >
                <SelectTrigger id="canvas-doc">
                  <SelectValue placeholder={isFetching ? "Loading documents..." : "Select a document"} />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-72">
                    {canvasDocuments.length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground text-center">
                        No Canvas documents found
                      </div>
                    ) : (
                      canvasDocuments.map((doc) => (
                        <SelectItem key={doc._id} value={doc._id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {doc.title || doc.name || "Untitled"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {doc._type} • {doc._id.substring(0, 8)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            {/* Selected Document Preview */}
            {selectedDocument && (
              <div className="rounded-lg border border-border bg-card p-3">
                <div className="text-sm font-medium text-foreground mb-1">
                  {selectedDocument.title || selectedDocument.name || "Untitled Document"}
                </div>
                <div className="text-xs text-muted-foreground">
                  Type: {selectedDocument._type}
                </div>
                {selectedDocument.blocks && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {selectedDocument.blocks.length} block{selectedDocument.blocks.length !== 1 ? "s" : ""}
                  </div>
                )}
              </div>
            )}

            {/* Import Status */}
            {importStatus && (
              <div
                className={`rounded-lg border p-3 ${
                  importStatus.success
                    ? "border-green-500 bg-green-50 dark:bg-green-950"
                    : "border-red-500 bg-red-50 dark:bg-red-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  {importStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {importStatus.success
                        ? "Successfully imported from Canvas"
                        : "Import failed"}
                    </div>
                    {importStatus.success && importStatus.title && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Title: {importStatus.title}
                      </div>
                    )}
                    {importStatus.error && (
                      <div className="text-xs text-red-600 mt-1">
                        {importStatus.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setImportStatus(null);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={isLoading || !selectedDocumentId || isFetching}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Import to Madison
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}



