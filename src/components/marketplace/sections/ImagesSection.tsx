import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface ImagesSectionProps {
  images: string[];
  onUpdate: (images: string[]) => void;
}

export function ImagesSection({ images, onUpdate }: ImagesSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-aged-brass/20">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-parchment-white/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-aged-brass/10 flex items-center justify-center">
                  <Image className="w-5 h-5 text-aged-brass" />
                </div>
                <CardTitle className="text-lg">Images</CardTitle>
              </div>
              <ChevronDown className={`w-5 h-5 text-charcoal/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="border-2 border-dashed border-aged-brass/30 rounded-lg p-8 text-center">
              <Image className="w-12 h-12 text-charcoal/40 mx-auto mb-3" />
              <p className="text-sm text-charcoal/70">Image upload coming soon...</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
