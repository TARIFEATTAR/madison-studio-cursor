import { Package, Sparkles, ShoppingBag, Users, Camera, Palette, Grid3x3 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BROAD_IMAGE_CATEGORIES } from "@/data/imageCategories";

interface ImageTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ImageTypeSelector({ value, onChange }: ImageTypeSelectorProps) {
  const selectedType = BROAD_IMAGE_CATEGORIES.find(t => t.key === value);
  const Icon = selectedType?.icon || Package;

  return (
    <div>
      <Label className="text-xs text-[#A8A39E] mb-1.5 block">Image Category</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="bg-[#252220] border-[#3D3935] text-[#FFFCF5] h-9 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {BROAD_IMAGE_CATEGORIES.map((type) => {
            const TypeIcon = type.icon;
            return (
              <SelectItem key={type.key} value={type.key}>
                <div className="flex items-center gap-2">
                  <TypeIcon className="h-4 w-4 text-[#A8A39E]" />
                  <span>{type.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
