import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Sparkles, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MadisonSaveSuggestionProps {
  promptId: string;
  promptName: string;
  message?: string;
  onSave?: () => void;
  onDismiss?: () => void;
}

export function MadisonSaveSuggestion({
  promptId,
  promptName,
  message = "This prompt worked really well! Add it to your favorites?",
  onSave,
  onDismiss
}: MadisonSaveSuggestionProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const { error } = await supabase
        .from('prompts')
        .update({ is_favorited: true })
        .eq('id', promptId);

      if (error) throw error;

      toast({
        title: "✓ Added to Favorites",
        description: `Find "${promptName}" in Load Recent → Favorites`,
        duration: 4000,
      });

      setIsVisible(false);
      onSave?.();
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast({
        title: "Save failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="mt-4"
        >
          <Card className="border-2 border-brass bg-gradient-to-br from-brass/5 to-transparent p-4">
            <div className="flex items-start gap-4">
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
                className="flex-shrink-0"
              >
                <Sparkles className="h-6 w-6 text-brass" />
              </motion.div>

              <div className="flex-1">
                <h3 className="font-semibold text-ink-black">
                  Madison Suggests
                </h3>
                <p className="mt-1 text-sm text-charcoal">
                  {message}
                </p>

                <div className="mt-4 flex gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="sm"
                    className="bg-brass text-ink-black hover:bg-brass-glow"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Add to Favorites'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDismiss}
                  >
                    Not Now
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
