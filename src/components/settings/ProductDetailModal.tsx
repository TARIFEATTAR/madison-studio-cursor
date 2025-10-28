import { Product } from "@/hooks/useProducts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductDetailModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailModal({ product, open, onOpenChange }: ProductDetailModalProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{product.name}</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="core" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="core">Core</TabsTrigger>
            <TabsTrigger value="visual">Visual DNA</TabsTrigger>
            <TabsTrigger value="archetypes">Archetypes</TabsTrigger>
            <TabsTrigger value="scent">Scent</TabsTrigger>
            <TabsTrigger value="philosophy">Philosophy</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            {/* Core Info Tab */}
            <TabsContent value="core" className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Product Name</Label>
                  <Input value={product.name} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Handle (URL-friendly)</Label>
                  <Input value={product.handle || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Collection Tier</Label>
                  <Input value={product.collection_tier || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Category</Label>
                  <Input value={product.category} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Product Type</Label>
                  <Input value={product.product_type || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Collection</Label>
                  <Input value={product.collection || "—"} readOnly className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Scent Family (Detailed)</Label>
                  <Input value={product.scent_family_detailed || "—"} readOnly className="mt-1" />
                </div>
              </div>
            </TabsContent>

            {/* Visual DNA Tab */}
            <TabsContent value="visual" className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform Type</Label>
                  <Input value={product.platform_type || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Platform Material</Label>
                  <Input value={product.platform_material || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Visual World</Label>
                  <Input value={product.visual_world || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Visual World Week</Label>
                  <Input value={product.visual_world_week || "—"} readOnly className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Color Palette (Hex Codes)</Label>
                  <Textarea value={product.color_palette_hex_codes || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div>
                  <Label>Lighting Spec</Label>
                  <Input value={product.lighting_spec || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Lighting Direction</Label>
                  <Input value={product.lighting_direction || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Depth of Field</Label>
                  <Input value={product.depth_of_field || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Composition Style</Label>
                  <Input value={product.composition_style || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Aspect Ratio (Primary)</Label>
                  <Input value={product.aspect_ratio_primary || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Shadow Treatment</Label>
                  <Input value={product.shadow_treatment || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Image Type (Primary)</Label>
                  <Input value={product.image_type_primary || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Textile Backdrop</Label>
                  <Input value={product.textile_backdrop || "—"} readOnly className="mt-1" />
                </div>
              </div>
            </TabsContent>

            {/* Archetypes & Context Tab */}
            <TabsContent value="archetypes" className="space-y-4 p-1">
              <div className="space-y-3">
                <Label className="text-base font-semibold">Enabled Archetypes</Label>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <Checkbox checked={product.archetype_hero_enabled || false} disabled />
                    <Label>Hero</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={product.archetype_flatlay_enabled || false} disabled />
                    <Label>Flatlay</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={product.archetype_lived_enabled || false} disabled />
                    <Label>Lived</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={product.archetype_travel_enabled || false} disabled />
                    <Label>Travel</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={product.archetype_environmental_enabled || false} disabled />
                    <Label>Environmental</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={product.archetype_ritual_enabled || false} disabled />
                    <Label>Ritual</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="col-span-2">
                  <Label>Hero Primary Artifacts</Label>
                  <Textarea value={product.hero_primary_artifacts || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div>
                  <Label>Hero Artifact Placement</Label>
                  <Input value={product.hero_artifact_placement || "—"} readOnly className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Flatlay Ingredients</Label>
                  <Textarea value={product.flatlay_ingredients || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Lived Life Context</Label>
                  <Textarea value={product.lived_life_context || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Travel Context</Label>
                  <Textarea value={product.travel_context || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Environmental Location</Label>
                  <Textarea value={product.environmental_location || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div>
                  <Label>Ritual Skin Tone</Label>
                  <Input value={product.ritual_skin_tone || "—"} readOnly className="mt-1" />
                </div>
              </div>
            </TabsContent>

            {/* Scent Profile Tab */}
            <TabsContent value="scent" className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Top Notes</Label>
                  <Textarea value={product.topNotes || "—"} readOnly className="mt-1 h-20" />
                </div>
                <div className="col-span-2">
                  <Label>Middle Notes</Label>
                  <Textarea value={product.middleNotes || "—"} readOnly className="mt-1 h-20" />
                </div>
                <div className="col-span-2">
                  <Label>Base Notes</Label>
                  <Textarea value={product.baseNotes || "—"} readOnly className="mt-1 h-20" />
                </div>
                <div>
                  <Label>Longevity (Hours)</Label>
                  <Input value={product.longevity_hours || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Sillage Description</Label>
                  <Input value={product.sillage_description || "—"} readOnly className="mt-1" />
                </div>
              </div>
            </TabsContent>

            {/* Philosophy & Messaging Tab */}
            <TabsContent value="philosophy" className="space-y-4 p-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Moral Philosophy</Label>
                  <Input value={product.moral_philosophy || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Dip Layer Moral</Label>
                  <Input value={product.dip_layer_moral || "—"} readOnly className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Philosophy Keywords</Label>
                  <Textarea value={product.philosophy_keywords || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Semantic Categories</Label>
                  <Textarea value={product.semantic_categories || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Approved Descriptors</Label>
                  <Textarea value={product.approved_descriptors || "—"} readOnly className="mt-1 h-20" />
                </div>
                <div>
                  <Label>Primary Avatar</Label>
                  <Input value={product.primary_avatar || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Avatar Motivation</Label>
                  <Input value={product.avatar_motivation || "—"} readOnly className="mt-1" />
                </div>
                <div className="col-span-2">
                  <Label>Use Case (Primary)</Label>
                  <Textarea value={product.use_case_primary || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Occasion Tags</Label>
                  <Textarea value={product.occasion_tags || "—"} readOnly className="mt-1 h-16" />
                </div>
                <div className="col-span-2">
                  <Label>Transparency Statement</Label>
                  <Textarea value={product.transparency_statement || "—"} readOnly className="mt-1 h-24" />
                </div>
                <div>
                  <Label>Craftsmanship Term</Label>
                  <Input value={product.craftsmanship_term || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Ingredient Disclosure</Label>
                  <Input value={product.ingredient_disclosure || "—"} readOnly className="mt-1" />
                </div>
              </div>
            </TabsContent>

            {/* AI Instructions Tab */}
            <TabsContent value="ai" className="space-y-4 p-1">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Prompt Template ID</Label>
                  <Input value={product.prompt_template_id || "—"} readOnly className="mt-1" />
                </div>
                <div>
                  <Label>Use Case Templates</Label>
                  <Textarea value={product.use_case_templates || "—"} readOnly className="mt-1 h-32" />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
