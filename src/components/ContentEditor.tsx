import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Maximize2, Minimize2, Undo2, Redo2, Copy, Check, Bold, Italic, Underline, List, ListOrdered, Heading1, Heading2, Heading3, AlignLeft, AlignCenter, AlignRight, AlignJustify, Indent, Outdent, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import DOMPurify from 'dompurify';

// Convert markdown syntax to HTML
const markdownToHtml = (text: string): string => {
  let html = text;
  
  // Bold: **text** or __text__
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic: *text* or _text_
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.+?)_/g, '<em>$1</em>');
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Line breaks
  html = html.replace(/\n/g, '<br>');
  
  return html;
};

// Configure DOMPurify with safe defaults for rich text editing
const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
      'span', 'div'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'class', 'style'
    ],
    KEEP_CONTENT: true,
    ADD_ATTR: ['target']
  });
};

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", serif' },
  { value: 'crimson', label: 'Crimson Text', family: '"Crimson Text", serif' },
  { value: 'lato', label: 'Lato', family: '"Lato", sans-serif' },
  { value: 'inter', label: 'Inter', family: '"Inter", sans-serif' },
];

interface SavedSelection {
  anchorPath: number[];
  anchorOffset: number;
  focusPath: number[];
  focusOffset: number;
}

const getNodePath = (root: Node, target: Node): number[] => {
  const path: number[] = [];
  let current = target;

  while (current && current !== root) {
    const parent = current.parentNode;
    if (!parent) break;
    const index = Array.from(parent.childNodes).indexOf(current as ChildNode);
    path.unshift(index);
    current = parent;
  }

  return path;
};

const getNodeFromPath = (root: Node, path: number[]): Node | null => {
  let current: Node | null = root;
  
  for (const index of path) {
    if (!current || !current.childNodes[index]) {
      return null;
    }
    current = current.childNodes[index];
  }
  
  return current;
};

const saveSelection = (root: HTMLElement): SavedSelection | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);
  
  return {
    anchorPath: getNodePath(root, range.startContainer),
    anchorOffset: range.startOffset,
    focusPath: getNodePath(root, range.endContainer),
    focusOffset: range.endOffset,
  };
};

const restoreSelection = (root: HTMLElement, saved: SavedSelection) => {
  const anchorNode = getNodeFromPath(root, saved.anchorPath);
  const focusNode = getNodeFromPath(root, saved.focusPath);

  if (!anchorNode || !focusNode) return;

  const selection = window.getSelection();
  const range = document.createRange();

  try {
    range.setStart(anchorNode, Math.min(saved.anchorOffset, anchorNode.textContent?.length || 0));
    range.setEnd(focusNode, Math.min(saved.focusOffset, focusNode.textContent?.length || 0));
    
    selection?.removeAllRanges();
    selection?.addRange(range);
  } catch (e) {
    console.warn('Failed to restore selection:', e);
  }
};

interface ContentEditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave?: () => void;
  placeholder?: string;
  className?: string;
  initialFullScreen?: boolean;
  onAssistantToggle?: (open: boolean) => void;
}

export const ContentEditor = ({ 
  content, 
  onChange, 
  onSave,
  placeholder = "Generated content will appear here...",
  className,
  initialFullScreen = false,
  onAssistantToggle
}: ContentEditorProps) => {
  const [isFullScreen, setIsFullScreen] = useState(initialFullScreen);
  const [wordCount, setWordCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedFormatted, setCopiedFormatted] = useState(false);
  const [selectedFont, setSelectedFont] = useState('cormorant');
  const [richHtml, setRichHtml] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const historyRef = useRef<string[]>([]);
  const richHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const savedSelectionRef = useRef<SavedSelection | null>(null);

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
      // Convert markdown to HTML first, then sanitize
      const htmlWithMarkdown = markdownToHtml(content);
      const nextHtml = sanitizeHtml(htmlWithMarkdown);
      
      // Only set if different to avoid unnecessary DOM changes
      if (editableRef.current.innerHTML !== nextHtml) {
        console.debug("[ContentEditor] Hydrating full-screen editor");
        editableRef.current.innerHTML = nextHtml;
        setRichHtml(nextHtml);
      }
      
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

  // Preserve selection inside the editor so toolbar actions work reliably
  useEffect(() => {
    const handleSelectionChange = () => {
      const editor = editableRef.current;
      const sel = window.getSelection();
      if (!editor || !sel || sel.rangeCount === 0) return;
      const node = sel.anchorNode as Node | null;
      if (node && editor.contains(node)) {
        savedSelectionRef.current = saveSelection(editor);
      }
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

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
        // Sanitize HTML before setting to prevent XSS
        editableRef.current.innerHTML = sanitizeHtml(prevRichHtml);
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
        // Sanitize HTML before setting to prevent XSS
        editableRef.current.innerHTML = sanitizeHtml(nextRichHtml);
        setRichHtml(nextRichHtml);
      }
      onChange(historyRef.current[historyIndexRef.current]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Indent/outdent list items with Tab / Shift+Tab when caret is in a list
    if (e.key === 'Tab') {
      const editor = editableRef.current;
      const sel = window.getSelection();
      const insideList = !!(editor && sel && sel.rangeCount > 0 && sel.anchorNode && (sel.anchorNode as any).parentElement?.closest?.('li') && editor.contains(sel.anchorNode));
      if (insideList) {
        e.preventDefault();
        document.execCommand(e.shiftKey ? 'outdent' : 'indent');
        updateContentFromEditable();
        return;
      }
    }

    if (e.key === 'Escape' && isFullScreen) {
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
    const editor = editableRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const withinEditor = !!(sel && sel.rangeCount > 0 && sel.anchorNode && editor.contains(sel.anchorNode));

    if (!withinEditor && savedSelectionRef.current) {
      try {
        editor.focus();
        restoreSelection(editor, savedSelectionRef.current);
      } catch {}
    } else {
      editor.focus();
    }

    document.execCommand(command, false, value);

    const needsListFallback = command === 'insertUnorderedList' || command === 'insertOrderedList';
    const ordered = command === 'insertOrderedList';

    const ensureList = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const anchor = selection.anchorNode as Node;
      const li = (anchor as any)?.parentElement?.closest?.('li');
      if (li) return; // list already created

      let node: Node | null = anchor;
      while (node && node !== editor && !(node instanceof HTMLElement && /^(P|DIV|H[1-6])$/.test(node.tagName))) {
        node = node.parentNode;
      }
      const block = (node as HTMLElement) || editor;

      const list = document.createElement(ordered ? 'ol' : 'ul');
      const item = document.createElement('li');

      while (block.firstChild) item.appendChild(block.firstChild);
      list.appendChild(item);

      if (block !== editor) {
        block.replaceWith(list);
      } else {
        editor.appendChild(list);
      }

      const range = document.createRange();
      range.selectNodeContents(item);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
    };

    requestAnimationFrame(() => {
      if (needsListFallback) {
        const s = window.getSelection();
        const liNow = s && s.anchorNode && (s.anchorNode as any).parentElement?.closest?.('li');
        if (!liNow) ensureList();
      }
      updateContentFromEditable();
    });
  };

  const updateContentFromEditable = () => {
    if (editableRef.current) {
      // Guard IME composition
      if (isComposing) return;

      const html = editableRef.current.innerHTML;
      
      // Early return if content hasn't changed
      if (html === richHtml) return;

      // Save selection before update
      const saved = saveSelection(editableRef.current);
      
      setRichHtml(html);
      
      // Restore selection after React re-renders
      if (saved) {
        requestAnimationFrame(() => {
          if (editableRef.current) {
            console.debug("[ContentEditor] Restoring selection after update");
            restoreSelection(editableRef.current, saved);
          }
        });
      }
      
      // Debounce history updates to avoid too many entries while typing
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      
      updateTimeoutRef.current = setTimeout(() => {
        if (!isUndoRedoRef.current) {
          const plainText = htmlToPlainText(html);
          
          // Only push if actually different from last entry
          const lastPlainText = historyRef.current[historyRef.current.length - 1];
          if (plainText !== lastPlainText) {
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
            console.debug("[ContentEditor] History pushed, index:", historyIndexRef.current);
          }
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

  // If initialFullScreen is true, skip the normal view entirely
  if (initialFullScreen) {
    return (
      <div 
        className="rounded-lg border p-6"
        style={{
          backgroundColor: "#FFFCF5",
          borderColor: "#D4CFC8"
        }}
      >
        <div 
          className="min-h-[400px] bg-background/50 leading-relaxed font-serif text-lg rounded-md border border-input p-3"
          dangerouslySetInnerHTML={{ 
            __html: sanitizeHtml(markdownToHtml(content)) 
          }}
          style={{
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word'
          }}
        />
      </div>
    );
  }

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
          <div 
            className="min-h-[200px] bg-background/50 leading-relaxed font-serif rounded-md border border-input p-3"
            dangerouslySetInnerHTML={{ 
              __html: sanitizeHtml(markdownToHtml(content)) 
            }}
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
            onClick={handleToggleFullScreen}
          />
        </div>
      )}

      {/* Full Screen Editor */}
      {isFullScreen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] bg-background w-screen h-[100dvh] flex flex-col">
            {/* Enhanced Toolbar */}
            <div className="border-b border-border/40 bg-background/95 backdrop-blur-sm flex-shrink-0">
              <div className="flex items-center justify-between px-6 py-3">
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

                </div>

                {/* Right: Undo/Redo + Word Count */}
                <div className="flex items-center gap-2">
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
                  
                  <div className="h-6 w-px bg-border/40 mx-1" />
                  
                  <span className="text-sm text-muted-foreground font-medium tabular-nums">
                    {wordCount} {wordCount === 1 ? 'word' : 'words'}
                  </span>

                  <div className="h-6 w-px bg-border/40 mx-2" />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFullScreen}
                    className="h-9 gap-2"
                    title="Exit Editor (ESC)"
                  >
                    <X className="w-4 h-4" />
                    Exit Editor
                  </Button>
                </div>
              </div>

              {/* Second Row: Actions */}
              <div className="border-t border-border/40 px-6 py-2.5 flex items-center justify-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-9 gap-2"
                  title="Copy Text"
                >
                  <Copy className="w-4 h-4" />
                  Copy Text
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyFormatted}
                  className="h-9 gap-2"
                  title="Copy Page"
                >
                  <FileText className="w-4 h-4" />
                  Copy Page
                </Button>
              </div>
            </div>

            {/* Document Editor */}
            <div className="flex-1 bg-muted/30 overflow-hidden"> 
              {/* Editor Area */}
              <div className="h-full overflow-y-auto">
                <div className="max-w-4xl mx-auto py-12 px-8 md:px-16 lg:px-24">
                  <div
                    ref={editableRef}
                    contentEditable
                    onInput={updateContentFromEditable}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning
                    data-testid="fullscreen-editor"
                    className="editor-content rte-content w-full min-h-[calc(100vh-200px)] bg-background border-none focus:outline-none text-lg leading-relaxed resize-none shadow-sm rounded-lg p-12 font-serif"
                  >
                    {/* Content is set via innerHTML in useEffect, not as children */}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </>
  );
};
