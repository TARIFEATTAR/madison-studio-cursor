/**
 * MADISON AGENT - Component Exports
 * Proactive creative director behaviors
 *
 * "Perhaps I might be of assistance?"
 */

// Main provider - wrap your app with this
export { AgentContextProvider, useAgent } from './AgentContextProvider';

// Suggestion components
export { AgentSuggestion, InlineSuggestion } from './AgentSuggestion';

// Hook for advanced usage
export { useAgentBehavior } from '@/hooks/useAgentBehavior';

// Re-export types
export type { SuggestionType } from '@/types/librarian';
