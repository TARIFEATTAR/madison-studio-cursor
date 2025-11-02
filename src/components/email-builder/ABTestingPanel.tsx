import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Split, Copy, Plus } from "lucide-react";
import { EmailBlock } from "@/types/emailBlocks";
import { toast } from "sonner";

interface ABTestingPanelProps {
  blocks: EmailBlock[];
  onCreateVariant: (variantBlocks: EmailBlock[]) => void;
}

export function ABTestingPanel({ blocks, onCreateVariant }: ABTestingPanelProps) {
  const [variants, setVariants] = useState<Array<{ name: string; blocks: EmailBlock[] }>>([
    { name: "Original", blocks }
  ]);
  const [activeVariant, setActiveVariant] = useState(0);

  const handleCreateVariant = () => {
    const variantName = `Variant ${variants.length}`;
    const variantBlocks = blocks.map(block => ({
      ...block,
      id: `${block.id}-variant-${variants.length}`,
    }));

    setVariants([...variants, { name: variantName, blocks: variantBlocks }]);
    onCreateVariant(variantBlocks);
    toast.success(`${variantName} created`);
  };

  const handleDuplicateVariant = (index: number) => {
    const variant = variants[index];
    const newVariantName = `${variant.name} Copy`;
    const newBlocks = variant.blocks.map(block => ({
      ...block,
      id: `${block.id}-copy-${Date.now()}`,
    }));

    setVariants([...variants, { name: newVariantName, blocks: newBlocks }]);
    toast.success("Variant duplicated");
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Split className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">A/B Testing</h3>
          <Badge variant="outline">{variants.length} variant{variants.length > 1 ? 's' : ''}</Badge>
        </div>
        <Button
          size="sm"
          onClick={handleCreateVariant}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          New Variant
        </Button>
      </div>

      <Tabs value={activeVariant.toString()} onValueChange={(value) => setActiveVariant(parseInt(value))}>
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${variants.length}, 1fr)` }}>
          {variants.map((variant, index) => (
            <TabsTrigger key={index} value={index.toString()}>
              {variant.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {variants.map((variant, index) => (
          <TabsContent key={index} value={index.toString()} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1">
                <Label>Variant Name</Label>
                <Input
                  value={variant.name}
                  onChange={(e) => {
                    const newVariants = [...variants];
                    newVariants[index].name = e.target.value;
                    setVariants(newVariants);
                  }}
                  placeholder="Enter variant name"
                />
              </div>
              {index > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicateVariant(index)}
                  className="ml-4 gap-2"
                >
                  <Copy className="w-4 h-4" />
                  Duplicate
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label>Content Blocks</Label>
              <div className="p-3 bg-muted/50 rounded border border-border">
                <p className="text-sm text-muted-foreground">
                  {variant.blocks.length} block{variant.blocks.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                💡 <strong>Pro Tip:</strong> Test different headlines, CTAs, or image placements across variants to optimize performance.
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}
