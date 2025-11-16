# Library Images Enhancement Build Plan

## Overview
Enhance the Library view to show rich metadata for generated images, matching the detail level of the Prompt Library modal.

## Current State
✅ Generated images auto-save to library with generator tracking
✅ Basic image display in ContentDetailModal
✅ Images show prompt, aspect ratio, and goal type
❌ Missing generator info in library queries
❌ Missing rich metadata display (usage stats, category, generation settings)
❌ No link between library images and their prompt recipes
❌ Inconsistent modal experience between Library and Prompt Library

## Phase 1: Data Layer Updates

### 1.1 Update Library Content Query
**File:** `src/hooks/useLibraryContent.tsx`
- Add `image_generator` to generated_images select query
- Add `generated_image_id` from prompts table (if linking exists)
- Store generator info in LibraryContentItem

### 1.2 Update Library Content Interface
**File:** `src/hooks/useLibraryContent.tsx`
- Add `imageGenerator?: string` to LibraryContentItem type
- Add `promptRecipeId?: string` to link to prompt recipe

## Phase 2: ContentDetailModal Enhancements

### 2.1 Add Generator Information
**File:** `src/components/library/ContentDetailModal.tsx`
- Display generator info (Model: Nano Banana, etc.)
- Show generation settings card (Model, Style, Ratio)
- Format generator name for display

### 2.2 Add Usage Statistics
**File:** `src/components/library/ContentDetailModal.tsx`
- Query prompt table for usage stats if linked
- Display Uses, Rating, Effective, Version stats
- Show "—" if data unavailable

### 2.3 Add Category Badge
**File:** `src/components/library/ContentDetailModal.tsx`
- Import CategoryBadge component
- Extract image_type from additional_context or generated_images
- Display category badge in metadata section

### 2.4 Add "View Recipe" Link
**File:** `src/components/library/ContentDetailModal.tsx`
- Add button to navigate to prompt recipe if linked
- Query prompts table for `generated_image_id` match
- Navigate to Templates page with selected prompt

## Phase 3: Enhanced Image Detail View

### 3.1 Two-Column Layout Option
**File:** `src/components/library/ContentDetailModal.tsx`
- For visual assets, consider two-column layout (image left, metadata right)
- Match PromptDetailModal design for consistency
- Make it optional based on content type

### 3.2 Metadata Cards
**File:** `src/components/library/ContentDetailModal.tsx`
- Prompt Card (with copy button)
- Generation Settings Card
- Usage Statistics Card
- Category Card
- Created Card

## Phase 4: Integration & Linking

### 4.1 Link Library Images to Prompt Recipes
**File:** `src/pages/Library.tsx`
- When opening ContentDetailModal, check if prompt recipe exists
- Query: `SELECT * FROM prompts WHERE generated_image_id = image.id`
- Pass prompt recipe data to modal

### 4.2 Navigate to Prompt Library
**File:** `src/components/library/ContentDetailModal.tsx`
- Add "View in Prompt Library" button
- Navigate to `/templates` with prompt ID
- Open PromptDetailModal automatically

## Phase 5: Consistency & UX

### 5.1 Unify Modal Experience
- Consider using PromptDetailModal for library images when prompt recipe exists
- Fall back to ContentDetailModal for images without recipes
- Ensure consistent styling and functionality

### 5.2 Loading States
- Add loading states for fetching prompt recipe links
- Handle cases where prompt doesn't exist gracefully

## Testing Checklist

- [ ] Generated images show generator info in library
- [ ] ContentDetailModal displays all metadata correctly
- [ ] Category badges appear for library images
- [ ] "View Recipe" button works when prompt exists
- [ ] Navigation to Prompt Library works correctly
- [ ] Images without recipes still display properly
- [ ] No breaking changes to existing library functionality

## Files to Modify

1. `src/hooks/useLibraryContent.tsx` - Add image_generator to query
2. `src/components/library/ContentDetailModal.tsx` - Enhance metadata display
3. `src/pages/Library.tsx` - Pass additional data to modal
4. `src/components/prompt-library/PromptDetailModal.tsx` - Potentially reuse for library

## Estimated Effort
- Phase 1: 30 minutes
- Phase 2: 1-2 hours
- Phase 3: 1 hour
- Phase 4: 1 hour
- Phase 5: 30 minutes
- **Total: 4-5 hours**

