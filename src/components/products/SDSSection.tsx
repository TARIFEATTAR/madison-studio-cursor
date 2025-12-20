import { useState, useRef } from "react";
import {
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  RefreshCw,
  Eye,
  History,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  Shield,
  Upload,
  Link,
  Building2,
  Mail,
  ExternalLink,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useProductSDS,
  SDS_STATUS_CONFIG,
  GHS_PICTOGRAMS,
  type ProductSDS,
  type SDSStatus,
} from "@/hooks/useSDSPackaging";
import { useProductIngredients } from "@/hooks/useIngredients";
import { useSuppliers, type Supplier } from "@/hooks/useSuppliers";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

type SDSSourceType = "generated" | "uploaded" | "linked" | "requested";

interface SDSSectionProps {
  productId: string;
  productName: string;
  productType?: string;
  brandName?: string;
  sku?: string;
  isEditing?: boolean;
  supplierId?: string | null;
  isSelfManufactured?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// UPLOAD SDS DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface UploadSDSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  suppliers: Supplier[];
  onUploaded: () => void;
}

function UploadSDSDialog({
  open,
  onOpenChange,
  productId,
  suppliers,
  onUploaded,
}: UploadSDSDialogProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [supplierId, setSupplierId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check file type - allow PDFs and common document types
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(selectedFile.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        });
        return;
      }
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file to Supabase Storage
      const fileName = `sds/${productId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, file);

      if (uploadError) {
        // If bucket doesn't exist, create a placeholder entry without file
        console.warn("Storage upload failed:", uploadError);
      }

      // Get public URL if upload succeeded
      let fileUrl = null;
      if (uploadData) {
        const { data: urlData } = supabase.storage
          .from("documents")
          .getPublicUrl(fileName);
        fileUrl = urlData?.publicUrl;
      }

      // Create SDS record
      const { error: sdsError } = await supabase.from("product_sds").insert({
        product_id: productId,
        source_type: "uploaded",
        supplier_id: supplierId || null,
        file_url: fileUrl,
        file_name: file.name,
        request_notes: notes || null,
        status: "draft",
        version: "1.0",
      });

      if (sdsError) {
        throw sdsError;
      }

      toast({
        title: "SDS uploaded",
        description: "The Safety Data Sheet has been added successfully.",
      });

      onUploaded();
      onOpenChange(false);
      setFile(null);
      setSupplierId("");
      setNotes("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload SDS document",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upload SDS Document</DialogTitle>
          <DialogDescription>
            Upload a Safety Data Sheet from your supplier or manufacturer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>SDS Document</Label>
            <div
              className={cn(
                "mt-1.5 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                file
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium">{file.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF or Word (max 10MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Supplier Selection */}
          <div>
            <Label>From Supplier (optional)</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select supplier..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No supplier</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label>Notes (optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Received from supplier on Jan 15, 2025"
              className="mt-1.5"
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload SDS
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST SDS DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface RequestSDSDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
  sku?: string;
  suppliers: Supplier[];
}

function RequestSDSDialog({
  open,
  onOpenChange,
  productId,
  productName,
  sku,
  suppliers,
}: RequestSDSDialogProps) {
  const { toast } = useToast();
  const [supplierId, setSupplierId] = useState<string>("");
  const [email, setEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  // Update email when supplier changes
  const handleSupplierChange = (id: string) => {
    setSupplierId(id);
    const supplier = suppliers.find((s) => s.id === id);
    if (supplier?.contact_email) {
      setEmail(supplier.contact_email);
    }
  };

  const emailSubject = `SDS Request - ${productName}${sku ? ` (SKU: ${sku})` : ""}`;
  const emailBody = `Hi${selectedSupplier?.contact_name ? ` ${selectedSupplier.contact_name}` : ""},

I am requesting the Safety Data Sheet (SDS) for the following product:

Product: ${productName}
${sku ? `SKU: ${sku}\n` : ""}
Please send the most current version of the SDS document.

Thank you!`;

  const handleCopyEmail = async () => {
    const fullEmail = `To: ${email}\nSubject: ${emailSubject}\n\n${emailBody}`;
    await navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Email content has been copied. Paste it into your email client.",
    });
  };

  const handleOpenEmail = () => {
    const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request SDS from Supplier</DialogTitle>
          <DialogDescription>
            Send a request to your supplier for the Safety Data Sheet
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Supplier Selection */}
          <div>
            <Label>Select Supplier</Label>
            <Select value={supplierId} onValueChange={handleSupplierChange}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Choose a supplier..." />
              </SelectTrigger>
              <SelectContent>
                {suppliers.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No suppliers added yet
                  </SelectItem>
                ) : (
                  suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Email */}
          <div>
            <Label>Send to Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supplier@example.com"
              className="mt-1.5"
            />
          </div>

          {/* Email Preview */}
          {email && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted px-3 py-2 border-b border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>To:</strong> {email}
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Subject:</strong> {emailSubject}
                </p>
              </div>
              <div className="p-3 bg-background">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {emailBody}
                </pre>
              </div>
            </div>
          )}

          {/* Supplier Portal Link */}
          {selectedSupplier?.has_sds_portal && selectedSupplier.sds_portal_url && (
            <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span className="text-sm flex-1">
                This supplier has an SDS portal
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(selectedSupplier.sds_portal_url!, "_blank")
                }
              >
                Open Portal
              </Button>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleCopyEmail} disabled={!email}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? "Copied!" : "Copy to Clipboard"}
          </Button>
          <Button onClick={handleOpenEmail} disabled={!email}>
            <Mail className="w-4 h-4 mr-2" />
            Open in Email
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function SDSSection({
  productId,
  productName,
  productType,
  brandName,
  sku,
  isEditing = false,
  supplierId,
  isSelfManufactured = true,
}: SDSSectionProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    sdsVersions,
    currentSDS,
    isLoading,
    generateSDS,
    updateStatus,
    deleteSDS,
  } = useProductSDS(productId);

  const { ingredients } = useProductIngredients(productId);
  const { suppliers, activeSuppliers } = useSuppliers();

  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    isSelfManufactured ? "generate" : "upload"
  );

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generateSDS.mutateAsync({
        product_name: productName,
        product_type: productType,
        brand_name: brandName,
        sku,
        ingredients: ingredients.map((i) => ({
          name: i.ingredient?.name || i.inci_name || "",
          inci_name: i.inci_name || i.ingredient?.inci_name,
          concentration_percent: i.concentration_percent || undefined,
          cas_number: i.ingredient?.cas_number || undefined,
        })),
      });

      if (result.plain_text) {
        setPreviewContent(result.plain_text);
        setShowPreview(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(previewContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([previewContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SDS_${productName.replace(/\s+/g, "_")}_v${currentSDS?.version || "1.0"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = (status: SDSStatus) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "review":
        return <Clock className="w-4 h-4 text-amber-600" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSourceLabel = (sourceType: string | null | undefined) => {
    switch (sourceType) {
      case "uploaded":
        return "Uploaded";
      case "linked":
        return "External Link";
      case "requested":
        return "Requested";
      default:
        return "Generated";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  const needsSDS = !currentSDS;
  const isOutdated =
    currentSDS &&
    (currentSDS.status === "expired" ||
      new Date(currentSDS.created_at) <
        new Date(Date.now() - 365 * 24 * 60 * 60 * 1000));

  // Get linked supplier info
  const linkedSupplier = supplierId
    ? suppliers.find((s) => s.id === supplierId)
    : null;

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card
        className={cn(
          "border-2",
          needsSDS
            ? "border-amber-300 bg-amber-50"
            : isOutdated
              ? "border-red-300 bg-red-50"
              : currentSDS?.status === "approved"
                ? "border-green-300 bg-green-50"
                : "border-border bg-card"
        )}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center",
                  needsSDS
                    ? "bg-amber-200"
                    : isOutdated
                      ? "bg-red-200"
                      : currentSDS?.status === "approved"
                        ? "bg-green-200"
                        : "bg-muted"
                )}
              >
                {needsSDS ? (
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                ) : isOutdated ? (
                  <RefreshCw className="w-6 h-6 text-red-700" />
                ) : (
                  <Shield className="w-6 h-6 text-green-700" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">Safety Data Sheet (SDS)</CardTitle>
                <CardDescription>
                  {needsSDS ? (
                    "No SDS document exists for this product"
                  ) : isOutdated ? (
                    "SDS needs to be regenerated"
                  ) : (
                    <span className="flex items-center gap-2">
                      Version {currentSDS?.version} ·{" "}
                      {currentSDS?.revision_date || "Draft"}
                      <Badge variant="outline" className="text-xs">
                        {getSourceLabel((currentSDS as any)?.source_type)}
                      </Badge>
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>

            {currentSDS && (
              <Badge className={SDS_STATUS_CONFIG[currentSDS.status].color}>
                {getStatusIcon(currentSDS.status)}
                <span className="ml-1">
                  {SDS_STATUS_CONFIG[currentSDS.status].label}
                </span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Options Tabs */}
          {needsSDS && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="generate" className="gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="request" className="gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  Request
                </TabsTrigger>
              </TabsList>

              <TabsContent value="generate" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Generate an SDS document based on this product's ingredients.
                    Best for products you manufacture yourself.
                  </p>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || ingredients.length === 0}
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate SDS
                  </Button>
                  {ingredients.length === 0 && (
                    <p className="text-sm text-amber-700">
                      ⚠️ Add ingredients to this product before generating an SDS.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="upload" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Upload an SDS document you received from your supplier or
                    manufacturer. Supports PDF and Word documents.
                  </p>
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload SDS Document
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="request" className="mt-4">
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Send an email request to your supplier for the SDS document.
                    We'll help you draft the email.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowRequestDialog(true)}>
                      <Mail className="w-4 h-4 mr-2" />
                      Request from Supplier
                    </Button>
                    {activeSuppliers.length === 0 && (
                      <Button
                        variant="outline"
                        onClick={() => navigate("/suppliers")}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Supplier First
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {/* Action Buttons when SDS exists */}
          {currentSDS && (
            <div className="flex flex-wrap gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || ingredients.length === 0}
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Regenerate
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Generate a new version based on current ingredients</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>

              {currentSDS.file_url && (
                <Button
                  variant="outline"
                  onClick={() => window.open(currentSDS.file_url!, "_blank")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              )}

              <Button variant="outline" onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload New
              </Button>

              <Button variant="outline" onClick={() => setShowHistory(true)}>
                <History className="w-4 h-4 mr-2" />
                History ({sdsVersions.length})
              </Button>
            </div>
          )}

          {/* Linked Supplier Info */}
          {linkedSupplier && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mt-2">
              <Building2 className="w-5 h-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">
                  Sourced from: {linkedSupplier.name}
                </p>
                {linkedSupplier.contact_email && (
                  <p className="text-xs text-muted-foreground">
                    {linkedSupplier.contact_email}
                  </p>
                )}
              </div>
              {linkedSupplier.has_sds_portal && linkedSupplier.sds_portal_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    window.open(linkedSupplier.sds_portal_url!, "_blank")
                  }
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                  SDS Portal
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* GHS Classification (if SDS exists) */}
      {currentSDS && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              GHS Classification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Signal Word */}
            {currentSDS.signal_word && currentSDS.signal_word !== "None" && (
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-1">
                  Signal Word
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-lg font-bold px-4 py-2",
                    currentSDS.signal_word === "Danger"
                      ? "border-red-500 text-red-700"
                      : "border-amber-500 text-amber-700"
                  )}
                >
                  {currentSDS.signal_word}
                </Badge>
              </div>
            )}

            {/* Pictograms */}
            {currentSDS.ghs_pictograms && currentSDS.ghs_pictograms.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase mb-2">
                  GHS Pictograms
                </p>
                <div className="flex gap-3">
                  {currentSDS.ghs_pictograms.map((code) => {
                    const picto = GHS_PICTOGRAMS.find((p) => p.code === code);
                    return (
                      <div
                        key={code}
                        className="flex flex-col items-center gap-1 p-2 bg-muted rounded"
                      >
                        <span className="text-3xl">{picto?.symbol || "⚠️"}</span>
                        <span className="text-xs text-muted-foreground">
                          {picto?.name || code}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hazard Statements */}
            {currentSDS.hazard_statements &&
              currentSDS.hazard_statements.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                    <ChevronDown className="w-4 h-4" />
                    Hazard Statements ({currentSDS.hazard_statements.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {currentSDS.hazard_statements.map((h, i) => (
                      <p key={i} className="text-sm text-muted-foreground pl-6">
                        • {h}
                      </p>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

            {/* Precautionary Statements */}
            {currentSDS.precautionary_statements &&
              currentSDS.precautionary_statements.length > 0 && (
                <Collapsible>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                    <ChevronDown className="w-4 h-4" />
                    Precautionary Statements (
                    {currentSDS.precautionary_statements.length})
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-1">
                    {currentSDS.precautionary_statements.map((p, i) => (
                      <p key={i} className="text-sm text-muted-foreground pl-6">
                        • {p}
                      </p>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

            {/* Not Classified */}
            {(!currentSDS.ghs_pictograms ||
              currentSDS.ghs_pictograms.length === 0) &&
              (!currentSDS.signal_word || currentSDS.signal_word === "None") && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">
                    Not classified as hazardous under GHS
                  </span>
                </div>
              )}
          </CardContent>
        </Card>
      )}

      {/* Status Update (for editing) */}
      {currentSDS && isEditing && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base">SDS Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={currentSDS.status}
              onValueChange={(val) =>
                updateStatus.mutate({
                  sdsId: currentSDS.id,
                  status: val as SDSStatus,
                })
              }
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(SDS_STATUS_CONFIG).map(([value, config]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(value as SDSStatus)}
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <UploadSDSDialog
        open={showUploadDialog}
        onOpenChange={setShowUploadDialog}
        productId={productId}
        suppliers={activeSuppliers}
        onUploaded={() => {
          // Refresh SDS data
          window.location.reload();
        }}
      />

      {/* Request Dialog */}
      <RequestSDSDialog
        open={showRequestDialog}
        onOpenChange={setShowRequestDialog}
        productId={productId}
        productName={productName}
        sku={sku}
        suppliers={activeSuppliers}
      />

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>SDS Preview</DialogTitle>
            <DialogDescription>
              Version {currentSDS?.version || "Draft"} · {productName}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto max-h-[50vh] bg-muted/50 rounded-lg p-4">
            <pre className="text-xs font-mono whitespace-pre-wrap">
              {previewContent || generateSDSPreviewText(currentSDS)}
            </pre>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button variant="outline" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download TXT
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>SDS Version History</DialogTitle>
            <DialogDescription>
              {sdsVersions.length} version{sdsVersions.length !== 1 ? "s" : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[50vh] overflow-auto">
            {sdsVersions.map((sds) => (
              <div
                key={sds.id}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border",
                  sds.id === currentSDS?.id
                    ? "border-primary bg-primary/5"
                    : "border-border"
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">v{sds.version}</span>
                    <Badge className={SDS_STATUS_CONFIG[sds.status].color}>
                      {SDS_STATUS_CONFIG[sds.status].label}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getSourceLabel((sds as any)?.source_type)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(sds.created_at).toLocaleDateString()}
                  </p>
                </div>

                {isEditing && sds.id !== currentSDS?.id && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSDS.mutate(sds.id)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function generateSDSPreviewText(sds: ProductSDS | null): string {
  if (!sds) return "No SDS data available. Generate an SDS first.";

  const lines: string[] = [
    "═".repeat(60),
    "SAFETY DATA SHEET",
    "═".repeat(60),
    "",
    `Version: ${sds.version}`,
    `Revision Date: ${sds.revision_date || "Draft"}`,
    `Status: ${SDS_STATUS_CONFIG[sds.status].label}`,
    "",
    "─".repeat(60),
    "SECTION 2: HAZARD IDENTIFICATION",
    "─".repeat(60),
    "",
    `Signal Word: ${sds.signal_word || "None"}`,
    "",
  ];

  if (sds.ghs_classification && sds.ghs_classification.length > 0) {
    lines.push("GHS Classification:");
    sds.ghs_classification.forEach((c) => lines.push(`  • ${c}`));
    lines.push("");
  }

  if (sds.hazard_statements && sds.hazard_statements.length > 0) {
    lines.push("Hazard Statements:");
    sds.hazard_statements.forEach((h) => lines.push(`  • ${h}`));
    lines.push("");
  }

  if (sds.precautionary_statements && sds.precautionary_statements.length > 0) {
    lines.push("Precautionary Statements:");
    sds.precautionary_statements.forEach((p) => lines.push(`  • ${p}`));
    lines.push("");
  }

  lines.push("─".repeat(60));
  lines.push("SECTION 9: PHYSICAL PROPERTIES");
  lines.push("─".repeat(60));
  lines.push("");
  if (sds.physical_state) lines.push(`Physical State: ${sds.physical_state}`);
  if (sds.color) lines.push(`Color: ${sds.color}`);
  if (sds.odor) lines.push(`Odor: ${sds.odor}`);
  if (sds.ph) lines.push(`pH: ${sds.ph}`);
  if (sds.flash_point) lines.push(`Flash Point: ${sds.flash_point}`);

  return lines.join("\n");
}
