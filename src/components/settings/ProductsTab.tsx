import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, AlertCircle, Upload } from "lucide-react";
import { useProducts, Product, ProductCategory } from "@/hooks/useProducts";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CATEGORY_LABELS: Record<ProductCategory, string> = {
  personal_fragrance: "Personal Fragrance",
  home_fragrance: "Home Fragrance",
  skincare: "Skincare / Beauty"
};

export function ProductsTab() {
  const { toast } = useToast();
  const { products, loading, refetch } = useProducts();
  const { currentOrganizationId } = useOnboarding();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Form state - category-aware
  const [formData, setFormData] = useState({
    category: "personal_fragrance" as ProductCategory,
    name: "",
    product_type: "",
    collection: "",
    // Universal
    usp: "",
    tone: "",
    // Personal Fragrance
    scent_family: "",
    top_notes: "",
    middle_notes: "",
    base_notes: "",
    // Home Fragrance
    scent_profile: "",
    format: "",
    burn_time: "",
    // Skincare
    key_ingredients: "",
    benefits: "",
    usage: "",
    formulation_type: "",
  });

  const resetForm = () => {
    setFormData({
      category: "personal_fragrance",
      name: "",
      product_type: "",
      collection: "",
      usp: "",
      tone: "",
      scent_family: "",
      top_notes: "",
      middle_notes: "",
      base_notes: "",
      scent_profile: "",
      format: "",
      burn_time: "",
      key_ingredients: "",
      benefits: "",
      usage: "",
      formulation_type: "",
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      category: product.category,
      name: product.name,
      product_type: product.product_type || "",
      collection: product.collection || "",
      usp: product.usp || "",
      tone: product.tone || "",
      scent_family: product.scentFamily || "",
      top_notes: product.topNotes || "",
      middle_notes: product.middleNotes || "",
      base_notes: product.baseNotes || "",
      scent_profile: product.scentProfile || "",
      format: product.format || "",
      burn_time: product.burnTime || "",
      key_ingredients: product.keyIngredients || "",
      benefits: product.benefits || "",
      usage: product.usage || "",
      formulation_type: product.formulationType || "",
    });
    setEditingProduct(product);
  };

  const handleSave = async () => {
    if (!currentOrganizationId || !formData.name.trim()) return;

    try {
      const productData: any = {
        organization_id: currentOrganizationId,
        category: formData.category,
        name: formData.name.trim(),
        product_type: formData.product_type.trim() || null,
        collection: formData.collection.trim() || null,
        usp: formData.usp.trim() || null,
        tone: formData.tone.trim() || null,
      };

      // Add category-specific fields
      if (formData.category === 'personal_fragrance') {
        productData.scent_family = formData.scent_family.trim() || null;
        productData.top_notes = formData.top_notes.trim() || null;
        productData.middle_notes = formData.middle_notes.trim() || null;
        productData.base_notes = formData.base_notes.trim() || null;
      } else if (formData.category === 'home_fragrance') {
        productData.scent_profile = formData.scent_profile.trim() || null;
        productData.format = formData.format.trim() || null;
        productData.burn_time = formData.burn_time.trim() || null;
      } else if (formData.category === 'skincare') {
        productData.key_ingredients = formData.key_ingredients.trim() || null;
        productData.benefits = formData.benefits.trim() || null;
        productData.usage = formData.usage.trim() || null;
        productData.formulation_type = formData.formulation_type.trim() || null;
      }

      if (editingProduct) {
        const { error } = await supabase
          .from("brand_products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (error) throw error;

        toast({
          title: "Product updated",
          description: `"${formData.name}" has been updated.`,
        });
      } else {
        const { error } = await supabase
          .from("brand_products")
          .insert(productData);

        if (error) throw error;

        toast({
          title: "Product added",
          description: `"${formData.name}" has been added to your products.`,
        });
      }

      setShowAddDialog(false);
      setEditingProduct(null);
      resetForm();
      refetch();
    } catch (error) {
      console.error("Error saving product:", error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;

    try {
      const { error } = await supabase
        .from("brand_products")
        .delete()
        .eq("id", deleteProductId);

      if (error) throw error;

      toast({
        title: "Product deleted",
        description: "The product has been removed.",
      });

      setDeleteProductId(null);
      refetch();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentOrganizationId) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim());
      
      const products = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const product: any = { organization_id: currentOrganizationId };
        
        headers.forEach((header, index) => {
          if (header !== 'organization_id' && values[index]) {
            product[header] = values[index] || null;
          }
        });
        
        // Auto-detect category if not provided
        if (!product.category) {
          if (product.top_notes || product.middle_notes || product.base_notes) {
            product.category = 'personal_fragrance';
          } else if (product.format || product.burn_time) {
            product.category = 'home_fragrance';
          } else if (product.key_ingredients || product.benefits) {
            product.category = 'skincare';
          } else {
            product.category = 'personal_fragrance';
          }
        }
        
        return product;
      }).filter(p => p.name);

      if (products.length === 0) {
        toast({
          title: "No products found",
          description: "The CSV file appears to be empty or invalid.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('brand_products')
        .insert(products);

      if (error) throw error;

      toast({
        title: "Products imported",
        description: `Successfully imported ${products.length} product${products.length === 1 ? '' : 's'}.`,
      });

      refetch();
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: "Import failed",
        description: "Failed to import products. Please check your CSV format.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (p.collection?.toLowerCase() || "").includes(searchFilter.toLowerCase()) ||
    (p.product_type?.toLowerCase() || "").includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products Library</CardTitle>
              <CardDescription>
                {products.length} product{products.length === 1 ? "" : "s"} across all categories
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="hidden"
              />
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline"
                disabled={isImporting}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {isImporting ? "Importing..." : "Import CSV"}
              </Button>
              <Button onClick={handleAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search products..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
          />

          {loading ? (
            <p className="text-muted-foreground">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-muted-foreground italic">
              {searchFilter ? "No products match your search." : "No products yet. Add your first product above."}
            </p>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Collection</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {CATEGORY_LABELS[product.category]}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.product_type || "-"}</TableCell>
                      <TableCell>{product.collection || "-"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteProductId(product.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={showAddDialog || !!editingProduct} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingProduct(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>
              Fill in the product details. Category determines which fields are shown.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Category Selector */}
            <div className="space-y-2">
              <Label htmlFor="category">Product Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ProductCategory) => 
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal_fragrance">Personal Fragrance (Perfumes, Attars, Oils)</SelectItem>
                  <SelectItem value="home_fragrance">Home Fragrance (Candles, Diffusers, Sprays)</SelectItem>
                  <SelectItem value="skincare">Skincare / Beauty (Serums, Creams, Balms)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Universal Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Honey Oudh"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="product_type">Product Type</Label>
                <Input
                  id="product_type"
                  value={formData.product_type}
                  onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
                  placeholder={
                    formData.category === 'personal_fragrance' ? 'e.g., Attar, EDP' :
                    formData.category === 'home_fragrance' ? 'e.g., Candle, Diffuser' :
                    'e.g., Serum, Balm'
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="collection">Collection</Label>
                <Input
                  id="collection"
                  value={formData.collection}
                  onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  placeholder="e.g., Humanities"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="usp">USP (Unique Selling Point)</Label>
                <Input
                  id="usp"
                  value={formData.usp}
                  onChange={(e) => setFormData({ ...formData, usp: e.target.value })}
                  placeholder="What makes this product special?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tone">Brand Tone</Label>
              <Input
                id="tone"
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                placeholder="e.g., Elegant, Playful, Luxurious"
              />
            </div>

            {/* Personal Fragrance Fields */}
            {formData.category === 'personal_fragrance' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="scent_family">Scent Family</Label>
                  <Input
                    id="scent_family"
                    value={formData.scent_family}
                    onChange={(e) => setFormData({ ...formData, scent_family: e.target.value })}
                    placeholder="e.g., Warm, Fresh, Woody, Floral"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="top_notes">Top Notes</Label>
                  <Textarea
                    id="top_notes"
                    value={formData.top_notes}
                    onChange={(e) => setFormData({ ...formData, top_notes: e.target.value })}
                    placeholder="First impression notes"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="middle_notes">Middle Notes (Heart)</Label>
                  <Textarea
                    id="middle_notes"
                    value={formData.middle_notes}
                    onChange={(e) => setFormData({ ...formData, middle_notes: e.target.value })}
                    placeholder="Heart of the scent"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="base_notes">Base Notes</Label>
                  <Textarea
                    id="base_notes"
                    value={formData.base_notes}
                    onChange={(e) => setFormData({ ...formData, base_notes: e.target.value })}
                    placeholder="Lasting foundation"
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Home Fragrance Fields */}
            {formData.category === 'home_fragrance' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="scent_profile">Scent Profile</Label>
                  <Textarea
                    id="scent_profile"
                    value={formData.scent_profile}
                    onChange={(e) => setFormData({ ...formData, scent_profile: e.target.value })}
                    placeholder="Overall scent description (avoid top/middle/base for home fragrance)"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="format">Format</Label>
                    <Input
                      id="format"
                      value={formData.format}
                      onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                      placeholder="e.g., Candle, Reed Diffuser, Room Spray"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="burn_time">Burn Time / Duration</Label>
                    <Input
                      id="burn_time"
                      value={formData.burn_time}
                      onChange={(e) => setFormData({ ...formData, burn_time: e.target.value })}
                      placeholder="e.g., 40 hours, 3 months"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Skincare Fields */}
            {formData.category === 'skincare' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="key_ingredients">Key Ingredients</Label>
                  <Textarea
                    id="key_ingredients"
                    value={formData.key_ingredients}
                    onChange={(e) => setFormData({ ...formData, key_ingredients: e.target.value })}
                    placeholder="Main active ingredients"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="benefits">Benefits</Label>
                  <Textarea
                    id="benefits"
                    value={formData.benefits}
                    onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                    placeholder="e.g., Hydration, Anti-aging, Repair"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="usage">Usage Instructions</Label>
                    <Input
                      id="usage"
                      value={formData.usage}
                      onChange={(e) => setFormData({ ...formData, usage: e.target.value })}
                      placeholder="e.g., Daily use, Overnight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="formulation_type">Formulation Type</Label>
                    <Input
                      id="formulation_type"
                      value={formData.formulation_type}
                      onChange={(e) => setFormData({ ...formData, formulation_type: e.target.value })}
                      placeholder="e.g., Oil, Serum, Cream"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingProduct(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!formData.name.trim()}>
              {editingProduct ? "Save Changes" : "Add Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this product from your library. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
