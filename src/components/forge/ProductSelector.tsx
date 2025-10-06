import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { useProducts, type Product } from "@/hooks/useProducts";

interface ProductSelectorProps {
  value: string;
  onSelect: (product: Product) => void;
}

export function ProductSelector({ value, onSelect }: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { products, loading } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!searchValue) return products;
    return products.filter(product =>
      product.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue, products]);

  return (
    <div className="space-y-2">
      <Label htmlFor="productName">Product Name *</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="productName"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-background/50"
          >
            {value || "Select product..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search products..." 
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading products..." : "No products found. Products can be added through your brand settings."}
              </CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.name}
                    onSelect={() => {
                      onSelect(product);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    {product.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {product.collection || 'No collection'}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
