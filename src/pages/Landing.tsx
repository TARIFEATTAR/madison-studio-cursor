import { Link } from "react-router-dom";
import { BookOpen, Sparkles, Repeat, Archive, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

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
      description: "Generate blog posts, social content, and marketing materials using AI-powered tools that understand your brand voice."
    },
    {
      icon: Repeat,
      title: "Amplify Effortlessly",
      description: "Repurpose your best content across channels—transform blog posts into social media, newsletters, and more."
    },
    {
      icon: Archive,
      title: "Portfolio at a Glance",
      description: "Track all your published content in one place, with quality ratings and performance insights."
    },
    {
      icon: Calendar,
      title: "Plan Strategically",
      description: "Schedule content across your calendar, sync with Google Calendar, and never miss a publishing deadline."
    }
  ];

  const benefits = [
    "White-label ready for agency deployment",
    "Brand voice consistency across all content",
    "AI-powered content generation and repurposing",
    "Integrated calendar planning and scheduling",
    "Quality tracking and portfolio management"
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
                className="h-14 w-auto"
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
      <section className="relative overflow-hidden bg-gradient-to-b from-card to-background">
        <div className="absolute inset-0 bg-gradient-radial from-primary/5 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
              Your Brand Intelligence,
              <span className="text-primary block mt-2">Simplified</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed">
              Scriptorium transforms content marketing from chaos to clarity. Build your prompt library, 
              generate on-brand content, and orchestrate multi-channel campaigns—all in one elegant platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="brass" className="text-lg px-8 py-6">
                <Link to="/auth">
                  Start Creating <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6">
                <Link to="#features">
                  Explore Features
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              Everything You Need to Scale Content
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From ideation to publication, Scriptorium streamlines your entire content workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-transparent to-primary/5 border-t border-border/40">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
                Built for Modern Marketing Teams
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Whether you're a solo creator or managing content for multiple brands, 
                Scriptorium adapts to your workflow. White-label ready for agencies who 
                want to offer best-in-class content intelligence to their clients.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/90 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="card-luxury bg-gradient-to-br from-card to-primary/5 border-primary/20 p-12 shadow-level-3">
                <div className="space-y-6">
                  <div className="bg-background/50 rounded-lg p-6 border border-border/20 shadow-level-1">
                    <p className="font-serif text-2xl text-foreground mb-2">"Game-changing"</p>
                    <p className="text-muted-foreground">Cut content production time by 60% while maintaining brand consistency.</p>
                  </div>
                  <div className="bg-background/50 rounded-lg p-6 border border-border/20 shadow-level-1">
                    <p className="font-serif text-2xl text-foreground mb-2">"Effortless scaling"</p>
                    <p className="text-muted-foreground">From 2 posts per week to 20—without adding headcount.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 border-t border-border/40">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Transform Your Content Workflow?
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Join forward-thinking teams who've simplified their content operations with Scriptorium.
          </p>
          <Button asChild size="lg" variant="brass" className="text-lg px-10 py-6">
            <Link to="/auth">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
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
