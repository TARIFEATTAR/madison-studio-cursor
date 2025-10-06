import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Repeat, Archive, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import penHeroImage from "@/assets/pen-hero.jpg";
import calendarWatch from "@/assets/calendar-watch-v2.png";
import penNibIcon from "@/assets/pen-nib-icon.png";
import bookIcon from "@/assets/book-icon.png";

const steps = [
  {
    number: "1",
    title: "Build Your Library",
    description: "Store prompts, brand guidelines, and content templates in your centralized Reservoir.",
    icon: BookOpen,
  },
  {
    number: "2",
    title: "Create & Generate",
    description: "Generate AI-powered content, then edit and perfect it in our rich editor before moving to repurpose.",
    icon: Sparkles,
  },
  {
    number: "3",
    title: "Repurpose & Schedule",
    description: "Transform content across channels and plan your publishing calendar strategically.",
    icon: Calendar,
  }
];

const Landing = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: BookOpen,
      title: "Curate Your Library",
      description: "Build a centralized repository of high-quality prompts and brand guidelines that power consistent, on-brand content."
    },
    {
      icon: Sparkles,
      title: "Compose with Intelligence",
      description: "Generate content with AI assistance, then perfect it in our rich editor. Move polished content to repurposing—all in one seamless workflow."
    },
    {
      icon: Repeat,
      title: "Amplify Effortlessly",
      description: "Repurpose your best content across channels—transform blog posts into social media, newsletters, and more."
    },
    {
      icon: Archive,
      title: "Portfolio at a Glance",
      description: "Track all your published content in one organized archive with easy access to your content library."
    },
    {
      icon: Calendar,
      title: "Plan Strategically",
      description: "Schedule content across your calendar, sync with Google Calendar, and never miss a publishing deadline."
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
                alt="Scriptorium - Brand Intelligence" 
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
        
        {/* Overlay for Text Readability */}
        <div className="absolute inset-0 bg-black/40" />
        
        {/* Content */}
        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-20">
          <div className="text-center max-w-4xl mx-auto codex-spacing fade-enter">
            <h1 className="text-white mb-6">
              Your Brand Intelligence,
              <span className="text-primary block mt-2">Simplified</span>
            </h1>
            <p className="text-large text-white/90 mb-12 leading-relaxed">
              Scriptorium transforms content marketing from chaos to clarity. Build your prompt library, 
              generate on-brand content, and orchestrate multi-channel campaigns—all in one elegant platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
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

      {/* Features Grid */}
      <section id="features" className="py-20 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16 codex-spacing fade-enter">
            <h2 className="text-foreground mb-4">
              Everything You Need to Scale Content
            </h2>
            <p className="text-large text-muted-foreground max-w-2xl mx-auto">
              From ideation to publication, Scriptorium streamlines your entire content workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 fade-enter">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index}
                  className="card-luxury group cursor-default"
                >
                  <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-regular text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-primary/5 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center fade-enter">
            <div className="codex-spacing">
              <h2 className="text-foreground mb-6">
                Built for Modern Marketing Teams
              </h2>
              <p className="text-large text-muted-foreground mb-8 leading-relaxed">
                Whether you're a solo creator or managing content for multiple brands, 
                Scriptorium adapts to your workflow. White-label ready for agencies who 
                want to offer best-in-class content intelligence to their clients.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-regular text-foreground/90">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="card-luxury bg-gradient-to-br from-card to-primary/5 border-primary/20 p-10 shadow-level-3">
                <div className="space-y-6">
                  <div className="bg-background/50 rounded-lg p-6 border border-border/20 shadow-level-1 transition-all duration-300 hover:shadow-level-2">
                    <p className="font-serif text-xl font-semibold text-foreground mb-2">"Game-changing"</p>
                    <p className="text-regular text-muted-foreground">Cut content production time by 60% while maintaining brand consistency.</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-6 border border-border/20 shadow-level-1 transition-all duration-300 hover:shadow-level-2">
                    <p className="font-serif text-xl font-semibold text-foreground mb-2">"Effortless scaling"</p>
                    <p className="text-regular text-muted-foreground">From 2 posts per week to 20—without adding headcount.</p>
                  </div>
                </div>
              </div>
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
            Join forward-thinking teams who've simplified their content operations with Scriptorium.
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
              <img src="/logo.png" alt="Scriptorium" className="h-10 w-auto" />
              <span className="text-muted-foreground text-sm">© 2025 Scriptorium. All rights reserved.</span>
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
