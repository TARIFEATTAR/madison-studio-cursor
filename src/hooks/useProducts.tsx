import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOnboarding } from "./useOnboarding";
import { useToast } from "./use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type ProductStatus = 'draft' | 'active' | 'archived' | 'discontinued';
export type ProductVisibility = 'private' | 'internal' | 'public';
export type DevelopmentStage = 'concept' | 'formulation' | 'testing' | 'production' | 'launched';

export interface ProductHub {
  id: string;
  organization_id: string;
  
  // Basic Info
  name: string;
  slug: string | null;
  sku: string | null;
  barcode: string | null;
  
  // Description
  short_description: string | null;
  long_description: string | null;
  tagline: string | null;
  
  // Pricing
  price: number | null;
  compare_at_price: number | null;
  cost_per_unit: number | null;
  currency: string;
  
  // Status
  status: ProductStatus;
  visibility: ProductVisibility;
  development_stage: DevelopmentStage;
  
  // Categorization
  category: string | null;
  subcategory: string | null;
  product_type: string | null;
  product_line: string | null;
  collections: string[];
  tags: string[];
  
  // Media
  hero_image_id: string | null;
  hero_image_url?: string | null;
  gallery_image_ids: string[];
  video_ids: string[];
  
  // External
  external_ids: Record<string, unknown>;
  
  // AI & Brand
  brand_voice_notes: string | null;
  target_audience: string | null;
  key_benefits: string[];
  key_differentiators: string[];
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string[];
  
  // Dates
  launch_date: string | null;
  published_at: string | null;
  discontinued_at: string | null;
  created_at: string;
  updated_at: string;
  
  // Hierarchy
  parent_product_id: string | null;
  sort_order: number;
  
  // Metadata
  metadata: Record<string, unknown>;
  created_by: string | null;
  
  // Computed/joined
  variant_count?: number;
  content_count?: number;
  asset_count?: number;
}

export interface CreateProductInput {
  name: string;
  category?: string;
  product_type?: string;
  status?: ProductStatus;
  short_description?: string;
}

export interface UpdateProductInput {
  id: string;
  name?: string;
  slug?: string;
  sku?: string;
  barcode?: string;
  short_description?: string;
  long_description?: string;
  tagline?: string;
  price?: number;
  compare_at_price?: number;
  cost_per_unit?: number;
  status?: ProductStatus;
  visibility?: ProductVisibility;
  development_stage?: DevelopmentStage;
  category?: string;
  subcategory?: string;
  product_type?: string;
  product_line?: string;
  collections?: string[];
  tags?: string[];
  hero_image_id?: string;
  brand_voice_notes?: string;
  target_audience?: string;
  key_benefits?: string[];
  key_differentiators?: string[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string[];
  launch_date?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

export const PRODUCT_STATUS_OPTIONS: { value: ProductStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-muted text-muted-foreground' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-700' },
  { value: 'archived', label: 'Archived', color: 'bg-amber-100 text-amber-700' },
  { value: 'discontinued', label: 'Discontinued', color: 'bg-red-100 text-red-700' },
];

export const DEVELOPMENT_STAGE_OPTIONS: { value: DevelopmentStage; label: string; icon: string }[] = [
  { value: 'concept', label: 'Concept', icon: 'lightbulb' },
  { value: 'formulation', label: 'Formulation', icon: 'flask-conical' },
  { value: 'testing', label: 'Testing', icon: 'test-tube' },
  { value: 'production', label: 'Production', icon: 'factory' },
  { value: 'launched', label: 'Launched', icon: 'rocket' },
];

export const PRODUCT_CATEGORIES = [
  'Skincare',
  'Haircare', 
  'Body Care',
  'Cosmetics',
  'Fragrance',
  'Wellness',
  'Sun Care',
  'Men\'s Grooming',
  'Nail Care',
  'Oral Care',
  'Baby & Kids',
  'Other',
];

export const PRODUCT_TYPES: Record<string, string[]> = {
  'Skincare': ['Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Eye Cream', 'Mask', 'Exfoliant', 'Oil', 'Mist', 'SPF'],
  'Haircare': ['Shampoo', 'Conditioner', 'Treatment', 'Styling', 'Oil', 'Mask', 'Serum', 'Spray'],
  'Body Care': ['Body Wash', 'Body Lotion', 'Body Oil', 'Body Scrub', 'Hand Cream', 'Deodorant'],
  'Cosmetics': ['Foundation', 'Concealer', 'Powder', 'Blush', 'Bronzer', 'Highlighter', 'Lipstick', 'Lip Gloss', 'Mascara', 'Eyeliner', 'Eyeshadow'],
  'Fragrance': ['Eau de Parfum', 'Eau de Toilette', 'Body Mist', 'Perfume Oil', 'Room Spray', 'Candle'],
};

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

interface UseProductsOptions {
  status?: ProductStatus;
  category?: string;
  searchQuery?: string;
  sortBy?: 'name' | 'created_at' | 'updated_at' | 'status';
  sortDirection?: 'asc' | 'desc';
}

export function useProducts(options: UseProductsOptions = {}) {
  const { currentOrganizationId } = useOnboarding();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products
  const {
    data: products = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['products', currentOrganizationId, options],
    queryFn: async () => {
      if (!currentOrganizationId) return [];

      let query = supabase
        .from('product_hubs')
        .select(`
          *,
          hero_image:dam_assets!product_hubs_hero_image_id_fkey(id, file_url, thumbnail_url)
        `)
        .eq('organization_id', currentOrganizationId);

      // Filter by status
      if (options.status) {
        query = query.eq('status', options.status);
      }

      // Filter by category
      if (options.category) {
        query = query.eq('category', options.category);
      }

      // Search
      if (options.searchQuery) {
        query = query.or(`name.ilike.%${options.searchQuery}%,sku.ilike.%${options.searchQuery}%,tags.cs.{${options.searchQuery}}`);
      }

      // Sort
      const sortBy = options.sortBy || 'created_at';
      const sortDirection = options.sortDirection || 'desc';
      query = query.order(sortBy, { ascending: sortDirection === 'asc' });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      // Transform data to include hero_image_url
      return (data || []).map((product: any) => ({
        ...product,
        hero_image_url: product.hero_image?.thumbnail_url || product.hero_image?.file_url || null,
      })) as ProductHub[];
    },
    enabled: !!currentOrganizationId,
  });

  // Fetch single product
  const fetchProduct = async (productId: string): Promise<ProductHub | null> => {
    if (!currentOrganizationId) return null;

    const { data, error } = await supabase
      .from('product_hubs')
      .select(`
        *,
        hero_image:dam_assets!product_hubs_hero_image_id_fkey(id, file_url, thumbnail_url)
      `)
      .eq('id', productId)
      .eq('organization_id', currentOrganizationId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return {
      ...data,
      hero_image_url: data.hero_image?.thumbnail_url || data.hero_image?.file_url || null,
    } as ProductHub;
  };

  // Create product
  const createProduct = useMutation({
    mutationFn: async (input: CreateProductInput) => {
      if (!currentOrganizationId) throw new Error('No organization selected');

      // Generate slug from name
      const slug = input.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const { data, error } = await supabase
        .from('product_hubs')
        .insert({
          organization_id: currentOrganizationId,
          name: input.name,
          slug,
          category: input.category || null,
          product_type: input.product_type || null,
          status: input.status || 'draft',
          short_description: input.short_description || null,
          development_stage: 'concept',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProductHub;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product created',
        description: `"${product.name}" has been created`,
      });
    },
    onError: (error) => {
      console.error('Error creating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to create product',
        variant: 'destructive',
      });
    },
  });

  // Update product
  const updateProduct = useMutation({
    mutationFn: async (input: UpdateProductInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from('product_hubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ProductHub;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', product.id] });
      toast({
        title: 'Product updated',
        description: 'Changes have been saved',
      });
    },
    onError: (error) => {
      console.error('Error updating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    },
  });

  // Delete product
  const deleteProduct = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('product_hubs')
        .delete()
        .eq('id', productId);

      if (error) throw error;
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product deleted',
        description: 'Product has been removed',
      });
    },
    onError: (error) => {
      console.error('Error deleting product:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete product',
        variant: 'destructive',
      });
    },
  });

  // Duplicate product
  const duplicateProduct = useMutation({
    mutationFn: async (productId: string) => {
      // Fetch the original product
      const original = await fetchProduct(productId);
      if (!original) throw new Error('Product not found');

      // Create a copy with modified name
      const { data, error } = await supabase
        .from('product_hubs')
        .insert({
          organization_id: original.organization_id,
          name: `${original.name} (Copy)`,
          slug: `${original.slug}-copy-${Date.now()}`,
          sku: original.sku ? `${original.sku}-COPY` : null,
          short_description: original.short_description,
          long_description: original.long_description,
          tagline: original.tagline,
          category: original.category,
          subcategory: original.subcategory,
          product_type: original.product_type,
          product_line: original.product_line,
          collections: original.collections,
          tags: original.tags,
          brand_voice_notes: original.brand_voice_notes,
          target_audience: original.target_audience,
          key_benefits: original.key_benefits,
          key_differentiators: original.key_differentiators,
          status: 'draft',
          development_stage: 'concept',
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProductHub;
    },
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: 'Product duplicated',
        description: `"${product.name}" has been created`,
      });
    },
    onError: (error) => {
      console.error('Error duplicating product:', error);
      toast({
        title: 'Error',
        description: 'Failed to duplicate product',
        variant: 'destructive',
      });
    },
  });

  // Get product counts by status
  const statusCounts = products.reduce(
    (acc, product) => {
      acc[product.status] = (acc[product.status] || 0) + 1;
      acc.total++;
      return acc;
    },
    { draft: 0, active: 0, archived: 0, discontinued: 0, total: 0 } as Record<string, number>
  );

  // Get unique categories from products
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  return {
    // Data
    products,
    statusCounts,
    categories,
    
    // Loading
    isLoading,
    error,
    
    // Actions
    fetchProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    refetch,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SINGLE PRODUCT HOOK
// ═══════════════════════════════════════════════════════════════════════════════

export function useProduct(productId: string | null) {
  const { currentOrganizationId } = useOnboarding();

  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      if (!productId || !currentOrganizationId) return null;

      const { data, error } = await supabase
        .from('product_hubs')
        .select(`
          *,
          hero_image:dam_assets!product_hubs_hero_image_id_fkey(id, file_url, thumbnail_url)
        `)
        .eq('id', productId)
        .eq('organization_id', currentOrganizationId)
        .single();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return {
        ...data,
        hero_image_url: data.hero_image?.thumbnail_url || data.hero_image?.file_url || null,
      } as ProductHub;
    },
    enabled: !!productId && !!currentOrganizationId,
  });
}
