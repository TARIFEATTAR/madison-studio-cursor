/**
 * Widget Grid
 * 
 * Renders widgets in a responsive grid layout with drag-and-drop support.
 */

import { useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { useWidgets } from './WidgetContext';
import { WidgetWrapper } from './WidgetWrapper';
import { QuickWriteWidget } from './QuickWriteWidget';
import { ContentStreakWidget } from './ContentStreakWidget';
import { QuickMultiplyWidget } from './QuickMultiplyWidget';
import { AISuggestionsWidget } from './AISuggestionsWidget';
import { BrandHealthWidget } from './BrandHealthWidget';
import { ContentPipelineWidget } from './ContentPipelineWidget';
import { ThisWeekWidget } from './ThisWeekWidget';
import { QuickLinksWidget } from '../dashboard/QuickLinksWidget';
import { WidgetType, WidgetConfig } from './types';

// Widget component registry
const WIDGET_COMPONENTS: Record<WidgetType, React.ComponentType<any>> = {
  'quick-write': QuickWriteWidget,
  'content-streak': ContentStreakWidget,
  'quick-multiply': QuickMultiplyWidget,
  'ai-suggestions': AISuggestionsWidget,
  'brand-health': BrandHealthWidget,
  'content-pipeline': ContentPipelineWidget,
  'this-week': ThisWeekWidget,
  'quick-links': QuickLinksWidget,
};

// Size classes for grid items - supports all 12 column widths
const SIZE_CLASSES: Record<number, string> = {
  1: 'col-span-1 md:col-span-1',
  2: 'col-span-1 md:col-span-2',
  3: 'col-span-1 md:col-span-3',
  4: 'col-span-1 md:col-span-4',
  5: 'col-span-1 md:col-span-5',
  6: 'col-span-1 md:col-span-6',
  7: 'col-span-1 md:col-span-7',
  8: 'col-span-1 md:col-span-8',
  9: 'col-span-1 md:col-span-9',
  10: 'col-span-1 md:col-span-10',
  11: 'col-span-1 md:col-span-11',
  12: 'col-span-1 md:col-span-12',
};

// Height classes for different row spans
const HEIGHT_CLASSES: Record<number, string> = {
  1: 'min-h-[100px]',
  2: 'min-h-[160px]',
  3: 'min-h-[220px]',
  4: 'min-h-[280px]',
  5: 'min-h-[340px]',
  6: 'min-h-[400px]',
};

interface WidgetGridProps {
  className?: string;
}

export function WidgetGrid({ className }: WidgetGridProps) {
  const { layout, isEditMode, updateWidgetPosition, removeWidget } = useWidgets();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = layout.widgets.findIndex(w => w.id === active.id);
      const newIndex = layout.widgets.findIndex(w => w.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Swap positions
        const oldWidget = layout.widgets[oldIndex];
        const newWidget = layout.widgets[newIndex];

        updateWidgetPosition(oldWidget.id, { ...newWidget.position });
        updateWidgetPosition(newWidget.id, { ...oldWidget.position });
      }
    }
  }, [layout.widgets, updateWidgetPosition]);

  const handleWidgetResize = useCallback((widgetId: string, newSize: { w: number; h: number }) => {
    updateWidgetPosition(widgetId, { w: newSize.w, h: newSize.h });
  }, [updateWidgetPosition]);

  const renderWidget = (widget: WidgetConfig) => {
    const Component = WIDGET_COMPONENTS[widget.type];
    if (!Component) {
      console.warn(`Unknown widget type: ${widget.type}`);
      return null;
    }

    const widthClass = SIZE_CLASSES[widget.position.w] || 'col-span-1 md:col-span-4';
    const heightClass = HEIGHT_CLASSES[widget.position.h] || 'min-h-[160px]';

    return (
      <WidgetWrapper
        key={widget.id}
        id={widget.id}
        type={widget.type}
        position={widget.position}
        className={`${widthClass} ${heightClass}`}
        onRemove={isEditMode ? () => removeWidget(widget.id) : undefined}
        onResize={isEditMode ? (newSize) => handleWidgetResize(widget.id, newSize) : undefined}
      >
        <Component settings={widget.settings} />
      </WidgetWrapper>
    );
  };

  // Sort widgets by position for rendering
  const sortedWidgets = [...layout.widgets].sort((a, b) => {
    if (a.position.y !== b.position.y) return a.position.y - b.position.y;
    return a.position.x - b.position.x;
  });

  if (isEditMode) {
    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sortedWidgets.map(w => w.id)}
          strategy={rectSortingStrategy}
        >
          <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${className || ''}`}>
            {sortedWidgets.map(renderWidget)}
          </div>
        </SortableContext>
      </DndContext>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${className || ''}`}>
      {sortedWidgets.map(renderWidget)}
    </div>
  );
}

