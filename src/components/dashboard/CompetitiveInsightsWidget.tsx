import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, ExternalLink } from "lucide-react";
import { useCompetitiveIntelligence } from "@/hooks/useCompetitiveIntelligence";
import { formatRelativeTime } from "@/lib/dateUtils";
import { Button } from "@/components/ui/button";

const insightTypeColors: Record<string, string> = {
  messaging: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  pricing: "bg-green-500/10 text-green-500 border-green-500/20",
  content_strategy: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  positioning: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  opportunity: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  general: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export function CompetitiveInsightsWidget() {
  const { insights, preferences, loading, markInsightAsRead } = useCompetitiveIntelligence();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Weekly Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px]">
            <div className="animate-pulse text-sm text-muted-foreground">Loading insights...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences?.competitive_intelligence_enabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Weekly Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              Enable Competitive Intelligence in Settings to start monitoring competitors
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/settings?tab=apps">Go to Settings</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Weekly Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No insights yet. Add competitors in Settings to start monitoring.
            </p>
            {preferences.last_scan_at && (
              <p className="text-xs text-muted-foreground mt-2">
                Last scan: {formatRelativeTime(preferences.last_scan_at)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-500" />
            Weekly Intelligence
          </CardTitle>
          {preferences.last_scan_at && (
            <span className="text-xs text-muted-foreground">
              Last scan: {formatRelativeTime(preferences.last_scan_at)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`p-4 border rounded-lg transition-colors ${
                  insight.is_read ? 'bg-muted/30' : 'bg-card'
                }`}
                onClick={() => !insight.is_read && markInsightAsRead(insight.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <Badge
                    variant="outline"
                    className={insightTypeColors[insight.insight_type] || insightTypeColors.general}
                  >
                    {insight.insight_type.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(insight.discovered_at)}
                  </span>
                </div>

                <p className="text-sm mb-2 leading-relaxed">{insight.finding}</p>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-medium">{insight.competitor_name}</span>
                  {insight.source_url && (
                    <a
                      href={insight.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-primary transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" />
                      View source
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
