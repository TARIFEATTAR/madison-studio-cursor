import { Star, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const mockArchives = [
  {
    id: "1",
    promptTitle: "Product Description - Honey Oudh",
    generatedOutput: "In the gathering of sweet honey and sacred oudh lies a companion for quiet moments. This warm embrace speaks of journeys taken and stories yet to unfold, each note a memory keeper in liquid form. Honey's golden sweetness opens with familiar warmth, while oudh's depth anchors the experience in timeless tradition.",
    quality: 5,
    usageContext: "Cadence Collection Launch",
    performanceMetrics: { engagement: "24%", conversion: "3.2%" },
    createdAt: "Oct 1, 2024",
  },
  {
    id: "2",
    promptTitle: "Email - Welcome Sequence",
    generatedOutput: "Welcome to the art of self-anchoring. In a world of noise, we offer the quiet confidence of attar—fragrance oils that don't announce, they accompany. Each vessel is crafted to be your grounding ritual, your moment of intentional presence.",
    quality: 4,
    usageContext: "Q4 Nurture Campaign",
    performanceMetrics: { openRate: "42%", clickRate: "8.1%" },
    createdAt: "Sep 28, 2024",
  },
];

const Archive = () => {
  return (
    <div className="min-h-screen py-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto codex-spacing">
        <div className="fade-enter">
          <h1 className="text-foreground mb-3">The Archive</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            A curated repository of prompts paired with their outputs, each entry a testament to the Confident Whisper in practice.
          </p>
        </div>

        <div className="space-y-6 fade-enter">
          {mockArchives.map((archive) => (
            <div
              key={archive.id}
              className="card-matte p-8 rounded-lg border border-border/40 hover:shadow-elegant transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left: Prompt Used */}
                <div className="space-y-4">
                  <div>
                    <Badge className="mb-3">Prompt</Badge>
                    <h3 className="text-xl">{archive.promptTitle}</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{archive.createdAt}</span>
                    </div>
                    
                    <div>
                      <span className="font-medium text-foreground">Usage Context:</span>
                      <p className="mt-1">{archive.usageContext}</p>
                    </div>

                    <div>
                      <span className="font-medium text-foreground">Performance:</span>
                      <div className="mt-1 space-y-1">
                        {Object.entries(archive.performanceMetrics).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                            <span className="font-medium text-saffron-gold">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Generated Output */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">Output</Badge>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < archive.quality
                              ? "fill-saffron-gold text-saffron-gold"
                              : "text-border"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="bg-background/50 rounded-md p-6 border border-border/30">
                    <p className="leading-relaxed text-foreground/90">
                      {archive.generatedOutput}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {mockArchives.length === 0 && (
          <div className="text-center py-16 fade-enter">
            <p className="text-2xl font-serif text-muted-foreground">The Archive awaits</p>
            <p className="text-muted-foreground mt-2">No archived outputs yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Archive;
