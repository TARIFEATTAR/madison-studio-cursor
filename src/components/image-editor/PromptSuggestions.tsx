import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wand2, Loader2 } from 'lucide-react';

interface PromptOption {
  label: string;
  prompt: string;
  templateKey: string;
}

interface PromptSuggestionsProps {
  options: PromptOption[];
  onSelectPrompt: (prompt: string, templateKey: string) => void;
  isGenerating: boolean;
}

export function PromptSuggestions({ options, onSelectPrompt, isGenerating }: PromptSuggestionsProps) {
  return (
    <Card className="bg-parchment-white border border-charcoal/10 shadow-level-1 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-brass" />
        <h3 className="font-serif text-xl text-ink-black">Madison's Suggestions</h3>
      </div>
      
      <Badge variant="secondary" className="mb-6 bg-brass/10 text-brass border-brass/20">
        Brand-aligned prompts generated for you
      </Badge>

      <div className="space-y-4">
        {options.map((option, idx) => (
          <div
            key={idx}
            className="p-4 rounded-sm border-2 border-charcoal/10 
                     hover:border-brass/40 transition-all duration-300 group 
                     bg-gradient-to-br from-parchment-white to-vellum-cream/50"
          >
            <h4 className="font-sans font-semibold text-sm text-ink-black mb-2">{option.label}</h4>
            <p className="font-sans text-xs text-charcoal/60 line-clamp-3 mb-3">
              {option.prompt.split('\n')[0]}
            </p>
            <Button
              size="sm"
              onClick={() => onSelectPrompt(option.prompt, option.templateKey)}
              disabled={isGenerating}
              className="w-full bg-brass hover:bg-brass-glow text-ink-black font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                `Generate ${String.fromCharCode(65 + idx)}`
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
