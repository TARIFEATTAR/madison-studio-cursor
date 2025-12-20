/**
 * Dashboard Widget System
 * 
 * Unified widget system for the main dashboard with add/delete/resize/drag functionality
 */

import React, { useCallback, useState, useRef } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  CollisionDetection,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Plus, Package, Video, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Import all dashboard components
import { DashboardHero } from './DashboardHero';
import { PipelineOverviewWidget } from './RoleDashboardWidgets';
import { TeamActivityWidget } from './RoleDashboardWidgets';
import { RevenueMetricsWidget } from './RoleDashboardWidgets';
import { ContentPipelineCard } from './ContentPipelineCard';
import { SmartMomentumTracker } from './SmartMomentumTracker';
import { StrategySessionCard } from './StrategySessionCard';
import { QuickLinksWidget } from './QuickLinksWidget';
import { ThisWeekCard } from './ThisWeekCard';
import { DashboardRecentActivity } from './DashboardRecentActivity';
import { GoogleMeetWidget } from './GoogleMeetWidget';
import { BrandHealthCard } from './BrandHealthCard';
import { BrandWidget } from './BrandWidget';

export type DashboardWidgetType =
  | 'hero-banner'
  | 'pipeline-overview'
  | 'team-activity'
  | 'revenue-overview'
  | 'content-pipeline'
  | 'momentum-tracker'
  | 'strategy-session'
  | 'quick-links'
  | 'this-week'
  | 'recent-activity'
  | 'google-meet'
  | 'brand-health'
  | 'brand';

export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  w: number;
  h: number;
  x: number;
  y: number;
}

interface DashboardWidgetSystemProps {
  widgets: DashboardWidget[];
  isEditMode: boolean;
  onWidgetsChange: (widgets: DashboardWidget[]) => void;
  onAddWidget: (type: DashboardWidgetType) => void;
  onRemoveWidget: (id: string) => void;
  onResizeWidget: (id: string, w: number, h: number) => void;
  showAddButton?: boolean;
}

const WIDGET_COMPONENTS: Record<DashboardWidgetType, React.ComponentType<any>> = {
  'hero-banner': DashboardHero,
  'pipeline-overview': PipelineOverviewWidget,
  'team-activity': TeamActivityWidget,
  'revenue-overview': RevenueMetricsWidget,
  'content-pipeline': ContentPipelineCard,
  'momentum-tracker': SmartMomentumTracker,
  'strategy-session': StrategySessionCard,
  'quick-links': QuickLinksWidget,
  'this-week': ThisWeekCard,
  'recent-activity': DashboardRecentActivity,
  'google-meet': GoogleMeetWidget,
  'brand-health': BrandHealthCard,
  'brand': BrandWidget,
};

export const WIDGET_DEFINITIONS: Record<DashboardWidgetType, { name: string; icon: any; defaultW: number; defaultH: number }> = {
  'hero-banner': { name: 'Hero Banner', icon: Package, defaultW: 10, defaultH: 2 },
  'pipeline-overview': { name: 'Product Pipeline', icon: Package, defaultW: 4, defaultH: 3 },
  'team-activity': { name: 'Team Activity', icon: Package, defaultW: 4, defaultH: 3 },
  'revenue-overview': { name: 'Revenue Overview', icon: Package, defaultW: 4, defaultH: 3 },
  'content-pipeline': { name: 'Content Pipeline', icon: Package, defaultW: 6, defaultH: 4 },
  'momentum-tracker': { name: 'Momentum Tracker', icon: Package, defaultW: 6, defaultH: 4 },
  'strategy-session': { name: 'Strategy Session', icon: Package, defaultW: 2, defaultH: 1 }, // Compact card
  'quick-links': { name: 'Quick Links', icon: Package, defaultW: 8, defaultH: 2 }, // Smaller default
  'this-week': { name: "This Week's Schedule", icon: Package, defaultW: 12, defaultH: 3 },
  'recent-activity': { name: 'Recent Activity', icon: Package, defaultW: 12, defaultH: 4 },
  'google-meet': { name: 'Google Meet', icon: Video, defaultW: 4, defaultH: 3 }, // Compact preview, expandable
  'brand-health': { name: 'Brand Health', icon: Shield, defaultW: 4, defaultH: 3 },
  'brand': { name: 'Brand', icon: Palette, defaultW: 4, defaultH: 3 },
};

function SortableWidget({ widget, onRemove, onResize, isEditMode }: {
  widget: DashboardWidget;
  onRemove: (id: string) => void;
  onResize: (id: string, w: number, h: number) => void;
  isEditMode: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: widget.id, 
    disabled: !isEditMode,
    transition: {
      duration: 200,
      easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : (transition || 'transform 200ms cubic-bezier(0.25, 0.1, 0.25, 1)'),
    opacity: isDragging ? 0.4 : 1,
    cursor: isEditMode ? 'grab' : 'default',
    zIndex: isDragging ? 40 : 'auto',
  };

  const Component = WIDGET_COMPONENTS[widget.type];
  if (!Component) return null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group h-full w-full',
        isEditMode && 'ring-2 ring-primary/20 rounded-lg',
        isDragging && 'z-50',
      )}
      onMouseDown={(e) => {
        if (!isEditMode) return;
        // Prevent drag when clicking on resize handles
        if ((e.target as HTMLElement).closest('.resize-handle')) {
          e.stopPropagation();
        }
      }}
    >
      {/* Edit Mode Controls */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none z-10 rounded-lg">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1.5 rounded-md bg-background/90 shadow-sm cursor-grab active:cursor-grabbing pointer-events-auto hover:bg-muted transition-colors z-20"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Size Display */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium z-20 pointer-events-none">
            {widget.w}×{widget.h}
          </div>

          {/* Remove Button - Hide for hero banner */}
          {widget.type !== 'hero-banner' && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6 pointer-events-auto z-20"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(widget.id);
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}

          {/* Resize Handles - All edges and corners */}
          <ResizeHandles widget={widget} onResize={onResize} />
        </div>
      )}

      {/* Widget Content */}
      <div className={cn('h-full w-full rounded-lg', isEditMode && 'pointer-events-none')}>
        {widget.type === 'strategy-session' ? (
          <Component compact />
        ) : widget.type === 'brand-health' ? (
          <Component compact />
        ) : (
          <Component />
        )}
      </div>
    </div>
  );
}

function ResizeHandles({ widget, onResize }: { widget: DashboardWidget; onResize: (id: string, w: number, h: number) => void }) {
  const [isResizing, setIsResizing] = React.useState(false);
  const resizeDirectionRef = React.useRef<string | null>(null);

  type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

  const handleResizeStart = (direction: ResizeDirection) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeDirectionRef.current = direction;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = widget.w;
    const startH = widget.h;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      const containerWidth = 1200; // Approximate
      const pxPerCol = containerWidth / 12;
      const pxPerRow = 60;
      
      let newW = startW;
      let newH = startH;

      // Special constraints for hero banner
      const isHero = widget.type === 'hero-banner';
      const minW = isHero ? 6 : 2; // Hero can be narrowed but not too much
      const maxW = 12;
      const minH = isHero ? 2 : 1; // Allow 1 unit minimum for non-hero widgets
      const maxH = isHero ? 4 : 8; // Hero can be taller but not too much

      switch (direction) {
        case 'n': newH = Math.max(minH, Math.min(maxH, startH - Math.round(deltaY / pxPerRow))); break;
        case 's': newH = Math.max(minH, Math.min(maxH, startH + Math.round(deltaY / pxPerRow))); break;
        case 'e': newW = Math.max(minW, Math.min(maxW, startW + Math.round(deltaX / pxPerCol))); break;
        case 'w': newW = Math.max(minW, Math.min(maxW, startW - Math.round(deltaX / pxPerCol))); break;
        case 'ne': 
          newH = Math.max(minH, Math.min(maxH, startH - Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW + Math.round(deltaX / pxPerCol)));
          break;
        case 'nw':
          newH = Math.max(minH, Math.min(maxH, startH - Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW - Math.round(deltaX / pxPerCol)));
          break;
        case 'se':
          newH = Math.max(minH, Math.min(maxH, startH + Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW + Math.round(deltaX / pxPerCol)));
          break;
        case 'sw':
          newH = Math.max(minH, Math.min(maxH, startH + Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW - Math.round(deltaX / pxPerCol)));
          break;
      }

      if (newW !== widget.w || newH !== widget.h) {
        onResize(widget.id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      resizeDirectionRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const getCursor = (dir: ResizeDirection) => {
    if (dir === 'n' || dir === 's') return 'ns-resize';
    if (dir === 'e' || dir === 'w') return 'ew-resize';
    if (dir === 'ne' || dir === 'sw') return 'nesw-resize';
    return 'nwse-resize';
  };

  const ResizeHandle = ({ direction, position }: { direction: ResizeDirection; position: string }) => {
    const isEdge = direction.length === 1;
    const isCorner = direction.length === 2;
    
    let widthClass = '';
    let heightClass = '';
    
    if (isEdge) {
      if (direction === 'n' || direction === 's') {
        widthClass = 'w-full';
        heightClass = 'h-2';
      } else {
        widthClass = 'w-2';
        heightClass = 'h-full';
      }
    } else {
      widthClass = 'w-4';
      heightClass = 'h-4';
    }
    
    return (
      <div
        onMouseDown={handleResizeStart(direction)}
        className={cn(
          'absolute pointer-events-auto bg-primary/20 hover:bg-primary/40 transition-colors resize-handle',
          position,
          widthClass,
          heightClass,
          isEdge && 'opacity-60 hover:opacity-100',
          isCorner && 'opacity-80 hover:opacity-100 rounded'
        )}
        style={{ cursor: getCursor(direction) }}
      >
        {isCorner && (
          <div className={cn(
            'absolute w-3 h-3 border-2 border-primary/70',
            direction === 'ne' && 'top-0 right-0 border-t-2 border-r-2 rounded-tr',
            direction === 'nw' && 'top-0 left-0 border-t-2 border-l-2 rounded-tl',
            direction === 'se' && 'bottom-0 right-0 border-b-2 border-r-2 rounded-br',
            direction === 'sw' && 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl'
          )} />
        )}
      </div>
    );
  };

  return (
    <>
      <ResizeHandle direction="n" position="top-0 left-0 right-0" />
      <ResizeHandle direction="s" position="bottom-0 left-0 right-0" />
      <ResizeHandle direction="e" position="top-0 right-0 bottom-0" />
      <ResizeHandle direction="w" position="top-0 left-0 bottom-0" />
      <ResizeHandle direction="ne" position="top-0 right-0" />
      <ResizeHandle direction="nw" position="top-0 left-0" />
      <ResizeHandle direction="se" position="bottom-0 right-0" />
      <ResizeHandle direction="sw" position="bottom-0 left-0" />
    </>
  );
}

// Custom collision detection for grid-based layout
const gridCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  
  if (pointerCollisions.length > 0) {
    return pointerCollisions;
  }
  
  return rectIntersection(args);
};

// Calculate grid position from coordinates
function calculateGridPosition(
  x: number,
  y: number,
  containerRect: DOMRect,
  gap: number = 16,
  cols: number = 12,
  rowHeight: number = 80
): { x: number; y: number } {
  const relativeX = x - containerRect.left;
  const relativeY = y - containerRect.top;
  
  const colWidth = (containerRect.width - (gap * (cols - 1))) / cols;
  const gridX = Math.max(0, Math.min(cols - 1, Math.floor((relativeX + gap / 2) / (colWidth + gap))));
  const gridY = Math.max(0, Math.floor((relativeY + gap / 2) / (rowHeight + gap)));
  
  return { x: gridX, y: gridY };
}

// Check if two widgets overlap
function widgetsOverlap(w1: DashboardWidget, w2: DashboardWidget): boolean {
  if (w1.id === w2.id) return false;
  
  const w1Right = w1.x + w1.w;
  const w1Bottom = w1.y + w1.h;
  const w2Right = w2.x + w2.w;
  const w2Bottom = w2.y + w2.h;
  
  return !(
    w1Right <= w2.x ||
    w1.x >= w2Right ||
    w1Bottom <= w2.y ||
    w1.y >= w2Bottom
  );
}

// Find the best position for a widget, auto-repositioning others if needed
function findBestPosition(
  draggedWidget: DashboardWidget,
  targetX: number,
  targetY: number,
  allWidgets: DashboardWidget[]
): { newWidgets: DashboardWidget[]; placed: boolean } {
  const otherWidgets = allWidgets.filter(w => w.id !== draggedWidget.id);
  const isHero = draggedWidget.type === 'hero-banner';
  
  // Hero banner must stay at y: 0
  if (isHero) {
    const newX = Math.max(0, Math.min(12 - draggedWidget.w, targetX));
    return {
      newWidgets: allWidgets.map(w => 
        w.id === draggedWidget.id 
          ? { ...w, x: newX, y: 0 }
          : w
      ),
      placed: true,
    };
  }
  
  // Try to place at target position
  let newX = Math.max(0, Math.min(12 - draggedWidget.w, targetX));
  let newY = Math.max(isHero ? 0 : 0, targetY);
  
  const newPosition: DashboardWidget = {
    ...draggedWidget,
    x: newX,
    y: newY,
  };
  
  // Check for overlaps and reposition other widgets
  const repositionedWidgets = [...otherWidgets];
  const processedWidgets = new Set<string>();
  let hasOverlap = true;
  let iterations = 0;
  const maxIterations = 100; // Prevent infinite loops
  
  while (hasOverlap && iterations < maxIterations) {
    hasOverlap = false;
    iterations++;
    
    for (let i = 0; i < repositionedWidgets.length; i++) {
      const widget = repositionedWidgets[i];
      
      // Skip hero banner repositioning
      if (widget.type === 'hero-banner') continue;
      
      // Check if this widget overlaps with the new position
      if (widgetsOverlap(newPosition, widget)) {
        hasOverlap = true;
        
        // Try to push widget to the right first, then down
        const pushRight = {
          ...widget,
          x: newPosition.x + newPosition.w,
          y: widget.y,
        };
        
        // Check if pushed right position is valid and doesn't overlap
        const rightOverlaps = repositionedWidgets.some(w => 
          w.id !== widget.id && widgetsOverlap(pushRight, w)
        );
        
        if (!rightOverlaps && pushRight.x + pushRight.w <= 12) {
          repositionedWidgets[i] = pushRight;
        } else {
          // Push down instead
          repositionedWidgets[i] = {
            ...widget,
            y: newPosition.y + newPosition.h,
          };
        }
        
        processedWidgets.add(widget.id);
      }
    }
    
    // Check for overlaps between repositioned widgets
    for (let i = 0; i < repositionedWidgets.length; i++) {
      for (let j = i + 1; j < repositionedWidgets.length; j++) {
        if (widgetsOverlap(repositionedWidgets[i], repositionedWidgets[j])) {
          // Push the second widget down
          repositionedWidgets[j] = {
            ...repositionedWidgets[j],
            y: repositionedWidgets[i].y + repositionedWidgets[i].h,
          };
          hasOverlap = true;
        }
      }
    }
  }
  
  return {
    newWidgets: [newPosition, ...repositionedWidgets],
    placed: true,
  };
}

export function DashboardWidgetSystem({
  widgets,
  isEditMode,
  onWidgetsChange,
  onAddWidget,
  onRemoveWidget,
  onResizeWidget,
  showAddButton = true,
}: DashboardWidgetSystemProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3, // Very responsive - start dragging after 3px movement
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setDragPosition(null);
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    if (!gridRef.current || !event.active) return;
    
    const containerRect = gridRef.current.getBoundingClientRect();
    const position = calculateGridPosition(
      event.activatorEvent.clientX,
      event.activatorEvent.clientY,
      containerRect
    );
    
    setDragPosition(position);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDragPosition(null);

    const activeWidget = widgets.find(w => w.id === active.id);
    if (!activeWidget) return;

    // If dropped over another widget, use its position
    if (over && active.id !== over.id) {
      const overWidget = widgets.find(w => w.id === over.id);
      if (overWidget) {
        const isHero = activeWidget.type === 'hero-banner';
        
        if (isHero) {
          // Hero can only swap x position, not y
          const newWidgets = widgets.map(w => {
            if (w.id === active.id) return { ...w, x: overWidget.x, y: 0 };
            if (w.id === over.id && overWidget.type !== 'hero-banner') {
              return { ...w, x: activeWidget.x, y: overWidget.y };
            }
            return w;
          });
          onWidgetsChange(newWidgets);
          return;
        } else if (overWidget.type === 'hero-banner') {
          // Position below hero
          const heroHeight = overWidget.h;
          const result = findBestPosition(
            activeWidget,
            overWidget.x,
            heroHeight,
            widgets
          );
          onWidgetsChange(result.newWidgets);
          return;
        }
      }
    }
    
    // Use calculated position from drag coordinates
    if (dragPosition && gridRef.current) {
      const result = findBestPosition(
        activeWidget,
        dragPosition.x,
        dragPosition.y,
        widgets
      );
      if (result.placed) {
        onWidgetsChange(result.newWidgets);
      }
    } else if (over && active.id !== over.id) {
      // Fallback to swap if no position calculated
      const overWidget = widgets.find(w => w.id === over.id);
      if (overWidget && activeWidget.type !== 'hero-banner' && overWidget.type !== 'hero-banner') {
        const newWidgets = widgets.map(w => {
          if (w.id === active.id) return { ...w, x: overWidget.x, y: overWidget.y };
          if (w.id === over.id) return { ...w, x: activeWidget.x, y: activeWidget.y };
          return w;
        });
        onWidgetsChange(newWidgets);
      }
    }
  }, [widgets, onWidgetsChange, dragPosition]);

  const handleResize = useCallback((id: string, w: number, h: number) => {
    onResizeWidget(id, w, h);
  }, [onResizeWidget]);

  // Sort widgets by position - Hero banner always first
  const sortedWidgets = [...widgets].sort((a, b) => {
    // Hero banner always comes first
    if (a.type === 'hero-banner') return -1;
    if (b.type === 'hero-banner') return 1;
    // Then sort by y position, then x position
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  const activeWidget = activeId ? widgets.find(w => w.id === activeId) : null;

  return (
    <div className="space-y-4">
      {/* Add Widget Button - Above widgets */}
      {isEditMode && showAddButton && (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Plus className="w-4 h-4" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Available Widgets</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                {Object.entries(WIDGET_DEFINITIONS).map(([type, def]) => {
                  const Icon = def.icon;
                  const isAdded = widgets.some(w => w.type === type);
                  // Don't show hero-banner in add menu (it's always there)
                  if (type === 'hero-banner') return null;
                  return (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => onAddWidget(type as DashboardWidgetType)}
                      disabled={isAdded}
                      className="gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{def.name}</span>
                      {isAdded && <span className="ml-auto text-xs text-muted-foreground">Added</span>}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {/* Widget Grid */}
      {isEditMode ? (
        <DndContext
          sensors={sensors}
          collisionDetection={gridCollisionDetection}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedWidgets.map(w => w.id)}
            strategy={rectSortingStrategy}
          >
            <div 
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 relative" 
              style={{ gridAutoRows: 'minmax(80px, auto)' }}
            >
              {sortedWidgets.map(widget => (
                <div
                  key={widget.id}
                  className="h-full min-h-0"
                  style={{
                    gridColumn: `span ${widget.w}`,
                    gridRow: `span ${widget.h}`,
                  }}
                >
                  <SortableWidget
                    widget={widget}
                    onRemove={onRemoveWidget}
                    onResize={handleResize}
                    isEditMode={isEditMode}
                  />
                </div>
              ))}
              {/* Drop Indicator - Shows where widget will be placed */}
              {dragPosition && activeId && activeWidget && gridRef.current && (() => {
                const containerRect = gridRef.current.getBoundingClientRect();
                const gap = 16; // gap-4 = 16px
                const cols = 12;
                const rowHeight = 80;
                const colWidth = (containerRect.width - (gap * (cols - 1))) / cols;
                
                const left = dragPosition.x * (colWidth + gap);
                const top = dragPosition.y * (rowHeight + gap);
                const width = activeWidget.w * colWidth + (activeWidget.w - 1) * gap;
                const height = activeWidget.h * rowHeight + (activeWidget.h - 1) * gap;
                
                return (
                  <div
                    className="absolute border-2 border-dashed border-primary bg-primary/10 rounded-lg pointer-events-none z-30 transition-all duration-150"
                    style={{
                      left: `${left}px`,
                      top: `${top}px`,
                      width: `${width}px`,
                      height: `${height}px`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-xs font-medium text-primary bg-background/90 px-2 py-1 rounded shadow-sm">
                        Drop here
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeWidget && (
              <div 
                className="opacity-95 rounded-lg border-2 border-primary bg-background shadow-level-3 transform rotate-1 scale-105"
                style={{
                  width: '300px',
                  minHeight: '120px',
                }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-4 h-4 text-primary" />
                    <div className="text-sm font-medium text-primary">
                      {WIDGET_DEFINITIONS[activeWidget.type].name}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Size: {activeWidget.w}×{activeWidget.h}
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground/70">
                    Drag to reposition
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4" style={{ gridAutoRows: 'minmax(80px, auto)' }}>
          {sortedWidgets.map(widget => (
            <div
              key={widget.id}
              className="h-full min-h-0"
              style={{
                gridColumn: `span ${widget.w}`,
                gridRow: `span ${widget.h}`,
              }}
            >
              <div className="h-full w-full rounded-lg">
                {widget.type === 'strategy-session' ? (
                  <StrategySessionCard compact />
                ) : widget.type === 'brand-health' ? (
                  <BrandHealthCard compact />
                ) : (
                  React.createElement(WIDGET_COMPONENTS[widget.type])
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
