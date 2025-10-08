import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Repeat, Archive, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import penHeroImage from "@/assets/pen-hero.jpg";
import calendarWatch from "@/assets/calendar-watch-v2.png";
import penNibIcon from "@/assets/pen-nib-icon.png";
import bookIcon from "@/assets/book-icon.png";
import portfolioIcon from "@/assets/portfolio-icon.png";
import calendarIcon from "@/assets/calendar-icon.png";
import amplifyIcon from "@/assets/amplify-icon.png";
import composeIcon from "@/assets/compose-icon.png";
import libraryIcon from "@/assets/library-icon.png";
import analyticsIcon from "@/assets/analytics-icon.png";

const steps = [
  {
    number: "1",
    title: "Upload Brand Documents",
    description: "Import your brand guidelines, tone of voice, product catalogs, and content examples. Scriptora learns what makes your brand unique—from writing style to messaging pillars.",
    icon: BookOpen,
  },
  {
    number: "2",
    title: "Generate Content",
    description: "Create on-brand content powered by AI that actually knows your voice. From blog posts to social captions, every word reflects your brand's authentic personality.",
    icon: Sparkles,
  },
  {
    number: "3",
    title: "Amplify Everywhere",
    description: "Turn one piece of content into dozens of variations. Automatically repurpose for different channels, formats, and audiences while maintaining perfect brand consistency.",
    icon: Calendar,
  }
];

const Landing = () => {
  console.log("[Landing] Rendering Landing page...");
  const { user } = useAuth();
  console.log("[Landing] User state:", !!user);

  const features = [
    {
      icon: libraryIcon,
      title: "Build Your Repository",
      description: "Create a centralized library of high-quality content, prompts, and brand guidelines that power a consistent brand voice across all your marketing channels."
    },
    {
      icon: composeIcon,
      title: "Compose with Intelligence",
      description: "Generate content with AI assistance, then perfect it in our rich editor. Move polished content to repurposing—all in one seamless workflow."
    },
    {
      icon: amplifyIcon,
      title: "Amplify & Repurpose",
      description: "Transform your content into multiple formats and extend its reach across different platforms and audiences."
    },
    {
      icon: calendarIcon,
      title: "Plan Strategically",
      description: "Schedule content across your calendar, sync with Google Calendar, and never miss a publishing deadline."
    },
    {
      icon: portfolioIcon,
      title: "Track Your Portfolio",
      description: "Monitor all your published content in one organized archive with instant access to your complete content library."
    },
    {
      icon: analyticsIcon,
      title: "Measure Performance",
      description: "Analyze content performance with comprehensive analytics. Track engagement, reach, and ROI to continuously improve your content strategy."
    }
  ];

  const benefits = [
    "White-label ready for agency deployment",
    "Centralized prompt and template library",
    "AI-powered content generation and repurposing",
    "Integrated calendar planning and scheduling",
    "Organized content portfolio management"
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-level-1">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="Scriptora - Brand Intelligence" 
                className="h-14 w-auto transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <Button asChild variant="brass">
                  <Link to="/library">Go to App</Link>
                </Button>
              ) : (
                <>
                  <Button asChild variant="ghost">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                  <Button asChild variant="brass">
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{ backgroundImage: `url(${penHeroImage})` }}
        />
        
        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/20" />
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="text-left max-w-3xl codex-spacing fade-enter">
            <h1 className="text-white mb-6 text-4xl md:text-5xl lg:text-6xl" style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}>
              Content That Sounds Like Your Team Wrote It—
              <span className="text-primary block mt-2">Because It Learned From Them</span>
            </h1>
            <p className="text-large text-white/90 mb-12 leading-relaxed max-w-2xl" style={{ textShadow: '0 1px 10px rgba(0,0,0,0.6)' }}>
              Upload your brand docs. Scriptora learns your voice. Generate perfectly on-brand content. Amplify it everywhere.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" variant="brass">
                <Link to="/auth" className="gap-2">
                  Start Creating <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                <Link to="#features">
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 3 Steps */}
      <section className="py-20 border-t border-border/40 bg-gradient-to-b from-background to-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 codex-spacing fade-enter">
            <h2 className="text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-large text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to streamline your content workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 fade-enter">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isScheduleStep = step.number === "3";
              const isCreateStep = step.number === "2";
              
              return (
                <div 
                  key={index}
                  className="relative card-luxury text-center group cursor-default overflow-hidden"
                >
                  {/* Large Corner Number */}
                  <div className="absolute top-3 left-4 pointer-events-none">
                    <span className="font-serif text-[72px] leading-none text-foreground/[0.12] select-none">
                      {step.number}
                    </span>
                  </div>
                  
                  <div className="pt-6 relative z-10">
                    {isScheduleStep ? (
                      <div className="w-32 h-32 flex items-center justify-center mb-4 mx-auto">
                        <img 
                          src={calendarWatch} 
                          alt="Schedule and automate" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : isCreateStep ? (
                      <div className="w-32 h-32 flex items-center justify-center mb-4 mx-auto">
                        <img 
                          src={penNibIcon} 
                          alt="Create and generate content" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 flex items-center justify-center mb-4 mx-auto">
                        <img 
                          src={bookIcon} 
                          alt="Build your library" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-regular text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Comparison Section */}
      <section className="py-20 border-t relative overflow-hidden bg-black">
        {/* Decorative brass borders */}
        <div className="absolute left-0 top-0 bottom-0 w-1 opacity-50" style={{ background: 'linear-gradient(180deg, transparent 0%, hsl(38 33% 56%) 50%, transparent 100%)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-1 opacity-50" style={{ background: 'linear-gradient(180deg, transparent 0%, hsl(38 33% 56%) 50%, transparent 100%)' }} />
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          {/* Header */}
          <div className="text-center mb-16 codex-spacing fade-enter">
            <h2 className="mb-6" style={{ color: 'hsl(48 100% 99%)' }}>
              AI That Knows the Difference Between<br />Your Brand and Everyone Else's
            </h2>
            <p className="text-large max-w-2xl mx-auto" style={{ color: 'hsl(22 4% 61%)' }}>
              Stop settling for generic AI output. See how Scriptora enforces your unique brand voice.
            </p>
          </div>

          {/* Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12 fade-enter">
            {/* Generic AI Tools Card */}
            <div className="bg-card rounded-xl border-2 shadow-level-3 overflow-hidden" style={{ borderColor: 'hsl(38 28% 42%)' }}>
              {/* Header with X icon */}
              <div className="p-6 flex items-center justify-between border-b border-border/10">
                <h3 className="font-serif text-2xl font-bold text-foreground">Generic AI Tools</h3>
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>

              {/* Sample Output */}
              <div className="p-6 border-b border-border/10">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Product Description Output:</p>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm text-foreground/80">
                  <p>✨ Introducing our AMAZING new fragrance! ✨</p>
                  <p>This incredible scent will make you feel absolutely fantastic! 😍 Perfect for any occasion, it's a game-changer that you absolutely NEED in your life!</p>
                  <p>✨ Features fresh notes and a long-lasting formula that everyone will love! Don't miss out on this awesome product! 🎉</p>
                </div>
              </div>

              {/* Problems List */}
              <div className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Generic marketing clichés and emoji overload</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-muted-foreground">No brand-specific vocabulary or tone</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Vague descriptions that could apply to any product</p>
                </div>
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <p className="text-sm text-muted-foreground">Ignores your brand guidelines and style rules</p>
                </div>
                <p className="text-xs italic text-muted-foreground/70 pt-3 border-t border-border/10">
                  *Suggestions* that are easily ignored, resulting in off-brand content
                </p>
              </div>
            </div>

            {/* Scriptora Card */}
            <div className="bg-card rounded-xl border-2 shadow-level-3 overflow-hidden" style={{ borderColor: 'hsl(38 28% 42%)' }}>
              {/* Header with Checkmark icon */}
              <div className="p-6 flex items-center justify-between border-b border-border/10">
                <h3 className="font-serif text-2xl font-bold text-foreground">Scriptora</h3>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                </div>
              </div>

              {/* Sample Output */}
              <div className="p-6 border-b border-border/10">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Product Description Output:</p>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3 text-sm text-foreground/90 leading-relaxed">
                  <p>Attar Noir opens with the deep, resinous warmth of aged oud, layered with whispers of cardamom and saffron.</p>
                  <p>The heart reveals a complex interplay of Damascus rose absolute and Indonesian patchouli, while the base settles into a sophisticated blend of amber, sandalwood, and subtle leather undertones.</p>
                  <p>This composition embodies our commitment to traditional distillation methods and rare, ethically-sourced ingredients—a modern interpretation of classical perfumery.</p>
                </div>
              </div>

              {/* Benefits List */}
              <div className="p-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">Uses brand-specific fragrance vocabulary and terminology</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">Maintains sophisticated, editorial tone throughout</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">References actual notes, methods, and brand values</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">Enforces brand guidelines as mandatory rules</p>
                </div>
                <p className="text-sm font-medium text-primary pt-3 border-t border-primary/20">
                  Mandatory enforcement ensures every word aligns with your brand
                </p>
              </div>
            </div>
          </div>

          {/* Footer Message */}
          <div className="text-center fade-enter">
            <div className="inline-flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-full px-6 py-4 border border-primary/20 shadow-level-2">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-regular font-medium text-foreground">
                Your brand voice is sacred. We protect it with enforcement, not suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center fade-enter codex-spacing">
          <h2 className="text-foreground mb-6">
            Ready to Transform Your Content Workflow?
          </h2>
          <p className="text-large text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join forward-thinking teams who've simplified their content operations with Scriptora.
          </p>
          <Button asChild size="lg" variant="brass">
            <Link to="/auth" className="gap-2">
              Get Started Free <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-card/30">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Scriptora" className="h-10 w-auto" />
              <span className="text-muted-foreground text-sm">© 2025 Scriptora. All rights reserved.</span>
            </div>
            <div className="flex gap-8">
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link to="/auth" className="text-muted-foreground hover:text-primary transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
