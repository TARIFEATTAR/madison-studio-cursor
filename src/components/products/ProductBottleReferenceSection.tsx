import { ExternalLink, ImageIcon, Ruler, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePipelineGroupForProduct } from "@/hooks/usePipelineGroupForProduct";
import { useProducts } from "@/hooks/useProducts";
import type { GeometrySpec } from "@/lib/product-image/types";

function isGeometrySpec(v: unknown): v is GeometrySpec {
  if (!v || typeof v !== "object") return false;
  const o = v as GeometrySpec;
  return (
    o.bodyDimensionsMm != null &&
    typeof o.bodyDimensionsMm.height === "number" &&
    typeof o.bodyDimensionsMm.width === "number" &&
    o.canonicalCanvas != null &&
    typeof o.canonicalCanvas.widthPx === "number"
  );
}

interface ProductBottleReferenceSectionProps {
  organizationId: string | null;
  productId: string;
  sku: string | null;
  parentSku: string | null;
  canEdit: boolean;
}

export function ProductBottleReferenceSection({
  organizationId,
  productId,
  sku,
  parentSku,
  canEdit,
}: ProductBottleReferenceSectionProps) {
  const { data: group, isLoading, isError } = usePipelineGroupForProduct(
    organizationId,
    sku,
    parentSku,
  );
  const { updateProduct } = useProducts();

  if (!organizationId || (!sku?.trim() && !parentSku?.trim())) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Bottle reference & measurements
          </CardTitle>
          <CardDescription>
            Set a SKU (or parent SKU) on this product to link it to the Best Bottles grid
            tracker — catalog dimensions, geometry, and the current website product image.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-10 flex justify-center text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card className="bg-card border-destructive/40">
        <CardHeader>
          <CardTitle className="text-lg">Bottle reference</CardTitle>
          <CardDescription className="text-destructive">
            Could not load pipeline data. Try again later.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!group) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Bottle reference & measurements
          </CardTitle>
          <CardDescription>
            No grid-pipeline row matches this SKU or parent SKU. Use the same codes as the
            Grid-Image-Tracker (primary website SKU, Grace SKU, or a value listed under all
            legacy SKUs).
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1">
          <p>
            <span className="font-medium text-foreground">Lookup tried:</span>{" "}
            {[sku, parentSku].filter(Boolean).join(" · ") || "—"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const geo = isGeometrySpec(group.geometry_spec) ? group.geometry_spec : null;
  const refUrl = group.legacy_hero_image_url?.trim() || null;

  const setHeroFromWebsite = () => {
    if (!refUrl || !canEdit) return;
    updateProduct.mutate({
      id: productId,
      hero_image_external_url: refUrl,
      hero_image_id: null,
    });
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Bottle reference & measurements
            </CardTitle>
            <CardDescription>
              Data from the Best Bottles grid tracker. Swap the hub hero anytime; the
              website image stays the fallback reference until you replace it.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="shrink-0 w-fit">
            Tracker linked
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Catalog</h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div>
              <dt className="text-muted-foreground">Display name</dt>
              <dd>{group.display_name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Family</dt>
              <dd>{group.family}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Capacity</dt>
              <dd>
                {group.capacity_ml != null ? `${group.capacity_ml} ml` : "—"}
                {group.capacity_label ? ` (${group.capacity_label})` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Thread</dt>
              <dd>{group.thread_size || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Glass</dt>
              <dd>{group.glass_color || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Applicators</dt>
              <dd>{group.applicator_types || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Website SKU</dt>
              <dd className="font-mono text-xs">{group.primary_website_sku || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Grace SKU</dt>
              <dd className="font-mono text-xs">{group.primary_grace_sku || "—"}</dd>
            </div>
          </dl>
          {group.product_url && (
            <Button variant="link" className="px-0 h-auto mt-3" asChild>
              <a href={group.product_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Open product page (Best Bottles)
              </a>
            </Button>
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Website reference image
            </h4>
            <p className="text-xs text-muted-foreground mb-3">
              Pulled from the live catalog (tracker / scrape). Use as shape reference for
              renders; replace with a Madison hero when you have a final shot.
            </p>
            {refUrl ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-border overflow-hidden bg-muted/30 max-w-xs">
                  <img
                    src={refUrl}
                    alt={`${group.display_name} reference`}
                    className="w-full h-auto object-contain max-h-56"
                  />
                </div>
                {canEdit && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={updateProduct.isPending}
                    onClick={setHeroFromWebsite}
                  >
                    {updateProduct.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Link2 className="w-4 h-4 mr-2" />
                    )}
                    Use as Product Hub hero
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No website hero URL on this tracker row yet. Run scrape / fill from the
                pipeline page, or attach a hero from Media when ready.
              </p>
            )}
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Physical spec (geometry)</h4>
            {geo ? (
              <ul className="text-sm space-y-1.5 font-mono text-xs">
                <li>
                  Body: {geo.bodyDimensionsMm.height} × {geo.bodyDimensionsMm.width} mm
                </li>
                <li>Cap height: {geo.capHeightMm} mm</li>
                <li>Neck OD: {geo.neckOuterMm != null ? `${geo.neckOuterMm} mm` : "—"}</li>
                <li>Thread: {geo.threadSize || "—"}</li>
                <li>
                  Canvas: {geo.canonicalCanvas.widthPx} × {geo.canonicalCanvas.heightPx} px
                </li>
                <li>Bottom anchor Y: {geo.bottomAnchor.y} (±{geo.bottomAnchor.toleranceY})</li>
                {Object.keys(geo.fitmentSeatDepthMm).length > 0 && (
                  <li className="pt-1">
                    Fitment seat depths (mm):{" "}
                    {Object.entries(geo.fitmentSeatDepthMm)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("; ")}
                  </li>
                )}
                <li className="text-muted-foreground pt-1 text-[11px]">
                  {geo.source} · {geo.anchorVersion}
                </li>
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No paper-doll geometry ingested for this shape group yet. When Lane A
                ingest runs, body/neck/cap mm and canvas numbers will appear here.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
