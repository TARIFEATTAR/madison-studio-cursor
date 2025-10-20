import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from './useOnboarding';

export type ProductCategory = 'personal_fragrance' | 'home_fragrance';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  product_type: string | null;
  collection: string | null;
  
  // Personal Fragrance specific
  scentFamily: string | null;
  topNotes: string | null;
  middleNotes: string | null;
  baseNotes: string | null;
  
  // Home Fragrance specific
  scentProfile: string | null;
  format: string | null;
  burnTime: string | null;
  
  // Skincare specific
  keyIngredients: string | null;
  benefits: string | null;
  usage: string | null;
  formulationType: string | null;
  
  // Universal fields
  usp: string | null;
  tone: string | null;
}

export const useProducts = () => {
  const { currentOrganizationId } = useOnboarding();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    if (!currentOrganizationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('brand_products')
        .select('*')
        .eq('organization_id', currentOrganizationId)
        .order('name');

      if (fetchError) throw fetchError;

      const formattedProducts: Product[] = (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: (p.category || 'personal_fragrance') as ProductCategory,
        product_type: p.product_type,
        collection: p.collection,
        
        // Personal Fragrance
        scentFamily: p.scent_family,
        topNotes: p.top_notes,
        middleNotes: p.middle_notes,
        baseNotes: p.base_notes,
        
        // Home Fragrance
        scentProfile: p.scent_profile,
        format: p.format,
        burnTime: p.burn_time,
        
        // Skincare
        keyIngredients: p.key_ingredients,
        benefits: p.benefits,
        usage: p.usage,
        formulationType: p.formulation_type,
        
        // Universal
        usp: p.usp,
        tone: p.tone,
      }));

      setProducts(formattedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentOrganizationId]);

  return { products, loading, error, refetch: fetchProducts };
};
