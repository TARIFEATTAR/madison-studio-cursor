import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SDSStatus = "draft" | "review" | "approved" | "expired";
export type BarcodeType = "upc-a" | "ean-13" | "code-128" | "qr";

export interface ProductSDS {
  id: string;
  product_id: string;
  version: string;
  revision_date: string | null;
  file_url: string | null;
  file_name: string | null;
  ghs_classification: string[];
  signal_word: string | null;
  hazard_statements: string[];
  precautionary_statements: string[];
  ghs_pictograms: string[];
  physical_state: string | null;
  color: string | null;
  odor: string | null;
  ph: number | null;
  flash_point: string | null;
  first_aid_inhalation: string | null;
  first_aid_skin: string | null;
  first_aid_eye: string | null;
  first_aid_ingestion: string | null;
  storage_conditions: string | null;
  shelf_life_months: number | null;
  status: SDSStatus;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductPackaging {
  id: string;
  product_id: string;
  container_type: string | null;
  container_material: string | null;
  container_color: string | null;
  container_capacity: string | null;
  closure_type: string | null;
  closure_material: string | null;
  box_required: boolean;
  box_material: string | null;
  box_dimensions: { length?: number; width?: number; height?: number; unit?: string } | null;
  label_type: string | null;
  label_material: string | null;
  net_weight: number | null;
  net_weight_unit: string;
  gross_weight: number | null;
  gross_weight_unit: string;
  is_recyclable: boolean | null;
  recycling_code: string | null;
  is_refillable: boolean;
  post_consumer_recycled_percent: number | null;
  supplier_name: string | null;
  supplier_sku: string | null;
  unit_cost: number | null;
  moq: number | null;
  lead_time_days: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const CONTAINER_TYPES = [
  { value: "bottle", label: "Bottle" },
  { value: "jar", label: "Jar" },
  { value: "tube", label: "Tube" },
  { value: "pump", label: "Pump Bottle" },
  { value: "dropper", label: "Dropper Bottle" },
  { value: "roller", label: "Roller Bottle" },
  { value: "spray", label: "Spray Bottle" },
  { value: "airless", label: "Airless Pump" },
  { value: "tin", label: "Tin" },
  { value: "pouch", label: "Pouch/Sachet" },
  { value: "stick", label: "Stick/Twist-up" },
];

export const CONTAINER_MATERIALS = [
  { value: "glass", label: "Glass" },
  { value: "glass_frosted", label: "Frosted Glass" },
  { value: "glass_amber", label: "Amber Glass" },
  { value: "pet", label: "PET Plastic" },
  { value: "hdpe", label: "HDPE Plastic" },
  { value: "pp", label: "PP Plastic" },
  { value: "aluminum", label: "Aluminum" },
  { value: "bamboo", label: "Bamboo" },
  { value: "pcr", label: "Post-Consumer Recycled" },
];

export const CLOSURE_TYPES = [
  { value: "pump", label: "Pump" },
  { value: "spray", label: "Spray/Mist" },
  { value: "dropper", label: "Dropper" },
  { value: "screw_cap", label: "Screw Cap" },
  { value: "flip_top", label: "Flip Top" },
  { value: "disc_cap", label: "Disc Cap" },
  { value: "roller", label: "Roller Ball" },
  { value: "press_lock", label: "Press Lock" },
  { value: "tamper_evident", label: "Tamper Evident" },
];

export const LABEL_TYPES = [
  { value: "pressure_sensitive", label: "Pressure Sensitive" },
  { value: "shrink_sleeve", label: "Shrink Sleeve" },
  { value: "screen_print", label: "Screen Print" },
  { value: "hot_stamp", label: "Hot Stamp" },
  { value: "embossed", label: "Embossed" },
  { value: "in_mold", label: "In-Mold" },
];

export const RECYCLING_CODES = [
  { value: "1", label: "#1 PETE (Polyethylene Terephthalate)" },
  { value: "2", label: "#2 HDPE (High-Density Polyethylene)" },
  { value: "3", label: "#3 PVC (Polyvinyl Chloride)" },
  { value: "4", label: "#4 LDPE (Low-Density Polyethylene)" },
  { value: "5", label: "#5 PP (Polypropylene)" },
  { value: "6", label: "#6 PS (Polystyrene)" },
  { value: "7", label: "#7 Other" },
  { value: "20", label: "#20 PAP (Cardboard)" },
  { value: "70", label: "#70 GL (Clear Glass)" },
  { value: "71", label: "#71 GL (Green Glass)" },
  { value: "72", label: "#72 GL (Brown Glass)" },
  { value: "40", label: "#40 FE (Steel)" },
  { value: "41", label: "#41 ALU (Aluminum)" },
];

export const GHS_PICTOGRAMS = [
  { code: "GHS01", symbol: "💥", name: "Explosive" },
  { code: "GHS02", symbol: "🔥", name: "Flammable" },
  { code: "GHS03", symbol: "⭕", name: "Oxidizer" },
  { code: "GHS04", symbol: "🫧", name: "Compressed Gas" },
  { code: "GHS05", symbol: "⚗️", name: "Corrosive" },
  { code: "GHS06", symbol: "☠️", name: "Toxic" },
  { code: "GHS07", symbol: "⚠️", name: "Irritant/Harmful" },
  { code: "GHS08", symbol: "🫁", name: "Health Hazard" },
  { code: "GHS09", symbol: "🌊", name: "Environmental Hazard" },
];

export const SDS_STATUS_CONFIG: Record<SDSStatus, { label: string; color: string }> = {
  draft: { label: "Draft", color: "bg-muted text-muted-foreground" },
  review: { label: "In Review", color: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", color: "bg-green-100 text-green-800" },
  expired: { label: "Expired", color: "bg-red-100 text-red-800" },
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

export function useProductSDS(productId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all SDS versions for product
  const {
    data: sdsVersions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-sds", productId],
    queryFn: async () => {
      if (!productId) return [];

      const { data, error } = await supabase
        .from("product_sds")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ProductSDS[];
    },
    enabled: !!productId,
  });

  // Get current (latest approved or latest draft) SDS
  const currentSDS = sdsVersions.find((s) => s.status === "approved") || sdsVersions[0] || null;

  // Generate new SDS
  const generateSDS = useMutation({
    mutationFn: async (input: {
      product_name: string;
      product_type?: string;
      brand_name?: string;
      sku?: string;
      ingredients: Array<{
        name: string;
        inci_name?: string;
        concentration_percent?: number;
        cas_number?: string;
      }>;
      physical_properties?: {
        state?: string;
        color?: string;
        odor?: string;
        ph?: number;
        flash_point?: string;
      };
    }) => {
      const { data, error } = await supabase.functions.invoke("generate-sds-document", {
        body: {
          product_id: productId,
          ...input,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["product-sds", productId] });
      toast({
        title: "SDS Generated",
        description: `Version ${data.version} created successfully`,
      });
    },
    onError: (error) => {
      console.error("Error generating SDS:", error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  // Update SDS status
  const updateStatus = useMutation({
    mutationFn: async ({ sdsId, status }: { sdsId: string; status: SDSStatus }) => {
      const updates: Partial<ProductSDS> = { status };
      
      if (status === "approved") {
        const { data: userData } = await supabase.auth.getUser();
        updates.approved_by = userData.user?.id || null;
        updates.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("product_sds")
        .update(updates)
        .eq("id", sdsId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-sds", productId] });
      toast({ title: "Status Updated" });
    },
    onError: (error) => {
      console.error("Error updating SDS status:", error);
      toast({ title: "Update Failed", variant: "destructive" });
    },
  });

  // Delete SDS version
  const deleteSDS = useMutation({
    mutationFn: async (sdsId: string) => {
      const { error } = await supabase
        .from("product_sds")
        .delete()
        .eq("id", sdsId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-sds", productId] });
      toast({ title: "SDS Deleted" });
    },
  });

  // Determine if SDS is outdated (ingredients changed since last SDS)
  const checkIfOutdated = async (ingredientsUpdatedAt: string) => {
    if (!currentSDS) return { outdated: false, reason: "no_sds" };
    
    const sdsDate = new Date(currentSDS.created_at);
    const ingredientsDate = new Date(ingredientsUpdatedAt);
    
    if (ingredientsDate > sdsDate) {
      return { outdated: true, reason: "ingredients_changed" };
    }
    
    // Check if SDS is older than 1 year
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    if (sdsDate < oneYearAgo) {
      return { outdated: true, reason: "annual_review" };
    }
    
    return { outdated: false };
  };

  return {
    sdsVersions,
    currentSDS,
    isLoading,
    error,
    generateSDS,
    updateStatus,
    deleteSDS,
    checkIfOutdated,
  };
}

export function useProductPackaging(productId: string | null) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: packaging,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["product-packaging", productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from("product_packaging")
        .select("*")
        .eq("product_id", productId)
        .single();

      if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows
      return data as ProductPackaging | null;
    },
    enabled: !!productId,
  });

  const savePackaging = useMutation({
    mutationFn: async (input: Partial<ProductPackaging>) => {
      if (!productId) throw new Error("No product selected");

      if (packaging?.id) {
        // Update existing
        const { data, error } = await supabase
          .from("product_packaging")
          .update(input)
          .eq("id", packaging.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("product_packaging")
          .insert({ product_id: productId, ...input })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-packaging", productId] });
      toast({ title: "Packaging Saved" });
    },
    onError: (error) => {
      console.error("Error saving packaging:", error);
      toast({ title: "Save Failed", variant: "destructive" });
    },
  });

  return {
    packaging,
    isLoading,
    error,
    savePackaging,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// API HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateBarcode(input: {
  code: string;
  type: BarcodeType;
  product_id?: string;
  organization_id?: string;
  save_to_dam?: boolean;
  options?: {
    width?: number;
    height?: number;
    display_value?: boolean;
  };
}) {
  const { data, error } = await supabase.functions.invoke("generate-barcode-image", {
    body: input,
  });

  if (error) throw error;
  return data as {
    success: boolean;
    code: string;
    type: BarcodeType;
    svg: string;
    svg_base64: string;
    dam_asset_id: string | null;
  };
}
