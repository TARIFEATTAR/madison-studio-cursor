import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ProductCategory } from "@/hooks/useProducts";

interface ProductFormData {
    category: ProductCategory;
    name: string;
    product_type: string;
    collection: string;
    description: string;
    usp: string;
    tone: string;
    bottle_type: "oil" | "spray" | "auto";
    scent_family: string;
    top_notes: string;
    middle_notes: string;
    base_notes: string;
    scent_profile: string;
    format: string;
    burn_time: string;
    key_ingredients: string;
    benefits: string;
    usage: string;
    formulation_type: string;
}

interface ProductFormFieldsProps {
    formData: ProductFormData;
    onUpdate: (updates: Partial<ProductFormData>) => void;
}

export function ProductFormFields({ formData, onUpdate }: ProductFormFieldsProps) {
    return (
        <div className="space-y-4">
            {/* Category */}
            <div>
                <Label>Category *</Label>
                <Select
                    value={formData.category}
                    onValueChange={(value) => onUpdate({ category: value as ProductCategory })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="personal_fragrance">Personal Fragrance</SelectItem>
                        <SelectItem value="home_fragrance">Home Fragrance</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Name */}
            <div>
                <Label>Product Name *</Label>
                <Input
                    value={formData.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="e.g., Midnight Rose"
                />
            </div>

            {/* Product Type */}
            <div>
                <Label>Product Type</Label>
                <Input
                    value={formData.product_type}
                    onChange={(e) => onUpdate({ product_type: e.target.value })}
                    placeholder="e.g., Eau de Parfum"
                />
            </div>

            {/* Collection */}
            <div>
                <Label>Collection</Label>
                <Input
                    value={formData.collection}
                    onChange={(e) => onUpdate({ collection: e.target.value })}
                    placeholder="e.g., Summer 2024"
                />
            </div>

            {/* Description */}
            <div>
                <Label>Description</Label>
                <Textarea
                    value={formData.description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Product description..."
                    rows={3}
                />
            </div>

            {/* USP */}
            <div>
                <Label>Unique Selling Point</Label>
                <Textarea
                    value={formData.usp}
                    onChange={(e) => onUpdate({ usp: e.target.value })}
                    placeholder="What makes this product special..."
                    rows={2}
                />
            </div>

            {/* Tone */}
            <div>
                <Label>Brand Tone</Label>
                <Input
                    value={formData.tone}
                    onChange={(e) => onUpdate({ tone: e.target.value })}
                    placeholder="e.g., Luxurious, Playful"
                />
            </div>

            {/* Bottle Type */}
            <div>
                <Label>Bottle Type</Label>
                <Select
                    value={formData.bottle_type}
                    onValueChange={(value) => onUpdate({ bottle_type: value as "oil" | "spray" | "auto" })}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="spray">Spray Bottle</SelectItem>
                        <SelectItem value="oil">Oil Roller</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Category-specific fields */}
            {formData.category === "personal_fragrance" && (
                <>
                    <div>
                        <Label>Scent Family</Label>
                        <Input
                            value={formData.scent_family}
                            onChange={(e) => onUpdate({ scent_family: e.target.value })}
                            placeholder="e.g., Floral, Woody"
                        />
                    </div>
                    <div>
                        <Label>Top Notes</Label>
                        <Input
                            value={formData.top_notes}
                            onChange={(e) => onUpdate({ top_notes: e.target.value })}
                            placeholder="e.g., Bergamot, Lemon"
                        />
                    </div>
                    <div>
                        <Label>Middle Notes</Label>
                        <Input
                            value={formData.middle_notes}
                            onChange={(e) => onUpdate({ middle_notes: e.target.value })}
                            placeholder="e.g., Rose, Jasmine"
                        />
                    </div>
                    <div>
                        <Label>Base Notes</Label>
                        <Input
                            value={formData.base_notes}
                            onChange={(e) => onUpdate({ base_notes: e.target.value })}
                            placeholder="e.g., Sandalwood, Vanilla"
                        />
                    </div>
                </>
            )}

            {formData.category === "home_fragrance" && (
                <>
                    <div>
                        <Label>Scent Profile</Label>
                        <Input
                            value={formData.scent_profile}
                            onChange={(e) => onUpdate({ scent_profile: e.target.value })}
                            placeholder="e.g., Fresh, Warm"
                        />
                    </div>
                    <div>
                        <Label>Format</Label>
                        <Input
                            value={formData.format}
                            onChange={(e) => onUpdate({ format: e.target.value })}
                            placeholder="e.g., Candle, Diffuser"
                        />
                    </div>
                    <div>
                        <Label>Burn Time</Label>
                        <Input
                            value={formData.burn_time}
                            onChange={(e) => onUpdate({ burn_time: e.target.value })}
                            placeholder="e.g., 40 hours"
                        />
                    </div>
                </>
            )}
        </div>
    );
}
