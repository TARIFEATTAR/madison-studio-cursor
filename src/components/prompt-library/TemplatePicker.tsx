import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "@/hooks/useOnboarding";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles } from "lucide-react";

interface TemplatePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPick: (templateData: any) => void;
}

export const TemplatePicker = ({ open, onOpenChange, onPick }: TemplatePickerProps) => {
  const { currentOrganizationId } = useOnboarding();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['saved-templates', currentOrganizationId],
    queryFn: async () => {
      if (!currentOrganizationId) return [];
      
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .eq('is_template', true)
        .eq('is_archived', false)
        .order('times_used', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!currentOrganizationId && open,
  });

  const handleUseTemplate = (template: any) => {
    const wizardDefaults = template.meta_instructions?.wizard_defaults || {};
    
    const templateData = {
      purpose: wizardDefaults.purpose || '',
      contentType: wizardDefaults.contentType || template.content_type,
      collection: wizardDefaults.collection || template.collection,
      tone: wizardDefaults.tone || '',
      keyElements: wizardDefaults.keyElements || '',
      constraints: wizardDefaults.constraints || '',
      category: wizardDefaults.category || '',
    };

    onPick(templateData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Start from Template
          </DialogTitle>
          <DialogDescription>
            Select a saved template to pre-fill the wizard with proven structures
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : templates && templates.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            <div className="grid gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{template.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {template.content_type}
                        </Badge>
                        {template.collection && (
                          <Badge variant="secondary" className="text-xs">
                            {template.collection}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.prompt_text.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Used {template.times_used || 0} times</span>
                        {template.avg_quality_rating && (
                          <span>★ {template.avg_quality_rating.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      size="sm"
                    >
                      Use This
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No saved templates yet.</p>
            <p className="text-sm mt-2">Create a prompt and mark it as a template to see it here.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
