import { EMAIL_TEMPLATES } from "@/utils/emailTemplates";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Email Template</label>
      <div className="grid grid-cols-2 gap-3">
        {EMAIL_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            onClick={() => onSelect(template.id)}
            className={`p-4 cursor-pointer transition-all hover:shadow-md relative ${
              selectedTemplate === template.id
                ? "border-primary border-2 bg-primary/5"
                : "border-border hover:border-primary/50"
            }`}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" />
              </div>
            )}
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
