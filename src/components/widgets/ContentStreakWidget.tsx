/**
 * Content Streak Widget
 * 
 * Gamification widget showing content creation streak.
 */

import { useState, useEffect } from 'react';
import { Flame, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

export function ContentStreakWidget() {
  const { organizationId } = useOrganization();
  const [streak, setStreak] = useState(0);
  const [thisWeek, setThisWeek] = useState(0);
  const [weeklyGoal] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStreak = async () => {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get content created in the last 30 days to calculate streak
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data } = await supabase
          .from('master_content')
          .select('created_at')
          .eq('organization_id', organizationId)
          .gte('created_at', thirtyDaysAgo.toISOString())
          .order('created_at', { ascending: false });

        if (data && data.length > 0) {
          // Calculate streak (consecutive days with content)
          const dates = data.map(d => new Date(d.created_at).toDateString());
          const uniqueDates = [...new Set(dates)];
          
          let currentStreak = 0;
          const today = new Date();
          
          for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            const dateStr = checkDate.toDateString();
            
            if (uniqueDates.includes(dateStr)) {
              currentStreak++;
            } else if (i > 0) {
              break;
            }
          }
          
          setStreak(currentStreak);

          // Count this week's content
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          const thisWeekContent = data.filter(d => 
            new Date(d.created_at) >= weekStart
          ).length;
          setThisWeek(thisWeekContent);
        }
      } catch (e) {
        console.error('[ContentStreakWidget] Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStreak();
  }, [organizationId]);

  const progress = Math.min((thisWeek / weeklyGoal) * 100, 100);
  const flameColor = streak >= 7 ? 'text-orange-500' : streak >= 3 ? 'text-amber-500' : 'text-muted-foreground';

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Flame className={`w-4 h-4 ${flameColor}`} />
          Content Streak
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Streak Display */}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground">{streak}</div>
          <div className="text-xs text-muted-foreground">day streak</div>
        </div>

        {/* Weekly Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              This week
            </span>
            <span className="font-medium">{thisWeek}/{weeklyGoal}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Motivation */}
        {streak > 0 && (
          <div className="text-center">
            <span className="text-xs text-primary flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {streak >= 7 ? 'On fire! 🔥' : streak >= 3 ? 'Building momentum!' : 'Keep going!'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

