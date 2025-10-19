import { Flame, Award, HelpCircle, Settings } from "lucide-react";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";
import { getPaperTexture } from "@/utils/paperTextureStyles";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBrandColor } from "@/hooks/useBrandColor";

export function StreakTracker() {
  const { data: streakData } = useStreakCalculation();
  const { brandColor } = useBrandColor();

  return (
    <TooltipProvider>
      <div className={`${getPaperTexture('cardPaper')} border border-charcoal/10 p-3`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <Flame 
              className="w-4 h-4" 
              style={{ color: (streakData?.currentStreak || 0) > 0 ? brandColor : 'hsl(var(--aged-brass))' }}
            />
            <h3 className="font-serif text-xs font-medium">Publishing Streak</h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-charcoal/40 hover:text-aged-brass transition-colors">
                  <HelpCircle className="w-3 h-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-ink-black text-parchment-white border-charcoal/20">
                <p className="text-xs leading-relaxed">
                  <strong>How streaks work:</strong> Create, publish, or schedule at least one piece per week to maintain your streak. 
                  You have a 3-day grace period after each week.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex items-center gap-2">
            {streakData?.gracePeriodActive && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="text-[9px] bg-aged-brass/10 border border-aged-brass/20 px-1.5 py-0.5 cursor-help">
                    <span className="text-aged-brass font-medium">Grace</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-ink-black text-parchment-white border-charcoal/20">
                  <p className="text-xs leading-relaxed">
                    You have 3 days after the week ends to create content and keep your streak alive.
                  </p>
                </TooltipContent>
              </Tooltip>
            )}
            <Button
              onClick={() => {
                const settingsUrl = new URL('/settings', window.location.href);
                settingsUrl.searchParams.set('tab', 'goals');
                window.location.href = settingsUrl.pathname + settingsUrl.search;
              }}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-aged-brass/10"
            >
              <Settings className="w-3 h-3 text-charcoal/60 hover:text-aged-brass" />
            </Button>
          </div>
        </div>

      {/* Horizontal Layout: Number on left, details on right */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div 
            className="font-serif text-4xl font-light leading-none"
            style={{ color: (streakData?.currentStreak || 0) > 0 ? brandColor : 'hsl(var(--aged-brass))' }}
          >
            {streakData?.currentStreak || 0}
          </div>
          <div className="text-[9px] uppercase tracking-wider text-charcoal/60">
            Days Active
          </div>
        </div>
        
        {(streakData?.longestStreak || 0) > 0 && (
          <div className="text-right">
            <div className="text-[9px] uppercase tracking-wider text-charcoal/60">Best</div>
            <div className="font-serif text-lg text-ink-black">{streakData.longestStreak}</div>
          </div>
        )}
      </div>

      {/* Compact Last 7 Days */}
      {streakData?.dailyActivity && streakData.dailyActivity.length > 0 && (
        <div className="border-t border-charcoal/10 pt-2">
          <div className="text-[9px] uppercase tracking-wider text-charcoal/50 mb-2 text-center">
            Last 7 Days
          </div>
          <div className="flex gap-1.5 justify-center">
            {streakData.dailyActivity.map((day) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
              
              return (
                <div
                  key={day.date}
                  className="text-center"
                  title={date.toLocaleDateString()}
                >
                  <div
                    className={`w-6 h-6 rounded-full border ${
                      day.hasActivity ? '' : 'border-charcoal/20'
                    }`}
                    style={day.hasActivity ? { 
                      backgroundColor: brandColor, 
                      borderColor: brandColor 
                    } : {}}
                  />
                  <div className="text-[8px] text-charcoal/50 mt-0.5">
                    {dayName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Motivational Copy */}
      {streakData && streakData.currentStreak === 0 && (
        <div className="mt-6 text-center">
          <p className="text-xs italic text-charcoal/60 font-serif">
            Start your streak today—every piece counts
          </p>
        </div>
      )}
      
      {streakData && streakData.currentStreak > 0 && streakData.currentStreak < 7 && (
        <div className="mt-6 text-center">
          <p className="text-xs italic text-charcoal/60 font-serif">
            Building momentum—keep going!
          </p>
        </div>
      )}
      
      {streakData && streakData.currentStreak >= 7 && streakData.currentStreak < 14 && (
        <div className="mt-6 text-center">
          <p className="text-xs italic text-charcoal/60 font-serif">
            Excellent consistency—you're in the rhythm
          </p>
        </div>
      )}
      
      {streakData && streakData.currentStreak >= 14 && (
        <div className="mt-6 text-center">
          <p className="text-xs italic text-charcoal/60 font-serif">
            Remarkable dedication—you're a publishing professional
          </p>
        </div>
        )}
      </div>
    </TooltipProvider>
  );
}
