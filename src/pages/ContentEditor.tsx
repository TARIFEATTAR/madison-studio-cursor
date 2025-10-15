import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Check, Loader2, MessageSquare, Bold, Italic, Underline, Undo2, Redo2, X, List, ListOrdered } from "lucide-react";
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
import { useOnboarding } from "@/hooks/useOnboarding";

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
  const { currentOrganizationId } = useOnboarding();
  
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
  const currentHtmlRef = useRef<string>("");
  const savedSelectionRef = useRef<SavedSelection | null>(null);

  // HTML conversion utilities - MUST be defined before attachEditableRef
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

  // Callback ref - resilient to remounts and preserves content across layout changes
  const attachEditableRef = useCallback((element: HTMLDivElement | null) => {
    if (!element) return;

    // Use the latest known HTML if available, otherwise hydrate from initial plain text
    const htmlToSet = currentHtmlRef.current || plainTextToHtml(editableContent || "");
    element.innerHTML = htmlToSet;
    document.execCommand('defaultParagraphSeparator', false, 'p');

    editableRef.current = element;
    setIsEditorReady(true);

    // Restore previous selection if we saved it (e.g., before opening assistant)
    if (savedSelectionRef.current) {
      try {
        restoreSelection(element, savedSelectionRef.current);
        element.focus();
      } catch (e) {
        console.warn("[ContentEditor] Failed to restore selection on remount:", e);
      } finally {
        savedSelectionRef.current = null;
      }
    } else {
      // Ensure editor keeps focus for uninterrupted typing
      element.focus();
    }
    
    // Calculate word count after editor is hydrated
    requestAnimationFrame(() => {
      if (element) {
        const text = element.innerText;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
        console.debug("[ContentEditor] Word count set in attachEditableRef:", words.length);
      }
    });
  }, [editableContent, plainTextToHtml]);
  
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

  // Calculate word count on initial load
  useEffect(() => {
    if (isEditorReady && editableRef.current) {
      // Use requestAnimationFrame to ensure DOM has fully rendered
      requestAnimationFrame(() => {
        if (editableRef.current) {
          const text = editableRef.current.innerText;
          const words = text.trim().split(/\s+/).filter(word => word.length > 0);
          setWordCount(words.length);
          console.debug("[ContentEditor] Initial word count calculated:", words.length, "from text:", text.substring(0, 50));
        }
      });
    }
  }, [isEditorReady, editableContent]);

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

  // Word count is now updated directly in updateContentFromEditable
  // History is now updated directly in updateContentFromEditable

  const updateContentFromEditable = () => {
    if (!editableRef.current || isComposing || isUndoRedoRef.current) return;
    
    const html = editableRef.current.innerHTML;
    currentHtmlRef.current = html;
    const saved = saveSelection(editableRef.current);
    
    // Update word count immediately (cheap, doesn't cause re-render issues)
    const text = editableRef.current.innerText;
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
    
    // Update history immediately (no state update during typing)
    if (!isUndoRedoRef.current) {
      const lastEntry = historyRef.current[historyRef.current.length - 1];
      
      // Only push if content actually changed
      if (!lastEntry || lastEntry.html !== html) {
        const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHistory.push({ html, selection: saved });
        
        if (newHistory.length > 50) {
          newHistory.shift();
        } else {
          historyIndexRef.current++;
        }
        historyRef.current = newHistory;
        console.debug("[ContentEditor] History pushed, index:", historyIndexRef.current);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0 && editableRef.current) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const entry = historyRef.current[historyIndexRef.current];
      
      console.debug("[ContentEditor] Undo - setting innerHTML, index:", historyIndexRef.current);
      editableRef.current.innerHTML = entry.html;
      
      requestAnimationFrame(() => {
        if (editableRef.current && entry.selection) {
          console.debug("[ContentEditor] Restoring selection:", entry.selection);
          restoreSelection(editableRef.current, entry.selection);
        }
        isUndoRedoRef.current = false;
      });
    }
  };

  const handleRedo = () => {
    if (historyIndexRef.current < historyRef.current.length - 1 && editableRef.current) {
      isUndoRedoRef.current = true;
      historyIndexRef.current++;
      const entry = historyRef.current[historyIndexRef.current];
      
      console.debug("[ContentEditor] Redo - setting innerHTML, index:", historyIndexRef.current);
      editableRef.current.innerHTML = entry.html;
      
      requestAnimationFrame(() => {
        if (editableRef.current && entry.selection) {
          console.debug("[ContentEditor] Restoring selection:", entry.selection);
          restoreSelection(editableRef.current, entry.selection);
        }
        isUndoRedoRef.current = false;
      });
    }
  };

  const execCommand = (command: string, value?: string) => {
    const editor = editableRef.current;
    if (!editor) return;

    const sel = window.getSelection();
    const withinEditor = !!(sel && sel.rangeCount > 0 && sel.anchorNode && editor.contains(sel.anchorNode));

    // If toolbar click blurred the editor, restore the last saved selection
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

      // Find nearest block element
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

  const handleBold = () => execCommand('bold');
  const handleItalic = () => execCommand('italic');
  const handleUnderline = () => execCommand('underline');
  const handleH1 = () => execCommand('formatBlock', '<h1>');
  const handleH2 = () => execCommand('formatBlock', '<h2>');
  const handleH3 = () => execCommand('formatBlock', '<h3>');
  const handleBulletList = () => execCommand('insertUnorderedList');
  const handleNumberedList = () => execCommand('insertOrderedList');

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  const handleSave = async () => {
    const contentToSave = getContentForSave();
    
    if (contentId) {
      const { error } = await supabase
        .from('master_content')
        .update({ 
          full_content: contentToSave,
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
    console.log('[ContentEditor] Starting navigation to Multiply');
    console.log('[ContentEditor] Save status before navigation:', saveStatus);
    
    try {
      // Force save and wait for completion (best-effort)
      if (saveStatus !== "saved") {
        console.log('[ContentEditor] Forcing save before navigation...');
        try {
          await forceSave();
          console.log('[ContentEditor] Save completed');
        } catch (e) {
          console.warn('[ContentEditor] forceSave failed, proceeding with upsert fallback:', e);
        }
      }
      
      const contentToSend = getContentForSave();
      
      // Ensure we have a contentId - create master_content if needed
      let finalContentId = contentId;
      
      if (!finalContentId) {
        console.info('[ContentEditor] No contentId - checking for existing master_content');
        
        const { data: userData } = await supabase.auth.getUser();
        
        // Get organization ID using authoritative source
        let orgId = currentOrganizationId;
        
        if (!orgId) {
          console.info('[ContentEditor] No currentOrganizationId from useOnboarding, fetching from organization_members');
          const { data: orgData } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', userData?.user?.id)
            .limit(1)
            .maybeSingle();
          
          orgId = orgData?.organization_id || null;
        }
        
        if (!orgId) {
          console.error('[ContentEditor] Could not determine organization ID');
          toast({
            title: "Error",
            description: "Could not find organization",
            variant: "destructive"
          });
          return;
        }
        
        console.info('[ContentEditor] Using organization ID:', orgId);
        
        // Use a single UPSERT to avoid duplicates and race conditions
        const normalizedTitle = (title || 'Untitled Content').trim();
        console.info('[ContentEditor] Saving via upsert with normalized title:', normalizedTitle);

        const { data: upsertData, error: upsertError } = await supabase
          .from('master_content')
          .upsert(
            {
              // Conflict target: organization_id + title
              organization_id: orgId,
              title: normalizedTitle,
              content_type: contentType || 'Content',
              full_content: contentToSend || '',
              word_count: (contentToSend?.split(/\s+/).filter(Boolean).length) || 0,
              created_by: userData?.user?.id || null,
              // If row exists and was archived, unarchive it
              is_archived: false,
              archived_at: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'organization_id,title' }
          )
          .select('id')
          .single();

        if (upsertError) {
          console.error('[ContentEditor] Upsert master_content failed:', upsertError);
          toast({
            title: 'Error',
            description: upsertError.message || 'Failed to save content',
            variant: 'destructive',
          });
          return;
        }

        if (!upsertData?.id) {
          console.error('[ContentEditor] Upsert succeeded without id');
          toast({
            title: 'Error',
            description: 'Failed to save content',
            variant: 'destructive',
          });
          return;
        }

        finalContentId = upsertData.id;
        console.info('[ContentEditor] Upserted master_content id:', finalContentId);
      }
      
      // Persist master ID to localStorage and URL for robust cross-device/reload tracking
      localStorage.setItem('lastEditedMasterId', finalContentId);
      localStorage.setItem('lastEditedMasterTitle', title);
      
      console.log('[ContentEditor] Navigating to Multiply with content:', {
        id: finalContentId,
        title,
        contentLength: contentToSend?.length,
        preview: contentToSend?.substring(0, 100)
      });
      
      navigate(`/multiply?id=${finalContentId}`, { 
        state: { 
          content: contentToSend,
          title,
          contentType,
          productName,
          contentId: finalContentId
        } 
      });
    } catch (error) {
      console.error('[ContentEditor] Error during navigation:', error);
      toast({
        title: "Error",
        description: "Failed to save content before continuing",
        variant: "destructive"
      });
    }
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

    const editor = editableRef.current;
    const sel = window.getSelection();
    const insideList = !!(editor && sel && sel.rangeCount > 0 && sel.anchorNode && (sel.anchorNode as any).parentElement?.closest?.('li') && editor.contains(sel.anchorNode));

    // Indent/outdent list items with Tab / Shift+Tab
    if (e.key === 'Tab' && insideList) {
      e.preventDefault();
      document.execCommand(e.shiftKey ? 'outdent' : 'indent');
      updateContentFromEditable();
      return;
    }

    // Ensure Enter key creates proper <p> tags only outside lists
    if (e.key === 'Enter' && !e.shiftKey && !insideList) {
      e.preventDefault();
      document.execCommand('insertParagraph', false);
      document.execCommand('defaultParagraphSeparator', false, 'p');
      updateContentFromEditable();
    }
  };

  // Toggle the assistant without modifying content and preserve editor state
  const handleToggleAssistant = () => {
    if (editableRef.current) {
      // Persist latest HTML and selection before layout changes
      currentHtmlRef.current = editableRef.current.innerHTML;
      savedSelectionRef.current = saveSelection(editableRef.current);
    }
    if (updateTimeoutRef.current) {
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
        <div className="flex items-center justify-between px-4 py-2 gap-2 overflow-x-auto">
          {/* Left: Exit Button + Font & Formatting */}
          <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 flex-nowrap min-w-0">
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Exit Editor"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Font Selection - Desktop only */}
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

            {/* Essential Formatting - Always visible */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleBold();
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleItalic();
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleUnderline();
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* List Formatting - Always visible */}
            <div className="h-6 w-px bg-border/40 mx-0.5 sm:mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleBulletList();
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => {
                e.preventDefault();
                handleNumberedList();
              }}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Numbered List"
            >
              <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            {/* Undo/Redo - Always visible */}
            <div className="h-6 w-px bg-border/40 mx-0.5 sm:mx-1" />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>

            <div className="h-6 w-px bg-border/40 mx-1 hidden md:block" />

            {/* Headers - Desktop only */}
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

          {/* Right: Word Count, Quality Rating, Save, Next */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Word Count - Compact on mobile */}
            <span className="text-xs sm:text-sm text-muted-foreground px-1 sm:px-2">
              {wordCount}w
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
              className="gap-1 sm:gap-2 h-8 sm:h-9 bg-gradient-to-r from-aged-brass to-antique-gold text-ink-black hover:opacity-90"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
              <span className="hidden sm:inline">Save</span>
            </Button>
            
            <Button
              onClick={handleNextToMultiply}
              disabled={saveStatus === "saving"}
              className="gap-1 sm:gap-2 h-8 sm:h-9"
              style={{
                backgroundColor: "#1A1816",
                color: "#FFFFFF"
              }}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                  <span className="sm:hidden">Saving</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Save & Continue to Multiply</span>
                  <span className="sm:hidden">Continue</span>
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-180" />
                </>
              )}
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
                    className="editor-content w-full min-h-[calc(100vh-200px)] focus:outline-none prose prose-lg max-w-none"
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
                  initialContent={getContentForSave()}
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
                className="editor-content w-full min-h-[calc(100vh-200px)] focus:outline-none prose prose-lg max-w-none"
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
                initialContent={getContentForSave()}
              />
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
