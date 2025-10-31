import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { TemplateSelector } from "@/components/email-composer/TemplateSelector";
import { StyleCustomizer } from "@/components/email-composer/StyleCustomizer";
import { ImagePicker } from "@/components/email-composer/ImagePicker";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface EmailDesignSectionProps {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  title: string;
  setTitle: (title: string) => void;
  subtitle: string;
  setSubtitle: (subtitle: string) => void;
  content: string;
  setContent: (content: string) => void;
  headerImage: string;
  setHeaderImage: (image: string) => void;
  brandColor: string;
  setBrandColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
}

export function EmailDesignSection({
  selectedTemplate,
  setSelectedTemplate,
  title,
  setTitle,
  subtitle,
  setSubtitle,
  content,
  setContent,
  headerImage,
  setHeaderImage,
  brandColor,
  setBrandColor,
  secondaryColor,
  setSecondaryColor,
  fontFamily,
  setFontFamily,
  textColor,
  setTextColor,
}: EmailDesignSectionProps) {
  const [templateOpen, setTemplateOpen] = useState(true);

  return (
    <div className="space-y-4">
      <Collapsible open={templateOpen} onOpenChange={setTemplateOpen}>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 hover:opacity-70 transition-opacity">
          <Label className="cursor-pointer">Template</Label>
          <ChevronDown className={`h-4 w-4 transition-transform ${templateOpen ? "rotate-180" : ""}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">
          <TemplateSelector
            selectedTemplate={selectedTemplate}
            onSelect={setSelectedTemplate}
          />
        </CollapsibleContent>
      </Collapsible>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="email-title">Email Title</Label>
        <Input
          id="email-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Main headline in email"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-subtitle">Subtitle</Label>
        <Input
          id="email-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Secondary headline"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email-content">Body Content</Label>
        <Textarea
          id="email-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Main email message"
          rows={6}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Header Image</Label>
        <ImagePicker
          value={headerImage}
          onChange={setHeaderImage}
        />
      </div>

      <Separator />

      <div className="space-y-2">
        <Label>Style Customization</Label>
        <StyleCustomizer
          brandColor={brandColor}
          secondaryColor={secondaryColor}
          fontFamily={fontFamily}
          textColor={textColor}
          onBrandColorChange={setBrandColor}
          onSecondaryColorChange={setSecondaryColor}
          onFontChange={setFontFamily}
          onTextColorChange={setTextColor}
        />
      </div>
    </div>
  );
}
