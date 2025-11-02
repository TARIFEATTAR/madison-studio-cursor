import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";

interface MadisonSuggestionsProps {
  onSelectHeadline: (headline: string) => void;
  onSelectCTA: (cta: string) => void;
  currentContent?: string;
}

export function MadisonSuggestions({ onSelectHeadline, onSelectCTA, currentContent }: MadisonSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [headlines, setHeadlines] = useState<string[]>([]);
  const [ctas, setCtas] = useState<string[]>([]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-with-claude', {
        body: {
          prompt: `Based on this email content: "${currentContent || 'luxury brand email'}", suggest 3 compelling email headlines and 3 call-to-action phrases. Return as JSON with keys "headlines" and "ctas" as arrays.`,
          systemPrompt: 'You are Madison, an AI editorial director for luxury brands. Generate sophisticated, brand-aligned suggestions.',
        }
      });

      if (error) throw error;

      const result = JSON.parse(data.generatedText);
      setHeadlines(result.headlines || []);
      setCtas(result.ctas || []);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      toast.error('Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Madison Suggestions</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSuggestions}
          disabled={loading}
          className="gap-2"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          Generate
        </Button>
      </div>

      {headlines.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Headlines</p>
          {headlines.map((headline, i) => (
            <Card
              key={i}
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                onSelectHeadline(headline);
                toast.success('Headline applied');
              }}
            >
              <p className="text-sm">{headline}</p>
            </Card>
          ))}
        </div>
      )}

      {ctas.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Call-to-Actions</p>
          {ctas.map((cta, i) => (
            <Card
              key={i}
              className="p-3 cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                onSelectCTA(cta);
                toast.success('CTA applied');
              }}
            >
              <p className="text-sm font-medium">{cta}</p>
            </Card>
          ))}
        </div>
      )}

      {!loading && headlines.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">
          Click Generate to get Madison's suggestions
        </p>
      )}
    </div>
  );
}
