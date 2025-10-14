import { User, Lightbulb, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import madisonInsignia from "@/assets/madison-insignia.png";

export default function MeetMadison() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-vellum-cream">
      {/* Full-page background image - 50% visibility */}
      <div 
        className="fixed inset-0 opacity-50 pointer-events-none"
        style={{
          backgroundImage: "url('/assets/madison-avenue-sketch.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0
        }}
      />
      
      {/* Content wrapper */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-16">
{/* Madison insignia - OUTSIDE card, on cream background */}
<div className="flex justify-center mb-6">
  <div className="w-[576px] h-[576px] bg-vellum-cream flex items-center justify-center">
    <img 
      src={madisonInsignia} 
      alt="Madison" 
      className="w-full h-full object-cover"
    />
  </div>
</div>
        
        {/* Header text - OUTSIDE card */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-serif font-semibold text-ink-black mb-2">
            Meet Madison
          </h1>
          <p className="text-xl text-warm-gray">
            Your Editorial Director at Scriptora
          </p>
        </div>
        
        {/* Solid white content card */}
        <Card className="max-w-4xl mx-auto bg-white shadow-xl border border-warm-gray/20">
          <CardContent className="p-8 space-y-8">
          {/* Origin Story */}
          <section className="mb-10">
            <h2 className="text-2xl font-serif font-medium text-ink-black mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-brass" />
              Origin Story
            </h2>
            <div className="space-y-4 text-warm-gray leading-relaxed">
              <p>
                Madison's career began on Madison Avenue during advertising's golden age—the era when David Ogilvy and Bill Bernbach were reshaping how the world communicated with consumers. After years working across top Manhattan agencies and publishing houses, Madison developed expertise in luxury brand communications, with particular depth in beauty, fragrance, and personal care marketing.
              </p>
              <p>
                Madison worked on campaigns for heritage perfume houses, emerging niche fragrance brands, prestige skincare lines, and luxury beauty conglomerates. They learned that whether selling a classic French parfum, an indie botanical perfume oil, a clinical skincare serum, or an artisan fragrance—the principles of effective communication remain constant, while the application evolves with consumer behavior.
              </p>
              <p>
                Now at Scriptora, Madison brings decades of cross-category expertise to help modern beauty and fragrance brands craft content that honors timeless principles while speaking to contemporary consumers.
              </p>
            </div>
          </section>

          {/* Philosophy */}
          <section className="mb-10">
            <h2 className="text-2xl font-serif font-medium text-ink-black mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-brass" />
              Editorial Philosophy
            </h2>
            <div className="space-y-6">
              <div className="border-l-4 border-brass pl-6">
                <h3 className="font-semibold text-ink-black mb-2">From David Ogilvy</h3>
                <ul className="space-y-2 text-warm-gray">
                  <li>• Research is sacred—every piece should be grounded in truth</li>
                  <li>• Respect the consumer's intelligence</li>
                  <li>• Make the product the hero</li>
                  <li>• Specificity sells—concrete details persuade</li>
                  <li>• Truth above all—no deception, no puffery</li>
                </ul>
              </div>

              <div className="border-l-4 border-brass pl-6">
                <h3 className="font-semibold text-ink-black mb-2">From Bill Bernbach</h3>
                <ul className="space-y-2 text-warm-gray">
                  <li>• Creativity must sell—effectiveness over cleverness</li>
                  <li>• Human insight is everything</li>
                  <li>• Truth as power—honesty is compelling</li>
                  <li>• Simplicity and wit over complexity</li>
                  <li>• Principles endure, formulas don't</li>
                </ul>
              </div>

              <div className="border-l-4 border-brass pl-6">
                <h3 className="font-semibold text-ink-black mb-2">2025 Context</h3>
                <ul className="space-y-2 text-warm-gray">
                  <li>• Value-conscious consumers demand pricing transparency</li>
                  <li>• Clinical confidence—science-backed claims matter</li>
                  <li>• Authenticity over hype—audiences spot greenwashing</li>
                  <li>• Personalization—help customers find their signature</li>
                  <li>• Storytelling integration—emotional narrative, not transactions</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Expertise */}
          <section className="mb-10">
            <h2 className="text-2xl font-serif font-medium text-ink-black mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brass" />
              Areas of Expertise
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-vellum-cream p-6 rounded-lg">
                <h3 className="font-semibold text-ink-black mb-3">Fragrance</h3>
                <ul className="space-y-1 text-warm-gray text-sm">
                  <li>• Fine fragrance (Parfum, EDP, EDT)</li>
                  <li>• Natural & artisan (attars, oils, absolutes)</li>
                  <li>• Niche & indie perfumery</li>
                  <li>• Olfactory terminology & structure</li>
                </ul>
              </div>

              <div className="bg-vellum-cream p-6 rounded-lg">
                <h3 className="font-semibold text-ink-black mb-3">Skincare</h3>
                <ul className="space-y-1 text-warm-gray text-sm">
                  <li>• Clinical & luxury formulations</li>
                  <li>• Active ingredients & efficacy</li>
                  <li>• Dermocosmetics positioning</li>
                  <li>• Clean beauty & transparency</li>
                </ul>
              </div>

              <div className="bg-vellum-cream p-6 rounded-lg">
                <h3 className="font-semibold text-ink-black mb-3">Cosmetics & Color</h3>
                <ul className="space-y-1 text-warm-gray text-sm">
                  <li>• Texture & finish descriptions</li>
                  <li>• Performance & longevity</li>
                  <li>• Shade inclusivity messaging</li>
                  <li>• Application guidance</li>
                </ul>
              </div>

              <div className="bg-vellum-cream p-6 rounded-lg">
                <h3 className="font-semibold text-ink-black mb-3">Body Care & Wellness</h3>
                <ul className="space-y-1 text-warm-gray text-sm">
                  <li>• Ritual & self-care framing</li>
                  <li>• Sensory experience language</li>
                  <li>• Wellness integration</li>
                  <li>• Mindful luxury positioning</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How Madison Works */}
          <section>
            <h2 className="text-2xl font-serif font-medium text-ink-black mb-4">
              How Madison Works With You
            </h2>
            <div className="bg-brass/5 p-6 rounded-lg space-y-4 text-warm-gray">
              <p>
                <span className="font-semibold text-ink-black">In Think Mode:</span> Madison helps you brainstorm and clarify ideas before you commit to a formal brief. Expect thoughtful questions, insight into consumer behavior, and guidance toward specific, compelling angles.
              </p>
              <p>
                <span className="font-semibold text-ink-black">In Content Generation:</span> Madison creates polished copy rooted in timeless advertising principles and contemporary market awareness. Every piece balances technical precision with emotional resonance.
              </p>
              <p>
                <span className="font-semibold text-ink-black">In Editorial Review:</span> Madison offers measured, specific feedback—always constructive, never harsh. You'll learn the "why" behind every suggestion, building your own editorial instincts over time.
              </p>
              <p className="text-ink-black italic pt-4 border-t border-warm-gray/20">
                "The more facts you tell, the more you sell. Respect your audience's intelligence. Make the product the hero. That's the Madison Avenue way—and it works in 2025 just as it did in 1960."
              </p>
            </div>
          </section>
          </CardContent>
        </Card>
        
        {/* CTA - OUTSIDE card */}
        <div className="text-center mt-12">
          <Button
            onClick={() => navigate("/create")}
            className="bg-gradient-to-r from-brass to-brass-glow hover:opacity-90 text-white px-8 py-6 text-lg"
          >
            Start Creating with Madison
          </Button>
          <p className="text-warm-gray text-sm mt-4">
            Ready to craft content that honors timeless principles
          </p>
        </div>
      </div>
    </div>
  );
}
