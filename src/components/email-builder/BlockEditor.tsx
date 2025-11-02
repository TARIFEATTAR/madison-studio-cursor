import { EmailBlock } from "@/types/emailBlocks";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ImageLibraryPicker } from "@/components/email-composer/ImageLibraryPicker";

interface BlockEditorProps {
  block: EmailBlock;
  onUpdate: (block: EmailBlock) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function BlockEditor({ block, onUpdate, onMoveUp, onMoveDown, onDelete, canMoveUp, canMoveDown }: BlockEditorProps) {
  const renderBlockEditor = () => {
    switch (block.type) {
      case 'headline':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Headline Text</Label>
              <Input
                value={block.text}
                onChange={(e) => onUpdate({ ...block, text: e.target.value })}
                placeholder="Enter headline"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Size</Label>
                <Select value={block.size} onValueChange={(value: any) => onUpdate({ ...block, size: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select value={block.alignment} onValueChange={(value: any) => onUpdate({ ...block, alignment: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <ImageLibraryPicker
              value={block.url}
              onChange={(url) => onUpdate({ ...block, url })}
            />
            <div className="space-y-2">
              <Label>Alt Text</Label>
              <Input
                value={block.alt}
                onChange={(e) => onUpdate({ ...block, alt: e.target.value })}
                placeholder="Describe the image"
              />
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select value={block.alignment} onValueChange={(value: any) => onUpdate({ ...block, alignment: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Text Content</Label>
              <Textarea
                value={block.content}
                onChange={(e) => onUpdate({ ...block, content: e.target.value })}
                placeholder="Enter your text content"
                rows={6}
              />
              <p className="text-xs text-muted-foreground">
                Supports **bold**, *italic*, and bullet lists with - or *
              </p>
            </div>
            <div className="space-y-2">
              <Label>Alignment</Label>
              <Select value={block.alignment} onValueChange={(value: any) => onUpdate({ ...block, alignment: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Button Text</Label>
                <Input
                  value={block.text}
                  onChange={(e) => onUpdate({ ...block, text: e.target.value })}
                  placeholder="Shop Now"
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  value={block.url}
                  onChange={(e) => onUpdate({ ...block, url: e.target.value })}
                  placeholder="https://"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Style</Label>
                <Select value={block.style} onValueChange={(value: any) => onUpdate({ ...block, style: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="rounded">Rounded</SelectItem>
                    <SelectItem value="pill">Pill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Alignment</Label>
                <Select value={block.alignment} onValueChange={(value: any) => onUpdate({ ...block, alignment: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'divider':
        return (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  type="color"
                  value={block.color || '#DDDDDD'}
                  onChange={(e) => onUpdate({ ...block, color: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Thickness (px)</Label>
                <Input
                  type="number"
                  value={block.thickness || 1}
                  onChange={(e) => onUpdate({ ...block, thickness: parseInt(e.target.value) || 1 })}
                  min="1"
                  max="10"
                />
              </div>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div className="space-y-2">
            <Label>Height (px)</Label>
            <Input
              type="number"
              value={block.height}
              onChange={(e) => onUpdate({ ...block, height: parseInt(e.target.value) || 20 })}
              min="10"
              max="200"
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getBlockIcon = () => {
    switch (block.type) {
      case 'headline': return '📝';
      case 'image': return '🖼️';
      case 'text': return '📄';
      case 'button': return '🔘';
      case 'divider': return '➖';
      case 'spacer': return '⬛';
      default: return '📦';
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            className="h-7 w-7 p-0"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            className="h-7 w-7 p-0"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getBlockIcon()}</span>
              <span className="font-semibold capitalize">{block.type} Block</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {renderBlockEditor()}

          {block.type !== 'spacer' && block.type !== 'divider' && (
            <div className="space-y-2 pt-2 border-t border-border">
              <Label>Section Background (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={block.backgroundColor || '#FFFFFF'}
                  onChange={(e) => onUpdate({ ...block, backgroundColor: e.target.value })}
                  className="w-20"
                />
                <Input
                  value={block.backgroundColor || ''}
                  onChange={(e) => onUpdate({ ...block, backgroundColor: e.target.value })}
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
