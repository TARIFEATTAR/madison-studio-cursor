import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useOnboarding } from './useOnboarding';

export interface WeekNames {
  1: string;
  2: string;
  3: string;
  4: string;
}

const DEFAULT_WEEK_NAMES: WeekNames = {
  1: 'Week 1',
  2: 'Week 2',
  3: 'Week 3',
  4: 'Week 4',
};

export const useWeekNames = () => {
  const { currentOrganizationId } = useOnboarding();
  const [weekNames, setWeekNames] = useState<WeekNames>(DEFAULT_WEEK_NAMES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeekNames = async () => {
      if (!currentOrganizationId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('organizations')
          .select('settings')
          .eq('id', currentOrganizationId)
          .single();

        if (error) throw error;

        const settings = data?.settings as Record<string, any> | null;
        const customNames = settings?.custom_week_names;
        if (customNames) {
          setWeekNames(customNames as WeekNames);
        } else {
          setWeekNames(DEFAULT_WEEK_NAMES);
        }
      } catch (err) {
        console.error('Error fetching week names:', err);
        setWeekNames(DEFAULT_WEEK_NAMES);
      } finally {
        setLoading(false);
      }
    };

    fetchWeekNames();
  }, [currentOrganizationId]);

  const getWeekName = (weekNumber: number): string => {
    return weekNames[weekNumber as keyof WeekNames] || `Week ${weekNumber}`;
  };

  return { weekNames, getWeekName, loading };
};
