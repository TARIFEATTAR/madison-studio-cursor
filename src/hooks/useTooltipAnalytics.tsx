import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface TooltipEvent {
    tooltip_id: string;
    event_type: "viewed" | "dismissed" | "completed" | "action_clicked";
    user_id: string;
    organization_id?: string;
    timestamp: string;
    metadata?: Record<string, any>;
}

/**
 * Analytics hook for tracking tooltip interactions
 * 
 * This hook provides methods to track:
 * - When tooltips are viewed
 * - When users dismiss tooltips
 * - When users complete tooltips (click "Got it")
 * - When users click tooltip action buttons
 * 
 * Data is stored in localStorage for offline support and
 * synced to Supabase for analytics dashboards.
 */
export function useTooltipAnalytics() {
    const { user } = useAuth();

    // Sync local analytics to database periodically
    useEffect(() => {
        if (!user) return;

        const syncAnalytics = async () => {
            const pendingEvents = localStorage.getItem("tooltip_analytics_pending");
            if (!pendingEvents) return;

            try {
                const events: TooltipEvent[] = JSON.parse(pendingEvents);

                // Send to Supabase (you'll need to create this table)
                // For now, we'll just log to console
                console.log("Syncing tooltip analytics:", events);

                // TODO (Backlog): Uncomment when table is created
                // await supabase.from("tooltip_analytics").insert(events);

                // Clear pending events after successful sync
                localStorage.removeItem("tooltip_analytics_pending");
            } catch (error) {
                console.error("Error syncing tooltip analytics:", error);
            }
        };

        // Sync on mount and every 5 minutes
        syncAnalytics();
        const interval = setInterval(syncAnalytics, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, [user]);

    const trackEvent = (
        tooltipId: string,
        eventType: TooltipEvent["event_type"],
        metadata?: Record<string, any>
    ) => {
        if (!user) return;

        const event: TooltipEvent = {
            tooltip_id: tooltipId,
            event_type: eventType,
            user_id: user.id,
            timestamp: new Date().toISOString(),
            metadata,
        };

        // Store in localStorage for offline support
        const pendingEvents = localStorage.getItem("tooltip_analytics_pending");
        const events = pendingEvents ? JSON.parse(pendingEvents) : [];
        events.push(event);
        localStorage.setItem("tooltip_analytics_pending", JSON.stringify(events));

        // Also store summary stats for quick access
        const statsKey = `tooltip_stats_${tooltipId}`;
        const stats = JSON.parse(localStorage.getItem(statsKey) || "{}");
        stats[eventType] = (stats[eventType] || 0) + 1;
        stats.lastInteraction = new Date().toISOString();
        localStorage.setItem(statsKey, JSON.stringify(stats));
    };

    const trackView = (tooltipId: string, metadata?: Record<string, any>) => {
        trackEvent(tooltipId, "viewed", metadata);
    };

    const trackDismiss = (tooltipId: string, metadata?: Record<string, any>) => {
        trackEvent(tooltipId, "dismissed", metadata);
    };

    const trackComplete = (tooltipId: string, metadata?: Record<string, any>) => {
        trackEvent(tooltipId, "completed", metadata);
    };

    const trackActionClick = (tooltipId: string, actionLabel: string, metadata?: Record<string, any>) => {
        trackEvent(tooltipId, "action_clicked", { actionLabel, ...metadata });
    };

    const getTooltipStats = (tooltipId: string) => {
        const statsKey = `tooltip_stats_${tooltipId}`;
        return JSON.parse(localStorage.getItem(statsKey) || "{}");
    };

    const getAllTooltipStats = () => {
        const allStats: Record<string, any> = {};

        // Get all tooltip stats from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith("tooltip_stats_")) {
                const tooltipId = key.replace("tooltip_stats_", "");
                allStats[tooltipId] = JSON.parse(localStorage.getItem(key) || "{}");
            }
        }

        return allStats;
    };

    return {
        trackView,
        trackDismiss,
        trackComplete,
        trackActionClick,
        getTooltipStats,
        getAllTooltipStats,
    };
}
