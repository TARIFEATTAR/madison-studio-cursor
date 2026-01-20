/**
 * Publish to Sanity Component
 *
 * Allows users to push Madison Studio content to Sanity.io
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProductSelector } from "@/components/forge/ProductSelector";
import type { Product } from "@/hooks/useProducts";
import { Loader2, CheckCircle2, XCircle, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PublishToSanityProps {
  content: any;
  contentType: "master" | "derivative" | "output";
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  buttonText?: string;
}

const SANITY_DOCUMENT_TYPES = {
  master: [
    { value: "post", label: "Blog Post" },
    { value: "blog_article", label: "Blog Article" },
    { value: "journal", label: "Journal Entry" },
    { value: "fieldJournal", label: "Field Journal" },
    { value: "article", label: "Article" },
    { value: "emailCampaign", label: "Email Campaign" },
  ],
  derivative: [
    { value: "socialPost", label: "Social Media Post" },
    { value: "emailCampaign", label: "Email Campaign" },
  ],
  output: [
    { value: "contentDraft", label: "Content Draft" },
    { value: "post", label: "Blog Post" },
  ],
};

export function PublishToSanity({
  content,
  contentType,
  variant = "outline",
  size = "sm",
  buttonText = "Publish to Sanity",
}: PublishToSanityProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [sanityDocumentType, setSanityDocumentType] = useState<string>("");
  const [publish, setPublish] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [syncStatus, setSyncStatus] = useState<{
    success: boolean;
    sanityDocumentId?: string;
    error?: string;
  } | null>(null);

  const availableTypes = SANITY_DOCUMENT_TYPES[contentType] || [];

  const handlePush = async () => {
    if (!sanityDocumentType) {
      toast({
        title: "Select document type",
        description: "Please choose a Sanity document type",
        variant: "destructive",
      });
      return;
    }

    setIsPushing(true);
    setSyncStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke("push-to-sanity", {
        body: {
          contentId: content.id,
          contentType,
          sanityDocumentType,
          organizationId: content.organization_id,
          linkedProductId: selectedProduct?.id,
          linkedProductName: selectedProduct?.name,
          publish,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      setSyncStatus({
        success: true,
        sanityDocumentId: data?.sanityDocumentId,
      });

      toast({
        title: "✅ Published to Sanity",
        description: `Content successfully synced to Sanity${publish ? " and published" : " as draft"}`,
      });

      // Auto-close after 2 seconds on success
      setTimeout(() => {
        setOpen(false);
        setSyncStatus(null);
      }, 2000);
    } catch (error: any) {
      console.error("Error pushing to Sanity:", error);
      setSyncStatus({
        success: false,
        error: error.message || "Failed to push to Sanity",
      });

      toast({
        title: "❌ Failed to publish",
        description: error.message || "Unable to sync content to Sanity",
        variant: "destructive",
      });
    } finally {
      setIsPushing(false);
    }
  };

  const getSanityStudioUrl = () => {
    // TODO: Make this configurable per organization via settings
    // Tarife Attar uses a self-hosted Sanity Studio at their website
    const studioBaseUrl = "https://www.tarifeattar.com/studio";
    if (syncStatus?.sanityDocumentId) {
      // Link directly to the document in Sanity Studio
      return `${studioBaseUrl}/structure/post;${syncStatus.sanityDocumentId}`;
    }
    return studioBaseUrl;
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size={size}
        className="gap-2"
      >
        <ExternalLink className="w-4 h-4" />
        {buttonText}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Publish to Sanity</DialogTitle>
            <DialogDescription>
              Push this content to your Sanity.io project. Choose the document type and publishing option.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Content Info */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="text-sm font-medium text-foreground mb-1">
                {content.title || "Untitled Content"}
              </div>
              <div className="text-xs text-muted-foreground">
                Type: {content.content_type || content.asset_type || contentType}
              </div>
            </div>

            {/* Product Linking */}
            <div className="space-y-2">
              <Label>Link to Product (Optional)</Label>
              <ProductSelector
                value={selectedProduct?.name || ""}
                onSelect={setSelectedProduct}
                buttonClassName="w-full justify-between"
                className="w-full"
                showLabel={false}
              />
              <p className="text-[10px] text-muted-foreground">
                Linking to a product helps Sanity display this entry on that fragrance's page.
              </p>
            </div>

            {/* Document Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="sanity-type">Sanity Document Type</Label>
              <Select
                value={sanityDocumentType}
                onValueChange={setSanityDocumentType}
                disabled={isPushing}
              >
                <SelectTrigger id="sanity-type">
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  {availableTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Publish Option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="publish"
                checked={publish}
                onCheckedChange={(checked) => setPublish(checked === true)}
                disabled={isPushing}
              />
              <Label
                htmlFor="publish"
                className="text-sm font-normal cursor-pointer"
              >
                Publish immediately (otherwise saved as draft)
              </Label>
            </div>

            {/* Sync Status */}
            {syncStatus && (
              <div
                className={`rounded-lg border p-3 ${syncStatus.success
                  ? "border-green-500 bg-green-50 dark:bg-green-950"
                  : "border-red-500 bg-red-50 dark:bg-red-950"
                  }`}
              >
                <div className="flex items-center gap-2">
                  {syncStatus.success ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {syncStatus.success
                        ? "Successfully synced to Sanity"
                        : "Sync failed"}
                    </div>
                    {syncStatus.success && syncStatus.sanityDocumentId && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Document ID: {syncStatus.sanityDocumentId}
                      </div>
                    )}
                    {syncStatus.error && (
                      <div className="text-xs text-red-600 mt-1">
                        {syncStatus.error}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                setSyncStatus(null);
              }}
              disabled={isPushing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePush}
              disabled={isPushing || !sanityDocumentType}
              className="gap-2"
            >
              {isPushing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Publish to Sanity
                </>
              )}
            </Button>
          </DialogFooter>

          {syncStatus?.success && syncStatus.sanityDocumentId && (
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() => window.open(getSanityStudioUrl(), "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
                Open in Sanity Studio
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}



