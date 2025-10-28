import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';

const QUICK_REFINEMENTS = [
  'Make brighter',
  'Add more shadows',
  'Cleaner composition',
  'Add lifestyle context',
  'Desert backdrop'
];

interface RefinementChatProps {
  onRefine: (refinement: string) => void;
  isGenerating: boolean;
}

export function RefinementChat({ onRefine, isGenerating }: RefinementChatProps) {
  const [input, setInput] = useState('');

  const handleSubmit = () => {
    if (!input.trim() || isGenerating) return;
    onRefine(input.trim());
    setInput('');
  };

  const handleQuickRefine = (refinement: string) => {
    if (isGenerating) return;
    onRefine(refinement);
  };

  return (
    <Card className="bg-parchment-white border border-charcoal/10 shadow-level-1 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brass" />
        <h3 className="font-serif text-lg text-ink-black">Refine with Madison</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {QUICK_REFINEMENTS.map(ref => (
          <Button
            key={ref}
            size="sm"
            variant="outline"
            onClick={() => handleQuickRefine(ref)}
            disabled={isGenerating}
            className="border-charcoal/20 hover:border-brass/40 hover:bg-brass/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ref}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g., 'Make it brighter' or 'Add desert backdrop'"
          disabled={isGenerating}
          className="bg-vellum-cream border-charcoal/20 focus:border-brass focus:ring-brass disabled:opacity-50"
        />
        <Button 
          onClick={handleSubmit} 
          disabled={isGenerating || !input.trim()}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
