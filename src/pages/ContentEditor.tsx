import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Check, Loader2, MessageSquare, Bold, Italic, Underline, Undo2, Redo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import QualityRating from "@/components/QualityRating";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";

const FONT_OPTIONS = [
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", serif' },
  { value: 'crimson', label: 'Crimson Text', family: '"Crimson Text", serif' },
  { value: 'lato', label: 'Lato', family: '"Lato", sans-serif' },
  { value: 'inter', label: 'Inter', family: '"Inter", sans-serif' },
];

// Selection preservation utilities
interface SavedSelection {
  anchorPath: number[];
  anchorOffset: number;
  focusPath: number[];
  focusOffset: number;
}

const getNodePath = (node: Node, root: Node): number[] => {
  const path: number[] = [];
  let current = node;
  
  while (current !== root && current.parentNode) {
    const parent = current.parentNode;
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

const saveSelection = (root: HTMLDivElement): SavedSelection | null => {
  const selection = window.getSelection();
  if (!selection || !selection.rangeCount) return null;
  
  const range = selection.getRangeAt(0);
  
  return {
    anchorPath: getNodePath(range.startContainer, root),
    anchorOffset: range.startOffset,
    focusPath: getNodePath(range.endContainer, root),
    focusOffset: range.endOffset
  };
};

const restoreSelection = (root: HTMLDivElement, saved: SavedSelection | null) => {
  if (!saved) return;
  
  const anchorNode = getNodeFromPath(root, saved.anchorPath);
  const focusNode = getNodeFromPath(root, saved.focusPath);
  
  if (anchorNode && focusNode) {
    const selection = window.getSelection();
    const range = document.createRange();
    
    try {
      range.setStart(anchorNode, Math.min(saved.anchorOffset, anchorNode.textContent?.length || 0));
      range.setEnd(focusNode, Math.min(saved.focusOffset, focusNode.textContent?.length || 0));
      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch (e) {
      console.warn("[ContentEditor] Failed to restore selection:", e);
    }
  }
};

export default function ContentEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const editableRef = useRef<HTMLDivElement>(null);
  
  // Load content from route state, DB, or localStorage
  const [isLoading, setIsLoading] = useState(true);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const [contentId, setContentId] = useState<string | undefined>(location.state?.contentId);
  const [editableContent, setEditableContent] = useState("");
  const [title, setTitle] = useState("");
  const [contentType, setContentType] = useState("");
  const [productName, setProductName] = useState("");
  
  // Editor state
  const [selectedFont, setSelectedFont] = useState('cormorant');
  const [wordCount, setWordCount] = useState(0);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [qualityRating, setQualityRating] = useState(0);
  const [isComposing, setIsComposing] = useState(false);
  
  // History for undo/redo (now stores both HTML and selection)
  const historyRef = useRef<Array<{ html: string; selection: SavedSelection | null }>>([]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const hasInitialized = useRef(false);

  // Callback ref - only sets content ONCE on mount
  const attachEditableRef = useCallback((element: HTMLDivElement | null) => {
    if (element && !hasInitialized.current && editableContent) {
      editableRef.current = element;
      
      const formattedContent = plainTextToHtml(editableContent);
      element.innerHTML = formattedContent;
      document.execCommand('defaultParagraphSeparator', false, 'p');
      
      hasInitialized.current = true;
      setIsEditorReady(true);
      
      // Focus and position cursor at end
      requestAnimationFrame(() => {
        element.focus();
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      });
    }
  }, [editableContent]);
  
  // HTML conversion utilities
  const htmlToPlainText = useCallback((html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Convert block elements to proper line breaks
    // Convert <p> and <div> to double line breaks for paragraphs
    let text = temp.innerHTML
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<p[^>]*>/gi, '')
      .replace(/<\/div>/gi, '\n\n')
      .replace(/<div[^>]*>/gi, '')
      // Convert <br> to single line break
      .replace(/<br\s*\/?>/gi, '\n')
      // Convert headings with spacing
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<h[1-6][^>]*>/gi, '')
      // Convert list items
      .replace(/<\/li>/gi, '\n')
      .replace(/<li[^>]*>/gi, '• ')
      // Remove all other HTML tags
      .replace(/<[^>]+>/g, '');
    
    // Clean up the text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    text = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up excessive line breaks (more than 2 consecutive)
    text = text.replace(/\n{3,}/g, '\n\n');
    
    return text.trim();
  }, []);

  const plainTextToHtml = useCallback((text: string): string => {
    if (!text) return '<p><br></p>';
    
    // Split by double line breaks for paragraphs
    const paragraphs = text.split(/\n\n+/);
    
    return paragraphs
      .map(para => {
        // Handle empty paragraphs
        if (!para.trim()) return '<p><br></p>';
        
        // Replace single line breaks within paragraphs with <br>
        const content = para.replace(/\n/g, '<br>');
        return `<p>${content}</p>`;
      })
      .join('');
  }, []);
  
  // Auto-save using ref content
  const getContentForSave = useCallback(() => {
    if (editableRef.current) {
      return htmlToPlainText(editableRef.current.innerHTML);
    }
    return editableContent;
  }, [editableContent, htmlToPlainText]);
  
  const { saveStatus, forceSave } = useAutoSave({
    content: getContentForSave(),
    contentId,
    contentName: title,
    delay: 800
  });

  // Load content on mount
  useEffect(() => {
    const loadContent = async () => {
      console.log("[ContentEditor] Loading content...", { 
        hasLocationState: !!location.state, 
        content: location.state?.content?.substring(0, 100)
      });

      if (location.state?.content) {
        const content = location.state.content;
        console.log("[ContentEditor] Loading from location.state, content length:", content.length);
        setEditableContent(content);
        setTitle(location.state.contentName || "Untitled Content");
        setContentType(location.state.contentType || "Blog Post");
        setProductName(location.state.productName || "Product");
        setContentId(location.state.contentId);
        setIsLoading(false);
        return;
      }

      const urlParams = new URLSearchParams(location.search);
      const idFromUrl = urlParams.get('id');
      if (idFromUrl) {
        try {
          const { data, error } = await supabase
            .from('master_content')
            .select('*')
            .eq('id', idFromUrl)
            .single();

          if (error) throw error;
          
          const content = data.full_content || "";
          setEditableContent(content);
          setTitle(data.title || "Untitled Content");
          setContentType(data.content_type || "Blog Post");
          setContentId(data.id);
          setQualityRating(data.quality_rating || 0);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("[ContentEditor] Error loading from DB:", error);
          toast({
            title: "Failed to load content",
            description: "Unable to load content from database. Please try again.",
            variant: "destructive"
          });
        }
      }

      const savedDraft = localStorage.getItem('scriptora-content-draft');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          const content = draft.content || "";
          setEditableContent(content);
          setTitle(draft.title || "Untitled Content");
          setContentId(draft.id);
          setIsLoading(false);
          return;
        } catch (error) {
          console.error("[ContentEditor] Error loading from localStorage:", error);
        }
      }

      console.error("[ContentEditor] No content source found");
      toast({
        title: "No content found",
        description: "No content available to edit. Redirecting to content creation...",
        variant: "destructive"
      });
      setTimeout(() => navigate("/create"), 1500);
    };

    loadContent();
  }, [location.state, location.search, navigate, toast]);

  // NO LONGER NEEDED - content is set once in attachEditableRef

  // Calculate word count
  useEffect(() => {
    if (editableRef.current) {
      const text = editableRef.current.innerText;
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [editableContent]);

  // History is now updated directly in updateContentFromEditable

  const updateContentFromEditable = () => {
    if (!editableRef.current || isComposing || isUndoRedoRef.current) return;
    
    const html = editableRef.current.innerHTML;
    const saved = saveSelection(editableRef.current);
    
    // Update history immediately (no state update during typing)
    if (!isUndoRedoRef.current) {
      const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
      newHistory.push({ html, selection: saved });
      
      if (newHistory.length > 50) {
        newHistory.shift();
      } else {
        historyIndexRef.current++;
      }
      historyRef.current = newHistory;
    }
    
    // Debounced state update for autosave only
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    updateTimeoutRef.current = setTimeout(() => {
      const plainText = htmlToPlainText(html);
      setEditableContent(plainText);
    }, 500);
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0 && editableRef.current) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const entry = historyRef.current[historyIndexRef.current];
      
      editableRef.current.innerHTML = entry.html;
      
      requestAnimationFrame(() => {
        if (editableRef.current && entry.selection) {
          restoreSelection(editableRef.current, entry.selection);
        }
        isUndoRedoRef.current = false;
      });
      
      setEditableContent(htmlToPlainText(entry.html));
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1 && editableRef.current) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const entry = historyRef.current[historyIndexRef.current];
      
      editableRef.current.innerHTML = entry.html;
      
      requestAnimationFrame(() => {
        if (editableRef.current && entry.selection) {
          restoreSelection(editableRef.current, entry.selection);
        }
        isUndoRedoRef.current = false;
      });
      
      setEditableContent(htmlToPlainText(entry.html));
    }
  };

  const execCommand = (command: string, value?: string) => {
    if (!editableRef.current) return;
    
    const savedSelection = saveSelection(editableRef.current);
    editableRef.current.focus();
    document.execCommand(command, false, value);
    
    requestAnimationFrame(() => {
      if (editableRef.current && savedSelection) {
        restoreSelection(editableRef.current, savedSelection);
      }
      updateContentFromEditable();
    });
  };

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleH1 = () => execCommand('formatBlock', '<h1>');
  const handleH2 = () => execCommand('formatBlock', '<h2>');
  const handleH3 = () => execCommand('formatBlock', '<h3>');

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleSave = async () => {
    if (contentId) {
      const { error } = await supabase
        .from('master_content')
        .update({ 
          full_content: editableContent,
          quality_rating: qualityRating > 0 ? qualityRating : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentId);
      
      if (error) {
        toast({ 
          title: "Save failed", 
          description: error.message,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Saved successfully" });
      }
    } else {
      await forceSave();
      toast({
        title: "Saved",
        description: "Your content has been saved successfully",
      });
    }
  };

  const handleNextToMultiply = async () => {
    if (saveStatus !== "saved") {
      await forceSave();
    }
    
    navigate("/multiply", { 
      state: { 
        content: editableContent,
        title,
        contentType,
        productName,
        contentId
      } 
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle undo/redo shortcuts
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      handleRedo();
      return;
    }
    
    // Ensure Enter key creates proper <p> tags
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      // Insert a new paragraph
      document.execCommand('insertParagraph', false);
      
      // Ensure we're using <p> tags
      document.execCommand('defaultParagraphSeparator', false, 'p');
      
      updateContentFromEditable();
    }
  };

  // Toggle the assistant without modifying content
  const handleToggleAssistant = () => {
    if (editableRef.current && updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    setAssistantOpen((prev) => !prev);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#F5F1E8" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#B8956A" }} />
        <p className="text-sm" style={{ color: "#6B6662" }}>Loading your content...</p>
      </div>
    );
  }

  const currentFontFamily = FONT_OPTIONS.find(f => f.value === selectedFont)?.family || FONT_OPTIONS[0].family;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: "#F5F1E8" }}>
      {/* Top Toolbar - Clean & Minimal */}
      <div 
        className="border-b z-10 flex-shrink-0"
        style={{ 
          backgroundColor: "#FFFCF5",
          borderColor: "#E5E0D8"
        }}
      >
        <div className="flex items-center justify-between px-4 py-2">
          {/* Left: Exit Button + Font & Formatting */}
          <div className="flex items-center gap-2">
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="h-9 w-9 p-0"
              title="Exit Editor"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Font & Formatting - Hidden on mobile */}
            <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />

            <div className="hidden md:block">
              <Select 
                value={selectedFont} 
                onValueChange={setSelectedFont}
              >
                <SelectTrigger className="w-[180px] h-9 border-none shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background">
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.family }}>{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />

            {/* Formatting Buttons - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleBold();
              }}
              className="h-9 w-9 p-0 hidden md:flex"
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
              className="h-9 w-9 p-0 hidden md:flex"
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
              className="h-9 w-9 p-0 hidden md:flex"
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </Button>

            <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />

            {/* Headers - Hidden on mobile */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleH1();
              }}
              className="h-9 px-3 text-sm hidden md:flex"
              title="Heading 1"
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleH2();
              }}
              className="h-9 px-3 text-sm hidden md:flex"
              title="Heading 2"
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleH3();
              }}
              className="h-9 px-3 text-sm hidden md:flex"
              title="Heading 3"
            >
              H3
            </Button>
          </div>

          {/* Center: Editorial Assistant - Hidden on mobile */}
          <Button
            variant={assistantOpen ? "default" : "ghost"}
            onClick={handleToggleAssistant}
            className="gap-2 h-9 hidden md:flex"
            style={{
              backgroundColor: assistantOpen ? "#B8956A" : undefined,
              color: assistantOpen ? "#FFFFFF" : undefined
            }}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Editorial Assistant</span>
          </Button>

          {/* Right: Undo/Redo, Word Count, Save, Next */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-9 w-9 p-0 hidden sm:flex"
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-9 w-9 p-0 hidden sm:flex"
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <span className="text-sm text-muted-foreground mx-2 hidden lg:block">
              {wordCount} words
            </span>

            <div className="hidden lg:block">
              <QualityRating 
                rating={qualityRating} 
                onRatingChange={setQualityRating} 
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              className="gap-2 h-9 bg-gradient-to-r from-aged-brass to-antique-gold text-ink-black hover:opacity-90"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button
              onClick={handleNextToMultiply}
              className="gap-2 h-9"
              style={{
                backgroundColor: "#1A1816",
                color: "#FFFFFF"
              }}
            >
              <span className="hidden sm:inline">Next: Multiply</span>
              <span className="sm:hidden">Next</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 min-h-0">
        {!isMobile && assistantOpen ? (
          <ResizablePanelGroup direction="horizontal" className="w-full h-full">
            {/* Content Editor Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <div className="w-full overflow-auto h-full" style={{ backgroundColor: "#F5F1E8" }}>
                <div className="max-w-4xl mx-auto py-16 px-8 md:px-16">
                  <div
                    ref={attachEditableRef}
                    contentEditable
                    data-testid="main-editor"
                    onInput={updateContentFromEditable}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning
                    className="w-full min-h-[calc(100vh-200px)] focus:outline-none prose prose-lg max-w-none"
                    style={{
                      fontFamily: currentFontFamily,
                      color: "#1A1816",
                      lineHeight: "1.8"
                    }}
                  />
                </div>
              </div>
            </ResizablePanel>
            
            {/* Resizable Handle */}
            <ResizableHandle 
              className="w-1 hover:w-2 transition-all bg-warm-gray/20 hover:bg-aged-brass/40"
            />
            
            {/* Madison Assistant Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <div 
                className="w-full h-full"
                style={{ backgroundColor: "#FFFCF5" }}
              >
                <EditorialAssistantPanel 
                  onClose={handleToggleAssistant}
                  initialContent={editableContent}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          /* Full-width editor when Madison is closed */
          <div className="w-full overflow-auto h-full" style={{ backgroundColor: "#F5F1E8" }}>
            <div className="max-w-4xl mx-auto py-16 px-8 md:px-16">
              <div
                ref={attachEditableRef}
                contentEditable
                data-testid="main-editor"
                onInput={updateContentFromEditable}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning
                className="w-full min-h-[calc(100vh-200px)] focus:outline-none prose prose-lg max-w-none"
                style={{
                  fontFamily: currentFontFamily,
                  color: "#1A1816",
                  lineHeight: "1.8"
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile: Bottom drawer assistant */}
      {isMobile && (
        <>
          {/* Floating Madison Button - Mobile Only */}
          {!assistantOpen && (
            <button
              onClick={handleToggleAssistant}
              className="fixed bottom-6 right-6 z-50 group"
              style={{
                width: '64px',
                height: '64px',
                background: 'linear-gradient(135deg, #B8956A 0%, #8B7355 100%)',
                borderRadius: '16px 16px 16px 4px',
                boxShadow: '0 8px 24px rgba(184, 149, 106, 0.4), inset 0 -2px 8px rgba(0, 0, 0, 0.15)',
                border: '2px solid rgba(139, 115, 85, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              aria-label="Open Editorial Assistant"
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Engraved M */}
                <span 
                  className="font-serif text-3xl font-bold"
                  style={{
                    color: '#F5F1E8',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 -1px 2px rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-1px)'
                  }}
                >
                  M
                </span>
                {/* Subtle shine effect */}
                <div 
                  className="absolute inset-0 rounded-[14px] opacity-20 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
                  }}
                />
              </div>
            </button>
          )}
          
          <Drawer open={assistantOpen} onOpenChange={setAssistantOpen}>
            <DrawerContent className="h-[85vh] max-w-full" style={{ backgroundColor: "#FFFCF5" }}>
              <EditorialAssistantPanel
                onClose={handleToggleAssistant}
                initialContent={editableContent}
              />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
