import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { IMAGE_PROMPT_TEMPLATES, type ImagePromptType } from "@/config/imagePromptGuidelines";

interface VisualAssetFormProps {
  imageTemplate: ImagePromptType;
  onTemplateChange: (value: ImagePromptType) => void;
}

export function VisualAssetForm({ imageTemplate, onTemplateChange }: VisualAssetFormProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="imageTemplate">Image Template</Label>
      <Select
        value={imageTemplate}
        onValueChange={(value: ImagePromptType) => onTemplateChange(value)}
      >
        <SelectTrigger id="imageTemplate" className="bg-background/50">
          <SelectValue placeholder="Select image template..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="homepage-hero">Homepage Hero (21:9) - Wide banner</SelectItem>
          <SelectItem value="product-page">Product Page (4:5/1:1) - Clean focus</SelectItem>
          <SelectItem value="email-header">Email Header (3:1) - Newsletter</SelectItem>
          <SelectItem value="instagram-stories">Instagram Stories (9:16) - Vertical</SelectItem>
          <SelectItem value="ritual-process">Ritual/Process (4:5/1:1) - Educational</SelectItem>
          <SelectItem value="seasonal-limited">Seasonal/Limited (4:5) - Campaign</SelectItem>
          <SelectItem value="collection-overview">Collection Overview (16:9/4:3)</SelectItem>
          <SelectItem value="social-square">Social Square (1:1) - Instagram</SelectItem>
          <SelectItem value="behind-scenes">Behind Scenes (4:5) - Artisan</SelectItem>
          <SelectItem value="gift-set">Gift Set (4:5) - Holiday</SelectItem>
          <SelectItem value="macro-detail">Macro Detail (1:1/4:5) - Quality</SelectItem>
          <SelectItem value="lifestyle-sanctuary">Lifestyle/Sanctuary (4:5)</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {IMAGE_PROMPT_TEMPLATES[imageTemplate].useCase}
      </p>
    </div>
  );
}