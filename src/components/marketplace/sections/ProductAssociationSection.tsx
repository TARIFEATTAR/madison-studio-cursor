import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";

interface ProductAssociationSectionProps {
  productId: string | null;
  onProductSelect: (productId: string | null) => void;
  onProductDataChange?: (productData: any) => void;
}

export function ProductAssociationSection({ productId, onProductSelect, onProductDataChange }: ProductAssociationSectionProps) {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    loadProducts();
  }, [user]);

  const loadProducts = async () => {
    if (!user) return;

    try {
      const { data: orgMember } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .single();

      if (!orgMember) return;

      const { data, error } = await supabase
        .from("brand_products")
        .select("*")
        .eq("organization_id", orgMember.organization_id)
        .order("name");

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-aged-brass/20">
        <CollapsibleTrigger className="w-full">
          <CardHeader className="cursor-pointer hover:bg-parchment-white/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-aged-brass/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-aged-brass" />
                </div>
                <CardTitle className="text-lg">Product Association</CardTitle>
              </div>
              <ChevronDown className={`w-5 h-5 text-charcoal/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-ink-black mb-2 block">
                  Link to Existing Product (Optional)
                </label>
                <Select 
                  value={productId || undefined} 
                  onValueChange={(value) => {
                    if (value === 'none') {
                      onProductSelect(null);
                      onProductDataChange?.(null);
                    } else {
                      onProductSelect(value);
                      const product = products.find(p => p.id === value);
                      onProductDataChange?.(product);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select product from database..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Create standalone listing)</SelectItem>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {productId && (
                <div className="flex items-center gap-2 text-sm text-charcoal/70 bg-aged-brass/5 p-3 rounded-lg">
                  <Sparkles className="w-4 h-4 text-aged-brass" />
                  <span>Pre-fills title, description, images from database</span>
                </div>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
