import { useState, useRef, useEffect } from "react";
import { Maximize2, Minimize2, Save, Undo2, Redo2, Copy, Check, Bold, Italic, List, Heading } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

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
  const [copied, setCopied] = useState(false);
  const historyRef = useRef<string[]>([content]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const insertMarkdown = (before: string, after: string = before) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertLineMarkdown = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lines = content.split('\n');
    
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;
    
    // Find which lines are selected
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1; // +1 for newline
      if (currentPos <= start && start < currentPos + lineLength) {
        startLine = i;
      }
      if (currentPos <= end && end < currentPos + lineLength) {
        endLine = i;
        break;
      }
      currentPos += lineLength;
    }
    
    // Toggle prefix on selected lines
    const modifiedLines = lines.map((line, i) => {
      if (i >= startLine && i <= endLine) {
        if (line.startsWith(prefix)) {
          return line.substring(prefix.length);
        } else {
          return prefix + line;
        }
      }
      return line;
    });
    
    onChange(modifiedLines.join('\n'));
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
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
            ref={textareaRef}
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
          {/* Floating Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-2 bg-background/95 backdrop-blur-sm border border-border/40 rounded-lg px-3 py-2 shadow-lg">
              {/* Formatting Tools */}
              <div className="flex items-center gap-1 pr-2 border-r border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown('**')}
                  className="h-8 w-8 p-0"
                  title="Bold"
                >
                  <Bold className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertMarkdown('*')}
                  className="h-8 w-8 p-0"
                  title="Italic"
                >
                  <Italic className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertLineMarkdown('# ')}
                  className="h-8 w-8 p-0"
                  title="Heading"
                >
                  <Heading className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => insertLineMarkdown('- ')}
                  className="h-8 w-8 p-0"
                  title="Bullet List"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>

              {/* Undo/Redo */}
              <div className="flex items-center gap-1 pr-2 border-r border-border/40">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0"
                  title="Redo (Ctrl+Y)"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Word Count */}
              <span className="text-sm text-muted-foreground px-2">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>

              {/* Copy Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1.5"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy All
                  </>
                )}
              </Button>

              {/* Exit */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleToggleFullScreen}
                className="h-8 gap-1.5 ml-2"
              >
                <Minimize2 className="w-4 h-4" />
                Exit
              </Button>
            </div>
          </div>

          {/* Full Screen Editor Area - Completely Clean */}
          <div className="flex-1 overflow-auto px-8 py-20">
            <div className="max-w-4xl mx-auto">
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="min-h-[calc(100vh-160px)] w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed font-serif resize-none shadow-none"
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
