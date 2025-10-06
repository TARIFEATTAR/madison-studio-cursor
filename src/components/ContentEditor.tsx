import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Undo2, Redo2, Copy, Check, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", serif' },
  { value: 'crimson', label: 'Crimson Text', family: '"Crimson Text", serif' },
  { value: 'lato', label: 'Lato', family: '"Lato", sans-serif' },
  { value: 'inter', label: 'Inter', family: '"Inter", sans-serif' },
];

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
  const [selectedFont, setSelectedFont] = useState('cormorant');
  const historyRef = useRef<string[]>([content]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Prevent background scroll when full-screen
  useEffect(() => {
    if (isFullScreen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [isFullScreen]);

  // Focus textarea when entering full-screen
  useEffect(() => {
    if (isFullScreen && textareaRef.current) {
      const t = textareaRef.current;
      t.focus();
      const len = t.value.length;
      try {
        t.setSelectionRange(len, len);
      } catch {}
    }
  }, [isFullScreen]);

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
    } else if (e.key === 'Escape' && isFullScreen) {
      e.preventDefault();
      setIsFullScreen(false);
    }
  };

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
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

  const insertNumberedList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const lines = content.split('\n');
    
    let currentPos = 0;
    let startLine = 0;
    let endLine = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const lineLength = lines[i].length + 1;
      if (currentPos <= start && start < currentPos + lineLength) {
        startLine = i;
      }
      if (currentPos <= end && end < currentPos + lineLength) {
        endLine = i;
        break;
      }
      currentPos += lineLength;
    }
    
    const modifiedLines = lines.map((line, i) => {
      if (i >= startLine && i <= endLine) {
        const match = line.match(/^(\d+)\.\s/);
        if (match) {
          return line.substring(match[0].length);
        } else {
          return `${i - startLine + 1}. ${line}`;
        }
      }
      return line;
    });
    
    onChange(modifiedLines.join('\n'));
    
    setTimeout(() => {
      textarea.focus();
    }, 0);
  };

  const currentFontFamily = FONT_OPTIONS.find(f => f.value === selectedFont)?.family || FONT_OPTIONS[0].family;

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
                onClick={handleCopy}
                className="gap-1"
                title="Copy All"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
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
      {isFullScreen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-background w-screen h-[100dvh] flex flex-col">
            {/* Enhanced Toolbar */}
            <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
              <div className="flex items-center justify-between px-6 py-3 max-w-5xl mx-auto">
                {/* Left: Font & Formatting */}
                <div className="flex items-center gap-3">
                  {/* Font Selector */}
                  <Select value={selectedFont} onValueChange={setSelectedFont}>
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FONT_OPTIONS.map(font => (
                        <SelectItem key={font.value} value={font.value}>
                          <span style={{ fontFamily: font.family }}>{font.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-border/40" />

                  {/* Text Formatting */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('**')}
                      className="h-9 w-9 p-0"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('*')}
                      className="h-9 w-9 p-0"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertMarkdown('<u>', '</u>')}
                      className="h-9 w-9 p-0"
                      title="Underline"
                    >
                      <Underline className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="h-6 w-px bg-border/40" />

                  {/* Headers */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertLineMarkdown('# ')}
                      className="h-9 w-9 p-0"
                      title="Heading 1"
                    >
                      <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertLineMarkdown('## ')}
                      className="h-9 w-9 p-0"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertLineMarkdown('### ')}
                      className="h-9 w-9 p-0"
                      title="Heading 3"
                    >
                      <Heading3 className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="h-6 w-px bg-border/40" />

                  {/* Lists */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertLineMarkdown('- ')}
                      className="h-9 w-9 p-0"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={insertNumberedList}
                      className="h-9 w-9 p-0"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="h-6 w-px bg-border/40" />

                  {/* Undo/Redo */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleUndo}
                      disabled={!canUndo}
                      className="h-9 w-9 p-0"
                      title="Undo (Ctrl+Z)"
                    >
                      <Undo2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRedo}
                      disabled={!canRedo}
                      className="h-9 w-9 p-0"
                      title="Redo (Ctrl+Y)"
                    >
                      <Redo2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Right: Stats & Actions */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-9 gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFullScreen}
                    className="h-9 gap-2"
                  >
                    <Minimize2 className="w-4 h-4" />
                    Exit
                  </Button>
                </div>
              </div>
            </div>

            {/* Document Editor Area - Centered with max-width */}
            <div className="flex-1 overflow-auto bg-muted/30">
              <div className="max-w-4xl mx-auto py-12 px-8 md:px-16">
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  style={{ fontFamily: currentFontFamily }}
                  className="w-full min-h-[calc(100vh-200px)] bg-background border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-lg leading-relaxed resize-none shadow-sm rounded-lg p-12"
                  autoFocus
                />
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
};
