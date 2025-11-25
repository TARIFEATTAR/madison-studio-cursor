# Bug Tracking & Fix Roadmap

## Overview
This document tracks all identified bugs and their resolution status across the Madison Studio application. Bugs are categorized by severity and grouped into implementation phases.

---

## Severity Levels
- **S1 (Critical)**: App-breaking, data loss, security issues, major UX failures
- **S2 (High)**: Significant UX degradation, performance issues, incorrect behavior
- **S3 (Medium)**: Minor UX issues, cosmetic bugs, edge cases
- **S4 (Low)**: Nice-to-have improvements, cleanup tasks

---

## Phase 1: Critical Navigation & Stability ✅ COMPLETED

### BUG-001: Navigation Full Reload (S1) ✅ FIXED
- **Area**: Routing / Index Page
- **Repro Steps**: 
  1. Load app while unauthenticated
  2. Wait for loading timeout (3 seconds)
  3. Observe full page reload instead of client-side navigation
- **Expected**: Client-side navigation using React Router
- **Actual**: Full page reload with `window.location.href = '/'`
- **Root Cause**: Index.tsx line 19 used `window.location.href` instead of `navigate()`
- **Fix**: Replaced with `navigate('/')` to maintain SPA behavior
- **Files Touched**: `src/pages/Index.tsx`
- **Status**: ✅ Fixed

### BUG-003: No Route-Level Error Boundaries (S1) ✅ FIXED
- **Area**: Error Handling / App Shell
- **Repro Steps**: 
  1. Navigate to any route
  2. Trigger a component error (e.g., null reference)
  3. Entire app crashes with blank screen
- **Expected**: Isolated error with route-specific fallback and recovery options
- **Actual**: Global error boundary shows generic error for entire app
- **Root Cause**: Only one global ErrorBoundary in App.tsx; no per-route isolation
- **Fix**: Created `RouteErrorBoundary` component and wrapped all protected routes
- **Files Touched**: `src/App.tsx`
- **Tests Added**: Manual testing of error states per route
- **Status**: ✅ Fixed

### BUG-004: Regression Verification (Editor + Multiply) ✅ VERIFIED
- **Area**: Editor Page & Multiply Page
- **Tests**:
  - ✅ Editor: Rapid typing (100+ chars) → caret stays at end
  - ✅ Editor: Bold/Italic/Underline → caret stable
  - ✅ Editor: Multi-line paste → caret stable
  - ✅ Editor: Autosave (800ms debounce) → no cursor jumps
  - ✅ Editor: Undo/Redo 5x → caret position correct
  - ✅ Editor: IME composition (Chinese/Japanese) → no jumps
  - ✅ Multiply: Generate derivatives → content appears in correct boxes
  - ✅ Multiply: Editorial Director → caret stable during edits
- **Status**: ✅ Verified stable

---

## Phase 2: Forms & State Management (NEXT PRIORITY)

### BUG-002: Array Index as React Keys (S2) 🔴 OPEN
- **Area**: Multiple components (16 files)
- **Repro Steps**: 
  1. Navigate to any page with lists (Calendar, Chat, Forms)
  2. Add/remove/reorder items
  3. Observe incorrect rendering, lost state, or focus issues
- **Expected**: Stable keys that persist across re-renders
- **Actual**: Using `index` as key causes remounting and state loss
- **Root Cause**: Common anti-pattern in React; index changes when items reorder
- **Fix Plan**: 
  - **High Priority**: Calendar events, chat messages, editable form lists
  - **Medium Priority**: Static displays (settings tabs, documentation)
  - Use stable IDs (UUIDs, database IDs, or generated unique keys)
- **Files Affected**:
  - `src/components/calendar/TasksList.tsx`
  - `src/components/calendar/MonthView.tsx`
  - `src/components/assistant/EditorialAssistant.tsx`
  - `src/components/forge/ProductSelector.tsx`
  - `src/components/library/ContentGrid.tsx`
  - `src/components/multiply/DerivativeGridCard.tsx`
  - `src/components/prompt-library/PromptFilterCards.tsx`
  - `src/components/settings/ProductsTab.tsx`
  - 8+ additional files (see audit notes)
- **Tests Needed**: 
  - Playwright: Reorder calendar tasks, verify state persists
  - Unit: Key stability across add/remove operations
- **Status**: 🔴 Open

### BUG-005: Multiply Page Component Size (S2) 🔴 OPEN
- **Area**: Performance / Code Organization
- **Repro Steps**: 
  1. Open `src/pages/Multiply.tsx`
  2. Observe 900+ lines of code in single component
- **Expected**: Modular components under 300 lines each
- **Actual**: Monolithic component with complex state, hard to maintain
- **Root Cause**: No decomposition; all logic in one file
- **Fix Plan**: 
  - Extract `DerivativeTypeSelector` component
  - Extract `MasterContentPanel` component
  - Extract `DerivativeGenerationPanel` component
  - Move derivative logic to custom hooks (`useDerivativeGeneration`)
- **Files to Create**: 
  - `src/components/multiply/DerivativeTypeSelector.tsx`
  - `src/components/multiply/MasterContentPanel.tsx`
  - `src/components/multiply/DerivativeGenerationPanel.tsx`
  - `src/hooks/useDerivativeGeneration.ts`
- **Status**: 🔴 Open

### BUG-006: Inconsistent Autosave Debounce (S3) 🔴 OPEN
- **Area**: State Management / UX Consistency
- **Repro Steps**: 
  1. Compare autosave timing across Editor, Multiply, and other pages
  2. Observe different debounce values (800ms, 500ms, 1000ms)
- **Expected**: Consistent autosave timing across all editors
- **Actual**: Inconsistent UX; users unsure when content is saved
- **Root Cause**: No centralized configuration; ad-hoc values per component
- **Fix Plan**: 
  - Create `src/config/autosaveConfig.ts` with standard intervals
  - Update `useAutoSave` hook to use central config
  - Add visual feedback (last saved timestamp)
- **Files to Touch**: 
  - `src/config/autosaveConfig.ts` (new)
  - `src/hooks/useAutoSave.ts`
  - `src/pages/ContentEditor.tsx`
  - `src/pages/Multiply.tsx`
- **Status**: 🔴 Open

---

## Phase 3: Performance & Accessibility (PLANNED)

### PERF-001: Unnecessary Re-renders (S3) 🔵 PLANNED
- **Area**: Performance
- **Investigation Needed**: 
  - Audit `useEffect` dependencies for stale closures
  - Identify missing `useMemo` / `useCallback` for expensive computations
  - Check prop-drilling causing cascade re-renders
- **Tools**: React DevTools Profiler, Why Did You Render
- **Status**: 🔵 Planned

### A11Y-001: Focus Management Audit (S3) 🔵 PLANNED
- **Area**: Accessibility
- **Investigation Needed**: 
  - Verify focus trap in modals (Dialog, Sheet, Drawer)
  - Ensure ESC key dismisses overlays consistently
  - Check aria-labels on all interactive elements
  - Test keyboard navigation (Tab/Shift+Tab cycles)
- **Tools**: axe DevTools, manual keyboard testing
- **Status**: 🔵 Planned

---

## Phase 4: Automated Testing (PLANNED)

### TEST-001: Playwright E2E Suite (S2) 🔵 PLANNED
- **Coverage Needed**: 
  - Editor: Typing, paste, IME, autosave, undo/redo, toolbar actions
  - Multiply: Derivative generation, rendering, modal interactions
  - Auth: Sign up, sign in, password reset, session persistence
  - Navigation: Route changes, back/forward, deep linking
- **Status**: 🔵 Planned

### TEST-002: Unit Tests for Critical Utils (S3) 🔵 PLANNED
- **Coverage Needed**: 
  - Selection utilities (`getNodePath`, `restoreSelection`)
  - Debounce/autosave hooks
  - Derivative mapping logic
  - Form validation helpers
- **Status**: 🔵 Planned

---

## Regression Anchors (Must Never Return)

### 🎯 Editor Cursor Jumping
- **Fixed**: 2025-01-XX
- **Prevention**: 
  - Selection save/restore utilities in place
  - `innerHTML` assignments guarded
  - Composition events handled
  - Autosave read-only (non-destructive)
- **Tests**: Manual QA checklist completed ✅

### 🎯 Multiply Derivative Rendering
- **Fixed**: 2025-01-XX
- **Prevention**: 
  - Derivative content mapping verified
  - No race conditions in state updates
  - Error boundaries catch silent failures
- **Tests**: Manual QA checklist completed ✅

---

## How to Use This Document

1. **Before Starting Work**: Review open bugs in current phase
2. **During Development**: Update status and add findings
3. **After Fixing**: Mark ✅ and add verification notes
4. **Weekly Review**: Triage new bugs, reprioritize phases

---

## Status Legend
- 🔴 **Open**: Not started
- 🟡 **In Progress**: Actively being worked on
- ✅ **Fixed**: Completed and verified
- 🔵 **Planned**: Scoped but not yet started
- ⏸️ **Deferred**: Low priority, revisit later

---

**Last Updated**: 2025-01-XX  
**Next Review**: Phase 2 kickoff
