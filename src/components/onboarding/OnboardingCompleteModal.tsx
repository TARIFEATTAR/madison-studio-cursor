import { CheckCircle2, FileText, Sparkles, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface OnboardingCompleteModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingCompleteModal({ open, onClose }: OnboardingCompleteModalProps) {
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="h-20 w-20 rounded-full bg-brass/10 flex items-center justify-center mx-auto mb-4"
          >
            <CheckCircle2 className="h-10 w-10 text-brass" />
          </motion.div>
          <DialogTitle className="font-serif text-3xl text-center">
            Welcome to Scriptora! 🎉
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            You're all set! Your brand voice is trained and ready to use.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <h3 className="font-serif text-lg text-ink mb-3">What you've unlocked:</h3>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-vellum/50 border border-charcoal/10"
          >
            <div className="h-8 w-8 rounded-full bg-brass/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-brass" />
            </div>
            <div>
              <p className="font-medium text-ink">Brand voice trained</p>
              <p className="text-sm text-charcoal/70">AI understands your unique style and tone</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-vellum/50 border border-charcoal/10"
          >
            <div className="h-8 w-8 rounded-full bg-brass/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-brass" />
            </div>
            <div>
              <p className="font-medium text-ink">AI ready to generate content</p>
              <p className="text-sm text-charcoal/70">Create blog posts, social media, emails, and more</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-vellum/50 border border-charcoal/10"
          >
            <div className="h-8 w-8 rounded-full bg-brass/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="h-4 w-4 text-brass" />
            </div>
            <div>
              <p className="font-medium text-ink">Full access to all features</p>
              <p className="text-sm text-charcoal/70">Library, calendar, repurposing, and more</p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-3">
          <h3 className="font-serif text-lg text-ink mb-3">What's next?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => handleNavigation("/create")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-charcoal/20 hover:border-brass hover:bg-brass/5"
            >
              <Sparkles className="h-5 w-5 text-brass" />
              <div className="text-center">
                <p className="font-medium text-sm">Generate More</p>
                <p className="text-xs text-charcoal/70">Create more content</p>
              </div>
            </Button>

            <Button
              onClick={() => handleNavigation("/library")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-charcoal/20 hover:border-brass hover:bg-brass/5"
            >
              <FileText className="h-5 w-5 text-brass" />
              <div className="text-center">
                <p className="font-medium text-sm">View Library</p>
                <p className="text-xs text-charcoal/70">See your content</p>
              </div>
            </Button>

            <Button
              onClick={() => handleNavigation("/schedule")}
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4 border-charcoal/20 hover:border-brass hover:bg-brass/5"
            >
              <Calendar className="h-5 w-5 text-brass" />
              <div className="text-center">
                <p className="font-medium text-sm">Schedule Content</p>
                <p className="text-xs text-charcoal/70">Plan your posts</p>
              </div>
            </Button>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-brass text-ink hover:bg-antique-gold mt-4"
            size="lg"
          >
            Continue to Dashboard
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
