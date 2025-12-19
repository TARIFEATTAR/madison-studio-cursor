/**
 * Brand Health Widget
 * 
 * Compact widget showing brand consistency score.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

export function BrandHealthWidget() {
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const [score, setScore] = useState<number | null>(null);
  const [trend, setTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadScore = async () => {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        // Get recent brand consistency scores
        const { data } = await supabase
          .from('master_content')
          .select('brand_consistency_score')
          .eq('organization_id', organizationId)
          .not('brand_consistency_score', 'is', null)
          .order('created_at', { ascending: false })
          .limit(10);

        if (data && data.length > 0) {
          const scores = data.map(d => d.brand_consistency_score).filter(Boolean) as number[];
          const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
          setScore(Math.round(avgScore));

          // Calculate trend (compare first half vs second half)
          if (scores.length >= 4) {
            const recentAvg = scores.slice(0, Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) / Math.floor(scores.length / 2);
            const olderAvg = scores.slice(Math.floor(scores.length / 2)).reduce((a, b) => a + b, 0) / (scores.length - Math.floor(scores.length / 2));
            
            if (recentAvg > olderAvg + 5) setTrend('up');
            else if (recentAvg < olderAvg - 5) setTrend('down');
            else setTrend('stable');
          }
        }
      } catch (e) {
        console.error('[BrandHealthWidget] Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadScore();
  }, [organizationId]);

  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-green-600';
    if (s >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProgressColor = (s: number) => {
    if (s >= 85) return 'bg-green-500';
    if (s >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

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
    <Card 
      className="h-full cursor-pointer hover:shadow-md transition-all"
      onClick={() => navigate('/brand-health')}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Heart className="w-4 h-4 text-red-500" />
          Brand Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {score !== null ? (
          <>
            {/* Score Display */}
            <div className="flex items-center justify-between">
              <div className={`text-3xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <div className="flex items-center gap-1 text-xs">
                {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
                {trend === 'down' && <TrendingDown className="w-4 h-4 text-red-500" />}
                <span className="text-muted-foreground">
                  {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <Progress 
              value={score} 
              className="h-2"
              style={{ 
                '--progress-background': score >= 85 ? '#22c55e' : score >= 70 ? '#f59e0b' : '#ef4444' 
              } as React.CSSProperties}
            />

            {/* Quick Action */}
            <button className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
              View Details
              <ArrowRight className="w-3 h-3" />
            </button>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-sm text-muted-foreground mb-2">
              No brand data yet
            </p>
            <button 
              className="text-xs text-primary flex items-center justify-center gap-1"
              onClick={() => navigate('/brand-health')}
            >
              Set up Brand
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

