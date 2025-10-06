import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Undo2, Redo2, Copy, Check, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify, Indent, Outdent, FileText } from "lucide-react";
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
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [selectedFont, setSelectedFont] = useState('cormorant');
  const [richHtml, setRichHtml] = useState('');
  const historyRef = useRef<string[]>([]);
  const richHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
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

  // Initialize richHtml when entering full-screen
  useEffect(() => {
    if (isFullScreen && editableRef.current) {
      // Set the content directly on the element
      editableRef.current.innerHTML = content.replace(/\n/g, '<br>');
      setRichHtml(editableRef.current.innerHTML);
      
      setTimeout(() => {
        if (editableRef.current) {
          editableRef.current.focus();
          const range = document.createRange();
          const sel = window.getSelection();
          range.selectNodeContents(editableRef.current);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }, 0);
    }
  }, [isFullScreen, content]);

  // Calculate word count from richHtml in full-screen or content otherwise
  useEffect(() => {
    const textToCount = isFullScreen && editableRef.current 
      ? editableRef.current.innerText 
      : content;
    const words = textToCount.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content, richHtml, isFullScreen]);

  // Update history when content changes (but not during undo/redo)
  useEffect(() => {
    if (!isUndoRedoRef.current && content !== historyRef.current[historyIndexRef.current]) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push(content);
      const newRichHistory = richHistoryRef.current.slice(0, historyIndexRef.current + 1);
      newRichHistory.push(richHtml || '');
      
      // Keep history limited to 50 states
      if (newHistory.length > 50) {
        newHistory.shift();
        newRichHistory.shift();
      } else {
        historyIndexRef.current++;
      }
      historyRef.current = newHistory;
      richHistoryRef.current = newRichHistory;
    }
    isUndoRedoRef.current = false;
  }, [content, richHtml]);

  const handleUndo = () => {
    if (historyIndexRef.current > 0) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      
      if (isFullScreen && editableRef.current) {
        const prevRichHtml = richHistoryRef.current[historyIndexRef.current];
        editableRef.current.innerHTML = prevRichHtml;
        setRichHtml(prevRichHtml);
      }
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      
      if (isFullScreen && editableRef.current) {
        const nextRichHtml = richHistoryRef.current[historyIndexRef.current];
        editableRef.current.innerHTML = nextRichHtml;
        setRichHtml(nextRichHtml);
      }
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

  const htmlToPlainText = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const tagName = element.tagName.toLowerCase();
        
        if (tagName === 'br') return '\n';
        if (tagName === 'p' || tagName === 'div') {
          const content = Array.from(element.childNodes).map(processNode).join('');
          return content + '\n';
        }
        if (tagName.match(/^h[1-6]$/)) {
          const content = Array.from(element.childNodes).map(processNode).join('');
          return content + '\n\n';
        }
        if (tagName === 'li') {
          const content = Array.from(element.childNodes).map(processNode).join('');
          return '• ' + content + '\n';
        }
        if (tagName === 'ul' || tagName === 'ol') {
          const content = Array.from(element.childNodes).map(processNode).join('');
          return content + '\n';
        }
        
        return Array.from(element.childNodes).map(processNode).join('');
      }
      
      return '';
    };
    
    return processNode(temp).trim();
  };

  const handleToggleFullScreen = () => {
    if (isFullScreen && editableRef.current) {
      // Convert rich HTML to plain text before exiting
      const plainText = htmlToPlainText(richHtml);
      onChange(plainText);
    }
    setIsFullScreen(!isFullScreen);
  };

  const handleCopy = async () => {
    try {
      const textToCopy = editableRef.current?.innerText || content;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Plain text copied to clipboard",
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

  const handleCopyFormatted = async () => {
    try {
      const html = editableRef.current?.innerHTML || richHtml;
      const text = editableRef.current?.innerText || content;
      
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' })
        })
      ]);
      
      setCopiedFormatted(true);
      toast({
        title: "Copied!",
        description: "Formatted content copied to clipboard",
      });
      setTimeout(() => setCopiedFormatted(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy formatted content",
        variant: "destructive",
      });
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (editableRef.current) {
      editableRef.current.focus();
      document.execCommand(command, false, value);
      updateContentFromEditable();
    }
  };

  const updateContentFromEditable = () => {
    if (editableRef.current) {
      const html = editableRef.current.innerHTML;
      setRichHtml(html);
      
      // Debounce history updates to avoid too many entries while typing
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        if (!isUndoRedoRef.current) {
          const plainText = htmlToPlainText(html);
          const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
          newHistory.push(plainText);
          const newRichHistory = richHistoryRef.current.slice(0, historyIndexRef.current + 1);
          newRichHistory.push(html);
          
          if (newHistory.length > 50) {
            newHistory.shift();
            newRichHistory.shift();
          } else {
            historyIndexRef.current++;
          }
          
          historyRef.current = newHistory;
          richHistoryRef.current = newRichHistory;
        }
      }, 500);
    }
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleH1 = () => execCommand('formatBlock', '<h1>');
  const handleH2 = () => execCommand('formatBlock', '<h2>');
  const handleH3 = () => execCommand('formatBlock', '<h3>');
  const handleBulletList = () => execCommand('insertUnorderedList');
  const handleNumberedList = () => execCommand('insertOrderedList');
  const handleAlignLeft = () => execCommand('justifyLeft');
  const handleAlignCenter = () => execCommand('justifyCenter');
  const handleAlignRight = () => execCommand('justifyRight');
  const handleAlignJustify = () => execCommand('justifyFull');
  const handleIndent = () => execCommand('indent');
  const handleOutdent = () => execCommand('outdent');

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
                  <Select 
                    value={selectedFont} 
                    onValueChange={(value) => {
                      setSelectedFont(value);
                      const fontFamily = FONT_OPTIONS.find(f => f.value === value)?.family;
                      if (fontFamily && editableRef.current) {
                        const selection = window.getSelection();
                        if (selection && !selection.isCollapsed) {
                          // Apply font to selected text only
                          document.execCommand('fontName', false, fontFamily);
                          updateContentFromEditable();
                        }
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[10000] bg-background">
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
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleBold();
                      }}
                      className="h-9 w-9 p-0"
                      title="Bold"
                    >
                      <Bold className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleItalic();
                      }}
                      className="h-9 w-9 p-0"
                      title="Italic"
                    >
                      <Italic className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleUnderline();
                      }}
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
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleH1();
                      }}
                      className="h-9 w-9 p-0"
                      title="Heading 1"
                    >
                      <Heading1 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleH2();
                      }}
                      className="h-9 w-9 p-0"
                      title="Heading 2"
                    >
                      <Heading2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleH3();
                      }}
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
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleBulletList();
                      }}
                      className="h-9 w-9 p-0"
                      title="Bullet List"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleNumberedList();
                      }}
                      className="h-9 w-9 p-0"
                      title="Numbered List"
                    >
                      <ListOrdered className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="h-6 w-px bg-border/40" />

                  {/* Alignment */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAlignLeft();
                      }}
                      className="h-9 w-9 p-0"
                      title="Align Left"
                    >
                      <AlignLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAlignCenter();
                      }}
                      className="h-9 w-9 p-0"
                      title="Align Center"
                    >
                      <AlignCenter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAlignRight();
                      }}
                      className="h-9 w-9 p-0"
                      title="Align Right"
                    >
                      <AlignRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleAlignJustify();
                      }}
                      className="h-9 w-9 p-0"
                      title="Justify"
                    >
                      <AlignJustify className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="h-6 w-px bg-border/40" />

                  {/* Indentation */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleOutdent();
                      }}
                      className="h-9 w-9 p-0"
                      title="Decrease Indent"
                    >
                      <Outdent className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleIndent();
                      }}
                      className="h-9 w-9 p-0"
                      title="Increase Indent"
                    >
                      <Indent className="w-4 h-4" />
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
                        Copy Text
                      </>
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyFormatted}
                    className="h-9 gap-2"
                  >
                    {copiedFormatted ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Copy Formatted
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
              <div className="max-w-4xl mx-auto py-12 px-8 md:px-16 lg:px-24">
                <div
                  ref={editableRef}
                  contentEditable
                  onInput={updateContentFromEditable}
                  onKeyDown={handleKeyDown}
                  suppressContentEditableWarning
                  className="w-full min-h-[calc(100vh-200px)] bg-background border-none focus:outline-none text-lg leading-relaxed resize-none shadow-sm rounded-lg p-12 font-serif"
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
