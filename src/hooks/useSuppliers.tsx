import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrganization } from "./useOrganization";
import { useToast } from "./use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SupplierCompanyType =
  | "manufacturer"
  | "contract_manufacturer"
  | "distributor"
  | "raw_material"
  | "packaging"
  | "other";

export interface Supplier {
  id: string;
  organization_id: string;
  name: string;
  company_type: SupplierCompanyType | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  website: string | null;
  address_line_1: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  has_sds_portal: boolean;
  sds_portal_url: string | null;
  typical_response_days: number | null;
  account_number: string | null;
  payment_terms: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CreateSupplierInput {
  name: string;
  company_type?: SupplierCompanyType;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  has_sds_portal?: boolean;
  sds_portal_url?: string;
  typical_response_days?: number;
  account_number?: string;
  payment_terms?: string;
  notes?: string;
}

export interface UpdateSupplierInput extends Partial<CreateSupplierInput> {
  is_active?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const COMPANY_TYPES: { value: SupplierCompanyType; label: string; description: string }[] = [
  {
    value: "manufacturer",
    label: "Manufacturer",
    description: "Makes the finished product you sell",
  },
  {
    value: "contract_manufacturer",
    label: "Contract/White-Label Manufacturer",
    description: "Makes products under your brand name",
  },
  {
    value: "distributor",
    label: "Distributor",
    description: "Resells products from other manufacturers",
  },
  {
    value: "raw_material",
    label: "Raw Material Supplier",
    description: "Supplies ingredients and raw materials",
  },
  {
    value: "packaging",
    label: "Packaging Supplier",
    description: "Supplies bottles, jars, boxes, labels",
  },
  {
    value: "other",
    label: "Other",
    description: "Other type of supplier",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Hook to manage suppliers for the organization
 */
export function useSuppliers() {
  const { organization } = useOrganization();
  const organizationId = organization?.id;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all suppliers
  const {
    data: suppliers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["suppliers", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];

      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("organization_id", organizationId)
        .order("name", { ascending: true });

      if (error) {
        // Table might not exist yet
        if (error.code === "42P01" || error.code === "PGRST116") {
          console.warn("Suppliers table not found - migration may not be applied");
          return [];
        }
        throw error;
      }

      return data as Supplier[];
    },
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get only active suppliers (for dropdowns)
  const activeSuppliers = suppliers.filter((s) => s.is_active);

  // Create supplier
  const createSupplier = useMutation({
    mutationFn: async (input: CreateSupplierInput) => {
      if (!organizationId) throw new Error("No organization selected");

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("suppliers")
        .insert({
          ...input,
          organization_id: organizationId,
          created_by: user?.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", organizationId] });
      toast({
        title: "Supplier created",
        description: "The supplier has been added successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update supplier
  const updateSupplier = useMutation({
    mutationFn: async ({ id, ...input }: UpdateSupplierInput & { id: string }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", organizationId] });
      toast({
        title: "Supplier updated",
        description: "The supplier has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete supplier
  const deleteSupplier = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("suppliers").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", organizationId] });
      toast({
        title: "Supplier deleted",
        description: "The supplier has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle supplier active status
  const toggleSupplierActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { data, error } = await supabase
        .from("suppliers")
        .update({ is_active })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Supplier;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["suppliers", organizationId] });
      toast({
        title: data.is_active ? "Supplier activated" : "Supplier deactivated",
        description: `${data.name} is now ${data.is_active ? "active" : "inactive"}.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error updating supplier",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    suppliers,
    activeSuppliers,
    isLoading,
    error,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    toggleSupplierActive,
  };
}

/**
 * Hook to get a single supplier by ID
 */
export function useSupplier(supplierId: string | null | undefined) {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ["supplier", supplierId],
    queryFn: async () => {
      if (!supplierId) return null;

      const { data, error } = await supabase
        .from("suppliers")
        .select("*")
        .eq("id", supplierId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw error;
      }

      return data as Supplier;
    },
    enabled: !!supplierId && !!organizationId,
  });
}

/**
 * Hook to get suppliers linked to products (for reporting)
 */
export function useSupplierProducts(supplierId: string | null | undefined) {
  const { organization } = useOrganization();
  const organizationId = organization?.id;

  return useQuery({
    queryKey: ["supplier-products", supplierId],
    queryFn: async () => {
      if (!supplierId || !organizationId) return [];

      const { data, error } = await supabase
        .from("product_hubs")
        .select("id, name, sku, status")
        .eq("supplier_id", supplierId)
        .eq("organization_id", organizationId)
        .order("name");

      if (error) {
        // Column might not exist yet
        if (error.message.includes("supplier_id")) {
          return [];
        }
        throw error;
      }

      return data;
    },
    enabled: !!supplierId && !!organizationId,
  });
}
