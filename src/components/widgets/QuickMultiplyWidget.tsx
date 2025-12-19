/**
 * Quick Multiply Widget
 * 
 * One-click content repurposing from recent master content.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useOrganization } from '@/hooks/useOrganization';

interface RecentContent {
  id: string;
  title: string;
  content_type: string;
}

export function QuickMultiplyWidget() {
  const navigate = useNavigate();
  const { organizationId } = useOrganization();
  const [recentContent, setRecentContent] = useState<RecentContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRecent = async () => {
      if (!organizationId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('master_content')
          .select('id, title, content_type')
          .eq('organization_id', organizationId)
          .eq('is_archived', false)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setRecentContent(data);
        }
      } catch (e) {
        console.error('[QuickMultiplyWidget] Error:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecent();
  }, [organizationId]);

  const handleMultiply = () => {
    if (recentContent) {
      navigate(`/multiply?id=${recentContent.id}`);
    } else {
      navigate('/multiply');
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-gradient-to-br from-amber-500/5 to-orange-500/10 border-amber-500/20 hover:border-amber-500/40 transition-all">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          Quick Multiply
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentContent ? (
          <>
            <div className="text-xs text-muted-foreground">
              Ready to repurpose:
            </div>
            <div className="text-sm font-medium line-clamp-2">
              {recentContent.title}
            </div>
            <Button 
              size="sm" 
              onClick={handleMultiply}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Sparkles className="w-3 h-3" />
              Multiply Now
              <ArrowRight className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-muted-foreground mb-3">
              Create content to multiply
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => navigate('/create')}
            >
              Create First
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

