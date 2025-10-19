import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ScoreHistoryChartProps {
  organizationId: string;
}

export function ScoreHistoryChart({ organizationId }: ScoreHistoryChartProps) {
  const { data: history, isLoading } = useQuery({
    queryKey: ["brand-health-history", organizationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_health_history")
        .select("*")
        .eq("organization_id", organizationId)
        .order("analyzed_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!organizationId,
  });

  if (isLoading) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-8">
        <div className="animate-pulse">
          <div className="h-4 bg-charcoal/10 w-24 mb-4"></div>
          <div className="h-32 bg-charcoal/10 w-full"></div>
        </div>
      </div>
    );
  }

  if (!history || history.length < 2) {
    return (
      <div className="bg-parchment-white border border-charcoal/10 p-8">
        <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/80 mb-4">
          Score History
        </p>
        <p className="text-sm text-charcoal/60">
          Run another analysis to start tracking your progress over time.
        </p>
      </div>
    );
  }

  // Calculate trend - compare earliest to latest for overall progress
  const latestScore = history[0].completeness_score;
  const earliestScore = history[history.length - 1].completeness_score;
  const scoreDiff = latestScore - earliestScore;
  const trend = scoreDiff > 0 ? "up" : scoreDiff < 0 ? "down" : "same";
  
  // Format earliest date for display
  const earliestDate = new Date(history[history.length - 1].analyzed_at).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <div className="bg-parchment-white border border-charcoal/10 p-8">
      <p className="text-xs uppercase tracking-[0.15em] font-sans text-charcoal/80 mb-6">
        Score History
      </p>

      {/* Trend Indicator */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          {trend === "up" && (
            <>
              <TrendingUp className="w-5 h-5 text-forest-ink" />
              <span className="font-serif text-2xl text-forest-ink">+{scoreDiff}%</span>
            </>
          )}
          {trend === "down" && (
            <>
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="font-serif text-2xl text-red-600">{scoreDiff}%</span>
            </>
          )}
          {trend === "same" && (
            <>
              <Minus className="w-5 h-5 text-charcoal/40" />
              <span className="font-serif text-2xl text-charcoal/60">No change</span>
            </>
          )}
        </div>
        <p className="text-xs text-charcoal/60">Since {earliestDate}</p>
      </div>

      {/* Simple Score List */}
      <div className="space-y-3">
        {history.slice(0, 5).map((record, idx) => (
          <div
            key={record.id}
            className="flex items-center justify-between py-2 border-b border-charcoal/5 last:border-0"
          >
            <span className="text-xs text-charcoal/60">
              {new Date(record.analyzed_at).toLocaleDateString()}
            </span>
            <span className={`font-serif text-sm ${
              record.completeness_score >= 90 ? "text-forest-ink" :
              record.completeness_score >= 70 ? "text-aged-brass" :
              "text-red-600"
            }`}>
              {record.completeness_score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
