import { EMAIL_TEMPLATES } from "@/utils/emailTemplates";
import { Card } from "@/components/ui/card";
import { Check, FileText, Sparkles, Megaphone, HandHeart, Tag } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const templateIcons: Record<string, React.ReactNode> = {
  newsletter: <FileText className="w-5 h-5" />,
  "product-launch": <Sparkles className="w-5 h-5" />,
  announcement: <Megaphone className="w-5 h-5" />,
  welcome: <HandHeart className="w-5 h-5" />,
  promo: <Tag className="w-5 h-5" />,
};

export function TemplateSelector({ selectedTemplate, onSelect }: TemplateSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">Email Template</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {EMAIL_TEMPLATES.map((template) => {
          const Icon = templateIcons[template.id] || <FileText className="w-5 h-5" />;
          
          return (
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
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 rounded-lg bg-primary/10 text-primary">
                  {Icon}
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="font-semibold text-sm text-foreground">{template.name}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">{template.description}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
