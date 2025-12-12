/**
 * Madison Pipeline Test Page
 * 
 * A simple interface to test if Madison is pulling from the masters correctly.
 * This tests the Assembler (database queries) without needing the full AI pipeline.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CheckCircle, XCircle, Database, Brain, Sparkles } from 'lucide-react';

// Squad definitions for the mock router
const SQUAD_KEYWORDS = {
  THE_SCIENTISTS: ['specific', 'data', 'proof', 'technical', 'price', 'features', 'specs', 'percentage', 'clinical'],
  THE_STORYTELLERS: ['story', 'romance', 'lifestyle', 'fragrance', 'candle', 'journey', 'adventure', 'dream', 'imagine'],
  THE_DISRUPTORS: ['ad', 'scroll', 'attention', 'launch', 'urgent', 'bold', 'break', 'stop', 'now'],
};

// Map squads to their primary masters
const SQUAD_MASTERS: Record<string, string[]> = {
  THE_SCIENTISTS: ['OGILVY_SPECIFICITY', 'HOPKINS_REASON_WHY', 'CAPLES_HEADLINES'],
  THE_STORYTELLERS: ['PETERMAN_ROMANCE', 'COLLIER_CONVERSATION'],
  THE_DISRUPTORS: ['HALBERT_URGENCY', 'BERNBACH_DISRUPTION'],
};

interface MasterData {
  master_name: string;
  squad: string;
  summary: string;
  full_content: string;
}

interface TestResult {
  selectedSquad: string;
  selectedMasters: string[];
  masterData: MasterData[];
  schwartzStage: string;
  timestamp: Date;
}

export default function MadisonTest() {
  const [brief, setBrief] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [allMasters, setAllMasters] = useState<MasterData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Simple mock router that selects squad based on keywords
  const mockRouter = (userBrief: string): { squad: string; stage: string } => {
    const briefLower = userBrief.toLowerCase();
    
    // Check for squad keywords
    for (const [squad, keywords] of Object.entries(SQUAD_KEYWORDS)) {
      if (keywords.some(kw => briefLower.includes(kw))) {
        return { squad, stage: 'SOLUTION_AWARE' };
      }
    }
    
    // Default to Storytellers for lifestyle content
    return { squad: 'THE_STORYTELLERS', stage: 'PROBLEM_AWARE' };
  };

  const loadAllMasters = async () => {
    const { data, error } = await supabase
      .from('madison_masters')
      .select('master_name, squad, summary, full_content');

    if (error) {
      throw new Error(`Failed to load masters: ${error.message}`);
    }

    return data as MasterData[];
  };

  const fetchMastersForSquad = async (squad: string): Promise<MasterData[]> => {
    const masterNames = SQUAD_MASTERS[squad] || [];
    
    if (masterNames.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('madison_masters')
      .select('master_name, squad, summary, full_content')
      .in('master_name', masterNames);

    if (error) {
      throw new Error(`Failed to fetch masters: ${error.message}`);
    }

    return data as MasterData[];
  };

  const runTest = async () => {
    if (!brief.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load all masters first (for display)
      const masters = await loadAllMasters();
      setAllMasters(masters);

      // Mock the router decision
      const { squad, stage } = mockRouter(brief);

      // Fetch the specific masters for this squad
      const squadMasters = await fetchMastersForSquad(squad);

      setResult({
        selectedSquad: squad,
        selectedMasters: squadMasters.map(m => m.master_name),
        masterData: squadMasters,
        schwartzStage: stage,
        timestamp: new Date(),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const exampleBriefs = [
    { label: 'Storyteller', text: 'Write an Instagram caption for our new rose candle that evokes a romantic evening.' },
    { label: 'Scientist', text: 'Write product page copy highlighting the specific ingredients and clinical proof of our retinol serum.' },
    { label: 'Disruptor', text: 'Create a scroll-stopping ad for our new launch that demands attention immediately.' },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-serif text-foreground">Madison Pipeline Test</h1>
          <p className="text-muted-foreground">
            Test if Madison is pulling from the correct masters based on your brief
          </p>
        </div>

        {/* Input Section */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Enter Your Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder="e.g., Write an Instagram caption for our rose-scented candle..."
              className="min-h-[100px] bg-background"
            />
            
            {/* Example briefs */}
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">Try:</span>
              {exampleBriefs.map((example) => (
                <Button
                  key={example.label}
                  variant="outline"
                  size="sm"
                  onClick={() => setBrief(example.text)}
                  className="text-xs"
                >
                  {example.label}
                </Button>
              ))}
            </div>

            <Button 
              onClick={runTest} 
              disabled={isLoading || !brief.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Pipeline...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Test Madison
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Strategy Summary */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Router Decision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Selected Squad</p>
                    <Badge variant="default" className="mt-1 text-base px-3 py-1">
                      {result.selectedSquad.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Schwartz Stage</p>
                    <Badge variant="secondary" className="mt-1 text-base px-3 py-1">
                      {result.schwartzStage.replace(/_/g, ' ')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Selected Masters</p>
                  <div className="flex flex-wrap gap-2">
                    {result.selectedMasters.map((master) => (
                      <Badge key={master} variant="outline">
                        {master.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Master Content Preview */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  Loaded Master Documents
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.masterData.length === 0 ? (
                  <p className="text-muted-foreground italic">No masters found for this squad</p>
                ) : (
                  result.masterData.map((master) => (
                    <div key={master.master_name} className="border border-border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {master.master_name.replace(/_/g, ' ')}
                        </h3>
                        <Badge variant="secondary" className="text-xs">
                          {master.squad.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{master.summary}</p>
                      <details className="mt-2">
                        <summary className="text-sm text-primary cursor-pointer hover:underline">
                          View full training content ({master.full_content.length.toLocaleString()} chars)
                        </summary>
                        <pre className="mt-2 p-3 bg-background rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                          {master.full_content}
                        </pre>
                      </details>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* All Masters Overview */}
            <Card className="bg-card border border-border">
              <CardHeader>
                <CardTitle>All Available Masters ({allMasters.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allMasters.map((master) => (
                    <div
                      key={master.master_name}
                      className={`p-2 rounded border text-sm ${
                        result.selectedMasters.includes(master.master_name)
                          ? 'border-primary bg-primary/10'
                          : 'border-border'
                      }`}
                    >
                      <p className="font-medium truncate">{master.master_name.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">{master.squad.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
