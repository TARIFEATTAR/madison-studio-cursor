/**
 * Madison Editor - Module Exports
 * 
 * Tiptap-based rich text editor with inline AI for Madison Studio
 */

// Main editor component
export { 
  MadisonEditor, 
  getEditorContent, 
  getEditorText, 
  setEditorContent 
} from './MadisonEditor';

// Sub-components
export { FloatingToolbar } from './FloatingToolbar';
export { SlashCommandMenu } from './SlashCommandMenu';

// AI utilities and types
export { 
  // Main handler
  handleMadisonInlineAction,
  // Placeholder resolver
  resolveMadisonAction,
  // Utility functions
  isActionAvailable,
  getSelectionContext,
  getFloatingMenuActions,
  getSlashCommandActions,
  isMadisonAvailable,
  // Legacy compatibility
  runMadisonInlineAction,
  // Constants
  MADISON_ACTIONS,
  SLASH_COMMANDS,
} from './madisonAI';

// Type exports
export type { 
  MadisonInlineAction,
  MadisonAction,
  MadisonActionContext,
  MadisonActionResult,
  MadisonActionConfig,
} from './madisonAI';


















