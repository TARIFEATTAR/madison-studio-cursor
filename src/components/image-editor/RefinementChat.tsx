import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';

const QUICK_REFINEMENTS = [
  'Brighter',
  'More shadows',
  'Cleaner',
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
    if (!input.trim()) return;
    onRefine(input);
    setInput('');
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
            onClick={() => onRefine(ref)}
            disabled={isGenerating}
            className="border-charcoal/20 hover:border-brass/40 hover:bg-brass/5 transition-all"
          >
            {ref}
          </Button>
        ))}
      </div>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          placeholder="e.g., 'Make it brighter' or 'Add desert backdrop'"
          disabled={isGenerating}
          className="bg-vellum-cream border-charcoal/20 focus:border-brass focus:ring-brass"
        />
        <Button onClick={handleSubmit} disabled={isGenerating || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
}
