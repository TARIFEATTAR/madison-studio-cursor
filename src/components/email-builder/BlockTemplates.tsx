import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmailBlock } from "@/types/emailBlocks";
import { Heading, Image, Type, MousePointer } from "lucide-react";

interface BlockTemplatesProps {
  onSelectTemplate: (blocks: EmailBlock[]) => void;
}

const templates: Array<{ 
  name: string; 
  description: string; 
  icon: typeof Heading;
  blocks: any[];
}> = [
  {
    name: "Hero Section",
    description: "Large headline with image and CTA",
    icon: Heading,
    blocks: [
      { type: 'headline', text: 'Your Bold Headline Here', size: 'large', alignment: 'center' } as const,
      { type: 'spacer', height: 20 } as const,
      { type: 'image', url: '', alt: 'Hero image', alignment: 'center' } as const,
      { type: 'spacer', height: 20 } as const,
      { type: 'text', content: 'Compelling description that explains your offer.', alignment: 'center' } as const,
      { type: 'spacer', height: 20 } as const,
      { type: 'button', text: 'Shop Now', url: '', style: 'rounded', alignment: 'center' } as const,
    ],
  },
  {
    name: "Product Showcase",
    description: "Image with description and button",
    icon: Image,
    blocks: [
      { type: 'image', url: '', alt: 'Product image', alignment: 'center' } as const,
      { type: 'spacer', height: 16 } as const,
      { type: 'headline', text: 'Product Name', size: 'medium', alignment: 'left' } as const,
      { type: 'text', content: 'Product description goes here. Highlight key features and benefits.', alignment: 'left' } as const,
      { type: 'spacer', height: 12 } as const,
      { type: 'button', text: 'Learn More', url: '', style: 'square', alignment: 'left' } as const,
    ],
  },
  {
    name: "Text Block",
    description: "Headline with body text",
    icon: Type,
    blocks: [
      { type: 'headline', text: 'Section Title', size: 'medium', alignment: 'left' } as const,
      { type: 'spacer', height: 12 } as const,
      { type: 'text', content: 'Your main content goes here. Keep it concise and engaging.', alignment: 'left' } as const,
      { type: 'spacer', height: 16 } as const,
    ],
  },
  {
    name: "Call to Action",
    description: "Centered CTA with description",
    icon: MousePointer,
    blocks: [
      { type: 'headline', text: 'Ready to Get Started?', size: 'medium', alignment: 'center' } as const,
      { type: 'spacer', height: 12 } as const,
      { type: 'text', content: 'Join thousands of satisfied customers today.', alignment: 'center' } as const,
      { type: 'spacer', height: 20 } as const,
      { type: 'button', text: 'Get Started', url: '', style: 'pill', alignment: 'center', fullWidth: false } as const,
    ],
  },
];

export function BlockTemplates({ onSelectTemplate }: BlockTemplatesProps) {
  const handleSelectTemplate = (templateBlocks: any[]) => {
    const blocksWithIds: EmailBlock[] = templateBlocks.map((block) => ({
      ...block,
      id: crypto.randomUUID(),
    } as EmailBlock));
    onSelectTemplate(blocksWithIds);
  };

  return (
    <ScrollArea className="h-[calc(100vh-200px)] md:h-[500px]">
      <div className="space-y-3 p-4">
        <p className="text-sm text-muted-foreground mb-4">
          Quick-start templates for common email sections
        </p>
        {templates.map((template) => (
          <Card
            key={template.name}
            className="p-4 cursor-pointer hover:bg-accent transition-colors"
            onClick={() => handleSelectTemplate(template.blocks)}
          >
            <div className="flex items-start gap-3">
              <template.icon className="w-5 h-5 text-primary mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{template.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {template.blocks.length} blocks
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
