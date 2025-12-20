// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA SECTION - Product Images & Videos with DAM + External URL Support
// ═══════════════════════════════════════════════════════════════════════════════

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Link2,
  Upload,
  ExternalLink,
  Star,
  StarOff,
  GripVertical,
  Video,
  FileImage,
  X,
  Check,
  AlertCircle,
  Globe,
  HardDrive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useProductMedia, type ProductMediaAsset } from "@/hooks/useProductMedia";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const RELATIONSHIP_TYPES = [
  { value: "hero_image", label: "Hero Image", icon: Star, description: "Main product photo" },
  { value: "gallery", label: "Gallery", icon: FileImage, description: "Product gallery" },
  { value: "lifestyle", label: "Lifestyle", icon: ImageIcon, description: "In-use photos" },
  { value: "detail", label: "Detail Shot", icon: FileImage, description: "Close-up details" },
  { value: "packaging", label: "Packaging", icon: FileImage, description: "Packaging photos" },
  { value: "video", label: "Video", icon: Video, description: "Product videos" },
] as const;

const EXTERNAL_PROVIDERS = [
  { value: "google_drive", label: "Google Drive", icon: "🔵" },
  { value: "dropbox", label: "Dropbox", icon: "📦" },
  { value: "onedrive", label: "OneDrive", icon: "☁️" },
  { value: "direct_url", label: "Direct URL", icon: "🌐" },
  { value: "other", label: "Other", icon: "📎" },
] as const;

type RelationshipType = typeof RELATIONSHIP_TYPES[number]["value"];
type ExternalProvider = typeof EXTERNAL_PROVIDERS[number]["value"];

// ═══════════════════════════════════════════════════════════════════════════════
// INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

interface MediaSectionProps {
  productId: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADD EXTERNAL URL DIALOG
// ═══════════════════════════════════════════════════════════════════════════════

interface AddExternalUrlDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: {
    external_url: string;
    external_provider: ExternalProvider;
    relationship_type: RelationshipType;
    label?: string;
  }) => void;
  isLoading: boolean;
}

function AddExternalUrlDialog({
  open,
  onClose,
  onAdd,
  isLoading,
}: AddExternalUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [provider, setProvider] = useState<ExternalProvider>("direct_url");
  const [type, setType] = useState<RelationshipType>("gallery");
  const [label, setLabel] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const validateUrl = (value: string) => {
    if (!value.trim()) {
      setUrlError("URL is required");
      return false;
    }
    try {
      new URL(value);
      setUrlError(null);
      return true;
    } catch {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  const detectProvider = (value: string): ExternalProvider => {
    const lowerUrl = value.toLowerCase();
    if (lowerUrl.includes("drive.google.com")) return "google_drive";
    if (lowerUrl.includes("dropbox.com") || lowerUrl.includes("dropboxusercontent.com")) return "dropbox";
    if (lowerUrl.includes("onedrive.") || lowerUrl.includes("sharepoint.com")) return "onedrive";
    return "direct_url";
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      validateUrl(value);
      const detected = detectProvider(value);
      if (detected !== "direct_url") {
        setProvider(detected);
      }
    }
  };

  const handleSubmit = () => {
    if (!validateUrl(url)) return;
    onAdd({
      external_url: url.trim(),
      external_provider: provider,
      relationship_type: type,
      label: label.trim() || undefined,
    });
    handleClose();
  };

  const handleClose = () => {
    setUrl("");
    setProvider("direct_url");
    setType("gallery");
    setLabel("");
    setUrlError(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            Add External Image URL
          </DialogTitle>
          <DialogDescription>
            Paste a link to an image hosted on Google Drive, Dropbox, or any public URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="external-url">Image URL *</Label>
            <Input
              id="external-url"
              placeholder="https://drive.google.com/..."
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className={cn(urlError && "border-destructive")}
            />
            {urlError && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {urlError}
              </p>
            )}
          </div>

          {/* Provider */}
          <div className="space-y-2">
            <Label>Source</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as ExternalProvider)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXTERNAL_PROVIDERS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="flex items-center gap-2">
                      <span>{p.icon}</span>
                      {p.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label>Image Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as RelationshipType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RELATIONSHIP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      <t.icon className="w-4 h-4" />
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {RELATIONSHIP_TYPES.find((t) => t.value === type)?.description}
            </p>
          </div>

          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label (optional)</Label>
            <Input
              id="label"
              placeholder="e.g., Front View, Texture Shot"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Preview */}
          {url && !urlError && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="border rounded-lg p-2 bg-muted/50">
                <img
                  src={url}
                  alt="Preview"
                  className="max-h-32 w-auto mx-auto rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    setUrlError("Unable to load image from this URL");
                  }}
                  onLoad={(e) => {
                    (e.target as HTMLImageElement).style.display = "block";
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!url.trim() || !!urlError || isLoading}>
            {isLoading ? "Adding..." : "Add Image"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface MediaCardProps {
  asset: ProductMediaAsset;
  onSetPrimary: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function MediaCard({ asset, onSetPrimary, onDelete, isDeleting }: MediaCardProps) {
  const imageUrl = asset.external_url || asset.dam_asset?.thumbnail_url || asset.dam_asset?.file_url;
  const isExternal = !!asset.external_url;
  const typeInfo = RELATIONSHIP_TYPES.find((t) => t.value === asset.relationship_type);
  const providerInfo = EXTERNAL_PROVIDERS.find((p) => p.value === asset.external_provider);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative"
    >
      <Card className={cn(
        "overflow-hidden transition-all",
        asset.is_primary && "ring-2 ring-primary"
      )}>
        {/* Image */}
        <div className="aspect-square bg-muted relative">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={asset.label || "Product image"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
          )}

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8"
                    onClick={onSetPrimary}
                    disabled={asset.is_primary}
                  >
                    {asset.is_primary ? (
                      <Star className="w-4 h-4 fill-primary text-primary" />
                    ) : (
                      <StarOff className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {asset.is_primary ? "Primary image" : "Set as primary"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isExternal && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-8 w-8"
                      onClick={() => window.open(asset.external_url!, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open in new tab</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="h-8 w-8"
                    onClick={onDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Remove</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {/* Primary Badge */}
          {asset.is_primary && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-primary-foreground text-xs">
                <Star className="w-3 h-3 mr-1 fill-current" />
                Primary
              </Badge>
            </div>
          )}

          {/* Source Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {isExternal ? (
                <>
                  <Globe className="w-3 h-3 mr-1" />
                  {providerInfo?.icon}
                </>
              ) : (
                <>
                  <HardDrive className="w-3 h-3 mr-1" />
                  DAM
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Info */}
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="truncate">
              <p className="text-sm font-medium truncate">
                {asset.label || typeInfo?.label || "Image"}
              </p>
              <p className="text-xs text-muted-foreground">
                {typeInfo?.label}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN MEDIA SECTION COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function MediaSection({ productId }: MediaSectionProps) {
  const { toast } = useToast();
  const [addExternalOpen, setAddExternalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | RelationshipType>("all");

  const {
    assets,
    isLoading,
    addExternalAsset,
    removeAsset,
    setPrimaryAsset,
  } = useProductMedia(productId);

  // Filter assets by type
  const filteredAssets = activeTab === "all" 
    ? assets 
    : assets.filter((a) => a.relationship_type === activeTab);

  // Group assets by type for summary
  const assetCounts = RELATIONSHIP_TYPES.reduce((acc, type) => {
    acc[type.value] = assets.filter((a) => a.relationship_type === type.value).length;
    return acc;
  }, {} as Record<string, number>);

  const handleAddExternal = async (data: {
    external_url: string;
    external_provider: ExternalProvider;
    relationship_type: RelationshipType;
    label?: string;
  }) => {
    try {
      await addExternalAsset.mutateAsync({
        product_id: productId,
        ...data,
        is_primary: data.relationship_type === "hero_image" && assets.filter((a) => a.relationship_type === "hero_image").length === 0,
      });
      setAddExternalOpen(false);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDelete = async (assetId: string) => {
    try {
      await removeAsset.mutateAsync(assetId);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleSetPrimary = async (asset: ProductMediaAsset) => {
    try {
      await setPrimaryAsset.mutateAsync({
        assetId: asset.id,
        relationshipType: asset.relationship_type,
      });
    } catch (error) {
      // Error handled in hook
    }
  };

  // Hero image (for quick display)
  const heroImage = assets.find((a) => a.relationship_type === "hero_image" && a.is_primary);

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-primary" />
                Product Media
              </CardTitle>
              <CardDescription>
                Manage product images and videos from your DAM or external links
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setAddExternalOpen(true)}
                className="gap-2"
              >
                <Link2 className="w-4 h-4" />
                Add External URL
              </Button>
              <Button className="gap-2" disabled>
                <Upload className="w-4 h-4" />
                Upload to DAM
                <Badge variant="secondary" className="ml-1 text-xs">Soon</Badge>
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Quick Stats */}
          <div className="flex flex-wrap gap-3 mb-6">
            {RELATIONSHIP_TYPES.slice(0, 5).map((type) => (
              <div
                key={type.value}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm cursor-pointer transition-colors",
                  activeTab === type.value
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-muted/50 hover:bg-muted"
                )}
                onClick={() => setActiveTab(activeTab === type.value ? "all" : type.value)}
              >
                <type.icon className="w-4 h-4" />
                <span>{type.label}</span>
                <Badge variant="secondary" className="text-xs">
                  {assetCounts[type.value]}
                </Badge>
              </div>
            ))}
          </div>

          {/* Media Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="aspect-square bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No media yet</h3>
              <p className="text-muted-foreground mb-4">
                Add images from your DAM or paste external links
              </p>
              <Button
                variant="outline"
                onClick={() => setAddExternalOpen(true)}
                className="gap-2"
              >
                <Link2 className="w-4 h-4" />
                Add External URL
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredAssets.map((asset) => (
                  <MediaCard
                    key={asset.id}
                    asset={asset}
                    onSetPrimary={() => handleSetPrimary(asset)}
                    onDelete={() => handleDelete(asset.id)}
                    isDeleting={removeAsset.isPending}
                  />
                ))}
              </AnimatePresence>

              {/* Add More Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                onClick={() => setAddExternalOpen(true)}
              >
                <Plus className="w-8 h-8" />
                <span className="text-sm">Add Image</span>
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* External URL Dialog */}
      <AddExternalUrlDialog
        open={addExternalOpen}
        onClose={() => setAddExternalOpen(false)}
        onAdd={handleAddExternal}
        isLoading={addExternalAsset.isPending}
      />
    </div>
  );
}
