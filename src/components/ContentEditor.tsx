import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, Save, Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
}

export const ContentEditor = ({ 
  content, 
  onChange, 
  onSave,
  placeholder = "Generated content will appear here...",
  className 
}: ContentEditorProps) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const historyRef = useRef<string[]>([content]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  // Update history when content changes (but not during undo/redo)
  useEffect(() => {
    if (!isUndoRedoRef.current && content !== historyRef.current[historyIndexRef.current]) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(content);
      // Keep history limited to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        historyIndexRef.current++;
      }
      historyRef.current = newHistory;
    }
    isUndoRedoRef.current = false;
  }, [content]);

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
    }
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const handleSave = () => {
    onSave?.();
    if (isFullScreen) {
      setIsFullScreen(false);
    }
  };

  return (
    <>
      {/* Normal Editor View */}
      {!isFullScreen && (
        <div className={cn("relative", className)}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Click to edit content
              </span>
              <span className="text-xs text-muted-foreground">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="gap-1"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="gap-1"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleToggleFullScreen}
                className="gap-2"
              >
                <Maximize2 className="w-4 h-4" />
                Full Screen
              </Button>
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[200px] bg-background/50 leading-relaxed font-serif"
          />
        </div>
      )}

      {/* Full Screen Editor */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          {/* Minimal Header */}
          <div className="flex items-center justify-between px-8 py-4 border-b border-border/40">
            <div className="flex items-center gap-6">
              <h2 className="text-lg font-serif">Edit Content</h2>
              <span className="text-sm text-muted-foreground">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUndo}
                disabled={!canUndo}
                className="gap-1"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
                Undo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRedo}
                disabled={!canRedo}
                className="gap-1"
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
                Redo
              </Button>
              {onSave && (
                <Button
                  onClick={handleSave}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save & Exit
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleToggleFullScreen}
                className="gap-2"
              >
                <Minimize2 className="w-4 h-4" />
                Exit Full Screen
              </Button>
            </div>
          </div>

          {/* Full Screen Editor Area */}
          <div className="flex-1 overflow-auto p-8">
            <div className="max-w-4xl mx-auto">
              <Textarea
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[calc(100vh-200px)] bg-transparent border-none focus-visible:ring-0 text-lg leading-relaxed font-serif resize-none"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
