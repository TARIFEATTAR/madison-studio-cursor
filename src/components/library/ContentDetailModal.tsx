import { useState } from "react";
import { Edit2, Send, Copy, Check, FileDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { getContentSubtypeLabel } from "@/utils/contentSubtypeLabels";
import { exportAsPDF, exportAsDocx, exportAsText } from "@/utils/exportHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ContentCategory = "prompt" | "output" | "master" | "derivative";

interface ContentDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: any;
  category: ContentCategory;
  onUpdate?: () => void;
  onRepurpose?: (contentId: string) => void;
}

export function ContentDetailModal({
  open,
  onOpenChange,
  content,
  category,
  onUpdate,
  onRepurpose,
}: ContentDetailModalProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const getContentText = () => {
    if (category === "prompt") return content.prompt_text;
    if (category === "output") return content.generated_content;
    if (category === "master") return content.full_content;
    if (category === "derivative") return content.generated_content;
    return "";
  };

  const handleEdit = () => {
    setEditedContent(getContentText());
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const table =
        category === "prompt"
          ? "prompts"
          : category === "output"
          ? "outputs"
          : category === "derivative"
          ? "derivative_assets"
          : "master_content";
      
      const field =
        category === "prompt"
          ? "prompt_text"
          : category === "master"
          ? "full_content"
          : "generated_content";

      const { error } = await supabase
        .from(table)
        .update({ [field]: editedContent })
        .eq("id", content.id);

      if (error) throw error;

      toast({
        title: "Content updated",
        description: "Your changes have been saved successfully.",
      });
      
      setIsEditing(false);
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: "Error updating content",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getContentText());
    setIsCopied(true);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = async (format: 'pdf' | 'docx' | 'txt') => {
    setIsExporting(true);
    try {
      const metadata = {
        title: content.title || 'Untitled',
        contentType: subtypeLabel || contentType || category,
        collection: content.collection,
        dipWeek: content.dip_week,
        createdAt: content.created_at,
        wordCount: content.word_count,
      };

      const contentText = getContentText();

      if (format === 'pdf') {
        exportAsPDF(contentText, metadata);
      } else if (format === 'docx') {
        await exportAsDocx(contentText, metadata);
      } else {
        exportAsText(contentText, metadata);
      }

      toast({
        title: "Export successful",
        description: `Content exported as ${format.toUpperCase()}`,
      });
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const contentType = content.content_type || content.asset_type;
  const subtypeLabel = contentType ? getContentSubtypeLabel(contentType) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-serif mb-3">
                {content.title || "Content Details"}
              </DialogTitle>
              
              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                {contentType && (
                  <Badge variant="outline" className="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600">
                    {subtypeLabel || contentType}
                  </Badge>
                )}
                <Badge variant="outline" className="bg-muted/60 text-muted-foreground border-border/40 text-xs capitalize">
                  {category}
                </Badge>
                {content.collection && (
                  <Badge variant="secondary">
                    {content.collection}
                  </Badge>
                )}
                {content.dip_week && (
                  <Badge variant="secondary">
                    Week {content.dip_week}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          {/* Content Display/Edit */}
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[400px] font-mono text-sm"
                placeholder="Edit your content..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSave} size="sm">
                  Save Changes
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-muted/30 rounded-lg p-6 border border-border/40">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                {getContentText()}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          {!isEditing && (
            <div className="flex items-center gap-2 pt-4 border-t border-border/40">
              <Button onClick={handleEdit} variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button onClick={handleCopy} variant="outline" size="sm">
                {isCopied ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {isCopied ? "Copied!" : "Copy"}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" disabled={isExporting}>
                    <FileDown className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-40">
                  <DropdownMenuItem onClick={() => handleExport('pdf')}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('docx')}>
                    Export as DOCX
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('txt')}>
                    Export as TXT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {(category === "master" || category === "output") && onRepurpose && (
                <Button
                  onClick={() => {
                    onRepurpose(content.id);
                    onOpenChange(false);
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Multiply
                </Button>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-border/40 text-xs text-muted-foreground space-y-1">
            <p>Created: {new Date(content.created_at).toLocaleDateString()}</p>
            {content.updated_at && (
              <p>Updated: {new Date(content.updated_at).toLocaleDateString()}</p>
            )}
            {category === "output" && content.prompts && (
              <p>From prompt: {content.prompts.title}</p>
            )}
            {category === "derivative" && content.master_content && (
              <p>From master: {content.master_content.title}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
