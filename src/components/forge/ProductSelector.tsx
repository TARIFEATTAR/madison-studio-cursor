import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";

export const PRODUCTS = [
  { 
    name: "Aged Mysore Sandalwood", 
    collection: "Purity Collection", 
    scentFamily: "Woody",
    topNotes: "Sandalwood (Santalum Album)",
    middleNotes: "Sandalwood (Santalum Album)",
    baseNotes: "Sandalwood (Santalum Album)"
  },
  { 
    name: "Aseel", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "Fresh and vibrant citrus",
    middleNotes: "A blend of floral and spicy undertones",
    baseNotes: "Rich, woody accords combined with a touch of musk"
  },
  { 
    name: "Attar Al Kaaba", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Oudh, Amber",
    middleNotes: "Rose, Saffron",
    baseNotes: "Musk, Sandalwood"
  },
  { 
    name: "Bahrain Pearl", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "Marine Accord, Citrus",
    middleNotes: "Lily, Freesia",
    baseNotes: "Amber, Musk"
  },
  { 
    name: "Balsam Fir", 
    collection: "Purity Collection", 
    scentFamily: "Woody",
    topNotes: "Balsam Fir Needles",
    middleNotes: "Balsam Fir Resin",
    baseNotes: "Balsam Fir Absolute"
  },
  { 
    name: "Bay Rum", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Bay Leaf, Spices",
    middleNotes: "Rum, Clove",
    baseNotes: "Vanilla, Wood"
  },
  { 
    name: "Bergamot", 
    collection: "Purity Collection", 
    scentFamily: "Fresh",
    topNotes: "Bergamot",
    middleNotes: "Bergamot",
    baseNotes: "Bergamot"
  },
  { 
    name: "Black Agar", 
    collection: "Reserve Collection", 
    scentFamily: "Woody",
    topNotes: "Animalic notes, Leathery",
    middleNotes: "Smoky, Woody",
    baseNotes: "Earthy, Resinous"
  },
  { 
    name: "Black Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Ambrette",
    middleNotes: "Plant Resins",
    baseNotes: "Labdanum"
  },
  { 
    name: "Black Oudh", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "Bergamot, and Lime",
    middleNotes: "Cedarwood, Rose",
    baseNotes: "Oud, Cedar, and Amber"
  },
  { 
    name: "China Rain", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "Nectarine, green notes",
    middleNotes: "White lilies, Chinese roses",
    baseNotes: "Clean musk, sandalwood, moss"
  },
  { 
    name: "Egyptian Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Light Musk",
    middleNotes: "Florals",
    baseNotes: "Musk"
  },
  { 
    name: "Floral Dew", 
    collection: "Cadence Collection", 
    scentFamily: "Fresh",
    topNotes: "White Musk",
    middleNotes: "Light Florals",
    baseNotes: "Ylang Ylang"
  },
  { 
    name: "Frankincense & Myrrh", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "Frankincense",
    middleNotes: "Myrrh, Indian Frankincense",
    baseNotes: "Myrrh Essential Oil"
  },
  { 
    name: "Granada Amber", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Amber",
    middleNotes: "Vanilla, Amber Liquid",
    baseNotes: "Labdanum, Amber"
  },
  { 
    name: "Himalayan Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Florals",
    middleNotes: "Light Florals",
    baseNotes: "Musk"
  },
  { 
    name: "Hojari Frankincense & Yemeni Myrrh", 
    collection: "Reserve Collection", 
    scentFamily: "Woody",
    topNotes: "Citrusy Freshness, Piney",
    middleNotes: "Balsamic, Earthy",
    baseNotes: "Resinous quality"
  },
  { 
    name: "Honey Oudh", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Honey & Bergamot",
    middleNotes: "Agarwood (Oud) & Sumatran Patchouli",
    baseNotes: "Agarwood (Oud), Amber, Leather, Madagascar Vanilla, Labdanum, and Musk"
  },
  { 
    name: "Indonesian Patchouli", 
    collection: "Purity Collection", 
    scentFamily: "Woody",
    topNotes: "Indian Patchouli",
    middleNotes: "Indian Patchouli",
    baseNotes: "Indian Patchouli"
  },
  { 
    name: "Jannatul Firdaus", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "Rose and Lotus",
    middleNotes: "Jasmine, Geranium",
    baseNotes: "Earthy, Woody, and Herbal Notes"
  },
  { 
    name: "Kush", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "Cinnamon, Spices",
    middleNotes: "Incense, Myrrh",
    baseNotes: "Patchouli, Musk Myrrh"
  },
  { 
    name: "Majmua Attar", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  { 
    name: "Musk Tahara", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Floral Musk",
    middleNotes: "Musk, Powdery, Light Florals",
    baseNotes: "Musk"
  },
  { 
    name: "Red Musk", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Nutmeg, Geraniol",
    middleNotes: "Ambrette, Spice",
    baseNotes: "Neem Oil, Myrrh, Patchouli"
  },
  { 
    name: "Royal Green Frankincense", 
    collection: "Sacred Space", 
    scentFamily: "Woody",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  { 
    name: "Royal Tahara", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Light Florals",
    middleNotes: "Powdery Notes",
    baseNotes: "Musk"
  },
  { 
    name: "Sandalwood Rose", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "Rose Otto",
    middleNotes: "Damascus Rose",
    baseNotes: "Sandalwood"
  },
  { 
    name: "Seville", 
    collection: "Cadence Collection", 
    scentFamily: "Woody",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  { 
    name: "Turkish Rose", 
    collection: "Cadence Collection", 
    scentFamily: "Floral",
    topNotes: "Rose Otto",
    middleNotes: "Damascus Rose",
    baseNotes: "Light Woody Notes"
  },
  { 
    name: "Vanilla Sands", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Musk",
    middleNotes: "Vanilla, Caramel",
    baseNotes: "Musk, Woody Notes"
  },
  { 
    name: "White Amber", 
    collection: "Cadence Collection", 
    scentFamily: "Warm",
    topNotes: "Amber",
    middleNotes: "Amber",
    baseNotes: "Amber"
  },
].sort((a, b) => a.name.localeCompare(b.name));

interface ProductSelectorProps {
  value: string;
  onSelect: (product: typeof PRODUCTS[0]) => void;
}

export function ProductSelector({ value, onSelect }: ProductSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredProducts = useMemo(() => {
    if (!searchValue) return PRODUCTS;
    return PRODUCTS.filter(product =>
      product.name.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [searchValue]);

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
              <CommandEmpty>No product found.</CommandEmpty>
              <CommandGroup>
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.name}
                    value={product.name}
                    onSelect={() => {
                      onSelect(product);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    {product.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {product.collection}
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
