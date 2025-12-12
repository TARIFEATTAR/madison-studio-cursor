/**
 * Brand Quick View Panel
 * 
 * A slide-out panel that displays the brand's visual identity at a glance:
 * - Logo
 * - Color palette with swatches
 * - Typography preview
 * - Squad assignments
 * - Scan confidence
 * 
 * Following Madison design system: "Black Books & Cream Paper"
 */

import * as React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBrandDNA } from "@/hooks/useBrandDNA";
import { useOrganization } from "@/hooks/useOrganization";
import {
  Palette,
  Type,
  Users,
  Eye,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { CopySquad, VisualSquad } from "@/types/madison";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface BrandQuickViewPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function BrandQuickViewPanel({ open, onOpenChange }: BrandQuickViewPanelProps) {
  const { organization } = useOrganization();
  const { quickView, isLoading, rescan, isRescanning, hasBrandDNA, brandDNA } = useBrandDNA();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[480px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="font-serif text-xl flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            Brand DNA
          </SheetTitle>
          <SheetDescription>
            {organization?.name || "Your brand"}'s visual identity at a glance
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <BrandQuickViewSkeleton />
        ) : !hasBrandDNA ? (
          <EmptyBrandState onScan={() => rescan()} isScanning={isRescanning} />
        ) : (
          <div className="space-y-6">
            {/* Logo Section */}
            <LogoSection logoUrl={quickView?.logoUrl} />

            <Separator />

            {/* Color Palette */}
            <ColorPaletteSection
              primary={quickView?.colors?.primary}
              secondary={quickView?.colors?.secondary}
              accent={quickView?.colors?.accent}
              palette={quickView?.colors?.palette}
            />

            <Separator />

            {/* Typography */}
            <TypographySection
              headline={quickView?.typography?.headline}
              body={quickView?.typography?.body}
            />

            <Separator />

            {/* Squad Assignments */}
            <SquadSection
              copySquad={quickView?.copySquad}
              visualSquad={quickView?.visualSquad}
              tone={quickView?.tone}
            />

            <Separator />

            {/* Keywords */}
            {quickView?.keywords && quickView.keywords.length > 0 && (
              <>
                <KeywordsSection keywords={quickView.keywords} />
                <Separator />
              </>
            )}

            {/* Scan Info & Actions */}
            <ScanInfoSection
              confidence={quickView?.scanConfidence}
              lastScanned={quickView?.lastScanned}
              scanMethod={brandDNA?.scan_method}
              onRescan={() => rescan()}
              isRescanning={isRescanning}
            />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function LogoSection({ logoUrl }: { logoUrl?: string }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        Logo
      </h3>
      <div className="flex items-center justify-center p-6 bg-card border border-border rounded-lg">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Brand logo"
            className="max-h-16 max-w-[200px] object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="text-muted-foreground text-sm">No logo available</div>
        )}
      </div>
    </div>
  );
}

function ColorPaletteSection({
  primary,
  secondary,
  accent,
  palette,
}: {
  primary?: string;
  secondary?: string;
  accent?: string;
  palette?: string[];
}) {
  const copyColor = (color: string, name: string) => {
    navigator.clipboard.writeText(color);
    toast.success(`${name} color copied: ${color}`);
  };

  const mainColors = [
    { name: "Primary", color: primary },
    { name: "Secondary", color: secondary },
    { name: "Accent", color: accent },
  ].filter((c) => c.color);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Palette className="h-4 w-4" />
        Color Palette
      </h3>

      {/* Main Colors */}
      <div className="grid grid-cols-3 gap-3">
        {mainColors.map(({ name, color }) => (
          <TooltipProvider key={name}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => copyColor(color!, name)}
                  className="group flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full aspect-square rounded-lg border border-border shadow-level-1 transition-all group-hover:shadow-level-2 group-hover:scale-105"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-muted-foreground">{name}</span>
                  <span className="text-xs font-mono text-foreground/70">{color}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to copy {color}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Extended Palette */}
      {palette && palette.length > 3 && (
        <div className="mt-3">
          <p className="text-xs text-muted-foreground mb-2">Extended Palette</p>
          <div className="flex flex-wrap gap-2">
            {palette.slice(3).map((color, i) => (
              <TooltipProvider key={i}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => copyColor(color, `Color ${i + 4}`)}
                      className="w-8 h-8 rounded-md border border-border shadow-level-1 hover:shadow-level-2 transition-all hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{color}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TypographySection({
  headline,
  body,
}: {
  headline?: string;
  body?: string;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Type className="h-4 w-4" />
        Typography
      </h3>

      <div className="space-y-4">
        {headline && (
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Headlines</p>
            <p
              className="text-2xl font-semibold"
              style={{ fontFamily: `"${headline}", serif` }}
            >
              {headline}
            </p>
          </div>
        )}

        {body && (
          <div className="p-4 bg-card border border-border rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Body</p>
            <p
              className="text-base"
              style={{ fontFamily: `"${body}", sans-serif` }}
            >
              {body}
            </p>
            <p
              className="text-sm text-muted-foreground mt-2"
              style={{ fontFamily: `"${body}", sans-serif` }}
            >
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function SquadSection({
  copySquad,
  visualSquad,
  tone,
}: {
  copySquad?: CopySquad | null;
  visualSquad?: VisualSquad | null;
  tone?: string;
}) {
  const squadLabels: Record<string, { label: string; description: string }> = {
    THE_SCIENTISTS: {
      label: "The Scientists",
      description: "Data-driven, specific, proof-based copy",
    },
    THE_STORYTELLERS: {
      label: "The Storytellers",
      description: "Romantic, sensory, narrative-driven copy",
    },
    THE_DISRUPTORS: {
      label: "The Disruptors",
      description: "Bold, pattern-breaking, attention-grabbing",
    },
    THE_MINIMALISTS: {
      label: "The Minimalists",
      description: "Clean, clinical, white-space focused visuals",
    },
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Users className="h-4 w-4" />
        Squad Assignments
      </h3>

      <div className="space-y-3">
        {copySquad && (
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Copy Squad</p>
              <p className="font-medium">{squadLabels[copySquad]?.label || copySquad}</p>
            </div>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {copySquad.replace("THE_", "")}
            </Badge>
          </div>
        )}

        {visualSquad && (
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Visual Squad</p>
              <p className="font-medium">{squadLabels[visualSquad]?.label || visualSquad}</p>
            </div>
            <Badge variant="outline" className="bg-secondary/10 text-secondary-foreground border-secondary/20">
              {visualSquad.replace("THE_", "")}
            </Badge>
          </div>
        )}

        {tone && (
          <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
            <div>
              <p className="text-xs text-muted-foreground">Brand Tone</p>
              <p className="font-medium capitalize">{tone}</p>
            </div>
            <Badge variant="secondary">{tone}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

function KeywordsSection({ keywords }: { keywords: string[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Keywords</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.map((keyword, i) => (
          <Badge key={i} variant="outline" className="text-xs">
            {keyword}
          </Badge>
        ))}
      </div>
    </div>
  );
}

function ScanInfoSection({
  confidence,
  lastScanned,
  scanMethod,
  onRescan,
  isRescanning,
}: {
  confidence?: number;
  lastScanned?: string;
  scanMethod?: string;
  onRescan: () => void;
  isRescanning: boolean;
}) {
  const confidencePercent = confidence ? Math.round(confidence * 100) : null;
  const formattedDate = lastScanned
    ? new Date(lastScanned).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Eye className="h-4 w-4" />
        Scan Details
      </h3>

      <div className="space-y-2 text-sm">
        {confidencePercent !== null && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Confidence</span>
            <div className="flex items-center gap-2">
              {confidencePercent >= 80 ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              )}
              <span className="font-medium">{confidencePercent}%</span>
            </div>
          </div>
        )}

        {formattedDate && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Last Scanned</span>
            <span>{formattedDate}</span>
          </div>
        )}

        {scanMethod && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Method</span>
            <Badge variant="outline" className="text-xs">
              {scanMethod.replace(/_/g, " ")}
            </Badge>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full mt-2"
        onClick={onRescan}
        disabled={isRescanning}
      >
        {isRescanning ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4 mr-2" />
            Rescan Brand
          </>
        )}
      </Button>
    </div>
  );
}

function EmptyBrandState({
  onScan,
  isScanning,
}: {
  onScan: () => void;
  isScanning: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Palette className="h-12 w-12 text-muted-foreground/50 mb-4" />
      <h3 className="font-serif text-lg font-semibold mb-2">No Brand DNA Yet</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-[280px]">
        Scan your website or upload brand guidelines to extract your visual identity.
      </p>
      <Button onClick={onScan} disabled={isScanning}>
        {isScanning ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Scanning...
          </>
        ) : (
          <>
            <ExternalLink className="h-4 w-4 mr-2" />
            Scan Website
          </>
        )}
      </Button>
    </div>
  );
}

function BrandQuickViewSkeleton() {
  return (
    <div className="space-y-6">
      {/* Logo skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      <Separator />

      {/* Colors skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      </div>

      <Separator />

      {/* Typography skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>

      <Separator />

      {/* Squads skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default BrandQuickViewPanel;






