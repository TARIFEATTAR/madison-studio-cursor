import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Sparkles, ArrowRight, CheckCircle2, PlayCircle, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import archivesIcon from "@/assets/archives-icon-new.png";
import createIcon from "@/assets/create-icon.png";
import multiplyIcon from "@/assets/multiply-icon.png";
import calendarIcon from "@/assets/calendar-icon.png";
import scriptoraLogo from "@/assets/scriptora-logo-icon.png";
import scriptoraIcon from "@/assets/scriptora-icon-transparent.png";
import madisonHero from "@/assets/madison-hero.jpg";
import madisonNibb from "@/assets/madison-nibb.png";

const Landing = () => {
  const { user } = useAuth();
  
  // Rotating word animation state
  const rotatingWords = ["Narrative", "Story", "Voice", "Message", "Identity", "Legacy"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentWordIndex((prev) => (prev + 1) % rotatingWords.length);
        setIsTransitioning(false);
      }, 400);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-vellum">
      {/* Navigation Header */}
      <header 
        className="fixed top-0 w-full z-[1000] transition-all duration-300"
        style={{ 
          backgroundColor: '#1A1816',
          padding: '20px 40px',
          border: 'none',
          boxShadow: 'none'
        }}
      >
        <div className="container mx-auto">
          <nav className="flex items-center justify-between">
            <Link to="/" className="flex items-center">
              <div 
                className="font-serif text-white"
                style={{ 
                  fontSize: '24px',
                  fontWeight: 600,
                  lineHeight: 1
                }}
              >
                MADISON
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-12">
              <a 
                href="#features" 
                className="nav-link-styled font-sans text-white transition-all duration-300 hover:text-white/70 relative group"
                style={{
                  fontSize: '16px',
                  fontWeight: 400
                }}
              >
                Features
                <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
              <a 
                href="#how-it-works" 
                className="nav-link-styled font-sans text-white transition-all duration-300 hover:text-white/70 relative group"
                style={{
                  fontSize: '16px',
                  fontWeight: 400
                }}
              >
                How It Works
                <span className="absolute bottom-[-4px] left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></span>
              </a>
            </div>

            <div className="flex items-center gap-4">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="md:hidden text-white hover:text-white/70"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-vellum border-l border-aged-brass/20">
                  <SheetHeader className="sr-only">
                    <SheetTitle>Mobile Navigation</SheetTitle>
                    <SheetDescription>Navigate to different sections</SheetDescription>
                  </SheetHeader>
                  <div className="flex flex-col gap-6 mt-8">
                    {/* Navigation Links */}
                    <a 
                      href="#features" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-sans text-charcoal text-lg transition-all duration-300 hover:text-aged-brass"
                    >
                      Features
                    </a>
                    <a 
                      href="#how-it-works" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="font-sans text-charcoal text-lg transition-all duration-300 hover:text-aged-brass"
                    >
                      How It Works
                    </a>
                    
                    {/* Divider */}
                    <div className="border-t border-aged-brass/20 my-4"></div>
                    
                    {/* Auth Buttons */}
                    <div className="flex flex-col gap-3">
                      {user ? (
                        <Button asChild variant="brass" className="w-full">
                          <Link to="/dashboard">Go to App</Link>
                        </Button>
                      ) : (
                        <>
                          <Link
                            to="/auth"
                            className="font-sans text-charcoal text-center py-3 transition-all duration-300 hover:text-aged-brass"
                          >
                            Sign In
                          </Link>
                          <Button 
                            asChild 
                            className="w-full text-ink-black font-serif font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0" 
                            style={{
                              backgroundColor: '#B8956A',
                              padding: '14px 36px',
                              borderRadius: '8px',
                              boxShadow: '0 4px 12px rgba(184, 149, 106, 0.3)'
                            }}
                          >
                            <Link to="/auth">Get Started</Link>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Desktop Auth Buttons */}
              {user ? (
                <Button asChild variant="brass" className="hidden md:inline-flex">
                  <Link to="/dashboard">Go to App</Link>
                </Button>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="hidden md:inline-flex font-sans text-white transition-all duration-300 hover:text-white/70"
                    style={{
                      fontSize: '16px',
                      fontWeight: 500,
                      padding: '8px 16px'
                    }}
                  >
                    Sign In
                  </Link>
                  <Button 
                    asChild 
                    className="hidden md:inline-flex text-ink-black font-serif font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(184,149,106,0.45)] active:translate-y-0 active:shadow-[0_2px_8px_rgba(184,149,106,0.3)]" 
                    style={{
                      backgroundColor: '#B8956A',
                      padding: '14px 36px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(184, 149, 106, 0.3)',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    <Link to="/auth">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section - Full Screen */}
      <section className="hero-full-screen">
        {/* Background Image Layer */}
        <div className="hero-background">
          <img 
            src={madisonHero} 
            alt="Madison luxury editorial workspace"
            className="hero-image"
          />
        </div>
        
        {/* Top Fade Gradient - Light and Subtle */}
        <div 
          className="absolute inset-x-0 top-0 h-32 z-[1]"
          style={{
            background: 'linear-gradient(to bottom, rgba(245, 241, 232, 0.6) 0%, rgba(245, 241, 232, 0.3) 40%, transparent 100%)'
          }}
        ></div>
        
        {/* Gradient Overlay for Text Legibility */}
        <div className="hero-overlay md:hidden" style={{
          background: 'linear-gradient(to bottom, rgba(26, 24, 22, 0.65) 0%, rgba(26, 24, 22, 0.60) 40%, rgba(26, 24, 22, 0.75) 100%)',
          zIndex: 10
        }}></div>
        <div className="hero-overlay hidden md:block" style={{ zIndex: 10 }}></div>
        
        <div className="relative z-20 h-full flex items-center justify-start pl-6 pr-6 pt-32 md:pl-[120px] md:pr-[45%] md:pt-0">
          <div className="max-w-[650px] text-left -mt-5 md:mt-0">
            
            {/* Headline with brass accent */}
            <h1 className="font-serif font-semibold mb-4 md:mb-5">
              <span className="block text-3xl sm:text-4xl md:text-6xl lg:text-7xl leading-[1.25] md:leading-tight tracking-[0.015em] md:tracking-normal"
                style={{
                  color: '#FFFCF5',
                  textShadow: '0 3px 12px rgba(0, 0, 0, 0.5)'
                }}
              >
                Where Luxury Beauty Brands Craft Their
              </span>
              <span 
                className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-tight mt-1 md:mt-2 transition-all duration-500"
                style={{ 
                  color: 'hsl(42, 77%, 70%)',
                  textShadow: '0 0 30px rgba(212, 175, 55, 0.4)',
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(-16px)' : 'translateY(0)',
                  filter: isTransitioning ? 'blur(2px)' : 'blur(0)',
                  minWidth: '280px',
                  display: 'inline-block',
                  willChange: 'opacity, transform'
                }}
              >
                {rotatingWords[currentWordIndex]}
              </span>
            </h1>
            
            {/* Subheadline */}
            <p 
              className="text-[17px] leading-[1.8] sm:text-lg md:text-xl md:leading-[1.7] max-w-[520px] md:max-w-[580px]"
              style={{
                color: '#FFFCF5',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.6)'
              }}
            >
              AI-powered content creation that honors craftsmanship, 
              heritage, and the art of storytelling. From heritage 
              perfume houses to artisan skincare—every word reflects 
              your brand's soul.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10 md:mt-10">
              <Link 
                to="/auth" 
                className="inline-block px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-[18px] text-sm sm:text-base md:text-lg font-serif font-semibold text-ink-black rounded-lg transition-all duration-300"
                style={{
                  backgroundColor: '#B8956A',
                  boxShadow: '0 4px 16px rgba(184, 149, 106, 0.35)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(184, 149, 106, 0.45)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(184, 149, 106, 0.35)';
                }}
              >
                Create Your First Piece
              </Link>
              <Link 
                to="/meet-madison" 
                className="inline-block px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-[18px] text-sm sm:text-base md:text-lg font-sans font-medium rounded-lg transition-all duration-300 border-2 border-parchment-white/65 md:border-parchment-white/80 bg-ink-black/15 md:bg-transparent"
                style={{
                  color: 'rgba(255, 252, 245, 0.85)',
                  backdropFilter: 'blur(4px)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 252, 245, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255, 252, 245, 1)';
                  e.currentTarget.style.color = 'rgba(255, 252, 245, 0.95)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = window.innerWidth < 768 ? 'rgba(26, 24, 22, 0.15)' : 'transparent';
                  e.currentTarget.style.borderColor = window.innerWidth < 768 ? 'rgba(255, 252, 245, 0.65)' : 'rgba(255, 252, 245, 0.8)';
                  e.currentTarget.style.color = 'rgba(255, 252, 245, 0.85)';
                }}
              >
                Meet Your Editorial Director
              </Link>
            </div>
            
          </div>
        </div>
        
      </section>

      {/* Four-Tool Ecosystem Section */}
      <section id="features" className="py-20 bg-ink-black text-parchment-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif">Your Complete Content Ecosystem</h2>
              <p className="text-lg text-parchment-white/70 max-w-2xl mx-auto">
                Four powerful tools working together to transform your content creation workflow
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-parchment-white border-aged-brass/20 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img src={archivesIcon} alt="The Archives" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink-black">The Archives</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    Your brand's content library, organized and searchable. Every piece of content, from blog posts to social media, preserved and accessible.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-parchment-white border-aged-brass/20 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img src={createIcon} alt="Create" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink-black">Create</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    AI-powered content creation that understands your brand voice. Generate on-brand content with intelligent guidance and real-time feedback.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-parchment-white border-aged-brass/20 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img src={multiplyIcon} alt="Multiply" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink-black">Multiply</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    Transform master content into channel-specific derivatives. One blog post becomes Instagram carousels, email sequences, and more.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-parchment-white border-aged-brass/20 hover:shadow-level-2 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8 space-y-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <img src={calendarIcon} alt="Schedule" className="w-full h-full object-contain" />
                  </div>
                  <h3 className="text-2xl font-serif text-ink-black">Schedule</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    Schedule and coordinate your content calendar. Visualize your content strategy across all channels and platforms.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-5xl font-serif text-ink-black">How Madison Works</h2>
              <p className="text-lg text-charcoal/70">
                From brand setup to content distribution in three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-start">
              <Card className="bg-parchment-white border-aged-brass/10 relative">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-aged-brass text-parchment-white flex items-center justify-center text-xl font-bold">
                    1
                  </div>
                  <h3 className="text-xl font-serif text-ink-black">Establish Your Brand</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    Upload brand guidelines, define your voice, and set your visual identity. MADISON learns what makes your brand unique.
                  </p>
                </CardContent>
                <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-aged-brass w-8 h-8" />
              </Card>

              <Card className="bg-parchment-white border-aged-brass/10 relative">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-aged-brass text-parchment-white flex items-center justify-center text-xl font-bold">
                    2
                  </div>
                  <h3 className="text-xl font-serif text-ink-black">Create Master Content</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    Use The Editorial Desk to craft high-quality content with AI assistance. Your brand guidelines ensure every word is on-brand.
                  </p>
                </CardContent>
                <ArrowRight className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-aged-brass w-8 h-8" />
              </Card>

              <Card className="bg-parchment-white border-aged-brass/10">
                <CardContent className="p-8 space-y-4">
                  <div className="w-12 h-12 rounded-full bg-aged-brass text-parchment-white flex items-center justify-center text-xl font-bold">
                    3
                  </div>
                  <h3 className="text-xl font-serif text-ink-black">Amplify & Distribute</h3>
                  <p className="text-charcoal/80 leading-relaxed">
                    Transform your content into channel-specific formats. Schedule across platforms and watch your reach multiply.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits Section */}
      <section className="py-20 bg-charcoal text-parchment-white">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-serif leading-tight">
                  Everything You Need to <span className="text-aged-brass">Scale Your Content</span>
                </h2>
                <p className="text-lg text-parchment-white/70 leading-relaxed">
                  MADISON brings together brand intelligence, AI-powered creation, and strategic distribution into one seamless platform.
                </p>
                <Button asChild variant="brass" size="lg" className="gap-2">
                  <Link to="/auth">
                    Get Started Free <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {[
                  "Maintain consistent brand voice across all channels",
                  "Generate content 10x faster with AI assistance",
                  "Repurpose content efficiently for maximum reach",
                  "Centralize your brand guidelines and assets",
                  "Schedule and plan content strategically",
                  "Track content performance and quality"
                ].map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-parchment-white/5 border border-aged-brass/20">
                    <CheckCircle2 className="w-5 h-5 text-aged-brass flex-shrink-0 mt-0.5" />
                    <span className="text-parchment-white/90">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <Card className="max-w-4xl mx-auto bg-parchment-white border-aged-brass/20 shadow-level-2">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-serif text-ink-black">
                Ready to Transform Your Content Workflow?
              </h2>
              <p className="text-lg text-charcoal/80 max-w-2xl mx-auto">
                Join brands using MADISON to create consistent, on-brand content at scale. Start your free trial today—no credit card required.
              </p>
              <div className="space-y-3">
                <Button asChild variant="brass" size="lg" className="gap-2">
                  <Link to="/auth">
                    Start Your Free Trial <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <p className="text-sm text-charcoal/60">Setup takes less than 2 minutes</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-black text-parchment-white py-12 border-t border-aged-brass/20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div>
                <div className="font-serif font-bold text-xl">MADISON</div>
                <div className="text-xs text-parchment-white/60 tracking-wider uppercase">Editorial Intelligence</div>
              </div>
              <p className="text-sm text-parchment-white/70 leading-relaxed">
                Your editorial command center for brand-consistent content at scale.
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-aged-brass uppercase text-sm tracking-wider">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/dashboard" className="text-parchment-white/70 hover:text-aged-brass transition-colors">The Archives</Link></li>
                <li><Link to="/create" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Create</Link></li>
                <li><Link to="/multiply" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Multiply</Link></li>
                <li><Link to="/schedule" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Schedule</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-aged-brass uppercase text-sm tracking-wider">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Video Tutorials</a></li>
                <li><a href="#" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Customer Journey</a></li>
                <li><Link to="/templates" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Templates</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-aged-brass uppercase text-sm tracking-wider">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/settings" className="text-parchment-white/70 hover:text-aged-brass transition-colors">Settings</Link></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-aged-brass/20 text-center text-sm text-parchment-white/60">
            © 2024 MADISON. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
