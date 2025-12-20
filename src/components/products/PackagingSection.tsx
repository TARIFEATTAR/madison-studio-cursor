import { useState, useEffect } from "react";
import {
  Package,
  Box,
  Tag,
  Barcode,
  Download,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Recycle,
  Leaf,
  Info,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useProductPackaging,
  generateBarcode,
  CONTAINER_TYPES,
  CONTAINER_MATERIALS,
  CLOSURE_TYPES,
  LABEL_TYPES,
  RECYCLING_CODES,
  type ProductPackaging,
  type BarcodeType,
} from "@/hooks/useSDSPackaging";
import { useOrganizationId } from "@/contexts/OrganizationContext";

interface PackagingSectionProps {
  productId: string;
  productName?: string;
  isEditing?: boolean;
}

export function PackagingSection({
  productId,
  productName = "Product",
  isEditing = false,
}: PackagingSectionProps) {
  const { packaging, isLoading, savePackaging } = useProductPackaging(productId);
  const { organizationId } = useOrganizationId();

  // Form state
  const [formData, setFormData] = useState<Partial<ProductPackaging>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Barcode state
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [barcodeCode, setBarcodeCode] = useState("");
  const [barcodeType, setBarcodeType] = useState<BarcodeType>("ean-13");
  const [barcodePreview, setBarcodePreview] = useState<string | null>(null);
  const [isGeneratingBarcode, setIsGeneratingBarcode] = useState(false);

  // Initialize form when packaging loads
  useEffect(() => {
    if (packaging) {
      setFormData(packaging);
    }
  }, [packaging]);

  const handleChange = (field: keyof ProductPackaging, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    savePackaging.mutate(formData);
    setHasChanges(false);
  };

  const handleGenerateBarcode = async () => {
    if (!barcodeCode) return;

    setIsGeneratingBarcode(true);
    try {
      const result = await generateBarcode({
        code: barcodeCode,
        type: barcodeType,
        product_id: productId,
        organization_id: organizationId || undefined,
        save_to_dam: true,
      });

      if (result.success) {
        setBarcodePreview(result.svg_base64);
      }
    } catch (error) {
      console.error("Barcode generation error:", error);
    } finally {
      setIsGeneratingBarcode(false);
    }
  };

  const handleDownloadBarcode = () => {
    if (!barcodePreview) return;

    const a = document.createElement("a");
    a.href = barcodePreview;
    a.download = `barcode_${barcodeType}_${barcodeCode}.svg`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse h-48 bg-muted rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Save Button */}
      {isEditing && hasChanges && (
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2">
          <Button onClick={handleSave} disabled={savePackaging.isPending}>
            <Save className="w-4 h-4 mr-2" />
            Save Packaging Details
          </Button>
        </div>
      )}

      {/* Container Section */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-primary" />
            Primary Container
          </CardTitle>
          <CardDescription>
            Main packaging that holds the product
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Container Type */}
            <div>
              <Label>Container Type</Label>
              <Select
                value={formData.container_type || ""}
                onValueChange={(val) => handleChange("container_type", val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CONTAINER_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Container Material */}
            <div>
              <Label>Material</Label>
              <Select
                value={formData.container_material || ""}
                onValueChange={(val) => handleChange("container_material", val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {CONTAINER_MATERIALS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Container Color */}
            <div>
              <Label>Color</Label>
              <Input
                value={formData.container_color || ""}
                onChange={(e) => handleChange("container_color", e.target.value)}
                placeholder="e.g., Clear, Amber, Matte Black"
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Container Capacity */}
            <div>
              <Label>Capacity</Label>
              <Input
                value={formData.container_capacity || ""}
                onChange={(e) => handleChange("container_capacity", e.target.value)}
                placeholder="e.g., 30ml, 1 fl oz"
                disabled={!isEditing}
                className="mt-1"
              />
            </div>

            {/* Closure Type */}
            <div>
              <Label>Closure Type</Label>
              <Select
                value={formData.closure_type || ""}
                onValueChange={(val) => handleChange("closure_type", val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select closure" />
                </SelectTrigger>
                <SelectContent>
                  {CLOSURE_TYPES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Closure Material */}
            <div>
              <Label>Closure Material</Label>
              <Input
                value={formData.closure_material || ""}
                onChange={(e) => handleChange("closure_material", e.target.value)}
                placeholder="e.g., Aluminum, PP"
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Packaging */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Box className="w-5 h-5 text-primary" />
            Secondary Packaging
          </CardTitle>
          <CardDescription>
            Outer box or carton packaging
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Box Required */}
            <div className="flex items-center gap-3">
              <Checkbox
                id="box_required"
                checked={formData.box_required || false}
                onCheckedChange={(checked) => handleChange("box_required", !!checked)}
                disabled={!isEditing}
              />
              <Label htmlFor="box_required">Product ships in outer box</Label>
            </div>

            {formData.box_required && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Box Material */}
                <div>
                  <Label>Box Material</Label>
                  <Input
                    value={formData.box_material || ""}
                    onChange={(e) => handleChange("box_material", e.target.value)}
                    placeholder="e.g., Cardboard, Kraft"
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>

                {/* Box Dimensions */}
                <div>
                  <Label>Dimensions (L × W × H)</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="L"
                      value={(formData.box_dimensions as any)?.length || ""}
                      onChange={(e) =>
                        handleChange("box_dimensions", {
                          ...(formData.box_dimensions || {}),
                          length: parseFloat(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                    <Input
                      type="number"
                      placeholder="W"
                      value={(formData.box_dimensions as any)?.width || ""}
                      onChange={(e) =>
                        handleChange("box_dimensions", {
                          ...(formData.box_dimensions || {}),
                          width: parseFloat(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                    <Input
                      type="number"
                      placeholder="H"
                      value={(formData.box_dimensions as any)?.height || ""}
                      onChange={(e) =>
                        handleChange("box_dimensions", {
                          ...(formData.box_dimensions || {}),
                          height: parseFloat(e.target.value),
                        })
                      }
                      disabled={!isEditing}
                    />
                    <Select
                      value={(formData.box_dimensions as any)?.unit || "cm"}
                      onValueChange={(val) =>
                        handleChange("box_dimensions", {
                          ...(formData.box_dimensions || {}),
                          unit: val,
                        })
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cm">cm</SelectItem>
                        <SelectItem value="in">in</SelectItem>
                        <SelectItem value="mm">mm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Labels */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="w-5 h-5 text-primary" />
            Labels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Label Type</Label>
              <Select
                value={formData.label_type || ""}
                onValueChange={(val) => handleChange("label_type", val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select label type" />
                </SelectTrigger>
                <SelectContent>
                  {LABEL_TYPES.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Label Material</Label>
              <Input
                value={formData.label_material || ""}
                onChange={(e) => handleChange("label_material", e.target.value)}
                placeholder="e.g., Paper, Vinyl, BOPP"
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>

          {/* Asset Slots Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Label Design</p>
              <p className="text-xs text-muted-foreground mb-3">
                Connect to DAM asset
              </p>
              <Button variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Link Asset
              </Button>
            </div>

            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <Box className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">Box Design</p>
              <p className="text-xs text-muted-foreground mb-3">
                Connect to DAM asset
              </p>
              <Button variant="outline" size="sm" disabled>
                <Upload className="w-4 h-4 mr-2" />
                Link Asset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Barcode Generator */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Barcode className="w-5 h-5 text-primary" />
            Barcode
          </CardTitle>
          <CardDescription>
            Generate UPC/EAN barcodes for retail
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowBarcodeDialog(true)}>
              <Barcode className="w-4 h-4 mr-2" />
              Generate Barcode
            </Button>
          </div>

          {barcodePreview && (
            <div className="mt-4 p-4 bg-white rounded-lg border inline-block">
              <img src={barcodePreview} alt="Barcode" className="h-20" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sustainability */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Recycle className="w-5 h-5 text-primary" />
            Sustainability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="recyclable"
                  checked={formData.is_recyclable || false}
                  onCheckedChange={(checked) => handleChange("is_recyclable", !!checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="recyclable">Recyclable</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="refillable"
                  checked={formData.is_refillable || false}
                  onCheckedChange={(checked) => handleChange("is_refillable", !!checked)}
                  disabled={!isEditing}
                />
                <Label htmlFor="refillable">Refillable</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Recycling Code</Label>
                <Select
                  value={formData.recycling_code || ""}
                  onValueChange={(val) => handleChange("recycling_code", val)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select code" />
                  </SelectTrigger>
                  <SelectContent>
                    {RECYCLING_CODES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Post-Consumer Recycled %</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.post_consumer_recycled_percent || ""}
                  onChange={(e) =>
                    handleChange("post_consumer_recycled_percent", parseInt(e.target.value) || null)
                  }
                  placeholder="e.g., 30"
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weights */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Weights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Net Weight</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.net_weight || ""}
                onChange={(e) => handleChange("net_weight", parseFloat(e.target.value) || null)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={formData.net_weight_unit || "g"}
                onValueChange={(val) => handleChange("net_weight_unit", val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="fl oz">fl oz</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Gross Weight</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.gross_weight || ""}
                onChange={(e) => handleChange("gross_weight", parseFloat(e.target.value) || null)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Unit</Label>
              <Select
                value={formData.gross_weight_unit || "g"}
                onValueChange={(val) => handleChange("gross_weight_unit", val)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="oz">oz</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplier Info */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Supplier Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label>Supplier Name</Label>
              <Input
                value={formData.supplier_name || ""}
                onChange={(e) => handleChange("supplier_name", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Supplier SKU</Label>
              <Input
                value={formData.supplier_sku || ""}
                onChange={(e) => handleChange("supplier_sku", e.target.value)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Unit Cost</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.unit_cost || ""}
                onChange={(e) => handleChange("unit_cost", parseFloat(e.target.value) || null)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>MOQ (Minimum Order)</Label>
              <Input
                type="number"
                value={formData.moq || ""}
                onChange={(e) => handleChange("moq", parseInt(e.target.value) || null)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Lead Time (days)</Label>
              <Input
                type="number"
                value={formData.lead_time_days || ""}
                onChange={(e) => handleChange("lead_time_days", parseInt(e.target.value) || null)}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Additional packaging notes..."
              disabled={!isEditing}
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Barcode Generator Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Barcode</DialogTitle>
            <DialogDescription>
              Create a UPC or EAN barcode for this product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Barcode Type</Label>
              <Select
                value={barcodeType}
                onValueChange={(val) => setBarcodeType(val as BarcodeType)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upc-a">UPC-A (12 digits, US/Canada)</SelectItem>
                  <SelectItem value="ean-13">EAN-13 (13 digits, International)</SelectItem>
                  <SelectItem value="code-128">Code 128 (Alphanumeric)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                Barcode Number
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 inline ml-1 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter {barcodeType === "upc-a" ? "11-12" : "12-13"} digits.</p>
                      <p>Check digit will be calculated automatically.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Label>
              <Input
                value={barcodeCode}
                onChange={(e) => setBarcodeCode(e.target.value.replace(/\D/g, ""))}
                placeholder={barcodeType === "upc-a" ? "012345678901" : "5901234123457"}
                maxLength={barcodeType === "upc-a" ? 12 : 13}
                className="mt-1 font-mono"
              />
            </div>

            <Button
              onClick={handleGenerateBarcode}
              disabled={
                isGeneratingBarcode ||
                (barcodeType === "upc-a" && barcodeCode.length < 11) ||
                (barcodeType === "ean-13" && barcodeCode.length < 12)
              }
              className="w-full"
            >
              {isGeneratingBarcode ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Barcode className="w-4 h-4 mr-2" />
              )}
              Generate Barcode
            </Button>

            {barcodePreview && (
              <div className="p-4 bg-white rounded-lg border text-center">
                <img src={barcodePreview} alt="Barcode Preview" className="mx-auto" />
              </div>
            )}
          </div>

          <DialogFooter>
            {barcodePreview && (
              <Button variant="outline" onClick={handleDownloadBarcode}>
                <Download className="w-4 h-4 mr-2" />
                Download SVG
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
