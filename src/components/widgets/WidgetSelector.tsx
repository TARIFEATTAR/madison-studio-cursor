/**
 * Widget Selector
 * 
 * Dialog for adding new widgets to the dashboard.
 */

import { useState } from 'react';
import { Plus, Link2, PenLine, Flame, Sparkles, Heart, GitBranch, Calendar, Layers } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWidgets } from './WidgetContext';
import { WIDGET_REGISTRY, WidgetType } from './types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Link2,
  PenLine,
  Flame,
  Sparkles,
  Heart,
  GitBranch,
  Calendar,
  Layers,
};

const CATEGORY_LABELS: Record<string, string> = {
  productivity: 'Productivity',
  analytics: 'Analytics',
  content: 'Content',
  links: 'Links & Tools',
};

export function WidgetSelector() {
  const { layout, addWidget } = useWidgets();
  const [open, setOpen] = useState(false);

  // Group widgets by category
  const widgetsByCategory = Object.values(WIDGET_REGISTRY).reduce((acc, widget) => {
    if (!acc[widget.category]) {
      acc[widget.category] = [];
    }
    acc[widget.category].push(widget);
    return acc;
  }, {} as Record<string, typeof WIDGET_REGISTRY[WidgetType][]>);

  // Check which widgets are already added
  const activeWidgetTypes = new Set(layout.widgets.map(w => w.type));

  const handleAddWidget = (type: WidgetType) => {
    addWidget(type);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Add Widget</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6 py-4">
            {Object.entries(widgetsByCategory).map(([category, widgets]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  {CATEGORY_LABELS[category] || category}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {widgets.map((widget) => {
                    const Icon = ICON_MAP[widget.icon] || Sparkles;
                    const isActive = activeWidgetTypes.has(widget.type);

                    return (
                      <Card
                        key={widget.type}
                        className={`cursor-pointer transition-all ${
                          isActive
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary hover:shadow-md'
                        }`}
                        onClick={() => !isActive && handleAddWidget(widget.type)}
                      >
                        <CardContent className="p-4 flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{widget.name}</h4>
                              {isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Added
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {widget.description}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

