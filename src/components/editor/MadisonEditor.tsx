/**
 * MadisonEditor - Tiptap-based Rich Text Editor with Inline AI
 * 
 * A premium, minimal editorial editor for Madison Studio.
 * Built on Tiptap (open-source) with embedded AI capabilities.
 * 
 * Features:
 * - Floating selection toolbar with AI actions
 * - Slash command menu ("/")
 * - Cursor-based "continue writing" action
 * - Clean content replacement with undo support
 * - No external AI dependencies (placeholder resolver)
 * 
 * Design Philosophy:
 * "A calm editor making quiet, helpful suggestions."
 * 
 * @module MadisonEditor
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent, JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { cn } from '@/lib/utils';
import { FloatingToolbar } from './FloatingToolbar';
import { SlashCommandMenu } from './SlashCommandMenu';
import { 
  handleMadisonInlineAction, 
  type MadisonInlineAction,
  type MadisonActionContext 
} from './madisonAI';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface MadisonEditorProps {
  /** Initial content - Tiptap JSON, HTML string, or plain text */
  initialContent?: JSONContent | string;
  /** Callback when content changes - receives Tiptap JSON */
  onChange?: (content: JSONContent) => void;
  /** Callback when content changes - receives plain text */
  onTextChange?: (text: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Read-only mode */
  readOnly?: boolean;
  /** Organization ID for AI context */
  organizationId?: string;
  /** Callback when editor is ready */
  onReady?: () => void;
  /** Auto-focus on mount */
  autoFocus?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert plain text with line breaks into properly structured HTML
 * 
 * This is critical for displaying AI-generated content correctly:
 * - Double newlines (\n\n) become paragraph breaks (<p>)
 * - Single newlines (\n) become line breaks (<br>) within paragraphs
 * - Markdown headers (## ) become <h2>, (### ) become <h3>
 * - Empty lines are preserved as paragraph separators
 * 
 * @param text - Plain text content with line breaks
 * @returns HTML string with proper paragraph structure
 */
function convertPlainTextToHtml(text: string): string {
  if (!text || !text.trim()) {
    return '<p></p>';
  }

  // Normalize line endings (Windows \r\n to Unix \n)
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by double newlines (paragraph breaks)
  // Also split on single newlines followed by headers
  const paragraphs = normalized.split(/\n\n+/);
  
  const htmlParts: string[] = [];
  
  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;
    
    // Check for markdown-style headers
    if (trimmed.startsWith('### ')) {
      htmlParts.push(`<h3>${escapeHtml(trimmed.slice(4))}</h3>`);
      continue;
    }
    if (trimmed.startsWith('## ')) {
      htmlParts.push(`<h2>${escapeHtml(trimmed.slice(3))}</h2>`);
      continue;
    }
    if (trimmed.startsWith('# ')) {
      // Convert H1 to H2 (H1 is typically the page title)
      htmlParts.push(`<h2>${escapeHtml(trimmed.slice(2))}</h2>`);
      continue;
    }
    
    // Check if paragraph contains internal single newlines
    if (trimmed.includes('\n')) {
      // Split by single newlines and join with <br>
      const lines = trimmed.split('\n').map(line => line.trim()).filter(line => line);
      htmlParts.push(`<p>${lines.map(escapeHtml).join('<br>')}</p>`);
    } else {
      // Simple paragraph
      htmlParts.push(`<p>${escapeHtml(trimmed)}</p>`);
    }
  }
  
  return htmlParts.join('') || '<p></p>';
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function MadisonEditor({
  initialContent,
  onChange,
  onTextChange,
  placeholder = 'Start writing…',
  className,
  readOnly = false,
  organizationId,
  onReady,
  autoFocus = true,
}: MadisonEditorProps) {
  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────
  
  const [slashMenuOpen, setSlashMenuOpen] = useState(false);
  const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
  const slashStartPosRef = useRef<number | null>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // CONTENT PARSING
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Parse initial content into Tiptap-compatible format
   * 
   * Handles:
   * - JSON content (Tiptap format) - passed through as-is
   * - HTML strings - passed through as-is (Tiptap handles them)
   * - Plain text - converted to proper HTML paragraphs
   * 
   * The key issue: Plain text with \n characters doesn't automatically
   * become paragraphs in Tiptap - we need to convert them to <p> tags.
   */
  const parseInitialContent = useCallback(() => {
    if (!initialContent) return undefined;
    
    // If it's already a JSON object (Tiptap format), use it directly
    if (typeof initialContent === 'object') return initialContent;
    
    // If it's a string, check if it's HTML or plain text
    const content = initialContent.trim();
    
    // If it already contains HTML tags, let Tiptap handle it
    if (content.startsWith('<') || /<[^>]+>/.test(content)) {
      return content;
    }
    
    // Plain text - convert to HTML paragraphs
    // This is critical for content from the AI generator which uses \n\n for paragraphs
    return convertPlainTextToHtml(content);
  }, [initialContent]);

  // ─────────────────────────────────────────────────────────────────────────
  // TIPTAP EDITOR INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
        blockquote: { HTMLAttributes: { class: 'madison-blockquote' } },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'madison-editor-empty',
      }),
      Link.configure({
        openOnClick: false, // Don't open links while editing
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: parseInitialContent(),
    editable: !readOnly,
    autofocus: autoFocus ? 'end' : false,
    editorProps: {
      attributes: {
        class: cn(
          'madison-editor',
          'prose prose-lg max-w-none',
          'focus:outline-none',
          'min-h-[calc(100vh-200px)]',
          'font-serif text-foreground leading-loose'
        ),
      },
      // Handle "/" key for slash commands
      handleKeyDown: (view, event) => {
        // ═══════════════════════════════════════════════════════════════════
        // SLASH COMMAND TRIGGER
        // ═══════════════════════════════════════════════════════════════════
        if (event.key === '/' && !slashMenuOpen) {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;
          
          // Only trigger at start of line or after whitespace
          const textBefore = $from.parent.textContent.slice(0, $from.parentOffset);
          const lastChar = textBefore.slice(-1);
          
          if (textBefore.length === 0 || lastChar === ' ' || lastChar === '\n') {
            const coords = view.coordsAtPos(selection.from);
            const containerRect = editorContainerRef.current?.getBoundingClientRect();
            
            if (containerRect) {
              setSlashMenuPosition({
                top: coords.bottom - containerRect.top + 8,
                left: Math.max(0, coords.left - containerRect.left),
              });
              slashStartPosRef.current = selection.from;
              setSlashMenuOpen(true);
            }
          }
        }

        // Close slash menu on Escape
        if (event.key === 'Escape' && slashMenuOpen) {
          setSlashMenuOpen(false);
          slashStartPosRef.current = null;
          return true;
        }

        return false;
      },
    },
    onUpdate: ({ editor }) => {
      // Close slash menu if cursor moved backward past the "/" position
      if (slashMenuOpen && slashStartPosRef.current !== null) {
        const currentPos = editor.state.selection.from;
        if (currentPos < slashStartPosRef.current) {
          setSlashMenuOpen(false);
          slashStartPosRef.current = null;
        }
      }

      // Notify parent of changes
      onChange?.(editor.getJSON());
      onTextChange?.(editor.getText());
    },
    onCreate: () => {
      onReady?.();
    },
  });

  // ─────────────────────────────────────────────────────────────────────────
  // AI ACTION HANDLER
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Handle inline AI action from floating toolbar or slash menu
   * 
   * This is the single entry point for all AI actions.
   * It delegates to handleMadisonInlineAction which:
   * - Detects selection vs cursor context
   * - Calls the placeholder resolver
   * - Inserts/replaces content correctly
   * - Preserves undo/redo
   */
  const handleAIAction = useCallback(async (action: MadisonInlineAction) => {
    console.log('[MadisonEditor] handleAIAction called:', { action, hasEditor: !!editor, isEditable: editor?.isEditable });
    
    if (!editor) {
      console.error('[MadisonEditor] No editor instance available');
      return;
    }
    
    if (!editor.isEditable) {
      console.warn('[MadisonEditor] Editor is not editable');
      return;
    }

    // If slash menu is open, close it and delete the "/" character
    if (slashMenuOpen && slashStartPosRef.current !== null) {
      const currentPos = editor.state.selection.from;
      
      // Delete from "/" position to current cursor
      if (currentPos > slashStartPosRef.current) {
        editor
          .chain()
          .focus()
          .deleteRange({ 
            from: slashStartPosRef.current, 
            to: currentPos 
          })
          .run();
      }
      
      setSlashMenuOpen(false);
      slashStartPosRef.current = null;
    }

    // Build context for the AI action
    const context: Partial<MadisonActionContext> = {
      organizationId,
    };

    try {
      // Execute the AI action
      const result = await handleMadisonInlineAction(action, editor, context);

      if (result) {
        console.log('[MadisonEditor] AI action completed:', {
          action,
          mode: result.mode,
          contentLength: result.content.length,
        });
      } else {
        console.warn('[MadisonEditor] AI action returned no result');
      }
    } catch (error) {
      console.error('[MadisonEditor] AI action error:', error);
    }
  }, [editor, slashMenuOpen, organizationId]);

  /**
   * Close slash menu and refocus editor
   */
  const handleCloseSlashMenu = useCallback(() => {
    setSlashMenuOpen(false);
    slashStartPosRef.current = null;
    editor?.commands.focus();
  }, [editor]);

  // ─────────────────────────────────────────────────────────────────────────
  // EFFECTS
  // ─────────────────────────────────────────────────────────────────────────
  
  // Update editable state when readOnly prop changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!readOnly);
    }
  }, [editor, readOnly]);

  // Expose editor methods globally for debugging
  useEffect(() => {
    if (editor && typeof window !== 'undefined') {
      (window as any).__madisonEditor = {
        getJSON: () => editor.getJSON(),
        getText: () => editor.getText(),
        getHTML: () => editor.getHTML(),
        setContent: (content: JSONContent | string) => editor.commands.setContent(content),
        focus: () => editor.commands.focus(),
        clear: () => editor.commands.clearContent(),
        // AI action trigger for testing
        runAIAction: (action: MadisonInlineAction) => handleAIAction(action),
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        delete (window as any).__madisonEditor;
      }
    };
  }, [editor, handleAIAction]);

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  
  // Loading state
  if (!editor) {
    return (
      <div className={cn('animate-pulse bg-muted/20 rounded-lg', className)}>
        <div className="h-64" />
      </div>
    );
  }

  return (
    <div 
      ref={editorContainerRef}
      className={cn('madison-editor-wrapper relative', className)}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          FLOATING SELECTION TOOLBAR
          Shows when text is selected with AI actions + formatting
          ═══════════════════════════════════════════════════════════════════ */}
      <FloatingToolbar 
        editor={editor}
        onAIAction={handleAIAction}
        disabled={readOnly}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SLASH COMMAND MENU
          Shows when "/" is typed at start of line or after space
          ═══════════════════════════════════════════════════════════════════ */}
      <SlashCommandMenu
        editor={editor}
        isOpen={slashMenuOpen}
        onClose={handleCloseSlashMenu}
        position={slashMenuPosition}
        onAIAction={handleAIAction}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          EDITOR CONTENT
          ═══════════════════════════════════════════════════════════════════ */}
      <EditorContent editor={editor} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export function getEditorContent(): JSONContent | null {
  if (typeof window !== 'undefined' && (window as any).__madisonEditor) {
    return (window as any).__madisonEditor.getJSON();
  }
  return null;
}

export function getEditorText(): string {
  if (typeof window !== 'undefined' && (window as any).__madisonEditor) {
    return (window as any).__madisonEditor.getText();
  }
  return '';
}

export function setEditorContent(content: JSONContent | string): void {
  if (typeof window !== 'undefined' && (window as any).__madisonEditor) {
    (window as any).__madisonEditor.setContent(content);
  }
}

export default MadisonEditor;






