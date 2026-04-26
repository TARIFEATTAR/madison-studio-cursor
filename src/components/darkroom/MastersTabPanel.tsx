/**
 * Masters tab content for the Best Bottles Studio. Takes the selected
 * Convex product (from the Studio's left rail) plus a user-chosen preset
 * and generates the canonical master image via `generate-madison-image`.
 *
 * The full 4-layer prompt is assembled client-side (see promptAssembler).
 * Generation goes through the same edge function as Dark Room's chip mode
 * so we inherit its proven auth + storage + library-tag path.
 */

import { useMemo, useRef, useState } from "react";
import { Loader2, Sparkles, Check, AlertCircle, Download, RotateCcw, ImageIcon, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { toast } from "@/hooks/use-toast";
import { UploadZone } from "@/components/darkroom/UploadZone";
import { ImageLibraryModal } from "@/components/image-editor/ImageLibraryModal";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LEDIndicator } from "@/components/darkroom/LEDIndicator";
import {
  DEFAULT_IMAGE_PRESET_ID,
  IMAGE_PRESET_LIST,
} from "@/config/imagePresets";

// Masters tab generates full catalog scenes (bottle + fitment + cap), so the
// paper-doll transparent-layer preset doesn't belong here — pairing it with a
// full SKU would produce a transparent image that still has a fitment baked in,
// which defeats paper-doll's purpose. Components tab is the correct home for
// that preset.
const MASTERS_PRESETS = IMAGE_PRESET_LIST.filter((p) => p.kind === "final_render");
import {
  assemblePrompt,
  type AssembledPrompt,
  type LiquidSpec,
} from "@/lib/product-image/promptAssembler";
import type { Product } from "@/integrations/convex/bestBottles";
import {
  useAssembledPromptGeneration,
  type AssembledGenerationResult,
} from "@/hooks/useAssembledPromptGeneration";

interface MastersTabPanelProps {
  /** Selected variant from the Studio's left rail. */
  selectedProduct: Product | null;
  /** Family name for Library tagging. */
  familyName?: string | null;
  /** Optional callback when a master is approved. Parent can persist. */
  onApproveMaster?: (result: AssembledGenerationResult, product: Product) => void;
}

export function MastersTabPanel({
  selectedProduct,
  familyName,
  onApproveMaster,
}: MastersTabPanelProps) {
  const [presetId, setPresetId] = useState<string>(DEFAULT_IMAGE_PRESET_ID);
  const [liquidEnabled, setLiquidEnabled] = useState(false);
  const [liquidColor, setLiquidColor] = useState("warm amber perfume");
  const [liquidFill, setLiquidFill] = useState(75);
  const [showAssembledPrompt, setShowAssembledPrompt] = useState(false);
  const [assembledCache, setAssembledCache] = useState<AssembledPrompt | null>(null);

  // Manual reference image override — bypasses Convex's legacy .gif imageUrl
  // (which OpenAI /edits rejects). Drop a PSD-rendered PNG here to anchor
  // the gpt-image-2 generation to the actual studio photography.
  // Format: { url: <usable URL>, file?: File (only when freshly uploaded), name }
  const [customReference, setCustomReference] = useState<
    { url: string; file?: File; name?: string } | null
  >(null);
  const [isUploadingRef, setIsUploadingRef] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);

  const { user } = useAuth();
  const { currentOrganizationId } = useOnboarding();
  const { generate, isGenerating, error, result, reset } = useAssembledPromptGeneration();

  /**
   * UploadZone returns either a freshly-picked File (drag-drop or browse) or
   * a ready URL (library pick). For files, we upload to Supabase Storage so
   * OpenAI /edits can fetch the reference. For library URLs, we use as-is
   * since they're already in our generated-images bucket.
   */
  const handleReferencePicked = async (img: { url: string; file?: File; name?: string }) => {
    // Library pick — already a fetchable URL
    if (!img.file) {
      setCustomReference(img);
      return;
    }
    // Fresh upload — push to Supabase Storage to get a public URL
    if (!user || !currentOrganizationId) {
      toast({
        title: "Sign-in required",
        description: "You must be signed in with an organization to upload a reference.",
        variant: "destructive",
      });
      return;
    }
    setIsUploadingRef(true);
    try {
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const ext = (img.file.name.split(".").pop() || "png").toLowerCase();
      const path = `${currentOrganizationId}/${user.id}/studio-references/${ts}_${rand}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("generated-images")
        .upload(path, img.file, {
          cacheControl: "3600",
          upsert: false,
          contentType: img.file.type || "image/png",
        });
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage
        .from("generated-images")
        .getPublicUrl(path);
      if (!urlData?.publicUrl) throw new Error("No public URL returned");
      setCustomReference({ url: urlData.publicUrl, name: img.file.name });
      toast({
        title: "Reference uploaded",
        description: "Will anchor gpt-image-2 generation for this SKU.",
      });
    } catch (e: any) {
      console.error("[MastersTabPanel] reference upload failed", e);
      toast({
        title: "Upload failed",
        description: String(e?.message || e),
        variant: "destructive",
      });
    } finally {
      setIsUploadingRef(false);
    }
  };

  const clearCustomReference = () => setCustomReference(null);

  const selectedPreset = useMemo(
    () => MASTERS_PRESETS.find((p) => p.id === presetId) ?? MASTERS_PRESETS[0],
    [presetId],
  );

  const handleAssemble = (): AssembledPrompt | null => {
    if (!selectedProduct) return null;
    const liquid: LiquidSpec | null = liquidEnabled
      ? { present: true, color: liquidColor, fillPercent: liquidFill }
      : null;
    const assembled = assemblePrompt({
      presetId,
      sku: selectedProduct,
      liquid,
    });
    setAssembledCache(assembled);
    return assembled;
  };

  const handleGenerate = async () => {
    if (!selectedProduct) return;
    const assembled = handleAssemble();
    if (!assembled) return;

    await generate(assembled, {
      // Custom upload (PSD-rendered PNG) takes priority over Convex's
      // legacy .gif imageUrl — the latter is silently dropped by the
      // unsupported-format filter in useAssembledPromptGeneration.
      referenceImageUrl: customReference?.url ?? selectedProduct.imageUrl,
      productContext: {
        name: selectedProduct.itemName,
        collection: selectedProduct.bottleCollection ?? undefined,
        category: selectedProduct.category,
      },
      // Human-readable identifiers live on library tags. sessionId is a uuid
      // column in Postgres — don't pass a string here.
      extraLibraryTags: [
        "brand:best-bottles",
        "studio-master",
        familyName ? `family:${familyName.toLowerCase().replace(/\s+/g, "-")}` : null,
        `sku:${selectedProduct.graceSku}`,
      ].filter((t): t is string => Boolean(t)),
    });
  };

  const handleApprove = () => {
    if (!result || !selectedProduct || !onApproveMaster) return;
    onApproveMaster(result, selectedProduct);
  };

  if (!selectedProduct) {
    return (
      <div
        className="text-sm space-y-3 p-6"
        style={{ color: "var(--darkroom-text-muted)" }}
      >
        <div className="flex items-center gap-2">
          <LEDIndicator state="off" />
          <span className="uppercase tracking-wider text-xs">No variant selected</span>
        </div>
        <p>Click any SKU in the left rail to load it here. The preset picker and generation controls will unlock as soon as a variant is selected.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-1">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <LEDIndicator state={isGenerating ? "processing" : error ? "error" : result ? "ready" : "off"} />
          <span className="text-xs uppercase tracking-wider" style={{ color: "var(--darkroom-text-dim)" }}>
            Selected variant
          </span>
        </div>
        <div className="font-mono text-xs" style={{ color: "var(--darkroom-accent)" }}>
          {selectedProduct.graceSku}
        </div>
        <div className="text-xs" style={{ color: "var(--darkroom-text-muted)" }}>
          {selectedProduct.itemName}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs uppercase tracking-wider" style={{ color: "var(--darkroom-text-dim)" }}>
          Preset
        </Label>
        <Select value={presetId} onValueChange={setPresetId}>
          <SelectTrigger className="bg-white/[0.03] border-white/10 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MASTERS_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.id}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs" style={{ color: "var(--darkroom-text-dim)" }}>
          {selectedPreset.purpose}
        </p>
        <p className="text-[11px]" style={{ color: "var(--darkroom-text-dim)" }}>
          Canvas: <span className="font-mono">{selectedPreset.canvas.widthPx} × {selectedPreset.canvas.heightPx}</span>
          {" · "}{selectedPreset.aspectRatio} {selectedPreset.orientation}
          {" · "}Background: <span className="font-mono">{selectedPreset.backgroundHex}</span>
        </p>
      </div>

      <div className="space-y-2 pt-1 border-t" style={{ borderColor: "var(--darkroom-border-subtle)" }}>
        <div className="flex items-center justify-between pt-2">
          <Label htmlFor="liquid-toggle" className="text-xs uppercase tracking-wider cursor-pointer" style={{ color: "var(--darkroom-text-dim)" }}>
            Liquid
          </Label>
          <Switch id="liquid-toggle" checked={liquidEnabled} onCheckedChange={setLiquidEnabled} />
        </div>
        {liquidEnabled && (
          <div className="space-y-2">
            <Textarea
              value={liquidColor}
              onChange={(e) => setLiquidColor(e.target.value)}
              className="min-h-[40px] text-xs bg-white/[0.03] border-white/10 text-white"
              placeholder="warm amber perfume"
            />
            <div className="space-y-1">
              <div className="text-[11px]" style={{ color: "var(--darkroom-text-dim)" }}>
                Fill: {liquidFill}%
              </div>
              <Slider value={[liquidFill]} onValueChange={(v) => setLiquidFill(v[0])} min={0} max={100} step={5} />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2 pt-1 border-t" style={{ borderColor: "var(--darkroom-border-subtle)" }}>
        <div className="flex items-center justify-between pt-2">
          <Label className="text-xs uppercase tracking-wider" style={{ color: "var(--darkroom-text-dim)" }}>
            Reference image (override)
          </Label>
        </div>

        <UploadZone
          type="product"
          label="Drop reference PNG here"
          description="Drag-drop, browse, or pick from Image Library — overrides Convex's legacy .gif so gpt-image-2 actually anchors to the real product photography."
          image={customReference}
          onUpload={handleReferencePicked}
          onRemove={clearCustomReference}
          onLibraryOpen={() => setIsLibraryOpen(true)}
          disabled={isUploadingRef}
        />

        {isUploadingRef && (
          <div className="flex items-center gap-2 text-[11px]" style={{ color: "var(--darkroom-text-muted)" }}>
            <Loader2 className="w-3 h-3 animate-spin" />
            Uploading reference to Supabase…
          </div>
        )}

        <ImageLibraryModal
          open={isLibraryOpen}
          onOpenChange={setIsLibraryOpen}
          onSelectImage={(img) => {
            handleReferencePicked(img);
            setIsLibraryOpen(false);
          }}
          title="Select reference image"
          libraryTagContainsAny={["brand:best-bottles", "studio-master", "paper-doll-component"]}
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex-1 bg-[var(--darkroom-accent,#B8956A)] text-black hover:bg-[var(--darkroom-accent,#B8956A)]/90"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate master
            </>
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => {
            const a = handleAssemble();
            setShowAssembledPrompt(Boolean(a));
          }}
          className="border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-white"
          title="Preview the assembled 4-layer prompt without generating"
        >
          <Wand2 className="w-4 h-4" />
        </Button>
      </div>

      {showAssembledPrompt && assembledCache && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs uppercase tracking-wider" style={{ color: "var(--darkroom-text-dim)" }}>
              Assembled prompt
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssembledPrompt(false)}
              className="h-6 text-[11px]"
            >
              Hide
            </Button>
          </div>
          <Textarea
            value={assembledCache.prompt}
            readOnly
            className="min-h-[180px] font-mono text-[10px] bg-white/[0.03] border-white/10 text-white/80"
          />
        </div>
      )}

      {error && (
        <div
          className="p-3 rounded border flex items-start gap-2 text-xs"
          style={{
            borderColor: "var(--darkroom-error)",
            color: "var(--darkroom-error)",
            background: "rgba(239, 68, 68, 0.05)",
          }}
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="space-y-3 pt-1 border-t" style={{ borderColor: "var(--darkroom-border-subtle)" }}>
          <div className="flex items-center gap-2 pt-3">
            <LEDIndicator state="ready" />
            <span className="text-xs uppercase tracking-wider" style={{ color: "var(--darkroom-text-dim)" }}>
              Generated master
            </span>
          </div>
          <div className="relative rounded border overflow-hidden" style={{ borderColor: "var(--darkroom-border-subtle)" }}>
            <img src={result.imageUrl} alt={selectedProduct.itemName} className="w-full" />
          </div>
          <div className="text-[11px] space-y-0.5" style={{ color: "var(--darkroom-text-dim)" }}>
            <div>
              Preset: <span className="font-mono">{result.presetId}</span>
            </div>
            <div>
              Canvas: <span className="font-mono">{result.canvas.widthPx} × {result.canvas.heightPx}</span> · {result.aspectRatio}
            </div>
            {result.savedImageId && (
              <div>
                Library id: <span className="font-mono">{result.savedImageId}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleApprove}
              disabled={!onApproveMaster}
              className="bg-emerald-600 text-white hover:bg-emerald-500"
              size="sm"
              title="Marks the Pipeline row for this SKU's APPLICATOR GROUP as approved — not just this specific cap colorway."
            >
              <Check className="w-3.5 h-3.5 mr-1.5" />
              Approve master
            </Button>
            <Button asChild variant="outline" size="sm" className="border-white/15 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:text-white">
              <a href={result.imageUrl} target="_blank" rel="noreferrer">
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Full size
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                setShowAssembledPrompt(false);
              }}
              className="text-white/70 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Try again
            </Button>
          </div>
          <p className="text-[10px] leading-tight pt-1" style={{ color: "var(--darkroom-text-dim)" }}>
            Approval flags the whole applicator group in the Pipeline (e.g. all 9 tassel
            colorways), not just this variant. One canonical hero per group.
          </p>
        </div>
      )}

      {!isGenerating && !result && !error && (
        <div className="pt-1 text-[11px] flex items-center gap-2" style={{ color: "var(--darkroom-text-dim)" }}>
          <ImageIcon className="w-3 h-3" />
          <span>
            Click <span className="font-medium">Generate master</span> to produce this SKU on the selected preset.
            Reference image from Convex is attached automatically.
          </span>
        </div>
      )}
    </div>
  );
}
