import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Check, Loader2, MessageSquare, Bold, Italic, Underline, Strikethrough, Undo2, Redo2, X, List, ListOrdered, Link2, Quote, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { EditorialAssistantPanel } from "@/components/assistant/EditorialAssistantPanel";
import QualityRating from "@/components/QualityRating";
import { useAutoSave } from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence } from "framer-motion";
import { AutosaveIndicator } from "@/components/ui/autosave-indicator";
import { AUTOSAVE_CONFIG } from "@/config/autosaveConfig";
import { supabase } from "@/integrations/supabase/client";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useOnboarding } from "@/hooks/useOnboarding";

const FONT_OPTIONS = [
  // Serif fonts - Editorial/Luxury
  { value: 'cormorant', label: 'Cormorant Garamond', family: '"Cormorant Garamond", serif', category: 'serif' },
  { value: 'crimson', label: 'Crimson Text', family: '"Crimson Text", serif', category: 'serif' },
  { value: 'georgia', label: 'Georgia', family: 'Georgia, serif', category: 'serif' },
  { value: 'playfair', label: 'Playfair Display', family: '"Playfair Display", serif', category: 'serif' },
  { value: 'source-serif', label: 'Source Serif Pro', family: '"Source Serif Pro", serif', category: 'serif' },
  { value: 'merriweather', label: 'Merriweather', family: 'Merriweather, serif', category: 'serif' },
  { value: 'libre-baskerville', label: 'Libre Baskerville', family: '"Libre Baskerville", serif', category: 'serif' },
  { value: 'times', label: 'Times New Roman', family: '"Times New Roman", serif', category: 'serif' },
  // Sans-serif fonts - Modern/Clean
  { value: 'lato', label: 'Lato', family: '"Lato", sans-serif', category: 'sans' },
  { value: 'inter', label: 'Inter', family: '"Inter", sans-serif', category: 'sans' },
  { value: 'open-sans', label: 'Open Sans', family: '"Open Sans", sans-serif', category: 'sans' },
  { value: 'roboto', label: 'Roboto', family: 'Roboto, sans-serif', category: 'sans' },
  { value: 'montserrat', label: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans' },
  { value: 'poppins', label: 'Poppins', family: 'Poppins, sans-serif', category: 'sans' },
  { value: 'arial', label: 'Arial', family: 'Arial, sans-serif', category: 'sans' },
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
  const wordCountTimeoutRef = useRef<NodeJS.Timeout>();
  const historyTimeoutRef = useRef<NodeJS.Timeout>();
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
        // Word count set in attachEditableRef
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

  const { saveStatus, lastSavedAt, forceSave } = useAutoSave({
    content: getContentForSave(),
    contentId,
    contentName: title,
    delay: AUTOSAVE_CONFIG.AGGRESSIVE_DELAY
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

      const savedDraft = localStorage.getItem('madison-content-draft');
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

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (wordCountTimeoutRef.current) {
        clearTimeout(wordCountTimeoutRef.current);
      }
      if (historyTimeoutRef.current) {
        clearTimeout(historyTimeoutRef.current);
      }
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  // Calculate word count on initial load
  useEffect(() => {
    if (isEditorReady && editableRef.current) {
      // Use requestAnimationFrame to ensure DOM has fully rendered
      requestAnimationFrame(() => {
        if (editableRef.current) {
          const text = editableRef.current.innerText;
          const words = text.trim().split(/\s+/).filter(word => word.length > 0);
          setWordCount(words.length);
          // Initial word count calculated
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

    // Update word count with throttling to avoid excessive calculations
    if (wordCountTimeoutRef.current) {
      clearTimeout(wordCountTimeoutRef.current);
    }

    wordCountTimeoutRef.current = setTimeout(() => {
      if (editableRef.current) {
        const text = editableRef.current.innerText;
        const words = text.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
      }
    }, 300); // Throttle word count updates

    // Debounce history updates to avoid performance issues during rapid typing
    if (!isUndoRedoRef.current) {
      const lastEntry = historyRef.current[historyRef.current.length - 1];

      // Only push if content actually changed
      if (!lastEntry || lastEntry.html !== html) {
        // Clear any pending history update
        if (historyTimeoutRef.current) {
          clearTimeout(historyTimeoutRef.current);
        }

        // Debounce history updates to every 500ms during typing
        historyTimeoutRef.current = setTimeout(() => {
          if (editableRef.current && !isUndoRedoRef.current) {
            const currentHtml = editableRef.current.innerHTML;
            const saved = saveSelection(editableRef.current);
            const newHistory = historyRef.current.slice(0, historyIndexRef.current + 1);
            newHistory.push({ html: currentHtml, selection: saved });

            if (newHistory.length > 50) {
              newHistory.shift();
            } else {
              historyIndexRef.current++;
            }
            historyRef.current = newHistory;
          }
        }, 500);
      }
    }
  };

  const handleUndo = () => {
    if (historyIndexRef.current > 0 && editableRef.current) {
      isUndoRedoRef.current = true;
      historyIndexRef.current--;
      const entry = historyRef.current[historyIndexRef.current];

      // Undo - setting innerHTML
      editableRef.current.innerHTML = entry.html;

      requestAnimationFrame(() => {
        if (editableRef.current && entry.selection) {
          // Restoring selection
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

      // Redo - setting innerHTML
      editableRef.current.innerHTML = entry.html;

      requestAnimationFrame(() => {
        if (editableRef.current && entry.selection) {
          // Restoring selection
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
      } catch { }
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
  const handleStrikethrough = () => execCommand('strikeThrough');
  const handleH1 = () => execCommand('formatBlock', '<h1>');
  const handleH2 = () => execCommand('formatBlock', '<h2>');
  const handleH3 = () => execCommand('formatBlock', '<h3>');
  const handleBulletList = () => execCommand('insertUnorderedList');
  const handleNumberedList = () => execCommand('insertOrderedList');
  const handleBlockquote = () => execCommand('formatBlock', '<blockquote>');
  
  // Link insertion state
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  
  const handleInsertLink = () => {
    const editor = editableRef.current;
    if (!editor || !linkUrl) return;
    
    editor.focus();
    
    // Restore selection if we saved it
    if (savedSelectionRef.current) {
      try {
        restoreSelection(editor, savedSelectionRef.current);
      } catch {}
    }
    
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      
      // If there's selected text, use it; otherwise use linkText or URL
      const displayText = selectedText || linkText || linkUrl;
      
      // Create link element
      const link = document.createElement('a');
      link.href = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = displayText;
      
      // Replace selection with link
      range.deleteContents();
      range.insertNode(link);
      
      // Move cursor after the link
      range.setStartAfter(link);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }
    
    // Reset and close
    setLinkUrl('');
    setLinkText('');
    setLinkPopoverOpen(false);
    updateContentFromEditable();
  };

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
          console.warn('[ContentEditor] forceSave failed, proceeding with resolve-save fallback:', e);
        }
      }

      const contentToSend = getContentForSave();

      // Ensure we have a contentId - create master_content if needed
      let finalContentId = contentId;

      if (!finalContentId) {
        console.info('[ContentEditor] No contentId - starting resolve-save routine');

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

        const normalizedTitle = (title || 'Untitled Content').trim();
        const payload = {
          full_content: contentToSend || '',
          content_type: contentType || 'Content',
          word_count: (contentToSend?.split(/\s+/).filter(Boolean).length) || 0,
          updated_at: new Date().toISOString(),
          ...(qualityRating && { quality_rating: qualityRating })
        };

        console.info('[ContentEditor] Normalized title:', normalizedTitle);

        // Try to find active row first
        const { data: activeRow, error: activeErr } = await supabase
          .from('master_content')
          .select('id')
          .eq('organization_id', orgId)
          .eq('title', normalizedTitle)
          .eq('is_archived', false)
          .maybeSingle();

        if (activeErr) {
          console.error('[ContentEditor] Error checking for active row:', activeErr);
          toast({
            title: 'Error',
            description: activeErr.message || 'Failed to save content',
            variant: 'destructive',
          });
          return;
        }

        if (activeRow) {
          // Active row exists, update it
          console.info('[ContentEditor] Found active row, updating id:', activeRow.id);
          const { error: updateErr } = await supabase
            .from('master_content')
            .update(payload)
            .eq('id', activeRow.id);

          if (updateErr) {
            console.error('[ContentEditor] Error updating active row:', updateErr);
            toast({
              title: 'Error',
              description: updateErr.message || 'Failed to save content',
              variant: 'destructive',
            });
            return;
          }

          finalContentId = activeRow.id;
          console.info('[ContentEditor] Updated active row successfully');
        } else {
          // No active row, check for archived row
          const { data: archivedRow, error: archivedErr } = await supabase
            .from('master_content')
            .select('id')
            .eq('organization_id', orgId)
            .eq('title', normalizedTitle)
            .eq('is_archived', true)
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (archivedErr) {
            console.error('[ContentEditor] Error checking for archived row:', archivedErr);
            toast({
              title: 'Error',
              description: archivedErr.message || 'Failed to save content',
              variant: 'destructive',
            });
            return;
          }

          if (archivedRow) {
            // Archived row exists, unarchive and update it
            console.info('[ContentEditor] Found archived row, unarchiving and updating id:', archivedRow.id);
            const { error: unarchiveErr } = await supabase
              .from('master_content')
              .update({
                ...payload,
                is_archived: false,
                archived_at: null
              })
              .eq('id', archivedRow.id);

            if (unarchiveErr) {
              console.error('[ContentEditor] Error unarchiving row:', unarchiveErr);
              toast({
                title: 'Error',
                description: unarchiveErr.message || 'Failed to save content',
                variant: 'destructive',
              });
              return;
            }

            finalContentId = archivedRow.id;
            console.info('[ContentEditor] Unarchived and updated row successfully');
          } else {
            // No existing row, insert new
            console.info('[ContentEditor] No existing row found, inserting new');
            const { data: insertData, error: insertErr } = await supabase
              .from('master_content')
              .insert({
                organization_id: orgId,
                title: normalizedTitle,
                created_by: userData?.user?.id || null,
                ...payload,
                is_archived: false,
                archived_at: null
              })
              .select('id')
              .single();

            if (insertErr) {
              // Check if it's a duplicate key error (race condition)
              if (insertErr.code === '23505') {
                console.info('[ContentEditor] Insert failed with 23505 (duplicate), recovering by re-selecting active row');
                const { data: recoveryRow, error: recoveryErr } = await supabase
                  .from('master_content')
                  .select('id')
                  .eq('organization_id', orgId)
                  .eq('title', normalizedTitle)
                  .eq('is_archived', false)
                  .maybeSingle();

                if (recoveryErr || !recoveryRow) {
                  console.error('[ContentEditor] Recovery failed:', recoveryErr);
                  toast({
                    title: 'Error',
                    description: recoveryErr?.message || 'Failed to save content',
                    variant: 'destructive',
                  });
                  return;
                }

                // Update the recovered row
                const { error: recoveryUpdateErr } = await supabase
                  .from('master_content')
                  .update(payload)
                  .eq('id', recoveryRow.id);

                if (recoveryUpdateErr) {
                  console.error('[ContentEditor] Recovery update failed:', recoveryUpdateErr);
                  toast({
                    title: 'Error',
                    description: recoveryUpdateErr.message || 'Failed to save content',
                    variant: 'destructive',
                  });
                  return;
                }

                finalContentId = recoveryRow.id;
                console.info('[ContentEditor] Recovered from race condition, updated id:', finalContentId);
              } else {
                console.error('[ContentEditor] Insert failed:', insertErr);
                toast({
                  title: 'Error',
                  description: insertErr.message || 'Failed to save content',
                  variant: 'destructive',
                });
                return;
              }
            } else {
              finalContentId = insertData.id;
              console.info('[ContentEditor] Inserted new row successfully, id:', finalContentId);
            }
          }
        }
      } else {
        // We have a contentId, update it
        console.info('[ContentEditor] Have contentId, updating:', contentId);
        const payload = {
          full_content: contentToSend || '',
          content_type: contentType || 'Content',
          word_count: (contentToSend?.split(/\s+/).filter(Boolean).length) || 0,
          updated_at: new Date().toISOString(),
          ...(qualityRating && { quality_rating: qualityRating })
        };

        const { error: updateErr } = await supabase
          .from('master_content')
          .update(payload)
          .eq('id', contentId);

        if (updateErr) {
          console.error('[ContentEditor] Error updating existing content:', updateErr);
          toast({
            title: 'Error',
            description: updateErr.message || 'Failed to save content',
            variant: 'destructive',
          });
          return;
        }

        finalContentId = contentId;
        console.info('[ContentEditor] Updated existing content successfully');
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

  // Global keyboard shortcut handler - works even in embedded browsers
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only handle if editor is focused or exists
      const editor = editableRef.current;
      if (!editor) return;
      
      // Check if we're focused on the editor or its children
      const activeElement = document.activeElement;
      const isEditorFocused = editor.contains(activeElement) || activeElement === editor;
      
      // Also handle if focus is anywhere in the editor page (not in input fields)
      const isInputField = activeElement?.tagName === 'INPUT' || activeElement?.tagName === 'TEXTAREA';
      if (!isEditorFocused && isInputField) return;
      
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      
      if (!modKey) return; // Only handle modifier key combinations
      
      const key = e.key.toLowerCase();
      const code = e.code;
      
      // Bold: Cmd/Ctrl + B
      if (key === 'b' || code === 'KeyB') {
        e.preventDefault();
        e.stopPropagation();
        editor.focus();
        document.execCommand('bold', false);
        updateContentFromEditable();
        return;
      }
      
      // Italic: Cmd/Ctrl + I
      if (key === 'i' || code === 'KeyI') {
        e.preventDefault();
        e.stopPropagation();
        editor.focus();
        document.execCommand('italic', false);
        updateContentFromEditable();
        return;
      }
      
      // Underline: Cmd/Ctrl + U
      if (key === 'u' || code === 'KeyU') {
        e.preventDefault();
        e.stopPropagation();
        editor.focus();
        document.execCommand('underline', false);
        updateContentFromEditable();
        return;
      }
      
      // Strikethrough: Cmd/Ctrl + Shift + S
      if (e.shiftKey && (key === 's' || code === 'KeyS')) {
        e.preventDefault();
        e.stopPropagation();
        editor.focus();
        document.execCommand('strikeThrough', false);
        updateContentFromEditable();
        return;
      }
      
      // Link: Cmd/Ctrl + K
      if (key === 'k' || code === 'KeyK') {
        e.preventDefault();
        e.stopPropagation();
        if (editor) {
          savedSelectionRef.current = saveSelection(editor);
        }
        setLinkPopoverOpen(true);
        return;
      }
      
      // Undo: Cmd/Ctrl + Z (without Shift)
      if ((key === 'z' || code === 'KeyZ') && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        handleUndo();
        return;
      }
      
      // Redo: Cmd/Ctrl + Shift + Z or Ctrl + Y
      if ((key === 'z' && e.shiftKey) || (!isMac && (key === 'y' || code === 'KeyY'))) {
        e.preventDefault();
        e.stopPropagation();
        handleRedo();
        return;
      }
    };
    
    // Use capture phase to intercept before IDE browser can grab it
    document.addEventListener('keydown', handleGlobalKeyDown, { capture: true });
    
    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown, { capture: true });
    };
  }, [handleUndo, handleRedo, updateContentFromEditable, saveSelection]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;
    
    // === UNDO/REDO ===
    // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
    if (modKey && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }
    
    // Redo: Cmd+Shift+Z (Mac) or Ctrl+Y / Ctrl+Shift+Z (Windows)
    if ((modKey && e.key.toLowerCase() === 'z' && e.shiftKey) || 
        (!isMac && e.ctrlKey && e.key.toLowerCase() === 'y')) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // === TEXT FORMATTING ===
    // Bold: Cmd+B (Mac) or Ctrl+B (Windows)
    if (modKey && (e.key.toLowerCase() === 'b' || e.code === 'KeyB')) {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('bold', false);
      updateContentFromEditable();
      return;
    }
    
    // Italic: Cmd+I (Mac) or Ctrl+I (Windows)
    if (modKey && (e.key.toLowerCase() === 'i' || e.code === 'KeyI')) {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('italic', false);
      updateContentFromEditable();
      return;
    }
    
    // Underline: Cmd+U (Mac) or Ctrl+U (Windows)
    if (modKey && (e.key.toLowerCase() === 'u' || e.code === 'KeyU')) {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('underline', false);
      updateContentFromEditable();
      return;
    }
    
    // Strikethrough: Cmd+Shift+S (Mac) or Ctrl+Shift+S (Windows)
    if (modKey && e.shiftKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleStrikethrough();
      return;
    }
    
    // === LISTS ===
    const editor = editableRef.current;
    const sel = window.getSelection();
    const insideList = !!(editor && sel && sel.rangeCount > 0 && sel.anchorNode && (sel.anchorNode as any).parentElement?.closest?.('li') && editor.contains(sel.anchorNode));

    // Bullet List: Cmd+Shift+8 (Mac) or Ctrl+Shift+8 (Windows)
    if (modKey && e.shiftKey && e.key === '8') {
      e.preventDefault();
      handleBulletList();
      return;
    }
    
    // Numbered List: Cmd+Shift+7 (Mac) or Ctrl+Shift+7 (Windows)
    if (modKey && e.shiftKey && e.key === '7') {
      e.preventDefault();
      handleNumberedList();
      return;
    }

    // Indent/outdent list items with Tab / Shift+Tab
    if (e.key === 'Tab' && insideList) {
      e.preventDefault();
      document.execCommand(e.shiftKey ? 'outdent' : 'indent');
      updateContentFromEditable();
      return;
    }
    
    // === BLOCK FORMATTING ===
    // Block Quote: Cmd+Shift+. (Mac) or Ctrl+Shift+. (Windows)
    if (modKey && e.shiftKey && e.key === '>') {
      e.preventDefault();
      handleBlockquote();
      return;
    }
    
    // Link: Cmd+K (Mac) or Ctrl+K (Windows)
    if (modKey && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      // Save selection before opening popover
      if (editableRef.current) {
        savedSelectionRef.current = saveSelection(editableRef.current);
      }
      setLinkPopoverOpen(true);
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-brand-vellum">
        <Loader2 className="w-8 h-8 animate-spin text-brand-brass" />
        <p className="text-sm text-brand-charcoal">Loading your content...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-brand-vellum">
      {/* Top Toolbar - Clean & Minimal */}
      <div
        className="border-b z-10 flex-shrink-0 bg-brand-parchment border-brand-stone"
      >
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
          {/* Left: Exit Button + Font & Formatting */}
          <div className="flex items-center gap-0.5 flex-nowrap min-w-0 flex-shrink-0">
            {/* Exit Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="h-8 w-8 p-0 flex-shrink-0"
              title="Exit Editor"
            >
              <X className="w-4 h-4" />
            </Button>

            {/* Font Selection - Desktop & Tablet */}
            <div className="h-5 w-px bg-border/40 mx-1 hidden sm:block" />

            <div className="hidden sm:block">
              <Select
                value={selectedFont}
                onValueChange={(value) => {
                  const fontFamily = FONT_OPTIONS.find(f => f.value === value)?.family;
                  if (fontFamily && editableRef.current) {
                    const editor = editableRef.current;
                    const sel = window.getSelection();
                    const withinEditor = !!(sel && sel.rangeCount > 0 && sel.anchorNode && editor.contains(sel.anchorNode));

                    if (!withinEditor && savedSelectionRef.current) {
                      try {
                        editor.focus();
                        restoreSelection(editor, savedSelectionRef.current);
                      } catch { }
                    } else {
                      editor.focus();
                    }

                    if (sel && sel.rangeCount > 0) {
                      const range = sel.getRangeAt(0);
                      if (!range.collapsed) {
                        try {
                          const contents = range.extractContents();
                          const span = document.createElement('span');
                          span.style.fontFamily = fontFamily;
                          span.appendChild(contents);
                          range.insertNode(span);
                          const newRange = document.createRange();
                          newRange.selectNodeContents(span);
                          sel.removeAllRanges();
                          sel.addRange(newRange);
                        } catch (e) {
                          document.execCommand('fontName', false, fontFamily);
                        }
                      } else {
                        const span = document.createElement('span');
                        span.style.fontFamily = fontFamily;
                        span.textContent = '\u200B';
                        range.insertNode(span);
                        range.setStartAfter(span);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                      }
                    }
                    setSelectedFont(value);
                    updateContentFromEditable();
                  }
                }}
              >
                <SelectTrigger className="w-[140px] lg:w-[160px] h-8 border-none shadow-none text-xs lg:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background max-h-[300px]">
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Serif</div>
                  {FONT_OPTIONS.filter(f => f.category === 'serif').map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.family }} className="text-sm">{font.label}</span>
                    </SelectItem>
                  ))}
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1 text-xs text-muted-foreground font-medium">Sans-Serif</div>
                  {FONT_OPTIONS.filter(f => f.category === 'sans').map(font => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.family }} className="text-sm">{font.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="h-5 w-px bg-border/40 mx-0.5 sm:mx-1" />

            {/* Text Formatting - Always visible */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleBold(); }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Bold (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+B)`}
            >
              <Bold className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleItalic(); }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Italic (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+I)`}
            >
              <Italic className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleUnderline(); }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Underline (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+U)`}
            >
              <Underline className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleStrikethrough(); }}
              className="h-8 w-8 p-0 flex-shrink-0 hidden sm:flex"
              title={`Strikethrough (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+⇧+S)`}
            >
              <Strikethrough className="w-4 h-4" />
            </Button>

            <div className="h-5 w-px bg-border/40 mx-0.5 sm:mx-1" />

            {/* Lists */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleBulletList(); }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Bullet List (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+⇧+8)`}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleNumberedList(); }}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Numbered List (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+⇧+7)`}
            >
              <ListOrdered className="w-4 h-4" />
            </Button>

            <div className="h-5 w-px bg-border/40 mx-0.5 sm:mx-1" />

            {/* Undo/Redo */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUndo}
              disabled={!canUndo}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Undo (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Z)`}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRedo}
              disabled={!canRedo}
              className="h-8 w-8 p-0 flex-shrink-0"
              title={`Redo (${navigator.platform.includes('Mac') ? '⌘+⇧+Z' : 'Ctrl+Y'})`}
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            {/* Desktop: Headers & More formatting */}
            <div className="h-5 w-px bg-border/40 mx-1 hidden lg:block" />

            <div className="hidden lg:flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
                onMouseDown={(e) => { e.preventDefault(); handleH1(); }}
                className="h-8 px-2 text-xs font-semibold"
              title="Heading 1"
            >
              H1
            </Button>
            <Button
              variant="ghost"
              size="sm"
                onMouseDown={(e) => { e.preventDefault(); handleH2(); }}
                className="h-8 px-2 text-xs font-semibold"
              title="Heading 2"
            >
              H2
            </Button>
            <Button
              variant="ghost"
              size="sm"
                onMouseDown={(e) => { e.preventDefault(); handleH3(); }}
                className="h-8 px-2 text-xs font-semibold"
              title="Heading 3"
            >
              H3
            </Button>
            </div>

            <div className="h-5 w-px bg-border/40 mx-1 hidden md:block" />

            {/* Block Quote - Desktop */}
            <Button
              variant="ghost"
              size="sm"
              onMouseDown={(e) => { e.preventDefault(); handleBlockquote(); }}
              className="h-8 w-8 p-0 flex-shrink-0 hidden md:flex"
              title={`Block Quote (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+⇧+>)`}
            >
              <Quote className="w-4 h-4" />
            </Button>

            {/* Link Insertion - Desktop */}
            <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0 hidden md:flex"
                  title={`Insert Link (${navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+K)`}
                >
                  <Link2 className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4" align="start">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="link-url" className="text-sm font-medium">URL</Label>
                    <Input
                      id="link-url"
                      placeholder="https://example.com"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInsertLink();
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="link-text" className="text-sm font-medium">Display Text (optional)</Label>
                    <Input
                      id="link-text"
                      placeholder="Link text"
                      value={linkText}
                      onChange={(e) => setLinkText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleInsertLink();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setLinkPopoverOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="brass" size="sm" onClick={handleInsertLink} disabled={!linkUrl}>
                      Insert Link
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {/* Mobile: More Menu for additional options */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleStrikethrough(); }}>
                    <Strikethrough className="w-4 h-4 mr-2" />
                    Strikethrough
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleH1(); }}>
                    <span className="font-bold mr-2">H1</span>
                    Heading 1
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleH2(); }}>
                    <span className="font-bold mr-2">H2</span>
                    Heading 2
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleH3(); }}>
                    <span className="font-bold mr-2">H3</span>
                    Heading 3
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={(e) => { e.preventDefault(); handleBlockquote(); }}>
                    <Quote className="w-4 h-4 mr-2" />
                    Block Quote
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setLinkPopoverOpen(true)}>
                    <Link2 className="w-4 h-4 mr-2" />
                    Insert Link
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Center: Editorial Assistant - Hidden on mobile */}
          <Button
            variant={assistantOpen ? "brass" : "ghost"}
            onClick={handleToggleAssistant}
            className="gap-2 h-8 hidden lg:flex flex-shrink-0 whitespace-nowrap text-sm"
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="hidden xl:inline">Editorial Assistant</span>
            <span className="xl:hidden">Assistant</span>
          </Button>

          {/* Right: Word Count, Quality Rating, Save, Next */}
          <div className="flex items-center gap-1 flex-shrink-0 min-w-0">
            {/* Word Count */}
            <span className="text-xs text-muted-foreground px-1 whitespace-nowrap flex-shrink-0 tabular-nums">
              {wordCount}w
            </span>

            {/* Autosave Indicator - Hidden on mobile */}
            <div className="hidden lg:block flex-shrink-0">
              <AutosaveIndicator
                saveStatus={saveStatus}
                lastSavedAt={lastSavedAt}
              />
            </div>

            <div className="hidden xl:block flex-shrink-0">
              <QualityRating
                rating={qualityRating}
                onRatingChange={setQualityRating}
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saveStatus === "saving"}
              variant="brass"
              className="gap-1 h-8 px-2 sm:px-3"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saveStatus === "saved" ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span className="hidden sm:inline text-sm">Save</span>
            </Button>

            <Button
              onClick={handleNextToMultiply}
              disabled={saveStatus === "saving"}
              variant="default"
              className="gap-1 h-8 px-2 sm:px-3"
            >
              {saveStatus === "saving" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span className="hidden md:inline text-sm">Save & Continue to Multiply</span>
                  <span className="md:hidden text-sm">Continue</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
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
              <div className="w-full overflow-auto h-full bg-brand-vellum">
                <div className="max-w-4xl mx-auto py-16 px-8 md:px-16">
                  <div
                    ref={attachEditableRef}
                    contentEditable
                    data-testid="main-editor"
                    data-tooltip-target="content-editor-area"
                    onInput={updateContentFromEditable}
                    onCompositionStart={() => setIsComposing(true)}
                    onCompositionEnd={() => setIsComposing(false)}
                    onKeyDown={handleKeyDown}
                    suppressContentEditableWarning
                    className="editor-content w-full min-h-[calc(100vh-200px)] focus:outline-none prose prose-lg max-w-none text-brand-ink leading-loose"
                  />
                </div>
              </div>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle
              className="w-1 hover:w-2 transition-all bg-brand-stone/20 hover:bg-brand-brass/40"
            />

            {/* Madison Assistant Panel */}
            <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
              <div
                className="w-full h-full bg-brand-parchment"
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
          <div className="w-full overflow-auto h-full bg-brand-vellum">
            <div className="max-w-4xl mx-auto py-16 px-8 md:px-16">
              <div
                ref={attachEditableRef}
                contentEditable
                data-testid="main-editor"
                data-tooltip-target="content-editor-area"
                onInput={updateContentFromEditable}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                onKeyDown={handleKeyDown}
                suppressContentEditableWarning
                className="editor-content w-full min-h-[calc(100vh-200px)] focus:outline-none prose prose-lg max-w-none text-brand-ink leading-loose"
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
                background: 'linear-gradient(135deg, #B8956A 0%, #A3865A 100%)',
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
                  className="font-serif text-3xl font-bold text-brand-parchment"
                  style={{
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
            <DrawerContent
              className="h-screen max-h-[100dvh] mt-0 rounded-t-none flex flex-col overflow-hidden bg-brand-parchment"
              style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            >
              <div className="flex-1 overflow-hidden">
                <EditorialAssistantPanel
                  onClose={handleToggleAssistant}
                  initialContent={getContentForSave()}
                />
              </div>
            </DrawerContent>
          </Drawer>
        </>
      )}
    </div>
  );
}
