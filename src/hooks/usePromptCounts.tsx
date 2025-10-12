import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        .select("*")
        .eq("organization_id", organizationId)
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

      // Collections count - using collection field instead of collection_id
      const collections: Record<string, number> = {
        product_launches: 0,
        social_media: 0,
        email_campaigns: 0,
        seasonal_content: 0,
        customer_stories: 0,
      };

      // Categories count
      const categories: Record<string, number> = {
        all: total,
        product: prompts?.filter((p) => p.content_type === "product").length || 0,
        blog: prompts?.filter((p) => p.content_type === "blog").length || 0,
        email: prompts?.filter((p) => p.content_type === "email").length || 0,
        social: prompts?.filter((p) => p.content_type === "social").length || 0,
        visual: prompts?.filter((p) => p.content_type === "visual").length || 0,
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
  });
};
