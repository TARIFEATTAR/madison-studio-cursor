import { useState, useEffect } from "react";
import { X, Calendar } from "lucide-react";
import { useDipWeekCalculation } from "@/hooks/useDipWeekCalculation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const DailyBriefBanner = () => {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(() => 
    localStorage.getItem('hide-daily-brief') === 'true'
  );
  const [contentCount, setContentCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const dipWeekInfo = useDipWeekCalculation(new Date());

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      // Get content from this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const { count: content } = await supabase
        .from('master_content')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Get pending tasks
      const { count: tasks } = await supabase
        .from('calendar_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false);

      setContentCount(content || 0);
      setTaskCount(tasks || 0);
    };

    fetchStats();
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('hide-daily-brief', 'true');
    setIsDismissed(true);
  };

  if (isDismissed || !dipWeekInfo) return null;

  return (
    <div className="w-full bg-deep-burgundy/5 border-b border-deep-burgundy/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-aged-brass" />
              <span className="text-foreground/80">
                Week <span className="font-semibold text-aged-brass">{dipWeekInfo.week_number}</span>: {dipWeekInfo.pillar}
              </span>
            </div>
            
            <span className="hidden sm:inline text-muted-foreground">•</span>
            
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-muted-foreground text-xs uppercase tracking-wide">
                {dipWeekInfo.visual_world}
              </span>
            </div>

            {dipWeekInfo.core_lexicon && dipWeekInfo.core_lexicon.length > 0 && (
              <>
                <span className="hidden md:inline text-muted-foreground">•</span>
                <div className="hidden md:flex items-center gap-1.5">
                  {dipWeekInfo.core_lexicon.slice(0, 3).map((term, idx) => (
                    <span key={idx} className="text-xs text-aged-brass/70">
                      {term}
                    </span>
                  ))}
                </div>
              </>
            )}

            <span className="text-muted-foreground">|</span>

            <div className="flex items-center gap-3 text-xs">
              <span className="text-foreground/70">
                🎯 <span className="font-medium">{contentCount}</span> piece{contentCount !== 1 ? 's' : ''} this week
              </span>
              <span className="text-foreground/70">
                ✅ <span className="font-medium">{taskCount}</span> pending
              </span>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 rounded-md hover:bg-deep-burgundy/10 transition-colors"
            aria-label="Dismiss daily brief"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
};
