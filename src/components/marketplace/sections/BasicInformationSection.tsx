import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { getPlatform } from "@/config/marketplaceTemplates";

interface BasicInformationSectionProps {
  title: string;
  category: string;
  price: string;
  quantity: string;
  onUpdate: (updates: any) => void;
}

export function BasicInformationSection({ 
  title, 
  category, 
  price, 
  quantity, 
  onUpdate 
}: BasicInformationSectionProps) {
  const [isOpen, setIsOpen] = useState(true);
  const platform = getPlatform('etsy');
  const maxLength = platform?.validation.titleMaxLength || 140;

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
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
              <ChevronDown className={`w-5 h-5 text-charcoal/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Listing Title <span className="text-red-500">*</span>
                </Label>
                <span className="text-xs text-charcoal/60">
                  {title.length}/{maxLength}
                </span>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder="e.g., Noir de Nuit – Luxury Artisan Perfume..."
                maxLength={maxLength}
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={(value) => onUpdate({ category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {platform?.categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price & Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-sm font-medium mb-2 block">
                  Price (USD) <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/60">$</span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={price}
                    onChange={(e) => onUpdate({ price: e.target.value })}
                    placeholder="Leave empty if not applicable"
                    className="pl-7"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quantity" className="text-sm font-medium mb-2 block">
                  Quantity <span className="text-muted-foreground text-xs">(Optional)</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => onUpdate({ quantity: e.target.value })}
                  placeholder="Defaults to 1 if not specified"
                />
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
