import { useState } from "react";
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
  ChevronUp,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

interface SDSSectionProps {
  productId: string;
  productName: string;
  productType?: string;
  brandName?: string;
  sku?: string;
  isEditing?: boolean;
}

export function SDSSection({
  productId,
  productName,
  productType,
  brandName,
  sku,
  isEditing = false,
}: SDSSectionProps) {
  const {
    sdsVersions,
    currentSDS,
    isLoading,
    generateSDS,
    updateStatus,
    deleteSDS,
  } = useProductSDS(productId);

  const { ingredients } = useProductIngredients(productId);

  const [showHistory, setShowHistory] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse h-48 bg-muted rounded-lg" />
      </div>
    );
  }

  const needsSDS = !currentSDS;
  const isOutdated = currentSDS && (
    currentSDS.status === "expired" ||
    new Date(currentSDS.created_at) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
  );

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={cn(
        "border-2",
        needsSDS ? "border-amber-300 bg-amber-50" :
        isOutdated ? "border-red-300 bg-red-50" :
        currentSDS?.status === "approved" ? "border-green-300 bg-green-50" :
        "border-border bg-card"
      )}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                needsSDS ? "bg-amber-200" :
                isOutdated ? "bg-red-200" :
                currentSDS?.status === "approved" ? "bg-green-200" :
                "bg-muted"
              )}>
                {needsSDS ? (
                  <AlertTriangle className="w-6 h-6 text-amber-700" />
                ) : isOutdated ? (
                  <RefreshCw className="w-6 h-6 text-red-700" />
                ) : (
                  <Shield className="w-6 h-6 text-green-700" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  Safety Data Sheet (SDS)
                </CardTitle>
                <CardDescription>
                  {needsSDS ? (
                    "No SDS document exists for this product"
                  ) : isOutdated ? (
                    "SDS needs to be regenerated"
                  ) : (
                    `Version ${currentSDS?.version} · ${currentSDS?.revision_date || "Draft"}`
                  )}
                </CardDescription>
              </div>
            </div>

            {currentSDS && (
              <Badge className={SDS_STATUS_CONFIG[currentSDS.status].color}>
                {getStatusIcon(currentSDS.status)}
                <span className="ml-1">{SDS_STATUS_CONFIG[currentSDS.status].label}</span>
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || ingredients.length === 0}
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              {currentSDS ? "Regenerate SDS" : "Generate SDS"}
            </Button>

            {currentSDS && (
              <>
                <Button variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setShowHistory(true)}>
                  <History className="w-4 h-4 mr-2" />
                  History ({sdsVersions.length})
                </Button>
              </>
            )}
          </div>

          {ingredients.length === 0 && (
            <p className="text-sm text-amber-700">
              ⚠️ Add ingredients to this product before generating an SDS.
            </p>
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
                <p className="text-xs text-muted-foreground uppercase mb-1">Signal Word</p>
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
                <p className="text-xs text-muted-foreground uppercase mb-2">GHS Pictograms</p>
                <div className="flex gap-3">
                  {currentSDS.ghs_pictograms.map((code) => {
                    const picto = GHS_PICTOGRAMS.find((p) => p.code === code);
                    return (
                      <div
                        key={code}
                        className="flex flex-col items-center gap-1 p-2 bg-muted rounded"
                      >
                        <span className="text-3xl">{picto?.symbol || "⚠️"}</span>
                        <span className="text-xs text-muted-foreground">{picto?.name || code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hazard Statements */}
            {currentSDS.hazard_statements && currentSDS.hazard_statements.length > 0 && (
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
            {currentSDS.precautionary_statements && currentSDS.precautionary_statements.length > 0 && (
              <Collapsible>
                <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                  <ChevronDown className="w-4 h-4" />
                  Precautionary Statements ({currentSDS.precautionary_statements.length})
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
            {(!currentSDS.ghs_pictograms || currentSDS.ghs_pictograms.length === 0) &&
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
                updateStatus.mutate({ sdsId: currentSDS.id, status: val as SDSStatus })
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
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
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
                  sds.id === currentSDS?.id ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">v{sds.version}</span>
                    <Badge className={SDS_STATUS_CONFIG[sds.status].color}>
                      {SDS_STATUS_CONFIG[sds.status].label}
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
