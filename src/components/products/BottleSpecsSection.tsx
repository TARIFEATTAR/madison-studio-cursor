/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * BOTTLE SPECS SECTION
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Packaging-tailored Product Hub section for bottle/glass packaging companies.
 * Best Bottles is the anchor tenant.
 *
 * Field framework derived from technical-sheet conventions used by major glass
 * packaging manufacturers (Verescence, Saverglass, Pochet, Bormioli Luigi,
 * SGD Pharma, Heinz Glas, Stoelzle) and buyer marketplaces (Berlin Packaging,
 * O.Berk). Includes ISO/CETIE/FEA standards references and sustainability
 * disclosures that have become standard since 2023.
 *
 * Reads from product_hubs.metadata.bottle_specs. Empty fields render "—" in
 * read mode and become inline form inputs in edit mode, so the section doubles
 * as a fillable spec-sheet template.
 *
 * In editing mode, every field write produces a new metadata object and calls
 * onChange("metadata", newMetadata) — matching the same (field, value)
 * convention used by VariantsSection so it slots into ProductHub's existing
 * editedProduct state without special wiring.
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { createContext, useCallback, useContext, useMemo } from "react";
import {
  Beaker,
  Ruler,
  Package2,
  Tag,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertCircle,
  Hash,
  Leaf,
  Factory,
  Truck,
  Shield,
  Palette,
  Award,
  Droplet,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface BottleSpecs {
  family?: string | null;
  shape?: string | null;
  glass_color?: string | null;

  capacity?: {
    ml?: number | null;
    oz?: number | null;
    display?: string | null;
    brimful_ml?: number | null;
    fill_ml?: number | null;
  };

  neck_thread?: string | null;
  neck?: {
    finish_code?: string | null;
    standard?: "SPI" | "CETIE" | "FEA" | "GPI" | "Crimp" | "Snap" | string | null;
    inner_diameter_mm?: number | null;
    outer_diameter_mm?: number | null;
    cetie_reference?: string | null;
    fea_reference?: string | null;
  };

  applicator?: string | null;
  available_applicators?: string[];
  ball_material?: string | null;

  cap?: {
    color?: string | null;
    trim_color?: string | null;
    style?: string | null;
    height?: string | null;
  };

  physical?: {
    height_with_cap_mm?: number | null;
    height_without_cap_mm?: number | null;
    diameter_mm?: number | null;
    base_diameter_mm?: number | null;
    shoulder_height_mm?: number | null;
    wall_thickness_mm?: number | null;
    weight_g?: number | null;
    filled_weight_g?: number | null;
  };

  schematic?: {
    profile?: string | null;
    base_shape?: string | null;
    body_taper?: string | null;
    bounding_box_mm?: {
      width?: number | null;
      depth?: number | null;
      height_with_cap?: number | null;
      height_without_cap?: number | null;
    };
    heights_mm?: {
      base?: number | null;
      body_start?: number | null;
      body_max_diameter?: number | null;
      shoulder_start?: number | null;
      shoulder_end?: number | null;
      neck?: number | null;
      cap?: number | null;
    };
    diameters_mm?: {
      base?: number | null;
      body_min?: number | null;
      body_max?: number | null;
      shoulder?: number | null;
      neck_outer?: number | null;
      neck_inner_bore?: number | null;
      cap_max?: number | null;
    };
    widths_mm?: {
      base_w?: number | null;
      base_d?: number | null;
      body_max_w?: number | null;
      body_max_d?: number | null;
      shoulder_w?: number | null;
      shoulder_d?: number | null;
    };
    radii_mm?: {
      heel?: number | null;
      shoulder?: number | null;
      neck_transition?: number | null;
      corner?: number | null;
    };
    wall_thickness_mm?: {
      base?: number | null;
      body?: number | null;
      shoulder?: number | null;
      neck?: number | null;
    };
    draft_angle_degrees?: number | null;
    ratios?: {
      aspect_ratio?: number | null;
      cap_to_bottle?: number | null;
      neck_to_body?: number | null;
      shoulder_to_body?: number | null;
    };
    reference_orientation?: string | null;
    schematic_drawing_url?: string | null;
    cad_file_url?: string | null;
    reference_photo_urls?: string[];
    measurement_notes?: string | null;
  };

  material?: {
    type?: string | null;
    family?: string | null;
    lead_free?: boolean | null;
    cadmium_free?: boolean | null;
  };

  manufacturing?: {
    process?: string | null;
    cavity_count?: number | null;
    mold_reference?: string | null;
    factory_origin?: string | null;
  };

  packaging?: {
    case_quantity?: number | null;
    units_per_inner_carton?: number | null;
    cartons_per_pallet?: number | null;
    units_per_pallet?: number | null;
    pallet_standard?: string | null;
    pallet_height_mm?: number | null;
    gross_pallet_weight_kg?: number | null;
    gtin?: string | null;
    ean?: string | null;
    upc?: string | null;
    moq?: number | null;
    lead_time_days?: number | null;
    assembly_type?: string | null;
    component_group?: string | null;
    bottle_collection?: string | null;
    fitment_status?: string | null;
  };

  sustainability?: {
    pcr_content_percent?: number | null;
    cullet_ratio_percent?: number | null;
    recyclable?: boolean | null;
    carbon_footprint_kg_co2e?: number | null;
    lightweighting?: boolean | null;
    ecovadis_rating?: string | null;
  };

  decoration?: {
    available_finishes?: string[];
    compatible_methods?: string[];
    max_print_area_mm?: { width?: number | null; height?: number | null };
  };

  compatibility?: {
    compatible_closures?: string[];
    compatible_pumps?: string[];
    dip_tube_length_mm?: number | null;
  };

  roll_on?: {
    ball_diameter_mm?: number | null;
    ball_material?: string | null;
    fitment_material?: string | null;
    fitment_retention_force_n?: number | null;
  };

  regulatory?: {
    iso_certifications?: string[];
    fda_contact_safe?: boolean | null;
    eu_cosmetics_compliant?: boolean | null;
    reach_compliant?: boolean | null;
    prop_65?: string | null;
    child_resistant?: boolean | null;
    tamper_evident?: boolean | null;
    bpa_free?: boolean | null;
  };

  external_refs?: {
    grace_sku?: string | null;
    website_sku?: string | null;
    product_id?: string | null;
    image_url?: string | null;
    product_url?: string | null;
    data_grade?: string | null;
    verified?: boolean | null;
  };

  variant_count?: number | null;
  primary_grace_sku?: string | null;
  primary_website_sku?: string | null;
}

interface BottleSpecsSectionProps {
  product: {
    metadata?: { bottle_specs?: BottleSpecs } | string | null;
  };
  isEditing?: boolean;
  /** Matches ProductHub's pattern: onChange("metadata", newMetadataObject) */
  onChange?: (field: string, value: unknown) => void;
}

// ─── Edit context (so deeply-nested cards can dispatch updates) ───────────────

interface EditCtxValue {
  isEditing: boolean;
  /** Update a path under bottle_specs, e.g. "schematic.heights_mm.base" */
  update: (path: string, value: unknown) => void;
}
const EditCtx = createContext<EditCtxValue>({ isEditing: false, update: () => {} });
const useEditCtx = () => useContext(EditCtx);

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseSpecs(metadata: BottleSpecsSectionProps["product"]["metadata"]): BottleSpecs | null {
  if (!metadata) return null;
  const m = typeof metadata === "string" ? safeJsonParse(metadata) : metadata;
  return ((m as Record<string, unknown> | null)?.bottle_specs as BottleSpecs) ?? null;
}

function safeJsonParse(s: string): Record<string, unknown> | null {
  try { return JSON.parse(s); } catch { return null; }
}

/** Deep-clone-and-set a value at a dot-path. Returns the new root object. */
function setIn(root: Record<string, unknown>, path: string[], value: unknown): Record<string, unknown> {
  if (path.length === 0) return root;
  const out: Record<string, unknown> = Array.isArray(root) ? [...(root as unknown[])] as unknown as Record<string, unknown> : { ...root };
  const [head, ...rest] = path;
  if (rest.length === 0) {
    out[head] = value;
  } else {
    const child = (out[head] && typeof out[head] === "object") ? (out[head] as Record<string, unknown>) : {};
    out[head] = setIn(child, rest, value);
  }
  return out;
}

/** Parse a number-like input string. Returns null for empty / NaN. */
function parseNumLike(s: string): number | null {
  const t = s.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

// ─── Read-only display helpers ───────────────────────────────────────────────

/** Read-only label/value pair */
function ReadField({
  label, value, unit, mono = false, badge = false,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  mono?: boolean;
  badge?: boolean;
}) {
  const empty = value === null || value === undefined || value === "";
  const display = empty ? null : `${value}${unit ? ` ${unit}` : ""}`;
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      {empty ? (
        <span className="text-sm text-muted-foreground/40">—</span>
      ) : badge ? (
        <Badge variant="secondary" className="w-fit">{display}</Badge>
      ) : (
        <span className={cn("text-sm font-medium", mono && "font-mono")}>{display}</span>
      )}
    </div>
  );
}

// ─── Editable field components ───────────────────────────────────────────────

/**
 * Field that renders as a labeled value when not editing, and as a labeled
 * input when editing. `path` is the dot-path under bottle_specs.
 */
function Field({
  label,
  value,
  path,
  type = "text",
  unit,
  mono = false,
  badge = false,
  placeholder,
}: {
  label: string;
  value: string | number | null | undefined;
  path?: string;
  type?: "text" | "number" | "url";
  unit?: string;
  mono?: boolean;
  badge?: boolean;
  placeholder?: string;
}) {
  const { isEditing, update } = useEditCtx();
  const labelWithUnit = unit ? `${label} (${unit})` : label;

  if (!isEditing || !path) {
    return <ReadField label={labelWithUnit} value={value} mono={mono} badge={badge} />;
  }

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
        {labelWithUnit}
      </Label>
      <Input
        type={type}
        defaultValue={value ?? ""}
        placeholder={placeholder ?? "—"}
        className={cn("h-9", mono && "font-mono")}
        onBlur={(e) => {
          const raw = e.target.value;
          const v = type === "number" ? parseNumLike(raw) : raw === "" ? null : raw;
          update(path, v);
        }}
      />
    </div>
  );
}

/** Select for enum-style fields */
function SelectField({
  label, value, path, options, placeholder,
}: {
  label: string;
  value: string | null | undefined;
  path: string;
  options: string[];
  placeholder?: string;
}) {
  const { isEditing, update } = useEditCtx();

  if (!isEditing) return <ReadField label={label} value={value} badge />;

  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Select
        defaultValue={value ?? ""}
        onValueChange={(v) => update(path, v === "__none__" ? null : v)}
      >
        <SelectTrigger className="h-9">
          <SelectValue placeholder={placeholder ?? "Select..."} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">— (clear)</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/** Boolean field — Yes/No badges in read mode, Switch in edit mode */
function BoolField({
  label, value, path, trueLabel = "Yes", falseLabel = "No",
}: {
  label: string;
  value: boolean | null | undefined;
  path?: string;
  trueLabel?: string;
  falseLabel?: string;
}) {
  const { isEditing, update } = useEditCtx();

  if (!isEditing || !path) {
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        {value === true ? (
          <Badge variant="secondary" className="w-fit gap-1 bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3" />{trueLabel}
          </Badge>
        ) : value === false ? (
          <Badge variant="secondary" className="w-fit gap-1 bg-amber-100 text-amber-700">
            <AlertCircle className="w-3 h-3" />{falseLabel}
          </Badge>
        ) : (
          <span className="text-sm text-muted-foreground/40">—</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <div className="flex items-center gap-3 h-9">
        <Switch
          checked={value === true}
          onCheckedChange={(checked) => update(path, checked)}
        />
        <span className="text-sm text-muted-foreground">
          {value === true ? trueLabel : value === false ? falseLabel : "Not set"}
        </span>
      </div>
    </div>
  );
}

/** Array of strings as badges; comma-separated input in edit mode */
function ArrayField({
  label, values, path, emptyMessage = "—", placeholder,
}: {
  label: string;
  values: string[] | undefined | null;
  path?: string;
  emptyMessage?: string;
  placeholder?: string;
}) {
  const { isEditing, update } = useEditCtx();

  if (!isEditing || !path) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
        {values && values.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {values.map((v) => <Badge key={v} variant="secondary">{v}</Badge>)}
          </div>
        ) : (
          <span className="text-sm text-muted-foreground/40">{emptyMessage}</span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">
        {label} <span className="text-muted-foreground/60 normal-case font-normal">(comma-separated)</span>
      </Label>
      <Input
        defaultValue={values?.join(", ") ?? ""}
        placeholder={placeholder ?? "value 1, value 2, value 3"}
        className="h-9"
        onBlur={(e) => {
          const parsed = e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);
          update(path, parsed.length > 0 ? parsed : null);
        }}
      />
    </div>
  );
}

/** Textarea field for longer notes */
function NotesField({ label, value, path, placeholder }: {
  label: string; value: string | null | undefined; path: string; placeholder?: string;
}) {
  const { isEditing, update } = useEditCtx();
  if (!isEditing) {
    return value
      ? <div className="text-xs text-muted-foreground italic">{value}</div>
      : <div className="text-xs text-muted-foreground/40">{placeholder ?? "—"}</div>;
  }
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
      <Textarea
        defaultValue={value ?? ""}
        placeholder={placeholder ?? "Calibration notes, measurement methodology, etc."}
        rows={2}
        onBlur={(e) => update(path, e.target.value || null)}
      />
    </div>
  );
}

// ─── Section card wrapper ────────────────────────────────────────────────────

function SpecCard({ title, icon: Icon, description, children }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Icon className="w-4 h-4" />
          {title}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BottleSpecsSection({ product, isEditing = false, onChange }: BottleSpecsSectionProps) {
  const specs = parseSpecs(product?.metadata);

  // Build an updateSpec function bound to the current product metadata.
  // Each call deep-merges the change into metadata.bottle_specs and pushes
  // the new metadata back via onChange("metadata", newMeta).
  const update = useCallback(
    (path: string, value: unknown) => {
      if (!onChange) return;
      const currentMeta =
        (typeof product?.metadata === "string" ? safeJsonParse(product.metadata) : product?.metadata) ?? {};
      const newMeta = setIn(
        currentMeta as Record<string, unknown>,
        ["bottle_specs", ...path.split(".")],
        value,
      );
      onChange("metadata", newMeta);
    },
    [product?.metadata, onChange],
  );

  const ctx = useMemo<EditCtxValue>(() => ({ isEditing, update }), [isEditing, update]);

  if (!specs && !isEditing) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">
              No bottle specs found. Click <strong>Edit</strong> to fill in manually, or import via{" "}
              <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                scripts/import-bestbottles-catalog.ts
              </code>.
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Safe defaults so editing a brand-new spec works
  const s = specs ?? {};
  const cap = s.cap ?? {};
  const physical = s.physical ?? {};
  const neck = s.neck ?? {};
  const material = s.material ?? {};
  const manufacturing = s.manufacturing ?? {};
  const packaging = s.packaging ?? {};
  const sustainability = s.sustainability ?? {};
  const decoration = s.decoration ?? {};
  const compatibility = s.compatibility ?? {};
  const rollOn = s.roll_on ?? {};
  const regulatory = s.regulatory ?? {};
  const refs = s.external_refs ?? {};
  const schematic = s.schematic ?? {};
  const sBox = schematic.bounding_box_mm ?? {};
  const sH = schematic.heights_mm ?? {};
  const sD = schematic.diameters_mm ?? {};
  const sW = schematic.widths_mm ?? {};
  const sR = schematic.radii_mm ?? {};
  const sWT = schematic.wall_thickness_mm ?? {};
  const sRatios = schematic.ratios ?? {};

  const isRollOn =
    !!(rollOn.ball_diameter_mm || rollOn.ball_material ||
      (s.applicator && /roll/i.test(s.applicator)) ||
      (s.available_applicators ?? []).some((a) => /roll/i.test(a))) ||
    isEditing; // always show in edit mode so user can add roll-on data

  return (
    <EditCtx.Provider value={ctx}>
      <div className="space-y-6">

        {/* IDENTITY */}
        <SpecCard title="Bottle Identity" icon={Tag} description="The vessel itself — shape and family">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="Family" value={s.family} path="family" badge />
            <Field label="Shape" value={s.shape} path="shape" />
            <Field label="Glass Color" value={s.glass_color} path="glass_color" />
            <Field label="Bottle Collection" value={packaging.bottle_collection} path="packaging.bottle_collection" />
            <Field label="Component Group" value={packaging.component_group} path="packaging.component_group" />
            <Field label="Variants Available" value={s.variant_count} type="number" path="variant_count" />
          </div>
        </SpecCard>

        {/* CAPACITY */}
        <SpecCard
          title="Capacity"
          icon={Beaker}
          description="Labeled, overflow (brimful), and working fill capacity"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Labeled / Nominal" value={s.capacity?.display} path="capacity.display" />
            <Field label="ml" value={s.capacity?.ml} path="capacity.ml" type="number" mono />
            <Field label="fl oz" value={s.capacity?.oz} path="capacity.oz" type="number" mono />
            <Field label="Brimful (overflow)" value={s.capacity?.brimful_ml} path="capacity.brimful_ml" type="number" unit="ml" mono />
            <Field label="Fill (to headspace)" value={s.capacity?.fill_ml} path="capacity.fill_ml" type="number" unit="ml" mono />
          </div>
        </SpecCard>

        {/* NECK & THREAD */}
        <SpecCard
          title="Neck & Thread Finish"
          icon={Ruler}
          description="Industry standards: CETIE (Europe), SPI/GPI (US), FEA (fragrance pumps)"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Finish Code" value={neck.finish_code ?? s.neck_thread} path="neck.finish_code" mono badge />
            <SelectField label="Standard" value={neck.standard} path="neck.standard" options={["SPI", "GPI", "CETIE", "FEA", "Crimp", "Snap"]} />
            <Field label="Bore (Inner Ø)" value={neck.inner_diameter_mm} path="neck.inner_diameter_mm" type="number" unit="mm" mono />
            <Field label="Outer Ø" value={neck.outer_diameter_mm} path="neck.outer_diameter_mm" type="number" unit="mm" mono />
            <Field label="CETIE Ref." value={neck.cetie_reference} path="neck.cetie_reference" mono />
            <Field label="FEA Ref." value={neck.fea_reference} path="neck.fea_reference" mono />
          </div>
        </SpecCard>

        {/* PHYSICAL DIMENSIONS */}
        <SpecCard title="Physical Dimensions" icon={Ruler} description="Quick-reference dimensions; see Schematic for full envelope">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Height (with cap)" value={physical.height_with_cap_mm} path="physical.height_with_cap_mm" type="number" unit="mm" mono />
            <Field label="Height (no cap)" value={physical.height_without_cap_mm} path="physical.height_without_cap_mm" type="number" unit="mm" mono />
            <Field label="Body Ø (max)" value={physical.diameter_mm} path="physical.diameter_mm" type="number" unit="mm" mono />
            <Field label="Base Ø" value={physical.base_diameter_mm} path="physical.base_diameter_mm" type="number" unit="mm" mono />
            <Field label="Shoulder Height" value={physical.shoulder_height_mm} path="physical.shoulder_height_mm" type="number" unit="mm" mono />
            <Field label="Wall Thickness" value={physical.wall_thickness_mm} path="physical.wall_thickness_mm" type="number" unit="mm" mono />
            <Field label="Weight (empty)" value={physical.weight_g} path="physical.weight_g" type="number" unit="g" mono />
            <Field label="Weight (filled)" value={physical.filled_weight_g} path="physical.filled_weight_g" type="number" unit="g" mono />
          </div>
        </SpecCard>

        {/* SCHEMATIC / AI IMAGE-GEN REFERENCE */}
        <SpecCard
          title="Schematic Dimensions"
          icon={Ruler}
          description="Full schematic detail — feeds the AI image-generation pipeline. Empty fields are part of the spec checklist."
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <SelectField label="Profile" value={schematic.profile} path="schematic.profile"
                options={["Cylindrical", "Square-Section", "Rectangular-Section", "Oval", "Tapered", "Hourglass", "Freeform"]} />
              <SelectField label="Base Shape" value={schematic.base_shape} path="schematic.base_shape"
                options={["Round", "Square", "Rectangular", "Oval", "Hexagonal", "Octagonal", "Freeform"]} />
              <SelectField label="Body Taper" value={schematic.body_taper} path="schematic.body_taper"
                options={["Straight", "Tapered-In", "Tapered-Out", "Curved", "Hourglass"]} />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Bounding Envelope (W × D × H)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Width (X)" value={sBox.width} path="schematic.bounding_box_mm.width" type="number" unit="mm" mono />
                <Field label="Depth (Z)" value={sBox.depth} path="schematic.bounding_box_mm.depth" type="number" unit="mm" mono />
                <Field label="Height — with cap (Y)" value={sBox.height_with_cap ?? physical.height_with_cap_mm} path="schematic.bounding_box_mm.height_with_cap" type="number" unit="mm" mono />
                <Field label="Height — no cap (Y)" value={sBox.height_without_cap ?? physical.height_without_cap_mm} path="schematic.bounding_box_mm.height_without_cap" type="number" unit="mm" mono />
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Heights at Landmarks (mm from base)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Base thickness" value={sH.base} path="schematic.heights_mm.base" type="number" unit="mm" mono />
                <Field label="Body start" value={sH.body_start} path="schematic.heights_mm.body_start" type="number" unit="mm" mono />
                <Field label="Body max-Ø height" value={sH.body_max_diameter} path="schematic.heights_mm.body_max_diameter" type="number" unit="mm" mono />
                <Field label="Shoulder start" value={sH.shoulder_start} path="schematic.heights_mm.shoulder_start" type="number" unit="mm" mono />
                <Field label="Shoulder end" value={sH.shoulder_end} path="schematic.heights_mm.shoulder_end" type="number" unit="mm" mono />
                <Field label="Neck length" value={sH.neck} path="schematic.heights_mm.neck" type="number" unit="mm" mono />
                <Field label="Cap height" value={sH.cap} path="schematic.heights_mm.cap" type="number" unit="mm" mono />
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Diameters at Landmarks (cylindrical bottles)</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Base Ø" value={sD.base ?? physical.base_diameter_mm} path="schematic.diameters_mm.base" type="number" unit="mm" mono />
                <Field label="Body min Ø" value={sD.body_min} path="schematic.diameters_mm.body_min" type="number" unit="mm" mono />
                <Field label="Body max Ø" value={sD.body_max ?? physical.diameter_mm} path="schematic.diameters_mm.body_max" type="number" unit="mm" mono />
                <Field label="Shoulder Ø" value={sD.shoulder} path="schematic.diameters_mm.shoulder" type="number" unit="mm" mono />
                <Field label="Neck outer Ø" value={sD.neck_outer ?? neck.outer_diameter_mm} path="schematic.diameters_mm.neck_outer" type="number" unit="mm" mono />
                <Field label="Bore (neck inner Ø)" value={sD.neck_inner_bore ?? neck.inner_diameter_mm} path="schematic.diameters_mm.neck_inner_bore" type="number" unit="mm" mono />
                <Field label="Cap max Ø" value={sD.cap_max} path="schematic.diameters_mm.cap_max" type="number" unit="mm" mono />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Width × Depth at Landmarks (square / rectangular / oval bottles)</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Field label="Base width" value={sW.base_w} path="schematic.widths_mm.base_w" type="number" unit="mm" mono />
                <Field label="Base depth" value={sW.base_d} path="schematic.widths_mm.base_d" type="number" unit="mm" mono />
                <div /> {/* spacer */}
                <Field label="Body max width" value={sW.body_max_w} path="schematic.widths_mm.body_max_w" type="number" unit="mm" mono />
                <Field label="Body max depth" value={sW.body_max_d} path="schematic.widths_mm.body_max_d" type="number" unit="mm" mono />
                <div /> {/* spacer */}
                <Field label="Shoulder width" value={sW.shoulder_w} path="schematic.widths_mm.shoulder_w" type="number" unit="mm" mono />
                <Field label="Shoulder depth" value={sW.shoulder_d} path="schematic.widths_mm.shoulder_d" type="number" unit="mm" mono />
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Transition Radii</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Heel (base→body)" value={sR.heel} path="schematic.radii_mm.heel" type="number" unit="mm" mono />
                <Field label="Shoulder (body→shoulder)" value={sR.shoulder} path="schematic.radii_mm.shoulder" type="number" unit="mm" mono />
                <Field label="Neck (shoulder→neck)" value={sR.neck_transition} path="schematic.radii_mm.neck_transition" type="number" unit="mm" mono />
                <Field label="Corner (square/rect)" value={sR.corner} path="schematic.radii_mm.corner" type="number" unit="mm" mono />
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Wall Thickness at Landmarks</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Base" value={sWT.base ?? physical.wall_thickness_mm} path="schematic.wall_thickness_mm.base" type="number" unit="mm" mono />
                <Field label="Body" value={sWT.body} path="schematic.wall_thickness_mm.body" type="number" unit="mm" mono />
                <Field label="Shoulder" value={sWT.shoulder} path="schematic.wall_thickness_mm.shoulder" type="number" unit="mm" mono />
                <Field label="Neck" value={sWT.neck} path="schematic.wall_thickness_mm.neck" type="number" unit="mm" mono />
              </div>
            </div>

            <Separator />

            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-2 font-medium">Proportions & Manufacturing</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label="Aspect ratio (H:W)" value={sRatios.aspect_ratio} path="schematic.ratios.aspect_ratio" type="number" mono />
                <Field label="Cap-to-bottle ratio" value={sRatios.cap_to_bottle} path="schematic.ratios.cap_to_bottle" type="number" mono />
                <Field label="Neck-to-body ratio" value={sRatios.neck_to_body} path="schematic.ratios.neck_to_body" type="number" mono />
                <Field label="Shoulder-to-body ratio" value={sRatios.shoulder_to_body} path="schematic.ratios.shoulder_to_body" type="number" mono />
                <Field label="Draft angle" value={schematic.draft_angle_degrees} path="schematic.draft_angle_degrees" type="number" unit="°" mono />
                <SelectField label="Reference orientation" value={schematic.reference_orientation} path="schematic.reference_orientation"
                  options={["Front", "3/4", "Side", "Top", "Back"]} />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Reference Assets (for AI image generation grounding)</div>
              <Field label="Technical drawing URL (CAD/PDF)" value={schematic.schematic_drawing_url} path="schematic.schematic_drawing_url" type="url" placeholder="https://..." />
              <Field label="3D model URL (STEP / OBJ / GLB)" value={schematic.cad_file_url} path="schematic.cad_file_url" type="url" placeholder="https://..." />
              <ArrayField label="Reference photo URLs" values={schematic.reference_photo_urls} path="schematic.reference_photo_urls" placeholder="https://..., https://..." />
              <NotesField label="Measurement notes" value={schematic.measurement_notes} path="schematic.measurement_notes" placeholder="Calibration methodology, tolerances, instrument used..." />

              {!isEditing && schematic.schematic_drawing_url && (
                <a href={schematic.schematic_drawing_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />Open technical drawing
                </a>
              )}
              {!isEditing && schematic.cad_file_url && (
                <a href={schematic.cad_file_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <ExternalLink className="w-4 h-4" />Open 3D model
                </a>
              )}
            </div>
          </div>
        </SpecCard>

        {/* MATERIAL */}
        <SpecCard title="Material" icon={Droplet} description="Glass family and certifications">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <SelectField label="Glass Type" value={material.type} path="material.type"
              options={["Soda-Lime", "Extra-Flint", "Crystal", "Borosilicate", "Type I", "Type II", "Type III"]} />
            <Field label="Glass Family" value={material.family} path="material.family" />
            <div /> {/* spacer */}
            <BoolField label="Lead-Free" value={material.lead_free} path="material.lead_free" />
            <BoolField label="Cadmium-Free" value={material.cadmium_free} path="material.cadmium_free" />
          </div>
        </SpecCard>

        {/* MANUFACTURING */}
        <SpecCard title="Manufacturing" icon={Factory} description="Process: NNPB / BB / P&B (per Verescence/Pochet conventions)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SelectField label="Process" value={manufacturing.process} path="manufacturing.process"
              options={["NNPB", "BB", "P&B", "Hand-Blown"]} />
            <Field label="Cavity Count" value={manufacturing.cavity_count} path="manufacturing.cavity_count" type="number" mono />
            <Field label="Mold Reference" value={manufacturing.mold_reference} path="manufacturing.mold_reference" mono />
            <Field label="Factory Origin" value={manufacturing.factory_origin} path="manufacturing.factory_origin" />
          </div>
        </SpecCard>

        {/* APPLICATORS / CAP — hub-level summary */}
        <SpecCard
          title="Applicators & Caps"
          icon={Layers}
          description="Configuration options. Per-SKU details live in the Variants tab."
        >
          <div className="space-y-4">
            <ArrayField label="Available Applicators" values={s.available_applicators} path="available_applicators" emptyMessage="No applicator variants" />
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Default Applicator" value={s.applicator} path="applicator" />
              <Field label="Cap Style (default)" value={cap.style} path="cap.style" />
              <Field label="Cap Color (default)" value={cap.color} path="cap.color" />
              <Field label="Cap Height (default)" value={cap.height} path="cap.height" />
              <Field label="Trim Color" value={cap.trim_color} path="cap.trim_color" />
              <Field label="Ball Material" value={s.ball_material} path="ball_material" />
            </div>
          </div>
        </SpecCard>

        {/* ROLL-ON specifics */}
        {isRollOn && (
          <SpecCard title="Roll-On Specifics" icon={Droplet} description="Ball, fitment, dispense characteristics">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Field label="Ball Ø" value={rollOn.ball_diameter_mm} path="roll_on.ball_diameter_mm" type="number" unit="mm" mono />
              <SelectField label="Ball Material" value={rollOn.ball_material} path="roll_on.ball_material"
                options={["Stainless Steel", "Glass", "Plastic POM", "Ceramic"]} />
              <SelectField label="Fitment Material" value={rollOn.fitment_material} path="roll_on.fitment_material"
                options={["PE", "PP", "POM", "LDPE", "HDPE"]} />
              <Field label="Retention Force" value={rollOn.fitment_retention_force_n} path="roll_on.fitment_retention_force_n" type="number" unit="N" mono />
            </div>
          </SpecCard>
        )}

        {/* DECORATION & COMPATIBILITY */}
        <SpecCard
          title="Decoration & Compatibility"
          icon={Palette}
          description="Available finishes and compatible decoration methods"
        >
          <div className="space-y-4">
            <ArrayField label="Available Finishes" values={decoration.available_finishes} path="decoration.available_finishes"
              placeholder="frosted, lacquered, metallized, gradient" emptyMessage="No finish options recorded" />
            <ArrayField label="Compatible Decoration Methods" values={decoration.compatible_methods} path="decoration.compatible_methods"
              placeholder="screen_print, hot_stamp, label_pressure_sensitive, lacquer, frosting" />
            <ArrayField label="Compatible Closures" values={compatibility.compatible_closures} path="compatibility.compatible_closures"
              placeholder="18/415, 20/410, FEA 15" />
            <ArrayField label="Compatible Pumps / Sprayers" values={compatibility.compatible_pumps} path="compatibility.compatible_pumps"
              placeholder="Reference codes for compatible pumps" />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Dip Tube Length" value={compatibility.dip_tube_length_mm} path="compatibility.dip_tube_length_mm" type="number" unit="mm" mono />
              <Field label="Max Print Width" value={decoration.max_print_area_mm?.width} path="decoration.max_print_area_mm.width" type="number" unit="mm" mono />
              <Field label="Max Print Height" value={decoration.max_print_area_mm?.height} path="decoration.max_print_area_mm.height" type="number" unit="mm" mono />
            </div>
          </div>
        </SpecCard>

        {/* LOGISTICS */}
        <SpecCard title="Logistics & Packaging" icon={Truck} description="Case, pallet, and ordering information">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Case Quantity" value={packaging.case_quantity} path="packaging.case_quantity" type="number" mono />
            <Field label="Units / Inner Carton" value={packaging.units_per_inner_carton} path="packaging.units_per_inner_carton" type="number" mono />
            <Field label="Cartons / Pallet" value={packaging.cartons_per_pallet} path="packaging.cartons_per_pallet" type="number" mono />
            <Field label="Units / Pallet" value={packaging.units_per_pallet} path="packaging.units_per_pallet" type="number" mono />
            <SelectField label="Pallet Standard" value={packaging.pallet_standard} path="packaging.pallet_standard"
              options={["Euro (800×1200)", "US (1000×1200)", "ISO (1100×1100)"]} />
            <Field label="Pallet Height" value={packaging.pallet_height_mm} path="packaging.pallet_height_mm" type="number" unit="mm" mono />
            <Field label="Pallet Gross Weight" value={packaging.gross_pallet_weight_kg} path="packaging.gross_pallet_weight_kg" type="number" unit="kg" mono />
            <Field label="MOQ" value={packaging.moq} path="packaging.moq" type="number" mono />
            <Field label="Lead Time" value={packaging.lead_time_days} path="packaging.lead_time_days" type="number" unit="days" mono />
            <Field label="GTIN" value={packaging.gtin} path="packaging.gtin" mono />
            <Field label="EAN" value={packaging.ean} path="packaging.ean" mono />
            <Field label="UPC" value={packaging.upc} path="packaging.upc" mono />
            <Field label="Assembly Type" value={packaging.assembly_type} path="packaging.assembly_type" />
            <Field label="Fitment Status" value={packaging.fitment_status} path="packaging.fitment_status" />
          </div>
        </SpecCard>

        {/* SUSTAINABILITY */}
        <SpecCard
          title="Sustainability"
          icon={Leaf}
          description="PCR content, carbon footprint, recyclability — increasingly required by buyers"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="PCR Content" value={sustainability.pcr_content_percent} path="sustainability.pcr_content_percent" type="number" unit="%" mono />
            <Field label="Cullet Ratio" value={sustainability.cullet_ratio_percent} path="sustainability.cullet_ratio_percent" type="number" unit="%" mono />
            <BoolField label="Recyclable" value={sustainability.recyclable} path="sustainability.recyclable" />
            <Field label="Carbon Footprint" value={sustainability.carbon_footprint_kg_co2e} path="sustainability.carbon_footprint_kg_co2e" type="number" unit="kg CO2e" mono />
            <BoolField label="Lightweighting" value={sustainability.lightweighting} path="sustainability.lightweighting" />
            <SelectField label="EcoVadis Rating" value={sustainability.ecovadis_rating} path="sustainability.ecovadis_rating"
              options={["Platinum", "Gold", "Silver", "Bronze"]} />
          </div>
        </SpecCard>

        {/* REGULATORY & CERTIFICATIONS */}
        <SpecCard
          title="Regulatory & Certifications"
          icon={Shield}
          description="ISO standards, FDA contact-safety, REACH, EU cosmetics, child-resistant"
        >
          <div className="space-y-4">
            <ArrayField label="ISO Certifications" values={regulatory.iso_certifications} path="regulatory.iso_certifications"
              placeholder="ISO 9001, ISO 15378, ISO 8317" emptyMessage="No ISO certs recorded" />
            <Separator />
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <BoolField label="FDA Contact-Safe (21 CFR)" value={regulatory.fda_contact_safe} path="regulatory.fda_contact_safe" />
              <BoolField label="EU Cosmetics 1223/2009" value={regulatory.eu_cosmetics_compliant} path="regulatory.eu_cosmetics_compliant" />
              <BoolField label="REACH Compliant" value={regulatory.reach_compliant} path="regulatory.reach_compliant" />
              <BoolField label="Child-Resistant (ISO 8317)" value={regulatory.child_resistant} path="regulatory.child_resistant" />
              <BoolField label="Tamper-Evident" value={regulatory.tamper_evident} path="regulatory.tamper_evident" />
              <BoolField label="BPA-Free" value={regulatory.bpa_free} path="regulatory.bpa_free" />
              <Field label="Prop 65" value={regulatory.prop_65} path="regulatory.prop_65" />
            </div>
          </div>
        </SpecCard>

        {/* EXTERNAL REFS */}
        <SpecCard title="External References" icon={Hash} description="Cross-system identifiers and source-of-truth links">
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Field label="Primary Grace SKU" value={s.primary_grace_sku ?? refs.grace_sku} path="external_refs.grace_sku" mono badge />
              <Field label="Primary Website SKU" value={s.primary_website_sku ?? refs.website_sku} path="external_refs.website_sku" mono />
              <Field label="Product ID" value={refs.product_id} path="external_refs.product_id" mono />
              <Field label="Data Grade" value={refs.data_grade} path="external_refs.data_grade" />
              <BoolField label="Verified" value={refs.verified} path="external_refs.verified" trueLabel="Verified" falseLabel="Unverified" />
              <Field label="Image URL (legacy)" value={refs.image_url} path="external_refs.image_url" type="url" />
              <Field label="Product URL (live site)" value={refs.product_url} path="external_refs.product_url" type="url" />
            </div>
            {!isEditing && (refs.product_url || refs.image_url) && (
              <>
                <Separator />
                <div className="flex flex-col gap-2">
                  {refs.product_url && (
                    <a href={refs.product_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" />bestbottles.com product page
                    </a>
                  )}
                  {refs.image_url && (
                    <a href={refs.image_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline">
                      <ExternalLink className="w-4 h-4" />Legacy hero image
                    </a>
                  )}
                </div>
              </>
            )}
          </div>
        </SpecCard>
      </div>
    </EditCtx.Provider>
  );
}
