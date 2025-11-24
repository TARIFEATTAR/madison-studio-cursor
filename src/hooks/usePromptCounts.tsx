import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BROAD_IMAGE_CATEGORIES, getImageCategoryByKey } from "@/data/imageCategories";

export const usePromptCounts = (organizationId: string | null) => {
  return useQuery({
    queryKey: ["prompt-counts", organizationId],
    queryFn: async () => {
      if (!organizationId) {
        return {
          total: 0,
          favorites: 0,
          recentlyUsed: 0,
          mostUsed: 0,
          collections: {} as Record<string, number>,
          categories: {} as Record<string, number>,
        };
      }

      const { data: prompts } = await supabase
        .from("prompts")
        .select("is_template, last_used_at, times_used, content_type, collection, created_at, additional_context, category")
        .eq("organization_id", organizationId)
        .eq("is_archived", false)
        .is("archived_at", null);

      const total = prompts?.length || 0;
      const favorites = prompts?.filter((p) => p.is_template).length || 0;
      
      // Recently used (used in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentlyUsed = prompts?.filter(
        (p) => p.last_used_at && new Date(p.last_used_at) > sevenDaysAgo
      ).length || 0;

      // Most used (usage count > 5)
      const mostUsed = prompts?.filter((p) => (p.times_used || 0) > 5).length || 0;

      // Collections count placeholder (collections not surfaced in UI currently)
      const collections: Record<string, number> = {};

      // Categories count aligned with Image Studio options
      const categoryCounts: Record<string, number> = {};
      BROAD_IMAGE_CATEGORIES.forEach((category) => {
        categoryCounts[category.key] = 0;
      });

      prompts?.forEach((prompt) => {
        // 1. Try direct category column
        let categoryKey = (prompt as any).category;
        
        // 2. Fallback to additional_context
        if (!categoryKey) {
          categoryKey = (prompt.additional_context as any)?.category || (prompt.additional_context as any)?.image_type;
        }

        if (categoryKey) {
          // Check if it's already a broad category
          const isBroad = BROAD_IMAGE_CATEGORIES.some(c => c.key === categoryKey);
          
          if (isBroad) {
            categoryCounts[categoryKey] = (categoryCounts[categoryKey] || 0) + 1;
          } else {
            // Try to find the specific shot type and map it
            const specificCategory = getImageCategoryByKey(categoryKey);
            if (specificCategory) {
              const broadKey = specificCategory.broadCategory;
              if (broadKey in categoryCounts) {
                categoryCounts[broadKey] += 1;
              }
            }
          }
        }
      });

      const categories = {
        all: total,
        ...categoryCounts,
      };

      return {
        total,
        favorites,
        recentlyUsed,
        mostUsed,
        collections,
        categories,
      };
    },
    enabled: !!organizationId,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
