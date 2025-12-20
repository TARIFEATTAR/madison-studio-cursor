import React, { useRef, useState, useCallback, ReactNode } from 'react';
import { GripVertical } from 'lucide-react';
import { useDashboardEdit } from '@/contexts/DashboardEditContext';
import { cn } from '@/lib/utils';

interface ResizableCardProps {
  id: string;
  children: ReactNode;
  defaultW?: number;
  defaultH?: number;
  defaultX?: number;
  defaultY?: number;
  className?: string;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

type ResizeDirection = 
  | 'n' | 's' | 'e' | 'w'  // edges: north, south, east, west
  | 'ne' | 'nw' | 'se' | 'sw'; // corners: northeast, northwest, southeast, southwest

export function ResizableCard({
  id,
  children,
  defaultW = 4,
  defaultH = 3,
  defaultX = 0,
  defaultY = 0,
  className,
  minW = 2,
  minH = 2,
  maxW = 12,
  maxH = 8,
}: ResizableCardProps) {
  const { isEditMode, cardLayouts, updateCardLayout } = useDashboardEdit();
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const resizeDirectionRef = useRef<ResizeDirection | null>(null);

  const layout = cardLayouts[id] || { id, w: defaultW, h: defaultH, x: defaultX, y: defaultY };
  const { w, h } = layout;

  // Calculate grid column span (1-12)
  const colSpan = Math.max(1, Math.min(12, w));
  const rowSpan = h;

  // Handle resize from any edge or corner
  const handleResizeStart = useCallback((direction: ResizeDirection) => (e: React.MouseEvent) => {
    if (!isEditMode) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeDirectionRef.current = direction;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = w;
    const startH = h;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      // Approximate pixels per grid unit
      const containerWidth = resizeRef.current?.parentElement?.clientWidth || 1200;
      const pxPerCol = containerWidth / 12;
      const pxPerRow = 60; // Approximate row height
      
      let newW = startW;
      let newH = startH;

      // Handle resize based on direction
      switch (direction) {
        case 'n': // Top edge - decrease height
          newH = Math.max(minH, Math.min(maxH, startH - Math.round(deltaY / pxPerRow)));
          break;
        case 's': // Bottom edge - increase height
          newH = Math.max(minH, Math.min(maxH, startH + Math.round(deltaY / pxPerRow)));
          break;
        case 'e': // Right edge - increase width
          newW = Math.max(minW, Math.min(maxW, startW + Math.round(deltaX / pxPerCol)));
          break;
        case 'w': // Left edge - decrease width
          newW = Math.max(minW, Math.min(maxW, startW - Math.round(deltaX / pxPerCol)));
          break;
        case 'ne': // Top-right corner - decrease height, increase width
          newH = Math.max(minH, Math.min(maxH, startH - Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW + Math.round(deltaX / pxPerCol)));
          break;
        case 'nw': // Top-left corner - decrease height, decrease width
          newH = Math.max(minH, Math.min(maxH, startH - Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW - Math.round(deltaX / pxPerCol)));
          break;
        case 'se': // Bottom-right corner - increase height, increase width
          newH = Math.max(minH, Math.min(maxH, startH + Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW + Math.round(deltaX / pxPerCol)));
          break;
        case 'sw': // Bottom-left corner - increase height, decrease width
          newH = Math.max(minH, Math.min(maxH, startH + Math.round(deltaY / pxPerRow)));
          newW = Math.max(minW, Math.min(maxW, startW - Math.round(deltaX / pxPerCol)));
          break;
      }

      if (newW !== w || newH !== h) {
        updateCardLayout(id, { w: newW, h: newH });
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
  }, [isEditMode, w, h, minW, minH, maxW, maxH, id, updateCardLayout]);

  // Handle drag to reposition (simplified - just visual feedback for now)
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!isEditMode || isResizing) return;
    
    e.preventDefault();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  }, [isEditMode, isResizing]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  React.useEffect(() => {
    if (isDragging) {
      const handleMouseMove = () => {
        // Drag repositioning could be implemented here
        // For now, we'll just show visual feedback
      };
      
      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  // Get cursor style based on resize direction
  const getCursor = (direction: ResizeDirection) => {
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
    }
  };

  // Resize handle component
  const ResizeHandle = ({ direction, position }: { direction: ResizeDirection; position: string }) => {
    const isEdge = direction.length === 1;
    const isCorner = direction.length === 2;
    
    // Determine dimensions based on direction
    let widthClass = '';
    let heightClass = '';
    
    if (isEdge) {
      if (direction === 'n' || direction === 's') {
        // Horizontal edge (top or bottom)
        widthClass = 'w-full';
        heightClass = 'h-2';
      } else {
        // Vertical edge (left or right)
        widthClass = 'w-2';
        heightClass = 'h-full';
      }
    } else {
      // Corner - small square
      widthClass = 'w-4';
      heightClass = 'h-4';
    }
    
    return (
      <div
        onMouseDown={handleResizeStart(direction)}
        className={cn(
          'absolute pointer-events-auto bg-primary/20 hover:bg-primary/40 transition-colors',
          position,
          widthClass,
          heightClass,
          isEdge && 'opacity-60 hover:opacity-100', // edges are more subtle
          isCorner && 'opacity-80 hover:opacity-100 rounded' // corners are more visible
        )}
        style={{ cursor: getCursor(direction) }}
      >
        {/* Corner indicator */}
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
    <div
      ref={resizeRef}
      className={cn(
        'relative group',
        isEditMode && 'ring-2 ring-primary/20 rounded-lg',
        isResizing && 'ring-primary z-50',
        isDragging && 'opacity-75 z-50',
        className
      )}
      style={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
      }}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
    >
      {/* Edit Mode Overlay */}
      {isEditMode && (
        <div className="absolute inset-0 pointer-events-none z-10 rounded-lg">
          {/* Drag Handle */}
          <div
            className="absolute top-2 left-2 p-1.5 rounded-md bg-background/90 shadow-sm cursor-grab active:cursor-grabbing pointer-events-auto hover:bg-muted transition-colors z-20"
            onMouseDown={(e) => {
              e.stopPropagation();
              handleDragStart(e);
            }}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Size Display */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium z-20 pointer-events-none">
            {w}×{h}
          </div>

          {/* Edge Resize Handles */}
          <ResizeHandle direction="n" position="top-0 left-0 right-0" />
          <ResizeHandle direction="s" position="bottom-0 left-0 right-0" />
          <ResizeHandle direction="e" position="top-0 right-0 bottom-0" />
          <ResizeHandle direction="w" position="top-0 left-0 bottom-0" />
          
          {/* Corner Resize Handles */}
          <ResizeHandle direction="ne" position="top-0 right-0" />
          <ResizeHandle direction="nw" position="top-0 left-0" />
          <ResizeHandle direction="se" position="bottom-0 right-0" />
          <ResizeHandle direction="sw" position="bottom-0 left-0" />
        </div>
      )}

      {/* Card Content */}
      <div className={cn('h-full', isEditMode && 'pointer-events-none')}>
        {children}
      </div>
    </div>
  );
}
