import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface DashboardStats {
  totalContent: number;
  piecesCreatedThisWeek: number;
  piecesPublished: number;
  piecesScheduled: number;
  onBrandScore: number;
  streakDays: number;
  recentActivity: RecentActivityItem[];
  totalDrafts: number;
}

interface RecentActivityItem {
  id: string;
  title: string;
  type: string;
  action: string;
  time: string;
  category: 'master' | 'output' | 'derivative';
  created_at: string;
}

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["dashboard-stats", user?.id],
    queryFn: async (): Promise<DashboardStats> => {
      const defaultStats: DashboardStats = {
        totalContent: 0,
        piecesCreatedThisWeek: 0,
        piecesPublished: 0,
        piecesScheduled: 0,
        onBrandScore: 95,
        streakDays: 0,
        recentActivity: [],
        totalDrafts: 0,
      };

      try {
        if (!user) {
          return defaultStats;
        }

        // Get user's organization (non-throwing)
        const { data: orgMember } = await supabase
          .from("organization_members")
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (!orgMember) {
          // New users won't have an org yet; resolve immediately to avoid spinners
          return defaultStats;
        }

        const organizationId = orgMember.organization_id;

        // Get start of current week (Sunday)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        // Fetch brand health score
        const { data: brandHealth } = await supabase
          .from("brand_health")
          .select("completeness_score")
          .eq("organization_id", organizationId)
          .maybeSingle();

        // Fetch master content
        const { data: masterContent } = await supabase
          .from("master_content")
          .select("id, title, created_at, content_type, status, quality_rating")
          .eq("organization_id", organizationId)
          .eq("is_archived", false);

        // Fetch outputs
        const { data: outputs } = await supabase
          .from("outputs")
          .select("id, created_at, quality_rating")
          .eq("organization_id", organizationId)
          .eq("is_archived", false);

        // Fetch derivative assets
        const { data: derivatives } = await supabase
          .from("derivative_assets")
          .select("id, title: asset_type, created_at, asset_type, approval_status, quality_rating")
          .eq("organization_id", organizationId)
          .eq("is_archived", false);

        // Fetch scheduled content
        const { data: scheduled } = await supabase
          .from("scheduled_content")
          .select("id")
          .eq("organization_id", organizationId)
          .eq("status", "scheduled");

        // Calculate stats
        const totalContent = 
          (masterContent?.length || 0) + 
          (outputs?.length || 0) + 
          (derivatives?.length || 0);

        const piecesCreatedThisWeek = [
          ...(masterContent || []),
          ...(outputs || []),
          ...(derivatives || []),
        ].filter(item => new Date(item.created_at) >= startOfWeek).length;

        const piecesPublished = (masterContent || []).filter(
          item => item.status === "published"
        ).length;

        const piecesScheduled = scheduled?.length || 0;

        // Calculate total drafts (only master content in draft status)
        const totalDrafts = (masterContent || []).filter(
          item => item.status === "draft"
        ).length;

        // Use brand health score (from brand guidelines completeness analysis)
        const onBrandScore = brandHealth?.completeness_score ?? defaultStats.onBrandScore;

        // Calculate streak (simplified - just count days with activity in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        
        const recentDates = [
          ...(masterContent || []),
          ...(outputs || []),
          ...(derivatives || []),
        ]
          .filter(item => new Date(item.created_at) >= thirtyDaysAgo)
          .map(item => new Date(item.created_at).toDateString());

        const uniqueDates = new Set(recentDates);
        const streakDays = Math.min(uniqueDates.size, 30);

        // Get recent activity (last 5 items)
        const allActivity: RecentActivityItem[] = [
          ...(masterContent || []).map(item => ({
            id: item.id,
            title: item.title,
            type: item.content_type,
            action: item.status === "published" ? "Published" : "Created",
            time: getTimeAgo(item.created_at),
            category: 'master' as const,
            created_at: item.created_at,
          })),
          ...(outputs || []).map(item => ({
            id: item.id,
            title: "Output Content",
            type: "output",
            action: "Generated",
            time: getTimeAgo(item.created_at),
            category: 'output' as const,
            created_at: item.created_at,
          })),
          ...(derivatives || []).map(item => ({
            id: item.id,
            title: item.title || item.asset_type,
            type: item.asset_type,
            action: item.approval_status === "approved" ? "Approved" : "Created",
            time: getTimeAgo(item.created_at),
            category: 'derivative' as const,
            created_at: item.created_at,
          })),
        ];

        const recentActivity = allActivity
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);

        return {
          totalContent,
          piecesCreatedThisWeek,
          piecesPublished,
          piecesScheduled,
          onBrandScore,
          streakDays,
          recentActivity,
          totalDrafts,
        };
      } catch (e) {
        // Any failure should not block UI
        return defaultStats;
      }
    },
    enabled: !!user,
    retry: 0,
    staleTime: 1000 * 60 * 2, // Increased to 2 minutes to reduce refetches
  });
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 172800) return "Yesterday";
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}
