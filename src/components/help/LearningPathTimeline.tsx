import { Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
    <Card className="bg-card border-border bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-level-1 mb-8 overflow-hidden">
      <CardHeader className="pb-4">
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-light text-foreground tracking-wide">
            Recommended Learning Path
          </h3>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Start from the beginning or jump to any section. We suggest this order for the smoothest experience.
          </p>
          <Badge
            variant="outline"
            className="w-fit border-primary/30 text-primary text-xs font-medium"
          >
            Follow this sequence for best results
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Timeline Steps - Desktop */}
        <div className="hidden lg:flex items-stretch gap-2">
          {learningPath.map((step, index) => {
            const isActive = step.category === activeCategory;
            const isCompleted = completedCategories.has(step.category);
            const isCurrent = index === currentStepIndex;
            const progress = getCategoryProgress(step.category);

            return (
              <div key={step.category} className="flex items-stretch flex-1 min-w-0 max-w-[200px]">
                <button
                  onClick={() => onCategoryClick(step.category)}
                  className={`
                    relative w-full min-w-0 group transition-all duration-300 text-left
                    ${isActive ? 'z-10' : ''}
                  `}
                >
                  <div
                    className={`
                      h-full p-5 rounded-lg border-2 transition-all duration-300
                      flex flex-col min-h-[140px]
                      ${isActive
                        ? 'border-primary bg-primary/10 shadow-level-2'
                        : isCompleted
                        ? 'border-muted-sage/60 bg-muted-sage/10'
                        : 'border-border bg-card hover:border-primary/40'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className={`
                          w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-all
                          ${isActive
                            ? 'bg-primary text-primary-foreground'
                            : isCompleted
                            ? 'bg-muted-sage text-white'
                            : 'bg-muted text-muted-foreground'
                          }
                        `}
                      >
                        {isCompleted ? <Check className="w-4 h-4" /> : step.stepNumber}
                      </div>
                      {isCurrent && (
                        <Badge className="bg-primary text-primary-foreground text-xs font-medium shrink-0">
                          You are here
                        </Badge>
                      )}
                    </div>

                    <h4
                      className={`
                        font-medium text-sm mb-1 transition-colors line-clamp-2
                        ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                      `}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                      {step.description}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground mt-auto">
                      {progress.completed}/{progress.total} videos
                    </p>
                  </div>
                </button>

                {index < learningPath.length - 1 && (
                  <div className="flex items-center flex-shrink-0 px-1">
                    <ArrowRight
                      className={`
                        w-5 h-5 transition-colors
                        ${index < currentStepIndex ? 'text-muted-sage' : 'text-border'}
                      `}
                    />
                  </div>
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
                    p-5 rounded-lg border-2 transition-all duration-300
                    ${isActive
                      ? 'border-primary bg-primary/10 shadow-level-2'
                      : isCompleted
                      ? 'border-muted-sage/60 bg-muted-sage/10'
                      : 'border-border bg-card hover:border-primary/40'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 transition-all
                        ${isActive
                          ? 'bg-primary text-primary-foreground'
                          : isCompleted
                          ? 'bg-muted-sage text-white'
                          : 'bg-muted text-muted-foreground'
                        }
                      `}
                    >
                      {isCompleted ? <Check className="w-5 h-5" /> : step.stepNumber}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`
                            font-medium text-base
                            ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                          `}
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <Badge className="bg-primary text-primary-foreground text-xs font-medium shrink-0">
                            Current
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {step.description}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {progress.completed}/{progress.total} videos
                      </p>
                    </div>

                    <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
