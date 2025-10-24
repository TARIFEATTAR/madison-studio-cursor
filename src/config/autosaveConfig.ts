/**
 * Centralized autosave configuration
 * Used across all editors for consistent save timing
 */
export const AUTOSAVE_CONFIG = {
  /**
   * Standard delay for most editors (2 seconds)
   * Triggers after user stops typing
   */
  STANDARD_DELAY: 2000,
  
  /**
   * Aggressive delay for critical content (0.8 seconds)
   * Use for high-value content that must be saved quickly
   */
  AGGRESSIVE_DELAY: 800,
  
  /**
   * Visual feedback delay (0.5 seconds)
   * Shows "Saving..." indicator after this delay
   */
  VISUAL_FEEDBACK_DELAY: 500
} as const;
