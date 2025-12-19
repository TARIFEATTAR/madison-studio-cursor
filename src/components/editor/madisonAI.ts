/**
 * Madison Inline AI - Editorial Intelligence for the Editor
 * 
 * This module provides the inline AI capabilities for the Madison Editor.
 * It handles text selection, cursor context, and content replacement.
 * 
 * Architecture:
 * - Single command handler for all AI actions
 * - Placeholder resolver (no actual AI calls yet)
 * - Clean content replacement with undo support
 * 
 * @module madisonAI
 */

import type { Editor } from '@tiptap/react';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Available inline AI action types
 */
export type MadisonInlineAction =
  | 'refine'      // Polish and improve selected text
  | 'continue'    // Continue writing from cursor
  | 'rewrite'     // Completely rewrite selected text
  | 'email'       // Transform into email format
  | 'product'     // Transform into product description
  | 'instagram'   // Transform for Instagram caption
  | 'shorten'     // Make text more concise
  | 'expand'      // Expand on the selected text
  | 'tone';       // Adjust tone of the text

/**
 * Context for AI actions
 */
export interface MadisonActionContext {
  /** Organization ID for brand context */
  organizationId?: string;
  /** Brand voice settings */
  brandVoice?: string;
  /** Content type being edited */
  contentType?: string;
  /** Whether text is selected or cursor-only */
  hasSelection: boolean;
  /** The position in the document */
  cursorPosition: number;
}

/**
 * Result from an AI action
 */
export interface MadisonActionResult {
  /** The generated/transformed content */
  content: string;
  /** Whether to replace selection or insert at cursor */
  mode: 'replace' | 'insert';
  /** Original content for undo reference */
  originalContent: string;
}

/**
 * Configuration for displaying an action in the UI
 */
export interface MadisonActionConfig {
  action: MadisonInlineAction;
  label: string;
  description: string;
  /** Whether this action requires selected text */
  requiresSelection: boolean;
  /** Category for grouping in menus */
  category: 'transform' | 'generate' | 'adjust';
}

// ═══════════════════════════════════════════════════════════════════════════
// ACTION CONFIGURATIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All available AI actions with their configurations
 */
export const MADISON_ACTIONS: MadisonActionConfig[] = [
  // Transform actions - require selection
  {
    action: 'refine',
    label: 'Refine with Madison',
    description: 'Polish and improve the selected text',
    requiresSelection: true,
    category: 'transform'
  },
  {
    action: 'rewrite',
    label: 'Rewrite',
    description: 'Completely rewrite the selected text',
    requiresSelection: true,
    category: 'transform'
  },
  {
    action: 'shorten',
    label: 'Shorten',
    description: 'Make the text more concise',
    requiresSelection: true,
    category: 'adjust'
  },
  {
    action: 'expand',
    label: 'Expand',
    description: 'Add more detail to the text',
    requiresSelection: true,
    category: 'adjust'
  },
  // Format transforms
  {
    action: 'email',
    label: 'Transform to Email',
    description: 'Reformat as an email',
    requiresSelection: true,
    category: 'transform'
  },
  {
    action: 'product',
    label: 'Transform to Product',
    description: 'Reformat as product description',
    requiresSelection: true,
    category: 'transform'
  },
  {
    action: 'instagram',
    label: 'Transform to Instagram',
    description: 'Reformat for Instagram caption',
    requiresSelection: true,
    category: 'transform'
  },
  // Generate actions - work at cursor
  {
    action: 'continue',
    label: 'Continue Writing',
    description: 'Continue writing from this point',
    requiresSelection: false,
    category: 'generate'
  },
  {
    action: 'tone',
    label: 'Adjust Tone',
    description: 'Modify the tone of the text',
    requiresSelection: true,
    category: 'adjust'
  }
];

/**
 * Slash command definitions
 */
export const SLASH_COMMANDS = [
  { command: '/refine', action: 'refine' as MadisonInlineAction, label: 'Refine', description: 'Polish and improve writing' },
  { command: '/continue', action: 'continue' as MadisonInlineAction, label: 'Continue', description: 'Continue writing from here' },
  { command: '/rewrite', action: 'rewrite' as MadisonInlineAction, label: 'Rewrite', description: 'Rewrite this section' },
  { command: '/email', action: 'email' as MadisonInlineAction, label: 'Email', description: 'Transform into email format' },
  { command: '/product', action: 'product' as MadisonInlineAction, label: 'Product', description: 'Transform into product description' },
  { command: '/instagram', action: 'instagram' as MadisonInlineAction, label: 'Instagram', description: 'Transform for Instagram' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// PLACEHOLDER AI RESOLVER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Placeholder AI resolver - returns marked-up content for testing
 * 
 * This function simulates AI responses without making actual API calls.
 * It wraps content with action markers so we can validate:
 * - UX flows
 * - Content replacement
 * - Undo/redo behavior
 * 
 * TODO: Replace with Madison AI logic
 * - Connect to generate-with-claude edge function
 * - Add brand rules injection
 * - Add Brand Health scoring
 * - Add multi-step reasoning
 * - Add format-aware transforms
 * - Add cost-aware model routing
 * 
 * @param action - The AI action to perform
 * @param content - The text content to process
 * @param context - Additional context for the action
 */
export async function resolveMadisonAction({
  action,
  content,
  context,
}: {
  action: MadisonInlineAction;
  content: string;
  context?: Partial<MadisonActionContext>;
}): Promise<string> {
  // Simulate a brief delay (feels more natural)
  await new Promise(resolve => setTimeout(resolve, 300));

  // For 'continue' action with no content, provide placeholder continuation
  if (action === 'continue' && !content.trim()) {
    return 'This is a sample continuation of your writing. Madison will generate thoughtful, well-structured content that flows naturally from where you left off.\n\nThe AI will maintain your voice and style while adding depth and clarity to your message. Each paragraph will be properly formatted and separated for easy reading.';
  }

  // Return marked content for testing - this shows the action worked
  // In production, this will be actual AI-generated content
  const actionLabels: Record<MadisonInlineAction, string> = {
    refine: '✨ REFINED',
    continue: '→ CONTINUED',
    rewrite: '🔄 REWRITTEN',
    email: '📧 EMAIL',
    product: '📦 PRODUCT',
    instagram: '📸 INSTAGRAM',
    shorten: '📐 SHORTENED',
    expand: '📝 EXPANDED',
    tone: '🎭 TONE ADJUSTED',
  };

  const label = actionLabels[action] || action.toUpperCase();
  
  // Format the placeholder response with multiple paragraphs for testing
  // This demonstrates proper paragraph formatting
  return `[${label}]\n\n${content}\n\nThis is an example of how Madison formats longer content. Each paragraph is properly separated, making the text easy to read and edit.\n\nThe formatting system automatically detects paragraph breaks and structures the content accordingly.`;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT FORMATTING HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format plain text with line breaks into properly structured HTML for Tiptap
 * 
 * Handles:
 * - Double newlines (\n\n) = paragraph breaks
 * - Single newlines (\n) = line breaks within paragraph
 * - Empty lines = paragraph breaks
 * - Preserves existing formatting markers
 * 
 * @param text - Plain text content with line breaks
 * @returns HTML string with proper paragraph structure
 */
function formatContentForEditor(text: string): string {
  if (!text || !text.trim()) {
    return '<p></p>';
  }

  // Normalize line endings
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by double newlines (paragraph breaks)
  // If no double newlines, treat each single newline as a potential paragraph break
  const hasDoubleBreaks = normalized.includes('\n\n');
  
  let paragraphs: string[];
  
  if (hasDoubleBreaks) {
    // Split by double newlines (one or more)
    paragraphs = normalized.split(/\n\n+/);
  } else {
    // For single newlines, check if they're at line boundaries
    // If text has many single newlines, treat them as paragraph breaks
    const lines = normalized.split('\n');
    const singleLineCount = lines.filter(l => l.trim().length > 0 && l.trim().length < 100).length;
    
    // If we have multiple short lines, treat each as a paragraph
    // Otherwise, join with <br> tags
    if (lines.length > 2 && singleLineCount > lines.length * 0.5) {
      paragraphs = lines;
    } else {
      // Single paragraph with line breaks
      const content = lines
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('<br>');
      return `<p>${escapeHtml(content)}</p>`;
    }
  }

  const formattedParagraphs: string[] = [];

  for (const para of paragraphs) {
    const trimmed = para.trim();
    
    // Skip empty paragraphs
    if (!trimmed) {
      continue;
    }

    // Handle single newlines within paragraph (convert to <br>)
    const lines = trimmed.split('\n');
    const content = lines
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join('<br>');

    if (content) {
      formattedParagraphs.push(`<p>${escapeHtml(content)}</p>`);
    }
  }

  // If no paragraphs were created, create one with the original content
  if (formattedParagraphs.length === 0) {
    const escaped = escapeHtml(text.trim());
    return `<p>${escaped}</p>`;
  }

  return formattedParagraphs.join('');
}

/**
 * Escape HTML special characters
 * Works in both browser and Node.js environments
 */
function escapeHtml(text: string): string {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // Fallback for Node.js/server environments
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Handle an inline Madison AI action
 * 
 * This is the single entry point for all AI actions in the editor.
 * It handles:
 * - Detecting selected text vs cursor-only context
 * - Extracting relevant content
 * - Calling the AI resolver
 * - Inserting or replacing content correctly
 * - Preserving undo/redo history
 * 
 * @param action - The type of AI action to perform
 * @param editor - The Tiptap editor instance
 * @param context - Optional additional context
 */
export async function handleMadisonInlineAction(
  action: MadisonInlineAction,
  editor: Editor,
  context?: Partial<MadisonActionContext>
): Promise<MadisonActionResult | null> {
  if (!editor || !editor.isEditable) {
    console.warn('[Madison AI] Editor not available or not editable');
    return null;
  }

  const { state } = editor;
  const { selection } = state;
  const { from, to, empty } = selection;

  // Determine if we have a selection or cursor-only
  const hasSelection = !empty;
  let contentToProcess = '';
  let originalContent = '';

  if (hasSelection) {
    // Extract selected text
    contentToProcess = state.doc.textBetween(from, to, ' ');
    originalContent = contentToProcess;
  } else {
    // For cursor-only context, get the current paragraph
    const $from = selection.$from;
    contentToProcess = $from.parent.textContent;
    originalContent = contentToProcess;
  }

  // Check if action requires selection but none exists
  const actionConfig = MADISON_ACTIONS.find(a => a.action === action);
  if (actionConfig?.requiresSelection && !hasSelection && action !== 'continue') {
    console.log('[Madison AI] Action requires selection, but none provided');
    return null;
  }

  console.log('[Madison AI] Processing action:', {
    action,
    hasSelection,
    contentLength: contentToProcess.length,
    position: from,
  });

  try {
    // Call the AI resolver
    const result = await resolveMadisonAction({
      action,
      content: contentToProcess,
      context: {
        ...context,
        hasSelection,
        cursorPosition: from,
      },
    });

    if (!result || !result.trim()) {
      console.warn('[Madison AI] Empty result from resolver');
      return null;
    }

    // Format the content with proper paragraph structure
    const formattedContent = formatContentForEditor(result);
    
    console.log('[Madison AI] Formatted content:', {
      originalLength: result.length,
      formattedLength: formattedContent.length,
      paragraphCount: (formattedContent.match(/<p>/g) || []).length,
    });

    // Determine replacement mode
    const mode: 'replace' | 'insert' = hasSelection ? 'replace' : 'insert';

    // Apply the formatted result to the editor
    if (mode === 'replace' && hasSelection) {
      // Replace selected content
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContent(formattedContent)
        .run();
    } else {
      // Insert at cursor position
      editor
        .chain()
        .focus()
        .insertContent(formattedContent)
        .run();
    }

    console.log('[Madison AI] Action completed successfully:', {
      action,
      mode,
      resultLength: result.length,
    });

    return {
      content: result,
      mode,
      originalContent,
    };
  } catch (error) {
    console.error('[Madison AI] Action failed:', error);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if an action is available given the current editor state
 */
export function isActionAvailable(
  action: MadisonInlineAction,
  editor: Editor | null
): boolean {
  if (!editor || !editor.isEditable) return false;

  const { empty } = editor.state.selection;
  const hasSelection = !empty;

  const config = MADISON_ACTIONS.find(a => a.action === action);
  if (!config) return false;

  // Continue action is always available
  if (action === 'continue') return true;

  // Other actions require selection
  return !config.requiresSelection || hasSelection;
}

/**
 * Get the current selection context from the editor
 */
export function getSelectionContext(editor: Editor | null): {
  hasSelection: boolean;
  selectedText: string;
  cursorPosition: number;
} {
  if (!editor) {
    return { hasSelection: false, selectedText: '', cursorPosition: 0 };
  }

  const { state } = editor;
  const { selection } = state;
  const { from, to, empty } = selection;

  return {
    hasSelection: !empty,
    selectedText: empty ? '' : state.doc.textBetween(from, to, ' '),
    cursorPosition: from,
  };
}

/**
 * Get actions that are available for the floating menu
 * (Only actions that work with selected text)
 */
export function getFloatingMenuActions(): MadisonActionConfig[] {
  return MADISON_ACTIONS.filter(a => a.requiresSelection);
}

/**
 * Get actions available in the slash command menu
 */
export function getSlashCommandActions(): typeof SLASH_COMMANDS {
  return SLASH_COMMANDS;
}

// Legacy export for backwards compatibility
export type MadisonAction = MadisonInlineAction;

// Legacy function - redirects to new handler
export async function runMadisonInlineAction(
  action: MadisonInlineAction,
  selectedText: string,
  context?: Partial<MadisonActionContext>
): Promise<string> {
  return resolveMadisonAction({ action, content: selectedText, context });
}

/**
 * Check if Madison AI is available and configured
 */
export async function isMadisonAvailable(): Promise<boolean> {
  // TODO: Check actual availability
  // - Verify API keys are configured
  // - Check rate limits
  // - Verify organization has credits
  return true;
}






