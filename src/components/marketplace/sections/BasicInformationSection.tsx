import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BasicInformationSectionProps {
  title: string;
  category: string;
  price: string;
  quantity: string;
  onUpdate: (updates: Partial<{
    title: string;
    category: string;
    price: string;
    quantity: string;
  }>) => void;
}

export function BasicInformationSection({
  title,
  category,
  price,
  quantity,
  onUpdate,
}: BasicInformationSectionProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Basic Information</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Product Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Enter product title"
          />
        </div>
        
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => onUpdate({ category: e.target.value })}
            placeholder="Enter category"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              type="text"
              value={price}
              onChange={(e) => onUpdate({ price: e.target.value })}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity}
              onChange={(e) => onUpdate({ quantity: e.target.value })}
              placeholder="1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
