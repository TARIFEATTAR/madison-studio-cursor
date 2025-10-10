import { Check, Sparkles, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OnboardingSuccessProps {
  brandData: any;
  onComplete: (destination: string) => void;
}

export function OnboardingSuccess({ brandData, onComplete }: OnboardingSuccessProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brass/5 via-background to-gold/5">
        <div className="absolute top-20 left-20 w-64 h-64 bg-brass/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-brass to-gold/80 mb-6 animate-zoom-in">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-serif text-5xl text-foreground mb-4">You're All Set!</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Welcome to Scriptora, <strong>{brandData.brandName}</strong>! Your brand intelligence platform is ready to create content that truly reflects your voice.
          </p>
        </div>

        {/* What We've Set Up */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-lg border border-border/40 bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: brandData.primaryColor || '#B8956A' }}
              />
              <h3 className="font-semibold text-foreground">Brand Identity</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {brandData.brandName}'s unique voice and style
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Brand Guidelines</h3>
            <p className="text-sm text-muted-foreground">
              AI trained on your brand voice
            </p>
          </div>

          <div className="p-6 rounded-lg border border-border/40 bg-card">
            <h3 className="font-semibold text-foreground mb-3">Content Library</h3>
            <p className="text-sm text-muted-foreground">
              Ready to store your content
            </p>
          </div>
        </div>

        {/* Sample Content Preview */}
        <div className="mb-12 p-8 rounded-lg border border-border/40 bg-card paper-texture">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="secondary" className="bg-brass/10 text-brass">
              Blog Post
            </Badge>
          </div>
          <h2 className="font-serif text-2xl text-foreground mb-3">
            Welcome to {brandData.brandName}'s Content Journey
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Your brand's story begins here. With Scriptora's AI-powered platform, you'll create content that captures the essence of {brandData.brandName}, 
            maintaining consistency across every channel while adapting to each platform's unique voice.
          </p>
          <p className="text-xs text-muted-foreground">
            ✨ Generated using {brandData.brandName}'s brand guidelines and voice
          </p>
        </div>

        {/* Quick Tips */}
        <div className="mb-12 p-6 rounded-lg border border-border/40 bg-card/50">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            💡 Quick Tips to Get Started
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-brass">•</span>
              <span>Visit <strong>The Editorial Desk</strong> to create your first piece of content with AI assistance</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brass">•</span>
              <span>Use <strong>The Syndicate</strong> to repurpose content across multiple channels</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-brass">•</span>
              <span>Schedule posts in <strong>The Planner</strong> to maintain consistent publishing</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => onComplete('/create')}
            className="flex-1 h-14 bg-gradient-to-r from-brass to-gold text-white hover:opacity-90 text-base"
            size="lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Create Your First Content
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>

          <Button
            onClick={() => onComplete('/')}
            variant="outline"
            className="flex-1 h-14 text-base"
            size="lg"
          >
            <BookOpen className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
