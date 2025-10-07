import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from './useOnboarding';

export interface Product {
  id: string;
  name: string;
  product_type: string | null;
  collection: string | null;
  subCollection: string | null;
  scentFamily: string | null;
  topNotes: string | null;
  middleNotes: string | null;
  baseNotes: string | null;
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
        product_type: p.product_type,
        collection: p.collection,
        subCollection: p.sub_collection,
        scentFamily: p.scent_family,
        topNotes: p.top_notes,
        middleNotes: p.middle_notes,
        baseNotes: p.base_notes,
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
