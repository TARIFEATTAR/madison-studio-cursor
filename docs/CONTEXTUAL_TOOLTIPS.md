# Contextual Tooltips & Guided Tours

## Overview

The contextual tooltip system provides **guided tours** that automatically appear when users complete checklist tasks and navigate to relevant pages. This creates a seamless onboarding experience that teaches users how to use features in context.

---

## How It Works

### 1. **User Flow**
1. User completes a task in the Getting Started Checklist (e.g., "Explore Your Library")
2. User navigates to the relevant page (e.g., `/library`)
3. A contextual tooltip automatically appears, highlighting a specific UI element
4. Tooltip provides helpful information and guides the user
5. User dismisses the tooltip or completes the suggested action
6. Tooltip is marked as "shown" and won't appear again

### 2. **Components**

#### **ContextualTooltip** (`src/components/onboarding/ContextualTooltip.tsx`)
The core tooltip component that:
- Finds and highlights target elements using CSS selectors
- Shows a beautiful tooltip card with title, description, and actions
- Creates a spotlight effect on the target element
- Handles positioning (top, bottom, left, right)
- Manages show-once behavior via localStorage

#### **useOnboardingTooltips** (`src/hooks/useOnboardingTooltips.tsx`)
A hook that:
- Defines all tooltip steps in the onboarding tour
- Monitors route changes and checklist progress
- Determines which tooltip should be shown
- Manages tooltip state and dismissal

#### **OnboardingTooltipProvider** (`src/components/onboarding/OnboardingTooltipProvider.tsx`)
A provider component that:
- Wraps the entire app
- Renders the active tooltip
- Handles tooltip lifecycle

---

## Configuration

### Adding New Tooltips

Edit `src/hooks/useOnboardingTooltips.tsx` and add to the `tooltipSteps` array:

```typescript
{
  id: "unique_tooltip_id",
  route: "/page-route", // Which page to show on
  targetSelector: '[data-tooltip-target="element-id"]', // CSS selector
  title: "Tooltip Title",
  description: "Helpful description of what this element does",
  position: "bottom", // top, bottom, left, or right
  triggerOnChecklistTask: "checklist_task_id", // Optional: which task triggers this
  action: { // Optional: action button
    label: "Try It Now",
    onClick: () => {
      // Custom action
    }
  }
}
```

### Adding Target Elements

Add `data-tooltip-target` attributes to UI elements you want to highlight:

```tsx
<Select>
  <SelectTrigger data-tooltip-target="content-type-filter">
    <SelectValue placeholder="All Types" />
  </SelectTrigger>
</Select>
```

---

## Current Tooltip Tour

### 1. **Library - Content Type Filter**
- **Trigger:** User completes "Explore Your Library" checklist task
- **Route:** `/library`
- **Target:** Content type dropdown filter
- **Message:** "Click this dropdown to see how your content is organized by type..."

### 2. **Library - Search**
- **Trigger:** User completes "Explore Your Library" checklist task
- **Route:** `/library`
- **Target:** Search input
- **Message:** "Use the search bar to quickly find any piece of content..."

### 3. **Calendar - Schedule Button**
- **Trigger:** User completes "Schedule a Post" checklist task
- **Route:** `/calendar`
- **Target:** Schedule button
- **Message:** "Click here to schedule a post for publishing..."

### 4. **Brand Builder - Brand Voice**
- **Trigger:** User completes "Customize Your Brand" checklist task
- **Route:** `/brand-builder`
- **Target:** Brand voice section
- **Message:** "Customize your brand's tone, style, and personality..."

### 5. **Multiply - Master Content**
- **Trigger:** User completes "Try Content Multiplication" checklist task
- **Route:** `/multiply`
- **Target:** Master content selector
- **Message:** "Choose a piece of content to multiply into different formats..."

---

## Features

### ✨ **Spotlight Effect**
- Darkens the entire screen except the highlighted element
- Pulsing glow animation draws attention
- Creates a "tutorial mode" feel

### 🎯 **Smart Positioning**
- Automatically positions tooltip relative to target element
- Supports top, bottom, left, right positions
- Arrow pointer indicates which element is being highlighted

### 💾 **Persistent State**
- Tooltips only show once per user
- State stored in localStorage
- Won't annoy returning users

### 🔄 **Context-Aware**
- Only shows on relevant pages
- Triggered by checklist completion
- Respects user's current location

### ⌨️ **Keyboard Accessible**
- ESC to dismiss
- Tab navigation
- Screen reader friendly

---

## Styling

### Colors & Theme
- Uses Madison Studio's design system
- Primary color for highlights (`#B8956A`)
- Backdrop blur for modern feel
- Smooth animations

### Animations
- Fade in/slide in entrance
- Pulsing spotlight effect
- Smooth transitions

---

## Technical Details

### Dependencies
- React hooks (useState, useEffect)
- React Router (useLocation)
- Lucide React icons
- Tailwind CSS
- shadcn/ui components

### Performance
- Lazy element finding with retry logic
- Cleanup on unmount
- Minimal re-renders
- Efficient DOM queries

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Touch-friendly

---

## Usage Examples

### Basic Tooltip
```tsx
<ContextualTooltip
  id="my-tooltip"
  targetSelector='[data-tooltip-target="my-element"]'
  title="Welcome!"
  description="This is a helpful tooltip"
  position="bottom"
  onDismiss={() => console.log("Dismissed")}
  onComplete={() => console.log("Completed")}
/>
```

### With Action Button
```tsx
<ContextualTooltip
  id="action-tooltip"
  targetSelector='[data-tooltip-target="button"]'
  title="Try This Feature"
  description="Click the button to see what happens"
  position="right"
  action={{
    label: "Try It Now",
    onClick: () => {
      // Trigger the feature
    }
  }}
  onDismiss={() => {}}
  onComplete={() => {}}
/>
```

---

## Best Practices

### 1. **Keep It Simple**
- Short, clear titles (< 5 words)
- Concise descriptions (< 2 sentences)
- One tooltip at a time

### 2. **Be Contextual**
- Show tooltips when users need them
- Trigger based on user actions
- Don't interrupt critical workflows

### 3. **Provide Value**
- Teach something new
- Highlight non-obvious features
- Guide users to success

### 4. **Respect Users**
- Show once and remember
- Easy to dismiss
- Don't block critical UI

---

## Future Enhancements

### Potential Improvements:
1. **Multi-step Tours** - Sequential tooltips for complex features
2. **Video Tutorials** - Embed short videos in tooltips
3. **Interactive Demos** - Let users try features in a sandbox
4. **Analytics** - Track which tooltips are most helpful
5. **A/B Testing** - Test different tooltip copy
6. **Personalization** - Show different tooltips based on user role
7. **Progress Tracking** - Show "2 of 5 tips completed"
8. **Skip All** - Let users skip entire tour

---

## Troubleshooting

### Tooltip Not Appearing?
1. Check if target element exists on page
2. Verify `data-tooltip-target` attribute is correct
3. Check if tooltip was already shown (clear localStorage)
4. Ensure user completed the trigger task

### Tooltip Positioning Wrong?
1. Check target element's position
2. Try different position prop (top/bottom/left/right)
3. Ensure target element is visible
4. Check for CSS conflicts

### Tooltip Showing Multiple Times?
1. Check localStorage for tooltip state
2. Verify `showOnce` prop is true
3. Clear browser cache

---

## Testing

### Manual Testing Checklist:
- [ ] Tooltip appears when task is completed
- [ ] Tooltip highlights correct element
- [ ] Tooltip positions correctly
- [ ] Tooltip can be dismissed
- [ ] Tooltip doesn't show again after dismissal
- [ ] Tooltip works on mobile
- [ ] Tooltip is keyboard accessible
- [ ] Multiple tooltips don't overlap

### Testing in Development:
```javascript
// Clear all tooltip state
Object.keys(localStorage)
  .filter(key => key.startsWith('tooltip_shown_'))
  .forEach(key => localStorage.removeItem(key));

// Reload page to see tooltips again
```

---

## Maintenance

### Adding New Tooltips:
1. Add target element with `data-tooltip-target` attribute
2. Add tooltip configuration to `useOnboardingTooltips.tsx`
3. Test on relevant page
4. Update this documentation

### Removing Tooltips:
1. Remove from `tooltipSteps` array
2. Remove `data-tooltip-target` attribute
3. Update documentation

---

**Last Updated:** November 24, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
