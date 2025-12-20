import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Save,
  MoreHorizontal,
  Package,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Layers,
  DollarSign,
  Beaker,
  BarChart3,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Archive,
  ExternalLink,
  CheckCircle2,
  Lock,
  ListTodo,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useProduct,
  useProducts,
  PRODUCT_STATUS_OPTIONS,
  DEVELOPMENT_STAGE_OPTIONS,
  PRODUCT_CATEGORIES,
  PRODUCT_TYPES,
  type ProductStatus,
  type DevelopmentStage,
} from "@/hooks/useProducts";
import { FormulationSection } from "@/components/products/FormulationSection";
import { IngredientsSection } from "@/components/products/IngredientsSection";
import { SDSSection } from "@/components/products/SDSSection";
import { PackagingSection } from "@/components/products/PackagingSection";
import { MediaSection } from "@/components/products/MediaSection";
import { useUserRole, type RoleCapabilities } from "@/hooks/useUserRole";
import { RoleBadge, YourSectionsHighlight } from "@/components/role";
import { TaskList } from "@/components/tasks";
import { useOrganization } from "@/hooks/useOrganization";

// ═══════════════════════════════════════════════════════════════════════════════
// PRODUCT INFO TAB
// ═══════════════════════════════════════════════════════════════════════════════

interface ProductInfoTabProps {
  product: any;
  isEditing: boolean;
  onChange: (field: string, value: any) => void;
}

function ProductInfoTab({ product, isEditing, onChange }: ProductInfoTabProps) {
  const productTypes = product.category ? PRODUCT_TYPES[product.category] || [] : [];

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Basic Information</CardTitle>
          <CardDescription>Core product details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Product Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={product.name || ""}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Enter product name"
                />
              ) : (
                <p className="text-foreground">{product.name || "—"}</p>
              )}
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              {isEditing ? (
                <Input
                  id="sku"
                  value={product.sku || ""}
                  onChange={(e) => onChange("sku", e.target.value)}
                  placeholder="e.g., VIT-C-001"
                />
              ) : (
                <p className="text-foreground">{product.sku || "—"}</p>
              )}
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              {isEditing ? (
                <Input
                  id="barcode"
                  value={product.barcode || ""}
                  onChange={(e) => onChange("barcode", e.target.value)}
                  placeholder="UPC or EAN"
                />
              ) : (
                <p className="text-foreground">{product.barcode || "—"}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              {isEditing ? (
                <Select
                  value={product.category || ""}
                  onValueChange={(val) => {
                    onChange("category", val);
                    onChange("product_type", ""); // Reset product type when category changes
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground">{product.category || "—"}</p>
              )}
            </div>

            {/* Product Type */}
            <div className="space-y-2">
              <Label>Product Type</Label>
              {isEditing ? (
                <Select
                  value={product.product_type || ""}
                  onValueChange={(val) => onChange("product_type", val)}
                  disabled={productTypes.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {productTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-foreground">{product.product_type || "—"}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
          <CardDescription>Product descriptions for different uses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tagline */}
          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            {isEditing ? (
              <Input
                id="tagline"
                value={product.tagline || ""}
                onChange={(e) => onChange("tagline", e.target.value)}
                placeholder="A catchy one-liner"
              />
            ) : (
              <p className="text-foreground">{product.tagline || "—"}</p>
            )}
          </div>

          {/* Short Description */}
          <div className="space-y-2">
            <Label htmlFor="short_description">Short Description</Label>
            {isEditing ? (
              <Textarea
                id="short_description"
                value={product.short_description || ""}
                onChange={(e) => onChange("short_description", e.target.value)}
                placeholder="Brief description for listings and previews"
                rows={3}
              />
            ) : (
              <p className="text-foreground whitespace-pre-wrap">
                {product.short_description || "—"}
              </p>
            )}
          </div>

          {/* Long Description */}
          <div className="space-y-2">
            <Label htmlFor="long_description">Full Description</Label>
            {isEditing ? (
              <Textarea
                id="long_description"
                value={product.long_description || ""}
                onChange={(e) => onChange("long_description", e.target.value)}
                placeholder="Detailed product description"
                rows={6}
              />
            ) : (
              <p className="text-foreground whitespace-pre-wrap">
                {product.long_description || "—"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Key Benefits */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Key Benefits</CardTitle>
          <CardDescription>What makes this product special</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Benefits</Label>
            {isEditing ? (
              <Textarea
                value={(product.key_benefits || []).join("\n")}
                onChange={(e) =>
                  onChange(
                    "key_benefits",
                    e.target.value.split("\n").filter((b) => b.trim())
                  )
                }
                placeholder="Enter each benefit on a new line"
                rows={4}
              />
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {(product.key_benefits || []).map((benefit: string, i: number) => (
                  <li key={i} className="text-foreground">
                    {benefit}
                  </li>
                ))}
                {(!product.key_benefits || product.key_benefits.length === 0) && (
                  <p className="text-muted-foreground">No benefits listed</p>
                )}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <Label>Key Differentiators</Label>
            {isEditing ? (
              <Textarea
                value={(product.key_differentiators || []).join("\n")}
                onChange={(e) =>
                  onChange(
                    "key_differentiators",
                    e.target.value.split("\n").filter((d) => d.trim())
                  )
                }
                placeholder="What sets this apart from competitors"
                rows={3}
              />
            ) : (
              <ul className="list-disc list-inside space-y-1">
                {(product.key_differentiators || []).map((diff: string, i: number) => (
                  <li key={i} className="text-foreground">
                    {diff}
                  </li>
                ))}
                {(!product.key_differentiators || product.key_differentiators.length === 0) && (
                  <p className="text-muted-foreground">No differentiators listed</p>
                )}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PLACEHOLDER TABS
// ═══════════════════════════════════════════════════════════════════════════════

function PlaceholderTab({ title, description }: { title: string; description: string }) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="py-12 text-center">
        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// View-only banner for sections user can't edit
function ViewOnlyBanner({ section }: { section: string }) {
  return (
    <div className="mt-4 p-3 bg-muted/50 border border-border rounded-lg flex items-center gap-2 text-sm text-muted-foreground">
      <Lock className="w-4 h-4" />
      <span>
        You have view-only access to {section}. Contact a team admin to request edit access.
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PRODUCT HUB PAGE
// ═══════════════════════════════════════════════════════════════════════════════

// Tab configuration with role mapping
type TabSection = keyof RoleCapabilities["sections"];
interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  section: TabSection;
}

const TAB_CONFIG: TabConfig[] = [
  { id: "info", label: "Info", icon: FileText, section: "info" },
  { id: "tasks", label: "Tasks", icon: ListTodo, section: "info" },
  { id: "media", label: "Media", icon: ImageIcon, section: "media" },
  { id: "variants", label: "Variants", icon: Layers, section: "info" },
  { id: "pricing", label: "Pricing", icon: DollarSign, section: "analytics" },
  { id: "formulation", label: "Formulation", icon: Beaker, section: "formulation" },
  { id: "ingredients", label: "Ingredients", icon: Beaker, section: "ingredients" },
  { id: "sds", label: "SDS", icon: FileText, section: "compliance" },
  { id: "packaging", label: "Packaging", icon: Package, section: "packaging" },
  { id: "content", label: "Content", icon: Sparkles, section: "marketing" },
];

export default function ProductHub() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.pathname.endsWith("/edit");

  const { data: product, isLoading, error } = useProduct(productId || null);
  const { updateProduct, deleteProduct, duplicateProduct } = useProducts();
  const { organizationId } = useOrganization();
  
  // Role-based access
  const { 
    teamRole, 
    capabilities, 
    canView, 
    canEdit, 
    getAccessLevel,
    hasFullAccess 
  } = useUserRole();

  const [isEditing, setIsEditing] = useState(isEditMode);
  const [editedProduct, setEditedProduct] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Filter visible tabs based on role
  const visibleTabs = TAB_CONFIG.filter(tab => canView(tab.section));
  const [activeTab, setActiveTab] = useState(visibleTabs[0]?.id || "info");

  // Initialize edited product when product loads
  useEffect(() => {
    if (product) {
      setEditedProduct({ ...product });
    }
  }, [product]);

  // Track changes
  const handleChange = (field: string, value: any) => {
    setEditedProduct((prev: any) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!editedProduct || !productId) return;

    await updateProduct.mutateAsync({
      id: productId,
      ...editedProduct,
    });

    setHasChanges(false);
    setIsEditing(false);
    navigate(`/products/${productId}`);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditedProduct({ ...product });
    setHasChanges(false);
    setIsEditing(false);
    if (isEditMode) {
      navigate(`/products/${productId}`);
    }
  };

  // Get status badge
  const getStatusBadge = (status: ProductStatus) => {
    const option = PRODUCT_STATUS_OPTIONS.find((o) => o.value === status);
    if (!option) return null;
    return (
      <Badge variant="secondary" className={cn("text-xs", option.color)}>
        {option.label}
      </Badge>
    );
  };

  // Get development stage info
  const getStageInfo = (stage: DevelopmentStage) => {
    return DEVELOPMENT_STAGE_OPTIONS.find((o) => o.value === stage);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <Package className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-medium mb-2">Product not found</h2>
          <p className="text-muted-foreground mb-4">
            This product may have been deleted or you don't have access.
          </p>
          <Button onClick={() => navigate("/products")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const displayProduct = editedProduct || product;
  const stageInfo = getStageInfo(displayProduct.development_stage);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/products")}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Products
              </Button>

              <Separator orientation="vertical" className="h-6" />

              {/* Product Image */}
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {displayProduct.hero_image_url ? (
                  <img
                    src={displayProduct.hero_image_url}
                    alt={displayProduct.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-serif font-semibold">
                    {displayProduct.name}
                  </h1>
                  {getStatusBadge(displayProduct.status)}
                  <RoleBadge size="sm" />
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {displayProduct.sku && <span>SKU: {displayProduct.sku}</span>}
                  {displayProduct.category && (
                    <>
                      <span>•</span>
                      <span>{displayProduct.category}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!hasChanges || updateProduct.isPending}
                  >
                    {updateProduct.isPending ? (
                      "Saving..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => duplicateProduct.mutate(product.id)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          updateProduct.mutate({
                            id: product.id,
                            visibility: product.visibility === "public" ? "private" : "public",
                          })
                        }
                      >
                        {product.visibility === "public" ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Make Private
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Make Public
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() =>
                          updateProduct.mutate({ id: product.id, status: "archived" })
                        }
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={async () => {
                          await deleteProduct.mutateAsync(product.id);
                          navigate("/products");
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Your sections highlight */}
              <div className="mb-4">
                <YourSectionsHighlight />
              </div>
              
              <TabsList className="bg-muted/50 mb-6 flex-wrap h-auto gap-1 p-1">
                {visibleTabs.map((tab) => {
                  const accessLevel = getAccessLevel(tab.section);
                  const isFullAccess = accessLevel === "full";
                  const Icon = tab.icon;
                  
                  return (
                    <Tooltip key={tab.id}>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value={tab.id} 
                          className={cn(
                            "gap-2 relative",
                            isFullAccess && "ring-1 ring-primary/20 bg-primary/5"
                          )}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                          {!isFullAccess && (
                            <Eye className="w-3 h-3 text-muted-foreground ml-1" />
                          )}
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isFullAccess ? (
                          <p>Full access - you can edit this section</p>
                        ) : (
                          <p>View only - you can see but not edit</p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </TabsList>

              {/* Lazy render tabs - only mount content when tab is active */}
              {/* Role-aware: editing only allowed if user has full access */}
              <TabsContent value="info">
                <ProductInfoTab
                  product={displayProduct}
                  isEditing={isEditing && canEdit("info")}
                  onChange={handleChange}
                />
                {!canEdit("info") && isEditing && (
                  <ViewOnlyBanner section="Info" />
                )}
              </TabsContent>

              <TabsContent value="tasks" forceMount>
                {activeTab === "tasks" && organizationId && (
                  <TaskList
                    productId={productId!}
                    organizationId={organizationId}
                  />
                )}
              </TabsContent>

              <TabsContent value="media" forceMount>
                {activeTab === "media" && (
                  <>
                    <MediaSection productId={productId!} />
                    {!canEdit("media") && <ViewOnlyBanner section="Media" />}
                  </>
                )}
              </TabsContent>

              <TabsContent value="variants" forceMount>
                {activeTab === "variants" && (
                  <PlaceholderTab
                    title="Product Variants"
                    description="Coming in Week 7 - Manage sizes, colors, and other variations"
                  />
                )}
              </TabsContent>

              <TabsContent value="pricing" forceMount>
                {activeTab === "pricing" && (
                  <PlaceholderTab
                    title="Pricing & Commerce"
                    description="Coming in Week 8 - Set prices, manage inventory, and sync with platforms"
                  />
                )}
              </TabsContent>

              <TabsContent value="formulation" forceMount>
                {activeTab === "formulation" && (
                  <>
                    <FormulationSection
                      productId={productId!}
                      productCategory={displayProduct.category || displayProduct.product_type}
                      isEditing={isEditing && canEdit("formulation")}
                    />
                    {!canEdit("formulation") && isEditing && (
                      <ViewOnlyBanner section="Formulation" />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="ingredients" forceMount>
                {activeTab === "ingredients" && (
                  <>
                    <IngredientsSection
                      productId={productId!}
                      productName={displayProduct.name}
                      isEditing={isEditing && canEdit("ingredients")}
                    />
                    {!canEdit("ingredients") && isEditing && (
                      <ViewOnlyBanner section="Ingredients" />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="sds" forceMount>
                {activeTab === "sds" && (
                  <>
                    <SDSSection
                      productId={productId!}
                      productName={displayProduct.name}
                      productType={displayProduct.product_type}
                      brandName={displayProduct.brand}
                      sku={displayProduct.sku}
                      isEditing={isEditing && canEdit("compliance")}
                    />
                    {!canEdit("compliance") && isEditing && (
                      <ViewOnlyBanner section="SDS" />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="packaging" forceMount>
                {activeTab === "packaging" && (
                  <>
                    <PackagingSection
                      productId={productId!}
                      productName={displayProduct.name}
                      isEditing={isEditing && canEdit("packaging")}
                    />
                    {!canEdit("packaging") && isEditing && (
                      <ViewOnlyBanner section="Packaging" />
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="content" forceMount>
                {activeTab === "content" && (
                  <PlaceholderTab
                    title="Content Hub"
                    description="Coming in Week 10 - View all content created for this product"
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="w-72 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 space-y-4">
              {/* Status Card */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <Select
                      value={displayProduct.status}
                      onValueChange={(val) => handleChange("status", val)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRODUCT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge(displayProduct.status)
                  )}

                  <Separator />

                  <div>
                    <Label className="text-xs text-muted-foreground">
                      Development Stage
                    </Label>
                    {isEditing ? (
                      <Select
                        value={displayProduct.development_stage}
                        onValueChange={(val) => handleChange("development_stage", val)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {DEVELOPMENT_STAGE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-medium mt-1">
                        {stageInfo?.label || displayProduct.development_stage}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Visibility</Label>
                    <p className="text-sm font-medium capitalize mt-1">
                      {displayProduct.visibility}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span>
                      {new Date(displayProduct.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Updated</span>
                    <span>
                      {new Date(displayProduct.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  {displayProduct.launch_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Launch Date</span>
                      <span>
                        {new Date(displayProduct.launch_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
