import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from './useOnboarding';

export interface Collection {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  transparency_statement: string | null;
  color_theme: string | null;
  sort_order: number;
}

export const useCollections = () => {
  const { currentOrganizationId } = useOnboarding();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('brand_collections')
          .select('*')
          .eq('organization_id', currentOrganizationId)
          .order('sort_order');

        if (fetchError) throw fetchError;

        setCollections(data || []);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch collections');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [currentOrganizationId]);

  return { collections, loading, error };
};
