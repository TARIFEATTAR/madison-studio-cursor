import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useProducts, Product } from "@/hooks/useProducts";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useIndustryConfig, isFragranceIndustry } from "@/hooks/useIndustryConfig";

export function ProductsTab() {
  const { toast } = useToast();
  const { products, loading, refetch } = useProducts();
  const { currentOrganizationId } = useOnboarding();
  const { industryConfig } = useIndustryConfig(currentOrganizationId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    product_type: "",
    collection: "",
    scent_family: "",
    top_notes: "",
    middle_notes: "",
    base_notes: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      product_type: "",
      collection: "",
      scent_family: "",
      top_notes: "",
      middle_notes: "",
      base_notes: "",
    });
  };

  const handleAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      product_type: product.product_type || "",
      collection: product.collection || "",
      scent_family: product.scentFamily || "",
      top_notes: product.topNotes || "",
      middle_notes: product.middleNotes || "",
      base_notes: product.baseNotes || "",
    });
    setEditingProduct(product);
  };

  const handleSave = async () => {
    if (!currentOrganizationId || !formData.name.trim()) return;

    try {
      const productData = {
        organization_id: currentOrganizationId,
        name: formData.name.trim(),
        product_type: formData.product_type.trim() || null,
        collection: formData.collection.trim() || null,
        scent_family: isFragranceIndustry(industryConfig?.id) 
          ? (formData.scent_family.trim() || null) 
          : null,
        top_notes: formData.top_notes.trim() || null,
        middle_notes: formData.middle_notes.trim() || null,
        base_notes: formData.base_notes.trim() || null,
      };

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
        
        return product;
      }).filter(p => p.name); // Only include rows with a name

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

  const incompleteCount = isFragranceIndustry(industryConfig?.id)
    ? products.filter(
        (p) => !p.scentFamily || !p.topNotes || !p.middleNotes || !p.baseNotes
      ).length
    : 0;

  const isIncomplete = (product: Product) => {
    if (isFragranceIndustry(industryConfig?.id)) {
      return !product.scentFamily || !product.topNotes || !product.middleNotes || !product.baseNotes;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products Library</CardTitle>
              <CardDescription>
                {products.length} product{products.length === 1 ? "" : "s"}
                {incompleteCount > 0 && (
                  <span className="text-amber-600 ml-2">
                    ({incompleteCount} incomplete)
                  </span>
                )}
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
                  <TableHead>Type</TableHead>
                  <TableHead>Collection</TableHead>
                  {isFragranceIndustry(industryConfig?.id) && (
                    <TableHead>Scent Family</TableHead>
                  )}
                  <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {product.name}
                          {isIncomplete(product) && (
                            <AlertCircle className="w-4 h-4 text-amber-500" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{product.product_type || "-"}</TableCell>
                      <TableCell>{product.collection || "-"}</TableCell>
                      {isFragranceIndustry(industryConfig?.id) && (
                        <TableCell>
                          {product.scentFamily ? (
                            <Badge variant="secondary">{product.scentFamily}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      )}
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
              Fill in the product details. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
                  placeholder="e.g., Perfume Oil, Attar..."
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
                  placeholder="e.g., Cadence"
                />
              </div>
              {isFragranceIndustry(industryConfig?.id) && (
                <div className="space-y-2">
                  <Label htmlFor="scent_family">Scent Family</Label>
                  <Input
                    id="scent_family"
                    value={formData.scent_family}
                    onChange={(e) => setFormData({ ...formData, scent_family: e.target.value })}
                    placeholder="e.g., Warm, Fresh, Woody, Floral"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="top_notes">{industryConfig?.fields[0]?.label || "Field 1"}</Label>
              <Textarea
                id="top_notes"
                value={formData.top_notes}
                onChange={(e) => {
                  const target = e.target;
                  const cursorPosition = target.selectionStart;
                  const value = target.value;
                  setFormData({ ...formData, top_notes: value });
                  requestAnimationFrame(() => {
                    if (target) {
                      target.setSelectionRange(cursorPosition, cursorPosition);
                    }
                  });
                }}
                placeholder={`e.g., ${industryConfig?.fields[0]?.label || "Field 1"}`}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="middle_notes">{industryConfig?.fields[1]?.label || "Field 2"}</Label>
              <Textarea
                id="middle_notes"
                value={formData.middle_notes}
                onChange={(e) => {
                  const target = e.target;
                  const cursorPosition = target.selectionStart;
                  const value = target.value;
                  setFormData({ ...formData, middle_notes: value });
                  requestAnimationFrame(() => {
                    if (target) {
                      target.setSelectionRange(cursorPosition, cursorPosition);
                    }
                  });
                }}
                placeholder={`e.g., ${industryConfig?.fields[1]?.label || "Field 2"}`}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="base_notes">{industryConfig?.fields[2]?.label || "Field 3"}</Label>
              <Textarea
                id="base_notes"
                value={formData.base_notes}
                onChange={(e) => {
                  const target = e.target;
                  const cursorPosition = target.selectionStart;
                  const value = target.value;
                  setFormData({ ...formData, base_notes: value });
                  requestAnimationFrame(() => {
                    if (target) {
                      target.setSelectionRange(cursorPosition, cursorPosition);
                    }
                  });
                }}
                placeholder={`e.g., ${industryConfig?.fields[2]?.label || "Field 3"}`}
                rows={2}
              />
            </div>
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
              {editingProduct ? "Update" : "Add"} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteProductId}
        onOpenChange={(open) => !open && setDeleteProductId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this product from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}