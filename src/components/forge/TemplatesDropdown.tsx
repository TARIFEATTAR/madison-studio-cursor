import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, ChevronDown } from 'lucide-react';
import { formatPromptName } from '@/lib/promptNaming';

interface Template {
  id: string;
  title: string;
  content_type: string;
  collection: string;
  times_used: number;
  prompt_text: string;
  deliverable_format?: string;
  product_id?: string;
  audience?: string;
  goal?: string;
  style_overlay?: string;
  custom_instructions?: string;
}

interface TemplatesDropdownProps {
  organizationId: string;
  onSelect: (template: Template) => void;
}

export function TemplatesDropdown({ 
  organizationId, 
  onSelect 
}: TemplatesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates', organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('organization_id', organizationId)
        .eq('is_template', true)
        .order('times_used', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Template[];
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const handleSelect = (template: Template) => {
    onSelect(template);
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          Load Template
          {templates && templates.length > 0 && (
            <Badge variant="secondary" className="ml-1">
              {templates.length}
            </Badge>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[350px] max-w-[calc(100vw-2rem)] bg-background z-50">
        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Loading templates...
          </div>
        )}

        {!isLoading && (!templates || templates.length === 0) && (
          <div className="p-4 text-center">
            <FileText className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No templates yet
            </p>
          </div>
        )}

        {!isLoading && templates && templates.length > 0 && (
          <>
            <DropdownMenuLabel>Your Templates</DropdownMenuLabel>
            {templates.map((template) => (
              <DropdownMenuItem
                key={template.id}
                onClick={() => handleSelect(template)}
                className="flex flex-col items-start gap-1 p-3 cursor-pointer"
              >
                <span className="font-medium">
                  {formatPromptName(template.title, null, 40)}
                </span>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span>{template.content_type}</span>
                  {template.times_used > 0 && (
                    <>
                      <span>•</span>
                      <span>Used {template.times_used}×</span>
                    </>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
