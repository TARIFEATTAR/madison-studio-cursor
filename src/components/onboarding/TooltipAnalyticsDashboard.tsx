import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTooltipAnalytics } from "@/hooks/useTooltipAnalytics";
import { getABTestVariant } from "@/config/tooltipConfig";
import { BarChart, TrendingUp, Eye, X, Check, MousePointer } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface TooltipStats {
    viewed?: number;
    dismissed?: number;
    completed?: number;
    action_clicked?: number;
    lastInteraction?: string;
}

/**
 * Tooltip Analytics Dashboard
 * 
 * Displays analytics for all tooltips to help understand:
 * - Which tooltips are most viewed
 * - Which tooltips are most helpful (high completion rate)
 * - Which tooltips are skipped (high dismissal rate)
 * - Which tooltips drive action (high action click rate)
 */
export function TooltipAnalyticsDashboard() {
    const { getAllTooltipStats } = useTooltipAnalytics();
    const [stats, setStats] = useState<Record<string, TooltipStats>>({});
    const abVariant = getABTestVariant();

    useEffect(() => {
        // Load stats on mount and refresh every 5 seconds
        const loadStats = () => {
            setStats(getAllTooltipStats());
        };

        loadStats();
        const interval = setInterval(loadStats, 5000);

        return () => clearInterval(interval);
    }, []);

    const tooltipNames: Record<string, string> = {
        library_content_type_filter: "Library: Content Type Filter",
        library_search: "Library: Search Bar",
        calendar_schedule_button: "Calendar: Schedule Button",
        brand_builder_voice: "Brand Builder: Voice",
        multiply_master_content: "Multiply: Master Content",
        editor_refine_content: "Editor: Refine Content",
    };

    const calculateCompletionRate = (tooltipStats: TooltipStats) => {
        const total = (tooltipStats.viewed || 0);
        const completed = (tooltipStats.completed || 0);
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

    const calculateDismissalRate = (tooltipStats: TooltipStats) => {
        const total = (tooltipStats.viewed || 0);
        const dismissed = (tooltipStats.dismissed || 0);
        return total > 0 ? Math.round((dismissed / total) * 100) : 0;
    };

    const calculateActionRate = (tooltipStats: TooltipStats) => {
        const total = (tooltipStats.viewed || 0);
        const actionClicked = (tooltipStats.action_clicked || 0);
        return total > 0 ? Math.round((actionClicked / total) * 100) : 0;
    };

    const sortedTooltips = Object.entries(stats).sort((a, b) => {
        return (b[1].viewed || 0) - (a[1].viewed || 0);
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-serif font-bold text-foreground mb-2">
                    Tooltip Analytics
                </h2>
                <p className="text-muted-foreground">
                    Track how users interact with onboarding tooltips
                </p>
                {abVariant && (
                    <div className="mt-2 inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-md">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm text-primary">
                            A/B Test Variant: <strong>{abVariant.name}</strong> ({abVariant.id})
                        </span>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Total Views
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.values(stats).reduce((sum, s) => sum + (s.viewed || 0), 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Completions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.values(stats).reduce((sum, s) => sum + (s.completed || 0), 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <X className="w-4 h-4" />
                            Dismissals
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.values(stats).reduce((sum, s) => sum + (s.dismissed || 0), 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <MousePointer className="w-4 h-4" />
                            Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {Object.values(stats).reduce((sum, s) => sum + (s.action_clicked || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Individual Tooltip Stats */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart className="w-5 h-5" />
                        Tooltip Performance
                    </CardTitle>
                    <CardDescription>
                        Detailed metrics for each tooltip
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sortedTooltips.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No tooltip data yet. Tooltips will appear here once users interact with them.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedTooltips.map(([tooltipId, tooltipStats]) => {
                                const completionRate = calculateCompletionRate(tooltipStats);
                                const dismissalRate = calculateDismissalRate(tooltipStats);
                                const actionRate = calculateActionRate(tooltipStats);

                                return (
                                    <div key={tooltipId} className="space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-medium text-foreground">
                                                    {tooltipNames[tooltipId] || tooltipId}
                                                </h4>
                                                <p className="text-sm text-muted-foreground">
                                                    {tooltipStats.viewed || 0} views
                                                </p>
                                            </div>
                                            <div className="text-right text-sm space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Check className="w-3 h-3 text-green-500" />
                                                    <span>{completionRate}% completed</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <X className="w-3 h-3 text-red-500" />
                                                    <span>{dismissalRate}% dismissed</span>
                                                </div>
                                                {actionRate > 0 && (
                                                    <div className="flex items-center gap-2">
                                                        <MousePointer className="w-3 h-3 text-blue-500" />
                                                        <span>{actionRate}% took action</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="text-muted-foreground">Completion Rate</span>
                                                <span className="font-medium">{completionRate}%</span>
                                            </div>
                                            <Progress value={completionRate} className="h-2" />
                                        </div>

                                        <div className="grid grid-cols-4 gap-4 pt-2 border-t">
                                            <div className="text-center">
                                                <div className="text-xs text-muted-foreground">Viewed</div>
                                                <div className="text-lg font-semibold">{tooltipStats.viewed || 0}</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-muted-foreground">Completed</div>
                                                <div className="text-lg font-semibold text-green-600">
                                                    {tooltipStats.completed || 0}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-muted-foreground">Dismissed</div>
                                                <div className="text-lg font-semibold text-red-600">
                                                    {tooltipStats.dismissed || 0}
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs text-muted-foreground">Actions</div>
                                                <div className="text-lg font-semibold text-blue-600">
                                                    {tooltipStats.action_clicked || 0}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
