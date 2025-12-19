/**
 * AI Suggestions Widget
 * 
 * Shows smart recommendations from Madison AI.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Lightbulb, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface Suggestion {
  id: string;
  text: string;
  action: string;
  route: string;
  type: 'multiply' | 'create' | 'optimize' | 'schedule';
}

export function AISuggestionsWidget() {
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const generateSuggestions = async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Get recent content to base suggestions on
      const { data: recentContent } = await supabase
        .from('master_content')
        .select('id, title, content_type, created_at')
        .eq('organization_id', organizationId)
        .eq('is_archived', false)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: derivatives } = await supabase
        .from('derivative_assets')
        .select('id, asset_type, master_content_id')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .limit(10);

      const newSuggestions: Suggestion[] = [];

      // Check for content without derivatives
      if (recentContent && recentContent.length > 0) {
        const contentWithoutDerivatives = recentContent.filter(content => 
          !derivatives?.some(d => d.master_content_id === content.id)
        );

        if (contentWithoutDerivatives.length > 0) {
          const content = contentWithoutDerivatives[0];
          newSuggestions.push({
            id: `multiply-${content.id}`,
            text: `Turn "${content.title}" into social posts`,
            action: 'Multiply Now',
            route: `/multiply?id=${content.id}`,
            type: 'multiply',
          });
        }

        // Suggest creating new content types
        const contentTypes = recentContent.map(c => c.content_type);
        if (!contentTypes.includes('email_sequence')) {
          newSuggestions.push({
            id: 'create-email',
            text: 'Create an email sequence for your audience',
            action: 'Create Email',
            route: '/create?type=email_sequence',
            type: 'create',
          });
        }

        // Suggest LinkedIn if no recent LinkedIn posts
        const linkedInDerivatives = derivatives?.filter(d => 
          d.asset_type?.toLowerCase().includes('linkedin')
        );
        if (!linkedInDerivatives || linkedInDerivatives.length < 3) {
          const latestContent = recentContent[0];
          newSuggestions.push({
            id: 'linkedin-posts',
            text: `Create LinkedIn posts from "${latestContent.title}"`,
            action: 'Create Posts',
            route: `/multiply?id=${latestContent.id}&focus=linkedin`,
            type: 'multiply',
          });
        }
      }

      // Default suggestions if nothing specific
      if (newSuggestions.length === 0) {
        newSuggestions.push({
          id: 'start-blog',
          text: 'Start with a blog post to fuel your content engine',
          action: 'Create Blog',
          route: '/create?type=blog_article',
          type: 'create',
        });
      }

      // Add scheduling suggestion
      newSuggestions.push({
        id: 'schedule-content',
        text: 'Review your content calendar for this week',
        action: 'View Calendar',
        route: '/calendar',
        type: 'schedule',
      });

      setSuggestions(newSuggestions.slice(0, 4));
    } catch (e) {
      console.error('[AISuggestionsWidget] Error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [organizationId]);

  const getIcon = (type: Suggestion['type']) => {
    switch (type) {
      case 'multiply': return <Sparkles className="w-4 h-4 text-amber-500" />;
      case 'create': return <Lightbulb className="w-4 h-4 text-green-500" />;
      case 'optimize': return <Sparkles className="w-4 h-4 text-blue-500" />;
      case 'schedule': return <Lightbulb className="w-4 h-4 text-purple-500" />;
      default: return <Lightbulb className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Madison Suggests
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={generateSuggestions}
            disabled={isLoading}
            className="h-7 w-7 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No suggestions yet. Create some content first!
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="group p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => navigate(suggestion.route)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getIcon(suggestion.type)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground line-clamp-2">
                        {suggestion.text}
                      </p>
                      <button className="text-xs text-primary font-medium mt-1 flex items-center gap-1 group-hover:gap-2 transition-all">
                        {suggestion.action}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

