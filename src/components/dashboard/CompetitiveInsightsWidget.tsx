import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompetitiveIntelligence } from "@/hooks/useCompetitiveIntelligence";
import { Loader2, TrendingUp, AlertCircle, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";

interface CompetitiveInsightsWidgetProps {
  organizationId: string | null;
}

export function CompetitiveInsightsWidget({ organizationId }: CompetitiveInsightsWidgetProps) {
  const { insights, loading, markInsightAsRead } = useCompetitiveIntelligence(organizationId);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Competitive Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const unreadInsights = insights.filter(i => !i.is_read);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <CardTitle>Competitive Intelligence</CardTitle>
          </div>
          {unreadInsights.length > 0 && (
            <Badge variant="default" className="bg-amber-500">
              {unreadInsights.length} new
            </Badge>
          )}
        </div>
        <CardDescription>
          Latest insights from competitor monitoring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No insights yet. Add competitors to start monitoring.</p>
          </div>
        ) : (
          insights.slice(0, 5).map((insight) => (
            <div
              key={insight.id}
              className={`p-4 rounded-lg border ${
                insight.is_read ? 'bg-background' : 'bg-accent/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{insight.competitor_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {insight.insight_type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{insight.finding}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => markInsightAsRead(insight.id)}
                  className="shrink-0"
                >
                  {insight.is_read ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {format(new Date(insight.discovered_at), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
