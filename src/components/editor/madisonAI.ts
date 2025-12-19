/**
 * Madison Inline AI - Editorial Intelligence for the Editor
 * 
 * This module provides the inline AI capabilities for the Madison Editor.
 * It handles text selection, cursor context, and content replacement.
 * 
 * Architecture:
 * - Single command handler for all AI actions
 * - Connected to generate-with-claude edge function
 * - Clean content replacement with undo support
 * 
 * @module madisonAI
 */

import type { Editor } from '@tiptap/react';
import { supabase } from '@/integrations/supabase/client';

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
// AI RESOLVER - Connected to Claude API
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build the appropriate prompt for each inline action type
 */
function buildActionPrompt(action: MadisonInlineAction, content: string): string {
  const prompts: Record<MadisonInlineAction, string> = {
    refine: `Polish and improve the following text. Make it more eloquent, precise, and impactful while preserving the original meaning and intent. Fix any grammatical issues and enhance clarity:

"${content}"

Return ONLY the refined text with no explanations or preamble.`,

    continue: content.trim() 
      ? `Continue writing from where this text leaves off. Maintain the same voice, tone, and style. Write 2-3 additional paragraphs that flow naturally:

"${content}"

Return ONLY the continuation with no explanations.`
      : `Write an engaging opening paragraph for a piece of content. The writing should be sophisticated and compelling.

Return ONLY the opening text with no explanations.`,

    rewrite: `Completely rewrite the following text with fresh language and structure while preserving the core message. Make it more engaging and effective:

"${content}"

Return ONLY the rewritten text with no explanations.`,

    email: `Transform the following content into a professional email format. Include a compelling subject line and body that's suitable for marketing or customer communication:

"${content}"

Return ONLY the email content (Subject line followed by body) with no explanations.`,

    product: `Transform the following content into an engaging product description. Make it compelling for e-commerce, highlighting benefits and creating desire:

"${content}"

Return ONLY the product description with no explanations.`,

    instagram: `Transform the following content into an Instagram caption. Make it engaging, with appropriate line breaks for readability. Include a call-to-action but NO hashtags:

"${content}"

Return ONLY the caption with no explanations.`,

    shorten: `Make the following text more concise without losing key information. Aim to reduce length by 30-50% while maintaining impact:

"${content}"

Return ONLY the shortened text with no explanations.`,

    expand: `Expand on the following text by adding more detail, context, and depth. Approximately double the length while maintaining quality:

"${content}"

Return ONLY the expanded text with no explanations.`,

    tone: `Adjust the tone of the following text to be more sophisticated and brand-appropriate. Elevate the language while keeping it accessible:

"${content}"

Return ONLY the adjusted text with no explanations.`,
  };

  return prompts[action] || `Process the following text:\n\n"${content}"`;
}

/**
 * Madison AI resolver - calls the generate-with-claude edge function
 * 
 * This function connects inline editor actions to the real Claude API,
 * applying brand context and Madison's editorial expertise.
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
  console.log('[Madison AI] Resolving action:', { action, contentLength: content.length, context });

  try {
    // Build the prompt for this action
    const prompt = buildActionPrompt(action, content);

    // Call the generate-with-claude edge function
    const { data, error } = await supabase.functions.invoke('generate-with-claude', {
      body: {
        prompt,
        organizationId: context?.organizationId,
        mode: 'generate',
        styleOverlay: 'brand-voice',
        contentType: action === 'email' ? 'email' : action === 'instagram' ? 'instagram_caption' : 'blog_post',
      },
    });

    if (error) {
      console.error('[Madison AI] Edge function error:', error);
      throw new Error(error.message || 'Failed to generate content');
    }

    if (!data?.generatedContent) {
      console.error('[Madison AI] No content in response:', data);
      throw new Error('No content received from AI');
    }

    console.log('[Madison AI] Successfully generated content:', {
      action,
      resultLength: data.generatedContent.length,
    });

    return data.generatedContent;
  } catch (error) {
    console.error('[Madison AI] Error resolving action:', error);
  
    // Fallback to a helpful error message that still makes sense in context
    if (action === 'continue') {
      return '\n\n[Madison is thinking... Please try again in a moment.]';
    }
    
    // Re-throw to let the caller handle it
    throw error;
  }
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






