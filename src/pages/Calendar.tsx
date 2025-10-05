import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const dipWeeks = [
  {
    week: 1,
    dateRange: "Oct 7-13, 2025",
    pillar: "Identity",
    world: "Silk Road",
    lexicon: ["Authenticity", "Origin", "Craftsmanship", "Heritage", "Purity"],
    imagery: ["Ancient trade routes", "Caravans", "Spices", "Merchants", "Desert landscapes"],
    scheduled: [
      { day: "Mon", content: "Instagram: Identity hook post" },
      { day: "Wed", content: "Email: Origin story feature" },
      { day: "Fri", content: "Twitter: Craftsmanship thread" },
    ],
    completed: 2,
    total: 3,
  },
  {
    week: 2,
    dateRange: "Oct 14-20, 2025",
    pillar: "Memory",
    world: "Maritime",
    lexicon: ["Nostalgia", "Journey", "Voyage", "Discovery", "Timeless"],
    imagery: ["Ocean waves", "Ships", "Compasses", "Maps", "Sailors"],
    scheduled: [
      { day: "Mon", content: "Instagram: Memory moment carousel" },
      { day: "Wed", content: "Email: Journey narrative" },
      { day: "Fri", content: "Product: Maritime collection feature" },
    ],
    completed: 1,
    total: 3,
  },
  {
    week: 3,
    dateRange: "Oct 21-27, 2025",
    pillar: "Remembrance",
    world: "Imperial",
    lexicon: ["Reverence", "Legacy", "Ritual", "Tradition", "Sacred"],
    imagery: ["Palaces", "Royal courts", "Ceremonial spaces", "Gold accents", "Architecture"],
    scheduled: [
      { day: "Mon", content: "Instagram: Legacy story reel" },
      { day: "Wed", content: "Email: Ritual and tradition piece" },
      { day: "Fri", content: "Twitter: Sacred space thread" },
    ],
    completed: 0,
    total: 3,
  },
  {
    week: 4,
    dateRange: "Oct 28-Nov 3, 2025",
    pillar: "Cadence",
    world: "Royal Court",
    lexicon: ["Rhythm", "Balance", "Harmony", "Flow", "Elegance"],
    imagery: ["Royal chambers", "Silk fabrics", "Ornate details", "Symmetry", "Grace"],
    scheduled: [
      { day: "Mon", content: "Instagram: Cadence collection showcase" },
      { day: "Wed", content: "Email: Balance and harmony newsletter" },
      { day: "Fri", content: "Product: New release announcement" },
    ],
    completed: 0,
    total: 3,
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
