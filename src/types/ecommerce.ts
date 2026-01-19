/**
 * E-commerce type definitions for marketplace sync
 * These extend the brand_products table with full product data
 */

// Product variant from Shopify/Etsy
export interface ProductVariant {
  id: string;
  title: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  inventory_quantity: number;
  inventory_policy: 'deny' | 'continue';
  option1: string | null;
  option2: string | null;
  option3: string | null;
  barcode: string | null;
  weight: number | null;
  weight_unit: 'lb' | 'kg' | 'g' | 'oz';
  requires_shipping: boolean;
  position: number;
  // Platform-specific IDs
  shopify_variant_id?: string;
  etsy_offering_id?: string;
  etsy_product_id?: string;
}

// Product option (Size, Color, etc.)
export interface ProductOption {
  name: string;
  values: string[];
  position: number;
}

// Product image
export interface ProductImage {
  id: string;
  src: string;
  position: number;
  alt: string;
  width?: number;
  height?: number;
  // Platform-specific IDs
  shopify_image_id?: string;
  etsy_image_id?: string;
}

// E-commerce fields added to brand_products
export interface EcommerceProductFields {
  // SKU and pricing
  sku: string | null;
  barcode: string | null;
  price: number | null;
  compare_at_price: number | null;
  cost_per_item: number | null;
  
  // Inventory
  inventory_quantity: number;
  inventory_policy: 'deny' | 'continue';
  track_inventory: boolean;
  
  // Physical dimensions
  weight: number | null;
  weight_unit: 'lb' | 'kg' | 'g' | 'oz';
  requires_shipping: boolean;
  
  // Variants and options
  variants: ProductVariant[] | string; // JSONB stored as string
  options: ProductOption[] | string; // JSONB stored as string
  
  // Images
  images: ProductImage[] | string; // JSONB stored as string
  featured_image_url: string | null;
  
  // Vendor/brand
  vendor: string | null;
  brand: string | null;
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  
  // Status
  status: 'active' | 'draft' | 'archived';
  published_at: string | null;
  
  // Etsy-specific
  etsy_listing_id: string | null;
  etsy_shop_id: string | null;
  etsy_state: 'draft' | 'active' | 'sold_out' | 'inactive' | 'expired' | null;
  etsy_sync_status: 'synced' | 'pending' | 'error' | null;
  last_etsy_sync: string | null;
  etsy_taxonomy_id: number | null;
  etsy_who_made: string | null;
  etsy_when_made: string | null;
  etsy_is_supply: boolean | null;
  
  // Tags and materials
  tags: string[] | null;
  materials: string[] | null;
}

// Helper to parse JSONB fields
export function parseVariants(variants: string | ProductVariant[] | null): ProductVariant[] {
  if (!variants) return [];
  if (typeof variants === 'string') {
    try {
      return JSON.parse(variants);
    } catch {
      return [];
    }
  }
  return variants;
}

export function parseOptions(options: string | ProductOption[] | null): ProductOption[] {
  if (!options) return [];
  if (typeof options === 'string') {
    try {
      return JSON.parse(options);
    } catch {
      return [];
    }
  }
  return options;
}

export function parseImages(images: string | ProductImage[] | null): ProductImage[] {
  if (!images) return [];
  if (typeof images === 'string') {
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  }
  return images;
}

// Format price for display
export function formatPrice(price: number | null, currency = 'USD'): string {
  if (price === null || price === undefined) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

// Calculate total inventory across variants
export function getTotalInventory(variants: ProductVariant[]): number {
  return variants.reduce((sum, v) => sum + (v.inventory_quantity || 0), 0);
}

// Get price range from variants
export function getPriceRange(variants: ProductVariant[]): { min: number; max: number } | null {
  if (!variants.length) return null;
  const prices = variants.map(v => v.price).filter(p => p > 0);
  if (!prices.length) return null;
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

// Sync status types
export type ShopifySyncStatus = 'synced' | 'pending' | 'error' | null;
export type EtsySyncStatus = 'synced' | 'pending' | 'error' | null;

// Marketplace type
export type Marketplace = 'shopify' | 'etsy';

// Product with full e-commerce data
export interface EcommerceProduct extends EcommerceProductFields {
  id: string;
  organization_id: string;
  name: string;
  handle: string | null;
  description: string | null;
  product_type: string | null;
  collection: string | null;
  shopify_product_id: string | null;
  shopify_variant_id: string | null;
  shopify_sync_status: ShopifySyncStatus;
  last_shopify_sync: string | null;
  created_at: string;
  updated_at: string;
}
