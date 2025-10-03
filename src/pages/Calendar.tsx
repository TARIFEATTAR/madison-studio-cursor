import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const dipWeeks = [
  {
    week: 1,
    pillar: "Identity",
    world: "Silk Road",
    dateRange: "Oct 1-7",
    lexicon: ["anchor", "self-anchoring", "grounding", "core presence"],
    imagery: ["spices", "caravans", "ancient trade routes"],
    scheduled: [
      { day: "Mon", content: "Email (Welcome)" },
      { day: "Wed", content: "Social (Allegorical)" },
      { day: "Fri", content: "Product (2 descriptions)" },
    ],
    completed: 3,
    total: 5,
  },
  {
    week: 2,
    pillar: "Memory",
    world: "Maritime Voyage",
    dateRange: "Oct 8-14",
    lexicon: ["story", "journey", "companion", "gathering"],
    imagery: ["salt air", "brass instruments", "driftwood", "nautical"],
    scheduled: [
      { day: "Mon", content: "Email (Nurture)" },
      { day: "Wed", content: "Social (Allegorical)" },
      { day: "Fri", content: "Product (2 descriptions)" },
    ],
    completed: 4,
    total: 5,
  },
  {
    week: 3,
    pillar: "Remembrance",
    world: "Imperial Garden",
    dateRange: "Oct 15-21",
    lexicon: ["ritual", "preservation", "ceremony", "reverence"],
    imagery: ["gardens", "water features", "pavilions", "stone paths"],
    scheduled: [
      { day: "Mon", content: "Email (Journey)" },
      { day: "Thu", content: "Visual (Imperial scene)" },
      { day: "Fri", content: "Product (3 descriptions)" },
    ],
    completed: 2,
    total: 6,
  },
  {
    week: 4,
    pillar: "Cadence",
    world: "Royal Court",
    dateRange: "Oct 22-28",
    lexicon: ["rhythm", "measured", "presence", "intentional"],
    imagery: ["architecture", "textiles", "formal ceremonies"],
    scheduled: [
      { day: "Tue", content: "Email (Cadence launch)" },
      { day: "Wed", content: "Social (Collection)" },
      { day: "Fri", content: "Product (4 descriptions)" },
    ],
    completed: 0,
    total: 7,
  },
];

const Calendar = () => {
  return (
    <div className="min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto codex-spacing">
        <div className="fade-enter flex items-center justify-between">
          <div>
            <h1 className="text-foreground mb-3">The Calendar</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Navigate the four-week DIP rotation, each phase a world unto itself.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="icon">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 fade-enter">
          {dipWeeks.map((week) => {
            const progress = (week.completed / week.total) * 100;
            
            return (
              <div
                key={week.week}
                className="card-matte p-8 rounded-lg border border-border/40 hover:shadow-elegant transition-all"
              >
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-saffron-gold/20 text-saffron-gold border-saffron-gold/30">
                      Week {week.week}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{week.dateRange}</span>
                  </div>
                  <h2 className="text-2xl mb-1">{week.pillar}</h2>
                  <p className="text-muted-foreground italic">{week.world}</p>
                </div>

                {/* Core Elements */}
                <div className="space-y-4 mb-6">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Focus Lexicon:</p>
                    <div className="flex flex-wrap gap-2">
                      {week.lexicon.map((term) => (
                        <Badge key={term} variant="outline" className="text-xs">
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Visual Imagery:</p>
                    <div className="flex flex-wrap gap-2">
                      {week.imagery.map((image) => (
                        <Badge key={image} variant="outline" className="text-xs">
                          {image}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scheduled Content */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">Scheduled:</p>
                  <div className="space-y-2">
                    {week.scheduled.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 text-sm bg-background/50 rounded-md p-3"
                      >
                        <span className="font-medium text-saffron-gold w-10">{item.day}</span>
                        <span className="text-muted-foreground">{item.content}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {week.completed} of {week.total} completed
                    </span>
                    <span className="text-sm font-medium text-saffron-gold">
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-saffron-gold transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
