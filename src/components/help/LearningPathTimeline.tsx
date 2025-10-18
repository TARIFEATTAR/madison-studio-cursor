import { Check, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoCategory, categoryLabels } from "@/config/helpVideos";

interface PathStep {
  category: VideoCategory;
  label: string;
  description: string;
  stepNumber: number;
}

const learningPath: PathStep[] = [
  {
    category: 'getting-started',
    label: categoryLabels['getting-started'],
    description: 'Welcome & brand setup',
    stepNumber: 1,
  },
  {
    category: 'settings',
    label: categoryLabels['settings'],
    description: 'Products & collections',
    stepNumber: 2,
  },
  {
    category: 'content-creation',
    label: categoryLabels['content-creation'],
    description: 'Create master content',
    stepNumber: 3,
  },
  {
    category: 'multiply',
    label: categoryLabels['multiply'],
    description: 'Generate derivatives',
    stepNumber: 4,
  },
  {
    category: 'library',
    label: categoryLabels['library'],
    description: 'Organize & export',
    stepNumber: 5,
  },
  {
    category: 'calendar',
    label: categoryLabels['calendar'],
    description: 'Schedule & plan',
    stepNumber: 6,
  },
];

interface LearningPathTimelineProps {
  activeCategory: VideoCategory;
  onCategoryClick: (category: VideoCategory) => void;
  completedCategories: Set<VideoCategory>;
  getCategoryProgress: (category: VideoCategory) => { completed: number; total: number; percentage: number };
}

export function LearningPathTimeline({ activeCategory, onCategoryClick, completedCategories, getCategoryProgress }: LearningPathTimelineProps) {
  const currentStepIndex = learningPath.findIndex(step => step.category === activeCategory);

  return (
    <Card className="bg-gradient-to-br from-[hsl(var(--aged-brass))]/5 to-[hsl(var(--aged-brass))]/10 border-[hsl(var(--aged-brass))]/20 p-6 mb-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="font-serif text-xl text-[hsl(var(--ink-black))]">
            Recommended Learning Path
          </h3>
          <Badge 
            variant="outline" 
            className="border-[hsl(var(--aged-brass))]/30 text-[hsl(var(--aged-brass))]"
          >
            Follow this sequence for best results
          </Badge>
        </div>
        <p className="text-sm text-[hsl(var(--warm-gray))]">
          Start from the beginning or jump to any section. We suggest this order for the smoothest experience.
        </p>
      </div>

      {/* Timeline Steps - Desktop */}
      <div className="hidden lg:flex items-center justify-between gap-3">
        {learningPath.map((step, index) => {
          const isActive = step.category === activeCategory;
          const isCompleted = completedCategories.has(step.category);
          const isCurrent = index === currentStepIndex;
          const progress = getCategoryProgress(step.category);

          return (
            <div key={step.category} className="flex items-center flex-1">
              {/* Step Card */}
              <button
                onClick={() => onCategoryClick(step.category)}
                className={`
                  relative flex-1 group transition-all duration-300
                  ${isActive ? 'scale-105' : 'hover:scale-102'}
                `}
              >
                <div
                  className={`
                    p-4 rounded-lg border-2 transition-all duration-300
                    ${isActive 
                      ? 'border-[hsl(var(--aged-brass))] bg-[hsl(var(--aged-brass))]/10 shadow-md' 
                      : isCompleted
                      ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                      : 'border-[#E8DCC8] bg-white hover:border-[hsl(var(--aged-brass))]/50'
                    }
                  `}
                >
                  {/* Step Number Badge */}
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all
                        ${isActive
                          ? 'bg-[hsl(var(--aged-brass))] text-white'
                          : isCompleted
                          ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                          : 'bg-[#E8DCC8] text-[hsl(var(--warm-gray))]'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="w-4 h-4" /> : step.stepNumber}
                    </div>
                    {isCurrent && (
                      <Badge className="bg-[hsl(var(--aged-brass))] text-white text-xs">
                        You are here
                      </Badge>
                    )}
                  </div>

                  {/* Content */}
                  <h4
                    className={`
                      font-medium text-sm mb-1 transition-colors
                      ${isActive 
                        ? 'text-[hsl(var(--ink-black))]' 
                        : 'text-[hsl(var(--charcoal))]'
                      }
                    `}
                  >
                    {step.label}
                  </h4>
                  <p className="text-xs text-[hsl(var(--warm-gray))] mb-1">
                    {step.description}
                  </p>
                  <p className="text-xs font-medium text-[hsl(var(--warm-gray))]">
                    {progress.completed}/{progress.total} videos
                  </p>
                </div>
              </button>

              {/* Arrow Connector */}
              {index < learningPath.length - 1 && (
                <ArrowRight 
                  className={`
                    w-5 h-5 mx-2 flex-shrink-0 transition-colors
                    ${index < currentStepIndex
                      ? 'text-emerald-500'
                      : 'text-[#E8DCC8]'
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Timeline Steps - Mobile/Tablet */}
      <div className="lg:hidden space-y-3">
        {learningPath.map((step, index) => {
          const isActive = step.category === activeCategory;
          const isCompleted = completedCategories.has(step.category);
          const isCurrent = index === currentStepIndex;
          const progress = getCategoryProgress(step.category);

          return (
            <button
              key={step.category}
              onClick={() => onCategoryClick(step.category)}
              className="w-full text-left"
            >
              <div
                className={`
                  p-4 rounded-lg border-2 transition-all duration-300
                  ${isActive 
                    ? 'border-[hsl(var(--aged-brass))] bg-[hsl(var(--aged-brass))]/10 shadow-md' 
                    : isCompleted
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/30'
                    : 'border-[#E8DCC8] bg-white hover:border-[hsl(var(--aged-brass))]/50'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  {/* Step Number Badge */}
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0
                      ${isActive
                        ? 'bg-[hsl(var(--aged-brass))] text-white'
                        : isCompleted
                        ? 'bg-emerald-500 text-white dark:bg-emerald-600'
                        : 'bg-[#E8DCC8] text-[hsl(var(--warm-gray))]'
                      }
                    `}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : step.stepNumber}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4
                        className={`
                          font-medium text-sm
                          ${isActive 
                            ? 'text-[hsl(var(--ink-black))]' 
                            : 'text-[hsl(var(--charcoal))]'
                          }
                        `}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <Badge className="bg-[hsl(var(--aged-brass))] text-white text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[hsl(var(--warm-gray))] mb-1">
                      {step.description}
                    </p>
                    <p className="text-xs font-medium text-[hsl(var(--warm-gray))]">
                      {progress.completed}/{progress.total} videos
                    </p>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[hsl(var(--warm-gray))] flex-shrink-0" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
