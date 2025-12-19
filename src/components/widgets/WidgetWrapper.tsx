/**
 * Widget Wrapper
 * 
 * Wraps individual widgets with drag handle, resize controls, and remove button in edit mode.
 */

import { ReactNode, useState, useCallback, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWidgets } from './WidgetContext';
import { WIDGET_REGISTRY, WidgetType, WidgetPosition } from './types';
import { cn } from '@/lib/utils';

interface WidgetWrapperProps {
  id: string;
  type: WidgetType;
  position: WidgetPosition;
  children: ReactNode;
  className?: string;
  onRemove?: () => void;
  onResize?: (newSize: { w: number; h: number }) => void;
}

// Size presets for quick resize
const SIZE_PRESETS = [
  { label: 'S', w: 3, h: 2 },
  { label: 'M', w: 4, h: 3 },
  { label: 'L', w: 6, h: 4 },
  { label: 'W', w: 8, h: 2 },
  { label: 'XL', w: 6, h: 5 },
];

export function WidgetWrapper({ id, type, position, children, className, onRemove, onResize }: WidgetWrapperProps) {
  const { isEditMode } = useWidgets();
  const definition = WIDGET_REGISTRY[type];
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: !isEditMode || isResizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // Handle resize via drag
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = position.w;
    const startH = position.h;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Calculate new size based on drag distance
      // Each grid column is roughly 8.33% of container width
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Approximate pixels per grid unit (adjust based on your layout)
      const pxPerCol = 80;
      const pxPerRow = 60;
      
      const newW = Math.max(2, Math.min(12, startW + Math.round(deltaX / pxPerCol)));
      const newH = Math.max(2, Math.min(6, startH + Math.round(deltaY / pxPerRow)));

      if (onResize && (newW !== position.w || newH !== position.h)) {
        onResize({ w: newW, h: newH });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [position, onResize]);

  // Quick size preset selection
  const handleSizePreset = useCallback((w: number, h: number) => {
    if (onResize) {
      onResize({ w, h });
    }
    setShowSizeMenu(false);
  }, [onResize]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isEditMode && 'ring-2 ring-primary/20 rounded-lg',
        isDragging && 'z-50',
        isResizing && 'z-50 ring-primary',
        className
      )}
    >
      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="absolute top-2 left-2 p-1.5 rounded-md bg-background/90 shadow-sm cursor-grab active:cursor-grabbing pointer-events-auto hover:bg-muted transition-colors"
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Widget Label + Size */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
            {definition?.name || type}
            <span className="text-primary/60">({position.w}×{position.h})</span>
          </div>

          {/* Size Presets Button */}
          <div className="absolute top-2 right-10 pointer-events-auto">
            <Button
              variant="secondary"
              size="icon"
              className="w-6 h-6"
              onClick={(e) => {
                e.stopPropagation();
                setShowSizeMenu(!showSizeMenu);
              }}
            >
              {showSizeMenu ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            </Button>
            
            {/* Size Preset Menu */}
            {showSizeMenu && (
              <div className="absolute top-8 right-0 bg-background border border-border rounded-lg shadow-lg p-2 min-w-[120px]">
                <div className="text-xs text-muted-foreground mb-2 px-1">Quick Sizes</div>
                <div className="grid grid-cols-3 gap-1">
                  {SIZE_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSizePreset(preset.w, preset.h);
                      }}
                      className={cn(
                        "px-2 py-1 text-xs rounded hover:bg-muted transition-colors",
                        position.w === preset.w && position.h === preset.h 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted/50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="text-xs text-muted-foreground mt-2 px-1">
                  Or drag corner ↘
                </div>
              </div>
            )}
          </div>

          {/* Remove Button */}
          {onRemove && (
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 w-6 h-6 pointer-events-auto"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}

          {/* Resize Handle (bottom-right corner) */}
          <div
            ref={resizeRef}
            onMouseDown={handleResizeStart}
            className="absolute bottom-1 right-1 w-6 h-6 cursor-se-resize pointer-events-auto flex items-center justify-center"
          >
            <div className="w-3 h-3 border-r-2 border-b-2 border-primary/50 hover:border-primary transition-colors" />
          </div>
        </div>
      )}

      {/* Widget Content */}
      <div className={cn('h-full', isEditMode && 'pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}

