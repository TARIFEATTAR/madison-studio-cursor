/**
 * FloatingToolbar - Selection-aware toolbar for Madison Editor
 * 
 * Appears when text is selected, providing:
 * - Text formatting options
 * - Madison AI actions
 * 
 * Design principles:
 * - Calm and editorial
 * - Non-intrusive
 * - Only shows when relevant (selection > 0)
 * - Hides immediately on blur
 */

import { Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  Quote, 
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MadisonInlineAction } from './madisonAI';

interface FloatingToolbarProps {
  editor: Editor;
  onAIAction?: (action: MadisonInlineAction) => void;
  disabled?: boolean;
}

/**
 * Floating selection toolbar
 * 
 * Shows when text is selected with:
 * - ✨ Refine with Madison (primary AI action)
 * - 🎯 Adjust tone
 * - 🔁 Rewrite for...
 * - Basic formatting (bold, italic, headings, lists)
 */
export function FloatingToolbar({ 
  editor, 
  onAIAction,
  disabled = false 
}: FloatingToolbarProps) {
  if (!editor) return null;

  const isEditable = editor.isEditable;

  // Handler for AI actions
  const handleAIAction = (action: MadisonInlineAction) => {
    if (disabled || !isEditable) {
      console.warn('[FloatingToolbar] AI action blocked - disabled or not editable');
      return;
    }
    console.log('[FloatingToolbar] Triggering AI action:', action);
    onAIAction?.(action);
  };

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{
        duration: 150,
        placement: 'top',
        offset: [0, 8],
        // Hide on blur/click outside
        hideOnClick: true,
        // Prevent showing when clicking inside the toolbar
        interactive: true,
        // Smooth animations
        animation: 'fade',
      }}
      // Only show when selection length > 0 and editor is editable
      // This is the single source of truth for visibility
      shouldShow={({ editor, state }) => {
        // Must have a non-empty selection
        const { empty, from, to } = state.selection;
        if (empty || from === to) {
          return false;
        }
        
        // Must be editable
        if (!editor.isEditable) {
          return false;
        }
        
        // Don't show if selection is just whitespace
        const selectedText = state.doc.textBetween(from, to, ' ');
        if (!selectedText.trim()) {
          return false;
        }
        
        return true;
      }}
      className={cn(
        "flex items-center gap-0.5 p-1.5 rounded-lg",
        "bg-card border border-border",
        "shadow-level-2",
        // Subtle animation
        "animate-in fade-in-0 zoom-in-95 duration-150"
      )}
    >
      {/* ═══════════════════════════════════════════════════════════════════
          MADISON AI ACTIONS (Primary)
          ═══════════════════════════════════════════════════════════════════ */}
      
      {/* Refine with Madison - Primary AI action */}
      <AIActionButton
        onClick={() => handleAIAction('refine')}
        disabled={disabled || !isEditable}
        icon={<Sparkles className="w-3.5 h-3.5" />}
        label="Refine"
        title="✨ Refine with Madison"
        primary
      />

      {/* Adjust Tone */}
      <AIActionButton
        onClick={() => handleAIAction('tone')}
        disabled={disabled || !isEditable}
        icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
        label="Tone"
        title="🎯 Adjust tone"
      />

      {/* Rewrite */}
      <AIActionButton
        onClick={() => handleAIAction('rewrite')}
        disabled={disabled || !isEditable}
        icon={<RefreshCw className="w-3.5 h-3.5" />}
        label="Rewrite"
        title="🔁 Rewrite"
      />

      <ToolbarDivider />

      {/* ═══════════════════════════════════════════════════════════════════
          FORMATTING OPTIONS
          ═══════════════════════════════════════════════════════════════════ */}

      {/* Bold */}
      <FormatButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={disabled || !isEditable}
        title="Bold (⌘B)"
      >
        <Bold className="w-4 h-4" />
      </FormatButton>

      {/* Italic */}
      <FormatButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={disabled || !isEditable}
        title="Italic (⌘I)"
      >
        <Italic className="w-4 h-4" />
      </FormatButton>

      <ToolbarDivider />

      {/* Heading 2 */}
      <FormatButton
        onClick={() => {
          console.log('[FloatingToolbar] Toggling H2');
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        }}
        isActive={editor.isActive('heading', { level: 2 })}
        disabled={disabled || !isEditable}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </FormatButton>

      {/* Heading 3 */}
      <FormatButton
        onClick={() => {
          console.log('[FloatingToolbar] Toggling H3');
          editor.chain().focus().toggleHeading({ level: 3 }).run();
        }}
        isActive={editor.isActive('heading', { level: 3 })}
        disabled={disabled || !isEditable}
        title="Heading 3"
      >
        <Heading3 className="w-4 h-4" />
      </FormatButton>

      <ToolbarDivider />

      {/* Bullet List */}
      <FormatButton
        onClick={() => {
          console.log('[FloatingToolbar] Toggling bullet list');
          editor.chain().focus().toggleBulletList().run();
        }}
        isActive={editor.isActive('bulletList')}
        disabled={disabled || !isEditable}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </FormatButton>

      {/* Ordered List */}
      <FormatButton
        onClick={() => {
          console.log('[FloatingToolbar] Toggling ordered list');
          editor.chain().focus().toggleOrderedList().run();
        }}
        isActive={editor.isActive('orderedList')}
        disabled={disabled || !isEditable}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </FormatButton>

      {/* Blockquote */}
      <FormatButton
        onClick={() => {
          console.log('[FloatingToolbar] Toggling blockquote');
          editor.chain().focus().toggleBlockquote().run();
        }}
        isActive={editor.isActive('blockquote')}
        disabled={disabled || !isEditable}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </FormatButton>
    </BubbleMenu>
  );
}

/**
 * AI Action button - styled for Madison branding
 */
function AIActionButton({
  onClick,
  disabled,
  icon,
  label,
  title,
  primary = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
  title: string;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1.5 rounded-md",
        "text-xs font-medium transition-colors",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        primary
          ? "text-primary hover:bg-primary/10"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/**
 * Format button component
 */
function FormatButton({
  children,
  onClick,
  isActive,
  disabled,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "p-1.5 rounded transition-colors",
        "hover:bg-muted",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        isActive && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}

/**
 * Visual divider
 */
function ToolbarDivider() {
  return <div className="w-px h-5 mx-1 bg-border" />;
}

export default FloatingToolbar;




