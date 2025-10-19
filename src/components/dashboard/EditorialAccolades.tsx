import { useState } from "react";
import { Award, Lock, ChevronRight, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useGamificationData } from "@/hooks/useGoals";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { getPaperTexture } from "@/utils/paperTextureStyles";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Accolade {
  id: string;
  title: string;
  description: string;
  requirement: string;
  checkProgress: (stats: any) => { current: number; target: number; unlocked: boolean };
}

const ACCOLADES: Accolade[] = [
  {
    id: 'novice',
    title: 'The Novice',
    description: 'Your editorial journey begins',
    requirement: 'Create your first 10 pieces of content',
    checkProgress: (stats) => ({
      current: stats?.totalContent || 0,
      target: 10,
      unlocked: (stats?.totalContent || 0) >= 10,
    }),
  },
  {
    id: 'wordsmith',
    title: 'The Wordsmith',
    description: 'Mastering the craft of creation',
    requirement: 'Create 50 pieces of content',
    checkProgress: (stats) => ({
      current: stats?.totalContent || 0,
      target: 50,
      unlocked: (stats?.totalContent || 0) >= 50,
    }),
  },
  {
    id: 'columnist',
    title: 'The Columnist',
    description: 'Consistency is your signature',
    requirement: 'Maintain a 10-week streak',
    checkProgress: (stats) => ({
      current: Math.floor((stats?.streakDays || 0) / 7),
      target: 10,
      unlocked: Math.floor((stats?.streakDays || 0) / 7) >= 10,
    }),
  },
  {
    id: 'publisher',
    title: 'The Publisher',
    description: 'Your work reaches the world',
    requirement: 'Publish 100 pieces',
    checkProgress: (stats) => ({
      current: stats?.piecesPublished || 0,
      target: 100,
      unlocked: (stats?.piecesPublished || 0) >= 100,
    }),
  },
  {
    id: 'editor_in_chief',
    title: 'The Editor-in-Chief',
    description: 'Leading with excellence',
    requirement: '100 pieces created and 50 published',
    checkProgress: (stats) => ({
      current: Math.min(stats?.totalContent || 0, stats?.piecesPublished || 0),
      target: 50,
      unlocked: (stats?.totalContent || 0) >= 100 && (stats?.piecesPublished || 0) >= 50,
    }),
  },
  {
    id: 'bureau_chief',
    title: 'The Bureau Chief',
    description: 'Excellence and consistency combined',
    requirement: '20-week streak with 90%+ quality',
    checkProgress: (stats) => ({
      current: Math.floor((stats?.streakDays || 0) / 7),
      target: 20,
      unlocked: Math.floor((stats?.streakDays || 0) / 7) >= 20 && (stats?.onBrandScore || 0) >= 90,
    }),
  },
  {
    id: 'literary_master',
    title: 'The Literary Master',
    description: 'A true publishing professional',
    requirement: '500 total pieces and 6 months active',
    checkProgress: (stats) => ({
      current: stats?.totalContent || 0,
      target: 500,
      unlocked: (stats?.totalContent || 0) >= 500,
    }),
  },
];

export function EditorialAccolades() {
  const [showModal, setShowModal] = useState(false);
  const { data: gamificationData } = useGamificationData();
  const { data: stats } = useDashboardStats();

  const earnedAccolades = ACCOLADES.filter(accolade => 
    accolade.checkProgress(stats).unlocked
  );

  const currentAccolade = earnedAccolades[earnedAccolades.length - 1] || ACCOLADES[0];
  const nextAccolade = ACCOLADES.find(accolade => 
    !accolade.checkProgress(stats).unlocked
  );

  const nextProgress = nextAccolade ? nextAccolade.checkProgress(stats) : null;
  const progressPercent = nextProgress 
    ? Math.min((nextProgress.current / nextProgress.target) * 100, 100)
    : 100;

  return (
    <TooltipProvider>
      <div 
        className={`${getPaperTexture('cardPaper')} border border-charcoal/10 p-3 cursor-pointer hover:border-aged-brass/40 transition-all group`}
        onClick={() => setShowModal(true)}
      >
        {/* Header - Single Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-aged-brass" />
            <div>
              <div className="text-[8px] uppercase tracking-wider text-charcoal/50">
                Editorial Accolade
              </div>
              <h3 className="font-serif text-xs font-medium text-ink-black">
                {currentAccolade.title}
              </h3>
            </div>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-charcoal/30 group-hover:text-aged-brass transition-colors" />
        </div>

        {/* Next Accolade Progress - Compact */}
        {nextAccolade && nextProgress && (
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] text-charcoal/60">Next: {nextAccolade.title}</span>
              <span className="text-[10px] font-medium text-ink-black">{nextProgress.current}/{nextProgress.target}</span>
            </div>
            <div className="w-full h-0.5 bg-charcoal/10">
              <div 
                className="h-full bg-aged-brass transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* All Unlocked */}
        {!nextAccolade && (
          <div className="text-center py-2">
            <p className="text-xs font-medium text-aged-brass">
              All accolades unlocked!
            </p>
            <p className="text-[9px] italic text-charcoal/60 mt-0.5">
              You've mastered the editorial bureau
            </p>
          </div>
        )}
      </div>

      {/* Full Accolades Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className={`${getPaperTexture('cardPaper')} max-w-2xl max-h-[80vh] overflow-y-auto`}>
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-ink-black flex items-center gap-3">
              <Award className="w-6 h-6 text-aged-brass" />
              Editorial Bureau Accolades
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            {ACCOLADES.map((accolade) => {
              const progress = accolade.checkProgress(stats);
              const isUnlocked = progress.unlocked;

              return (
                <div
                  key={accolade.id}
                  className={`${getPaperTexture('manuscriptPaper')} border p-6 ${
                    isUnlocked 
                      ? 'border-aged-brass/30 bg-aged-brass/5' 
                      : 'border-charcoal/10 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 flex items-center justify-center border-2 ${
                      isUnlocked 
                        ? 'bg-aged-brass/20 border-aged-brass' 
                        : 'bg-charcoal/5 border-charcoal/20'
                    }`}>
                      {isUnlocked ? (
                        <Award className="w-6 h-6 text-aged-brass" />
                      ) : (
                        <Lock className="w-6 h-6 text-charcoal/40" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-serif text-lg font-medium text-ink-black">
                          {accolade.title}
                        </h4>
                        {isUnlocked && (
                          <div className="text-[10px] uppercase tracking-wider text-aged-brass border border-aged-brass px-2 py-1">
                            Unlocked
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-charcoal/70 mb-3">
                        {accolade.description}
                      </p>

                      <p className="text-xs text-charcoal/60 italic mb-3">
                        {accolade.requirement}
                      </p>

                      {!isUnlocked && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-charcoal/60">Progress</span>
                            <span className="font-medium text-ink-black">
                              {progress.current} / {progress.target}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-charcoal/10 overflow-hidden">
                            <div 
                              className="h-full bg-aged-brass/50 transition-all"
                              style={{ 
                                width: `${Math.min((progress.current / progress.target) * 100, 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-6 border-t border-charcoal/10">
            <p className="text-xs text-center text-charcoal/60 italic">
              {earnedAccolades.length} of {ACCOLADES.length} accolades unlocked
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
