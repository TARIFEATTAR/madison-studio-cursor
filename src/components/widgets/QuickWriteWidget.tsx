/**
 * Quick Write Widget
 * 
 * One-click access to the editor for instant writing.
 */

import { useNavigate } from 'react-router-dom';
import { PenLine, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function QuickWriteWidget() {
  const navigate = useNavigate();

  return (
    <Card className="h-full bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 hover:border-primary/40 transition-all cursor-pointer group"
      onClick={() => navigate('/editor')}
    >
      <CardContent className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
          <PenLine className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-medium text-foreground mb-1">Quick Write</h3>
        <p className="text-xs text-muted-foreground mb-3">Jump straight into writing</p>
        <Button 
          size="sm" 
          variant="ghost" 
          className="gap-1 text-primary hover:text-primary group-hover:gap-2 transition-all"
        >
          Start Writing
          <ArrowRight className="w-3 h-3" />
        </Button>
      </CardContent>
    </Card>
  );
}

