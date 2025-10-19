import { useState, useEffect } from "react";
import { Target, Flame, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useGoals, useUpdateGoals, useGamificationData, useUpdateGamification, ContentGoals } from "@/hooks/useGoals";
import { useStreakCalculation } from "@/hooks/useStreakCalculation";
import { getPaperTexture } from "@/utils/paperTextureStyles";

export function GoalsTab() {
  const { data: currentGoals } = useGoals();
  const { data: gamificationData } = useGamificationData();
  const { data: streakData } = useStreakCalculation();
  const updateGoals = useUpdateGoals();
  const updateGamification = useUpdateGamification();

  const [goals, setGoals] = useState<ContentGoals>({
    weekly_creation: 10,
    weekly_publishing: 5,
    weekly_scheduling: 7,
  });

  const [vacationMode, setVacationMode] = useState(false);

  useEffect(() => {
    if (currentGoals) {
      setGoals(currentGoals);
    }
  }, [currentGoals]);

  useEffect(() => {
    if (gamificationData?.streak.vacation_mode) {
      setVacationMode(gamificationData.streak.vacation_mode.active);
    }
  }, [gamificationData]);

  const handleSave = () => {
    updateGoals.mutate(goals);
  };

  const handleVacationToggle = (enabled: boolean) => {
    setVacationMode(enabled);
    
    if (gamificationData) {
      updateGamification.mutate({
        streak: {
          ...gamificationData.streak,
          vacation_mode: {
            active: enabled,
            start_date: enabled ? new Date().toISOString() : null,
            end_date: null,
          },
        },
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`${getPaperTexture('cardPaper')} border border-charcoal/10 p-8`}>
        <div className="flex items-start gap-4 mb-4">
          <div className="w-12 h-12 bg-aged-brass/10 border border-aged-brass/20 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-aged-brass" />
          </div>
          <div>
            <h2 className="font-serif text-2xl font-medium text-ink-black mb-2">
              Weekly Editorial Targets
            </h2>
            <p className="text-charcoal/70 text-sm font-light leading-relaxed">
              Set targets that challenge you, but won't break you. These goals help track your progress 
              and maintain consistency without creating burnout.
            </p>
          </div>
        </div>
      </div>

      {/* Goal Sliders */}
      <div className={`${getPaperTexture('cardPaper')} border border-charcoal/10 p-8 space-y-8`}>
        {/* Creation Goal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm uppercase tracking-wider text-charcoal/80">
              Weekly Creation Target
            </Label>
            <span className="font-serif text-3xl text-ink-black">
              {goals.weekly_creation}
            </span>
          </div>
          <Slider
            value={[goals.weekly_creation]}
            onValueChange={([value]) => setGoals({ ...goals, weekly_creation: value })}
            min={3}
            max={25}
            step={1}
            className="py-4"
          />
          <p className="text-xs text-charcoal/60 italic">
            Number of pieces you aim to create each week (3-25)
          </p>
        </div>

        {/* Publishing Goal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm uppercase tracking-wider text-charcoal/80">
              Weekly Publishing Target
            </Label>
            <span className="font-serif text-3xl text-ink-black">
              {goals.weekly_publishing}
            </span>
          </div>
          <Slider
            value={[goals.weekly_publishing]}
            onValueChange={([value]) => setGoals({ ...goals, weekly_publishing: value })}
            min={1}
            max={15}
            step={1}
            className="py-4"
          />
          <p className="text-xs text-charcoal/60 italic">
            Number of pieces you plan to publish each week (1-15)
          </p>
        </div>

        {/* Scheduling Goal */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm uppercase tracking-wider text-charcoal/80">
              Weekly Scheduling Target
            </Label>
            <span className="font-serif text-3xl text-ink-black">
              {goals.weekly_scheduling}
            </span>
          </div>
          <Slider
            value={[goals.weekly_scheduling]}
            onValueChange={([value]) => setGoals({ ...goals, weekly_scheduling: value })}
            min={1}
            max={20}
            step={1}
            className="py-4"
          />
          <p className="text-xs text-charcoal/60 italic">
            Number of pieces you aim to schedule each week (1-20)
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-charcoal/10">
          <Button
            onClick={handleSave}
            disabled={updateGoals.isPending}
            className="bg-ink-black hover:bg-charcoal text-parchment-white uppercase tracking-wider"
          >
            {updateGoals.isPending ? "Saving..." : "Save Targets"}
          </Button>
        </div>
      </div>

      {/* Streak Display */}
      <div className={`${getPaperTexture('cardPaper')} border border-charcoal/10 p-8`}>
        <div className="flex items-center gap-4 mb-6">
          <Flame className="w-8 h-8 text-aged-brass" />
          <div>
            <h3 className="font-serif text-xl font-medium text-ink-black">
              Publishing Streak
            </h3>
            <p className="text-sm text-charcoal/60">
              Consecutive weeks meeting any goal
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className={`${getPaperTexture('manuscriptPaper')} border border-charcoal/10 p-6 text-center`}>
            <div className="font-serif text-4xl text-aged-brass mb-2">
              {streakData?.currentStreak || 0}
            </div>
            <div className="text-xs uppercase tracking-wider text-charcoal/60">
              Current Streak
            </div>
          </div>
          <div className={`${getPaperTexture('manuscriptPaper')} border border-charcoal/10 p-6 text-center`}>
            <div className="font-serif text-4xl text-ink-black mb-2">
              {streakData?.longestStreak || 0}
            </div>
            <div className="text-xs uppercase tracking-wider text-charcoal/60">
              Longest Streak
            </div>
          </div>
        </div>

        {/* Grace Period Info */}
        <div className="bg-aged-brass/5 border border-aged-brass/20 p-4 mb-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-aged-brass flex-shrink-0 mt-0.5" />
            <div className="text-sm text-charcoal/70">
              <p className="font-medium mb-1">Editor's Extension</p>
              <p className="text-xs leading-relaxed">
                If you miss a day, you have 48 hours to catch up without breaking your streak. 
                This grace period helps maintain momentum without creating anxiety.
              </p>
            </div>
          </div>
        </div>

        {/* Vacation Mode */}
        <div className="flex items-center justify-between p-4 border border-charcoal/10">
          <div>
            <Label className="text-sm font-medium text-ink-black">
              Vacation Mode
            </Label>
            <p className="text-xs text-charcoal/60 mt-1">
              Pause your streak without penalty while you're away
            </p>
          </div>
          <Switch
            checked={vacationMode}
            onCheckedChange={handleVacationToggle}
          />
        </div>

        {/* Last 7 Days Activity */}
        {streakData?.dailyActivity && streakData.dailyActivity.length > 0 && (
          <div className="mt-6">
            <div className="text-xs uppercase tracking-wider text-charcoal/60 mb-3">
              Last 7 Days
            </div>
            <div className="flex gap-2">
              {streakData.dailyActivity.map((day, index) => (
                <div
                  key={day.date}
                  className="flex-1 text-center"
                  title={new Date(day.date).toLocaleDateString()}
                >
                  <div
                    className={`w-full aspect-square rounded-full border-2 mb-2 ${
                      day.hasActivity
                        ? 'bg-aged-brass border-aged-brass'
                        : 'bg-transparent border-charcoal/20'
                    }`}
                  />
                  <div className="text-[10px] text-charcoal/50">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
