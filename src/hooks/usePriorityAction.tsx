import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface PriorityAction {
  title: string;
  description: string;
  actionLabel: string;
  actionRoute: string;
  estimatedTime: string;
  count?: number;
}

export function usePriorityAction() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["priority-action", user?.id],
    queryFn: async (): Promise<PriorityAction | null> => {
      if (!user) return {
        title: "Create Your Next Masterpiece",
        description: "Ready to craft compelling content? Use Forge to generate on-brand material that resonates with your audience.",
        actionLabel: "Start Creating",
        actionRoute: "/create",
        estimatedTime: "15 min",
      };

      try {
        // Get user's organization (non-throwing)
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!orgMember) {
          // No org yet – default call to action
          return {
            title: "Create Your Next Masterpiece",
            description: "Ready to craft compelling content? Use Forge to generate on-brand material that resonates with your audience.",
            actionLabel: "Start Creating",
            actionRoute: "/create",
            estimatedTime: "15 min",
          };
        }

        const organizationId = orgMember.organization_id;

        // Check for unscheduled derivative assets that are ready
        const { data: unscheduledDerivatives } = await supabase
          .from("derivative_assets")
          .select("id, asset_type, created_at")
          .eq("organization_id", organizationId)
          .eq("is_archived", false)
          .eq("approval_status", "approved")
          .is("published_at", null);

        if (unscheduledDerivatives && unscheduledDerivatives.length > 0) {
          // Find the most common asset type
          const typeCounts = unscheduledDerivatives.reduce((acc, item) => {
            acc[item.asset_type] = (acc[item.asset_type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          const mostCommonType = Object.entries(typeCounts)
            .sort(([, a], [, b]) => b - a)[0][0];

          const count = typeCounts[mostCommonType];

          return {
            title: `Schedule Your ${formatAssetType(mostCommonType)} Content`,
            description: `You have ${count} beautiful ${formatAssetType(mostCommonType).toLowerCase()} piece${count > 1 ? 's' : ''} ready to publish. Let's get them scheduled to maximize your content impact.`,
            actionLabel: "Schedule Now",
            actionRoute: "/schedule",
            estimatedTime: "5 min",
            count,
          };
        }

        // Check for master content without derivatives
        const { data: masterWithoutDerivatives } = await supabase
          .from("master_content")
          .select("id, title, content_type")
          .eq("organization_id", organizationId)
          .eq("is_archived", false)
          .limit(10);

        if (masterWithoutDerivatives && masterWithoutDerivatives.length > 0) {
          // Check which ones have no derivatives
          const masterIds = masterWithoutDerivatives.map(m => m.id);
          const { data: derivatives } = await supabase
            .from("derivative_assets")
            .select("master_content_id")
            .in("master_content_id", masterIds);

          const masterIdsWithDerivatives = new Set(
            derivatives?.map(d => d.master_content_id) || []
          );

          const needsDerivatives = masterWithoutDerivatives.filter(
            m => !masterIdsWithDerivatives.has(m.id)
          );

          if (needsDerivatives.length > 0) {
            return {
              title: "Amplify Your Master Content",
              description: `You have ${needsDerivatives.length} master content piece${needsDerivatives.length > 1 ? 's' : ''} ready to be repurposed. Let's multiply their reach across different platforms.`,
              actionLabel: "Multiply Content",
              actionRoute: "/multiply",
              estimatedTime: "10 min",
              count: needsDerivatives.length,
            };
          }
        }

        // Default: Create new content
        return {
          title: "Create Your Next Masterpiece",
          description: "Ready to craft compelling content? Use Forge to generate on-brand material that resonates with your audience.",
          actionLabel: "Start Creating",
          actionRoute: "/create",
          estimatedTime: "15 min",
        };
      } catch (e) {
        return {
          title: "Create Your Next Masterpiece",
          description: "Ready to craft compelling content? Use Forge to generate on-brand material that resonates with your audience.",
          actionLabel: "Start Creating",
          actionRoute: "/create",
          estimatedTime: "15 min",
        };
      }
    },
    enabled: !!user,
    retry: 0,
    staleTime: 1000 * 60 * 2, // Increased to 2 minutes to reduce refetches
  });
}

function formatAssetType(type: string): string {
  const typeMap: Record<string, string> = {
    "instagram_post": "Instagram Post",
    "instagram_story": "Instagram Story",
    "twitter_post": "Twitter Post",
    "facebook_post": "Facebook Post",
    "linkedin_post": "LinkedIn Post",
    "email_campaign": "Email Campaign",
    "blog_excerpt": "Blog Excerpt",
  };
  return typeMap[type] || type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
