import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "./useOnboarding";
import { useToast } from "./use-toast";

// Business type definitions
export type BusinessType = 
  | "finished_goods" 
  | "bottles_vessels" 
  | "packaging_boxes" 
  | "raw_materials"
  | "marketing_agency";

export interface BusinessTypeConfig {
  business_type: BusinessType;
  display_name: string;
  description: string;
  icon: string;
  enabled_sections: Record<string, boolean>;
  vocabulary: Record<string, string>;
  default_categories: string[];
  product_fields: {
    required: string[];
    recommended: string[];
    optional: string[];
    hidden: string[];
  };
  ai_context: {
    industry_terms: string[];
    content_focus: string;
    tone_hints: string;
    target_audience: string;
  };
  onboarding_config: {
    welcome_message: string;
    suggested_first_steps: string[];
    skip_sections: string[];
  };
}

export interface BusinessTypeOption {
  value: BusinessType;
  label: string;
  description: string;
  icon: string;
}

// All available business types
export const BUSINESS_TYPE_OPTIONS: BusinessTypeOption[] = [
  {
    value: "finished_goods",
    label: "Finished Goods Brand",
    description: "Complete products sold to consumers (cosmetics, skincare, etc.)",
    icon: "sparkles",
  },
  {
    value: "bottles_vessels",
    label: "Bottles & Vessels",
    description: "Container manufacturing (bottles, jars, tubes, pumps)",
    icon: "flask-conical",
  },
  {
    value: "packaging_boxes",
    label: "Packaging & Boxes",
    description: "Secondary packaging (boxes, cartons, labels, displays)",
    icon: "box",
  },
  {
    value: "raw_materials",
    label: "Raw Materials",
    description: "Ingredient and material supplier to manufacturers",
    icon: "flask-round",
  },
  {
    value: "marketing_agency",
    label: "Brand & Creative Agency",
    description: "Create brand strategy & content for beauty/cosmetics clients",
    icon: "briefcase",
  },
];

/**
 * Hook to get and manage business type configuration
 */
export function useBusinessType() {
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current organization's business type
  const { 
    data: organizationData,
    isLoading: orgLoading,
  } = useQuery({
    queryKey: ["organization-business-type", currentOrganizationId],
    queryFn: async () => {
      if (!currentOrganizationId) return null;

      const { data, error } = await supabase
        .from("organizations")
        .select("id, business_type")
        .eq("id", currentOrganizationId)
        .single();

      if (error) {
        console.error("Error fetching organization:", error);
        return null;
      }

      return data;
    },
    enabled: !!currentOrganizationId,
  });

  // Fetch business type config
  const {
    data: config,
    isLoading: configLoading,
    error: configError,
  } = useQuery({
    queryKey: ["business-type-config", organizationData?.business_type],
    queryFn: async () => {
      const businessType = organizationData?.business_type || "finished_goods";
      
      const { data, error } = await supabase
        .from("business_type_config")
        .select("*")
        .eq("business_type", businessType)
        .eq("is_active", true)
        .single();

      if (error) {
        console.error("Error fetching business type config:", error);
        // Return default config
        return getDefaultConfig();
      }

      return data as BusinessTypeConfig;
    },
    enabled: true, // Always fetch, will use default if no org
  });

  // Fetch all business type configs (for selector)
  const {
    data: allConfigs,
    isLoading: allConfigsLoading,
  } = useQuery({
    queryKey: ["all-business-type-configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("business_type_config")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (error) {
        console.error("Error fetching all business type configs:", error);
        return [];
      }

      return data as BusinessTypeConfig[];
    },
  });

  // Update organization's business type
  const updateBusinessType = useMutation({
    mutationFn: async (newBusinessType: BusinessType) => {
      if (!currentOrganizationId) {
        throw new Error("No organization selected");
      }

      const { error } = await supabase
        .from("organizations")
        .update({ business_type: newBusinessType })
        .eq("id", currentOrganizationId);

      if (error) throw error;
      return newBusinessType;
    },
    onSuccess: (newBusinessType) => {
      queryClient.invalidateQueries({ queryKey: ["organization-business-type"] });
      queryClient.invalidateQueries({ queryKey: ["business-type-config"] });
      
      const option = BUSINESS_TYPE_OPTIONS.find(o => o.value === newBusinessType);
      toast({
        title: "Business type updated",
        description: `Your organization is now set as "${option?.label}"`,
      });
    },
    onError: (error) => {
      console.error("Error updating business type:", error);
      toast({
        title: "Error",
        description: "Failed to update business type",
        variant: "destructive",
      });
    },
  });

  // Helper: Check if a section is enabled
  const isSectionEnabled = (sectionKey: string): boolean => {
    if (!config?.enabled_sections) return true; // Default to enabled
    return config.enabled_sections[sectionKey] !== false;
  };

  // Helper: Get vocabulary term
  const getTerm = (key: string, fallback?: string): string => {
    if (!config?.vocabulary) return fallback || key;
    return config.vocabulary[key] || fallback || key;
  };

  // Helper: Check if a product field is required
  const isFieldRequired = (fieldName: string): boolean => {
    return config?.product_fields?.required?.includes(fieldName) || false;
  };

  // Helper: Check if a product field is hidden
  const isFieldHidden = (fieldName: string): boolean => {
    return config?.product_fields?.hidden?.includes(fieldName) || false;
  };

  return {
    // Current state
    currentBusinessType: organizationData?.business_type as BusinessType | null,
    config,
    allConfigs,
    
    // Loading states
    isLoading: orgLoading || configLoading,
    isAllConfigsLoading: allConfigsLoading,
    error: configError,
    
    // Actions
    updateBusinessType,
    
    // Helpers
    isSectionEnabled,
    getTerm,
    isFieldRequired,
    isFieldHidden,
    
    // Options
    businessTypeOptions: BUSINESS_TYPE_OPTIONS,
  };
}

// Default config when none is set
function getDefaultConfig(): BusinessTypeConfig {
  return {
    business_type: "finished_goods",
    display_name: "Finished Goods Brand",
    description: "Default configuration for finished goods brands",
    icon: "sparkles",
    enabled_sections: {
      products: true,
      ingredients: true,
      specifications: true,
      marketing_campaigns: true,
      social_media: true,
      email_marketing: true,
      blog_content: true,
      product_photography: true,
    },
    vocabulary: {
      product: "Product",
      products: "Products",
      ingredient: "Ingredient",
      customer: "Customer",
    },
    default_categories: [],
    product_fields: {
      required: ["name"],
      recommended: ["description"],
      optional: [],
      hidden: [],
    },
    ai_context: {
      industry_terms: [],
      content_focus: "Consumer marketing",
      tone_hints: "Professional and friendly",
      target_audience: "End consumers",
    },
    onboarding_config: {
      welcome_message: "Welcome to Madison Studio!",
      suggested_first_steps: ["Add your first product"],
      skip_sections: [],
    },
  };
}
