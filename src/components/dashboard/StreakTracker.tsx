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

export function StreakTracker() {
  const { data: streakData } = useStreakCalculation();

  return (
    <TooltipProvider>
      <div className={`${getPaperTexture('cardPaper')} border border-charcoal/10 p-5`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-aged-brass" />
            <h3 className="font-serif text-base font-medium text-ink-black">
              Publishing Streak
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-charcoal/40 hover:text-aged-brass transition-colors">
                  <HelpCircle className="w-3.5 h-3.5" />
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
                  <div className="text-[10px] bg-aged-brass/10 border border-aged-brass/20 px-2 py-0.5 cursor-help">
                    <span className="text-aged-brass font-medium">Grace Period</span>
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
              className="h-7 w-7 p-0 hover:bg-aged-brass/10"
            >
              <Settings className="w-3.5 h-3.5 text-charcoal/60 hover:text-aged-brass" />
            </Button>
          </div>
        </div>

      {/* Current Streak - Large Display */}
      <div className="text-center mb-5">
        <div className="font-serif text-6xl font-light text-aged-brass mb-1">
          {streakData?.currentStreak || 0}
        </div>
        <div className="text-xs uppercase tracking-wider text-charcoal/60">
          {streakData?.currentStreak === 1 ? 'Day' : 'Days'} Active
        </div>
        <p className="text-[10px] italic text-charcoal/50 mt-1.5">
          Keep creating to maintain momentum
        </p>
      </div>

      {/* Brass accent line */}
      <div className="w-24 h-[1px] bg-aged-brass/30 mx-auto mb-8" />

      {/* Longest Streak Badge */}
      {(streakData?.longestStreak || 0) > 0 && (
        <div className="flex items-center justify-center gap-3 mb-8">
          <Award className="w-5 h-5 text-ink-black/40" />
          <div className="text-center">
            <div className="text-xs uppercase tracking-wider text-charcoal/60 mb-1">
              Personal Best
            </div>
            <div className="font-serif text-2xl text-ink-black">
              {streakData.longestStreak} {streakData.longestStreak === 1 ? 'Day' : 'Days'}
            </div>
          </div>
        </div>
      )}

      {/* Mini Calendar - Last 7 Days */}
      {streakData?.dailyActivity && streakData.dailyActivity.length > 0 && (
        <div className={`${getPaperTexture('manuscriptPaper')} border border-charcoal/10 p-4`}>
          <div className="text-[10px] uppercase tracking-wider text-charcoal/50 mb-3 text-center">
            Last 7 Days
          </div>
          <div className="flex gap-2 justify-center">
            {streakData.dailyActivity.map((day) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              
              return (
                <div
                  key={day.date}
                  className="text-center"
                  title={date.toLocaleDateString()}
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 mb-1 transition-all ${
                      day.hasActivity
                        ? 'bg-aged-brass border-aged-brass shadow-sm'
                        : 'bg-transparent border-charcoal/20'
                    }`}
                  />
                  <div className="text-[9px] text-charcoal/50 uppercase">
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
