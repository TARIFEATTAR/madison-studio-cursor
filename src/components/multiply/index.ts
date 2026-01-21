/**
 * Multiply Page UX Components
 *
 * Phase 1-3 components for the progressive disclosure redesign.
 * Use feature flags to gradually roll out changes.
 */

// Phase 1: Quick Wins
export { CollapsibleMasterContent } from "./CollapsibleMasterContent";
export { UnifiedGenerateButton } from "./UnifiedGenerateButton";
export { VisualPromptsToggle } from "./VisualPromptsToggle";

// Phase 2: Category Grouping
export { DerivativeCategoryAccordion, DERIVATIVE_CATEGORIES } from "./DerivativeCategoryAccordion";

// Phase 3: AI Guidance
export { MadisonSuggestionCard, DEFAULT_SUGGESTIONS } from "./MadisonSuggestionCard";

// Existing components (re-export for convenience)
export { DerivativeTypeSelector } from "./DerivativeTypeSelector";
export { EditorialDirectorSplitScreen } from "./EditorialDirectorSplitScreen";

/**
 * Feature Flags for Multiply Page Redesign
 *
 * Toggle these to gradually roll out changes:
 * - Phase 1: Collapsed master content, unified generate button, visual toggle
 * - Phase 2: Category accordion grouping (A/B test candidate)
 * - Phase 3: Madison's AI suggestion card
 */
export const MULTIPLY_FEATURE_FLAGS = {
    // Phase 1 - Quick Wins (enable first)
    COLLAPSED_MASTER_CONTENT: true,
    UNIFIED_GENERATE_BUTTON: true,
    VISUAL_PROMPTS_TOGGLE: true,

    // Phase 2 - Category Grouping (A/B test)
    CATEGORY_ACCORDION: true,

    // Phase 3 - AI Guidance
    MADISON_SUGGESTIONS: false,
} as const;
