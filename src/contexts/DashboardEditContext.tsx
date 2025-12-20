import React, { createContext, useContext, useState, useCallback } from 'react';
import { useOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';

export interface CardLayout {
  id: string;
  w: number; // grid columns (1-12)
  h: number; // grid rows (approximate)
  x: number; // grid position
  y: number; // grid position
}

interface DashboardEditContextType {
  isEditMode: boolean;
  toggleEditMode: () => void;
  cardLayouts: Record<string, CardLayout>;
  updateCardLayout: (id: string, layout: Partial<CardLayout>) => void;
  resetLayouts: () => void;
}

const DashboardEditContext = createContext<DashboardEditContextType | undefined>(undefined);

export function DashboardEditProvider({ children }: { children: React.ReactNode }) {
  const { organizationId } = useOrganization();
  const [isEditMode, setIsEditMode] = useState(false);
  const [cardLayouts, setCardLayouts] = useState<Record<string, CardLayout>>({});

  // Load saved layouts from database
  React.useEffect(() => {
    const loadLayouts = async () => {
      if (!organizationId) return;
      
      try {
        const { data } = await supabase
          .from('organizations')
          .select('settings')
          .eq('id', organizationId)
          .single();
        
        if (data?.settings?.dashboardLayouts) {
          setCardLayouts(data.settings.dashboardLayouts);
        }
      } catch (error) {
        console.error('Error loading dashboard layouts:', error);
      }
    };
    
    loadLayouts();
  }, [organizationId]);

  // Save layouts to database
  const saveLayouts = useCallback(async (layouts: Record<string, CardLayout>) => {
    if (!organizationId) return;
    
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();
      
      const currentSettings = (orgData?.settings && typeof orgData.settings === 'object') 
        ? orgData.settings as Record<string, any>
        : {};
      
      const updatedSettings = {
        ...currentSettings,
        dashboardLayouts: layouts,
      };
      
      await supabase
        .from('organizations')
        .update({ settings: updatedSettings })
        .eq('id', organizationId);
    } catch (error) {
      console.error('Error saving dashboard layouts:', error);
    }
  }, [organizationId]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(prev => !prev);
  }, []);

  const updateCardLayout = useCallback((id: string, layout: Partial<CardLayout>) => {
    setCardLayouts(prev => {
      const updated = {
        ...prev,
        [id]: {
          ...prev[id],
          ...layout,
          id,
        } as CardLayout,
      };
      // Save to database
      saveLayouts(updated);
      return updated;
    });
  }, [saveLayouts]);

  const resetLayouts = useCallback(() => {
    setCardLayouts({});
    if (organizationId) {
      const { data: orgData } = supabase
        .from('organizations')
        .select('settings')
        .eq('id', organizationId)
        .single();
      
      orgData.then(({ data }) => {
        if (data?.settings) {
          const currentSettings = typeof data.settings === 'object' 
            ? data.settings as Record<string, any>
            : {};
          
          const updatedSettings = {
            ...currentSettings,
            dashboardLayouts: {},
          };
          
          supabase
            .from('organizations')
            .update({ settings: updatedSettings })
            .eq('id', organizationId);
        }
      });
    }
  }, [organizationId]);

  return (
    <DashboardEditContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        cardLayouts,
        updateCardLayout,
        resetLayouts,
      }}
    >
      {children}
    </DashboardEditContext.Provider>
  );
}

export function useDashboardEdit() {
  const context = useContext(DashboardEditContext);
  if (context === undefined) {
    throw new Error('useDashboardEdit must be used within a DashboardEditProvider');
  }
  return context;
}
