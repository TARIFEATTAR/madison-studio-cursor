import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Grid3X3,
  List,
  MoreHorizontal,
  Package,
  Sparkles,
  Archive,
  Trash2,
  Copy,
  Pencil,
  Eye,
  ChevronDown,
  Tag,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  useProducts,
  PRODUCT_STATUS_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  type ProductHub,
  type ProductStatus,
} from "@/hooks/useProducts";

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const option = PRODUCT_STATUS_OPTIONS.find(o => o.value === status);
  if (!option) return null;
  
  return (
    <Badge variant="secondary" className={cn("text-xs", option.color)}>
      {option.label}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductCardProps {
  product: ProductHub;
  viewMode: 'grid' | 'list';
  onView: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

function ProductCard({
  product,
  viewMode,
  onView,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}: ProductCardProps) {
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        <Card className="bg-card border-border hover:border-primary/30 hover:shadow-level-1 transition-all">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              {/* Image */}
              <div className="w-16 h-16 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
                {product.hero_image_url ? (
                  <img
                    src={product.hero_image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium truncate">{product.name}</h3>
                  <ProductStatusBadge status={product.status} />
                </div>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  {product.sku && <span>SKU: {product.sku}</span>}
                  {product.category && (
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {product.category}
                    </span>
                  )}
                  {product.product_type && (
                    <span>{product.product_type}</span>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="text-right">
                {product.price ? (
                  <span className="font-medium">
                    ${product.price.toFixed(2)}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-sm">No price</span>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onView}>
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onEdit}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDuplicate}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDelete} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Grid view
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group"
    >
      <Card 
        className="bg-card border-border hover:border-primary/30 hover:shadow-level-2 transition-all cursor-pointer overflow-hidden"
        onClick={onView}
      >
        {/* Image */}
        <div className="aspect-square bg-muted relative overflow-hidden">
          {product.hero_image_url ? (
            <img
              src={product.hero_image_url}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
          
          {/* Status badge overlay */}
          <div className="absolute top-2 left-2">
            <ProductStatusBadge status={product.status} />
          </div>

          {/* Actions overlay */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="secondary" size="sm" className="h-7 w-7 p-0">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDuplicate(); }}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onArchive(); }}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4">
          <h3 className="font-medium truncate">{product.name}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm text-muted-foreground">
              {product.category || 'Uncategorized'}
            </span>
            {product.price ? (
              <span className="font-medium text-sm">
                ${product.price.toFixed(2)}
              </span>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE PRODUCT MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; category?: string; product_type?: string; short_description?: string }) => void;
  isCreating: boolean;
}

function CreateProductModal({ open, onClose, onCreate, isCreating }: CreateProductModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [description, setDescription] = useState("");

  const productTypes = category ? PRODUCT_TYPES[category] || [] : [];

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate({
      name: name.trim(),
      category: category || undefined,
      product_type: productType || undefined,
      short_description: description.trim() || undefined,
    });
  };

  const handleClose = () => {
    setName("");
    setCategory("");
    setProductType("");
    setDescription("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New Product
          </DialogTitle>
          <DialogDescription>
            Add a new product to your catalog. You can add more details later.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Product Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Vitamin C Brightening Serum"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(val) => { setCategory(val); setProductType(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Product Type */}
          {productTypes.length > 0 && (
            <div className="space-y-2">
              <Label>Product Type</Label>
              <Select value={productType} onValueChange={setProductType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Short Description</Label>
            <Textarea
              id="description"
              placeholder="A brief description of your product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!name.trim() || isCreating}>
            {isCreating ? "Creating..." : "Create Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PRODUCTS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function Products() {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProductStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const {
    products,
    statusCounts,
    categories,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
  } = useProducts({
    searchQuery: searchQuery || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    category: categoryFilter !== 'all' ? categoryFilter : undefined,
  });

  // Filter products client-side for instant feedback
  const filteredProducts = useMemo(() => {
    let result = products;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return result;
  }, [products, searchQuery]);

  const handleCreateProduct = async (data: { name: string; category?: string; product_type?: string; short_description?: string }) => {
    const result = await createProduct.mutateAsync(data);
    setCreateModalOpen(false);
    // Navigate to the new product
    navigate(`/products/${result.id}`);
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirmId) return;
    await deleteProduct.mutateAsync(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-semibold text-foreground">Products</h1>
            <p className="text-muted-foreground mt-1">
              Manage your product catalog
            </p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Status Tabs */}
        <Tabs 
          value={statusFilter} 
          onValueChange={(val) => setStatusFilter(val as ProductStatus | 'all')}
          className="mb-6"
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="gap-2">
              All
              <Badge variant="secondary" className="ml-1">
                {statusCounts.total}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              Active
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700">
                {statusCounts.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="draft" className="gap-2">
              Draft
              <Badge variant="secondary" className="ml-1">
                {statusCounts.draft}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2">
              Archived
              <Badge variant="secondary" className="ml-1">
                {statusCounts.archived}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat || ''}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-9 px-3 rounded-r-none"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-9 px-3 rounded-l-none"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid/List */}
        {isLoading ? (
          <div className={cn(
            "gap-4",
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "flex flex-col"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className={cn(
                  "bg-muted rounded-lg",
                  viewMode === 'grid' ? "aspect-square" : "h-20"
                )} />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all'
                ? "Try adjusting your filters"
                : "Get started by adding your first product"}
            </p>
            {!searchQuery && statusFilter === 'all' && categoryFilter === 'all' && (
              <Button onClick={() => setCreateModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Product
              </Button>
            )}
          </div>
        ) : (
          <div className={cn(
            "gap-4",
            viewMode === 'grid' 
              ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4" 
              : "flex flex-col"
          )}>
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  viewMode={viewMode}
                  onView={() => navigate(`/products/${product.id}`)}
                  onEdit={() => navigate(`/products/${product.id}/edit`)}
                  onDuplicate={() => duplicateProduct.mutate(product.id)}
                  onArchive={() => updateProduct.mutate({ id: product.id, status: 'archived' })}
                  onDelete={() => setDeleteConfirmId(product.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Create Product Modal */}
      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateProduct}
        isCreating={createProduct.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. The product and all its associated data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
