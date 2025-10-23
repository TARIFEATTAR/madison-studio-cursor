import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, ChevronDown, Sparkles } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { getPlatform } from "@/config/marketplaceTemplates";
import { RepurposeBlogDialog } from "./RepurposeBlogDialog";

interface DescriptionSectionProps {
  description: string;
  onUpdate: (description: string) => void;
  formData?: any;
  onUpdateAll?: (updates: any) => void;
}

export function DescriptionSection({ description, onUpdate, formData, onUpdateAll }: DescriptionSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const platform = getPlatform('etsy');
  const maxLength = platform?.validation.descriptionMaxLength || 5000;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-aged-brass/20">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-parchment-white/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-aged-brass/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-aged-brass" />
                </div>
                <CardTitle className="text-lg">Description</CardTitle>
              </div>
              <ChevronDown className={`w-5 h-5 text-charcoal/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Product Description <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-charcoal/60">
                  {description.length} / {maxLength}
                </span>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => onUpdate(e.target.value)}
                placeholder="Describe your product in detail..."
                className="min-h-[200px] resize-y"
                maxLength={maxLength}
              />
              <p className="text-xs text-charcoal/60 mt-1">
                Tell the story behind your product. Max {maxLength.toLocaleString()} characters.
              </p>
            </div>

            {/* Helper Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className="text-aged-brass border-aged-brass/30 hover:bg-aged-brass/10"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ask Madison to Generate
              </Button>
              <RepurposeBlogDialog
                onRepurpose={(title, desc, tags) => {
                  onUpdate(desc);
                  if (onUpdateAll) {
                    onUpdateAll({
                      title: formData?.title || title,
                      description: desc,
                      tags: [...(formData?.tags || []), ...tags]
                    });
                  }
                }}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
