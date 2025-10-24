import { Flame, FileText, Target, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useDashboardStats } from "@/hooks/useDashboardStats";

interface MetricCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  sublabel: string;
}

function MetricCard({ icon, value, label, sublabel }: MetricCardProps) {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-warm-gray/5 rounded-lg">
      <div className="text-brass mb-2">{icon}</div>
      <div className="text-3xl font-serif font-light text-ink-black mb-1">
        {value}
      </div>
      <div className="text-sm font-medium text-charcoal uppercase tracking-wide mb-1">
        {label}
      </div>
      <div className="text-xs text-charcoal/60">{sublabel}</div>
    </div>
  );
}

export function ThisWeekMomentum() {
  const { data: stats } = useDashboardStats();

  // Check if user has activity this week
  const piecesCreated = stats?.piecesCreatedThisWeek || 0;
  const streak = stats?.streakDays || 0;
  const onBrandPercent = stats?.onBrandScore || 0;

  const hasActivityThisWeek = piecesCreated > 0 || streak > 0;

  // Get streak message
  const getStreakMessage = () => {
    if (streak >= 14) return "Unstoppable!";
    if (streak >= 7) return "Incredible dedication!";
    if (streak >= 3) return "On fire! Keep it going!";
    if (streak >= 1) return "Building momentum!";
    return "Start your streak!";
  };

  if (!hasActivityThisWeek) {
    return null;
  }

  return (
    <Collapsible defaultOpen={false}>
      <Card className="bg-parchment-white border border-charcoal/10">
        <CollapsibleTrigger className="w-full p-6 flex items-center justify-between hover:bg-warm-gray/5 transition-colors">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-5 h-5 text-charcoal/60 transition-transform ui-open:rotate-180" />
            <span className="text-lg font-serif font-light text-ink-black">
              This Week's Activity
            </span>
          </div>
          <span className="text-sm text-charcoal/60">
            {piecesCreated} pieces created
          </span>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <MetricCard
                icon={<Flame className="w-6 h-6" />}
                value={streak}
                label="Day Streak"
                sublabel={getStreakMessage()}
              />
              <MetricCard
                icon={<FileText className="w-6 h-6" />}
                value={piecesCreated}
                label="Pieces Created"
                sublabel="This week"
              />
              <MetricCard
                icon={<Target className="w-6 h-6" />}
                value={`${onBrandPercent}%`}
                label="On-Brand"
                sublabel="Quality rating"
              />
            </div>

            <Button
              variant="ghost"
              className="w-full text-charcoal hover:text-ink-black"
            >
              View Detailed Analytics →
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
