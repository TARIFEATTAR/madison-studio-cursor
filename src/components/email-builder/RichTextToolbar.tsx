import { Button } from "@/components/ui/button";
import { Bold, Italic, List, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface RichTextToolbarProps {
  onFormat: (format: string) => void;
  alignment?: 'left' | 'center' | 'right';
  onAlignmentChange?: (alignment: 'left' | 'center' | 'right') => void;
}

export function RichTextToolbar({ onFormat, alignment = 'left', onAlignmentChange }: RichTextToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border border-border rounded-md bg-muted/30 flex-wrap">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('bold')}
        className="h-8 w-8 p-0"
        title="Bold (Ctrl+B)"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('italic')}
        className="h-8 w-8 p-0"
        title="Italic (Ctrl+I)"
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('list')}
        className="h-8 w-8 p-0"
        title="Bullet List"
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onFormat('link')}
        className="h-8 w-8 p-0"
        title="Add Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Button>

      {onAlignmentChange && (
        <>
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Button
            variant={alignment === 'left' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onAlignmentChange('left')}
            className="h-8 w-8 p-0"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant={alignment === 'center' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onAlignmentChange('center')}
            className="h-8 w-8 p-0"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant={alignment === 'right' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onAlignmentChange('right')}
            className="h-8 w-8 p-0"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
}
