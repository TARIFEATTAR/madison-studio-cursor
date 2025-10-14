# PolyMet Export - Phase 3: Interactions & Transitions

## Overview
This document exports the Scriptora sidebar interaction patterns, animations, transitions, and responsive behaviors. It builds upon Phase 1 (Layout & Structure) and Phase 2 (Navigation Items).

---

## 1. NATURAL LANGUAGE UI SPECIFICATION

### Core Interaction Patterns

#### Sidebar State Management
**Component:** SidebarProvider (Context Provider)
- **States:** "expanded" | "collapsed"
- **Desktop Default:** Expanded (240px width)
- **Mobile Default:** Collapsed (overlay mode)
- **Persistence:** Cookie-based (`sidebar:state`, 7-day expiration)
- **Toggle Method:** `toggleSidebar()` function

#### State Variables
```typescript
{
  state: "expanded" | "collapsed",
  open: boolean,              // Desktop expanded state
  setOpen: (open: boolean) => void,
  openMobile: boolean,        // Mobile overlay state
  setOpenMobile: (open: boolean) => void,
  isMobile: boolean,          // Viewport detection
  toggleSidebar: () => void   // Universal toggle function
}
```

---

## 2. DESKTOP INTERACTIONS

### Collapse/Expand Transition
**Component:** Sidebar (Desktop)

#### Expanded → Collapsed
**Trigger:** Click collapse button (brass gradient button with ChevronLeft icon)

**Visual Transition:**
1. **Width Animation:**
   - From: 240px (`--sidebar-width`)
   - To: 56px (`--sidebar-width-icon`)
   - Duration: 200ms
   - Easing: `ease-linear`
   - Property: `transition-[width] duration-200 ease-linear`

2. **Content Changes:**
   - Logo scales down: 64px → 48px (200ms transition)
   - Brand text fades out: `opacity: 1 → 0` (immediate)
   - Navigation labels hide: Display removed
   - Navigation icons remain: Centered in 48px container
   - User info hides: Name & email removed
   - Sign out button hides: Only settings remains
   - Collapse button hides: Replaced by expand trigger

3. **Layout Adjustments:**
   - Left border on active items: Still visible (4px brass)
   - Icon centering: Icons automatically center via flexbox
   - Padding adjusts: Items become h-12 fixed height

**CSS Classes Applied:**
```tsx
className={`${open ? 'w-16 h-16' : 'w-12 h-12'} transition-all duration-200`}
```

#### Collapsed → Expanded
**Trigger:** Click expand trigger (SidebarTrigger, full-width button in collapsed header)

**Visual Transition:**
1. **Width Animation:**
   - From: 56px
   - To: 240px
   - Duration: 200ms
   - Easing: `ease-linear`

2. **Content Changes:**
   - Logo scales up: 48px → 64px
   - Brand text fades in: Appears immediately when width allows
   - Navigation labels appear: Display when width > threshold
   - User info appears: Name & email visible
   - Sign out button appears
   - Expand trigger replaced by collapse button

**Conditional Rendering Logic:**
```tsx
{open && (
  <div className="flex-1 min-w-0">
    {/* Content shown only when expanded */}
  </div>
)}

{!open && (
  <div className="px-2 pb-4">
    {/* Content shown only when collapsed */}
  </div>
)}
```

---

## 3. MOBILE INTERACTIONS

### Mobile Overlay Behavior
**Component:** Sheet (Radix UI Sheet/Dialog primitive)

#### Opening Mobile Sidebar
**Triggers:**
- Click hamburger menu button (top-left in mobile header)
- Keyboard shortcut: `Cmd/Ctrl + B`

**Visual Transition:**
1. **Overlay Appearance:**
   - Background overlay fades in: `rgba(0,0,0,0) → rgba(0,0,0,0.5)`
   - Duration: 200ms
   - Easing: Default Sheet animation

2. **Sidebar Slide-In:**
   - From: `-288px` (offscreen left, `SIDEBAR_WIDTH_MOBILE`)
   - To: `0px` (visible)
   - Duration: 200ms
   - Easing: `ease-out`
   - Width: 288px (18rem, `--sidebar-width-mobile`)

3. **Content State:**
   - Sidebar shows in **expanded state only** on mobile
   - No collapsed mini-sidebar on mobile
   - Full 288px width with all labels visible
   - Background: Pure black `#0A0A0A`

**Mobile Sheet Configuration:**
```tsx
<Sheet open={openMobile} onOpenChange={setOpenMobile}>
  <SheetContent
    data-sidebar="sidebar"
    data-mobile="true"
    className="w-[--sidebar-width] bg-black text-white border-none p-0"
    style={{ "--sidebar-width": SIDEBAR_WIDTH_MOBILE }}
    side="left"
  >
    {children}
  </SheetContent>
</Sheet>
```

#### Closing Mobile Sidebar
**Triggers:**
- Click any navigation item (auto-close on navigate)
- Click outside sidebar (overlay click)
- Swipe left gesture (handled by Sheet component)
- Press Escape key
- Click hamburger menu button again

**Visual Transition:**
1. **Sidebar Slide-Out:**
   - From: `0px`
   - To: `-288px` (offscreen left)
   - Duration: 200ms
   - Easing: `ease-in`

2. **Overlay Disappearance:**
   - Background fades out: `rgba(0,0,0,0.5) → rgba(0,0,0,0)`
   - Duration: 200ms

**Auto-Close Logic (Navigation Items):**
```tsx
<NavLink to={item.url} onClick={() => isMobile && toggleSidebar()}>
  {/* Navigation content */}
</NavLink>
```

---

## 4. RESPONSIVE BREAKPOINTS

### Viewport Detection
**Hook:** `useIsMobile()`
- **Breakpoint:** 768px (Tailwind `md:` breakpoint)
- **Mobile:** `< 768px`
- **Desktop:** `≥ 768px`

### Desktop Layout (≥768px)
**Behavior:**
- Persistent sidebar (visible by default)
- Collapsible to icon-only (56px mini-sidebar)
- Fixed position on left side
- Does not overlay content
- Content area adjusts for sidebar width
- Sidebar state persists via cookie

**CSS Classes:**
```tsx
className="group peer hidden text-sidebar-foreground md:block"
```

### Mobile Layout (<768px)
**Behavior:**
- Sidebar hidden by default
- Hamburger menu button in fixed header
- Sidebar appears as overlay (Sheet component)
- Always expanded when open (no collapsed state)
- Click navigation closes sidebar automatically
- No cookie persistence (always closed on page load)

**Mobile Header:**
```tsx
{isMobile && (
  <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-ink-black to-charcoal border-b border-aged-brass/20">
    <button onClick={toggleSidebar}>
      <Menu className="w-6 h-6" />
    </button>
    <img src="/logo.png" className="h-8" />
  </header>
)}
```

### Responsive Content Padding
**Mobile:** Content has top padding to account for fixed header
```tsx
className={`${isMobile ? 'pt-16' : ''} min-h-screen`}
```

---

## 5. KEYBOARD SHORTCUTS

### Global Keyboard Shortcut
**Shortcut:** `Cmd + B` (Mac) or `Ctrl + B` (Windows/Linux)
- **Action:** Toggle sidebar (expand/collapse desktop, open/close mobile)
- **Scope:** Global (works anywhere in app)
- **Implementation:** Event listener on window

**Code Implementation:**
```tsx
React.useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      toggleSidebar();
    }
  };
  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [toggleSidebar]);
```

### Future Keyboard Navigation (Not Implemented)
**Recommended:**
- `Tab` / `Shift+Tab`: Navigate between menu items
- `Enter` / `Space`: Activate focused item
- `Arrow Up` / `Arrow Down`: Navigate menu items
- `Escape`: Close mobile sidebar

---

## 6. ANIMATION SPECIFICATIONS

### Transition Properties
```css
/* Sidebar Width Transition (Desktop) */
transition-[width] duration-200 ease-linear

/* Sidebar Position Transition (Desktop Offcanvas) */
transition-[left,right,width] duration-200 ease-linear

/* Logo Scale Transition */
transition-all duration-200

/* Button Hover/Focus Transitions */
transition-all duration-200
transition-colors duration-200

/* Navigation Item State Transitions */
transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
```

### Keyframe Animations (Available but Not Used)
**Available in Tailwind Config:**
- `accordion-down`: Height expand with opacity
- `accordion-up`: Height collapse with opacity
- `fade-in`: Opacity + translateY (10px)
- `fade-out`: Opacity + translateY (-10px)
- `scale-in`: Scale + opacity
- `modal-fade-in`: Combined scale + translateY + opacity

**Usage (if needed for future enhancements):**
```tsx
className="animate-fade-in"
className="animate-scale-in"
```

### Easing Curves
**All Transitions Use:**
- `ease-linear`: Sidebar width changes (consistent speed)
- `cubic-bezier(0.4, 0, 0.2, 1)`: Animations (smooth start/end)

---

## 7. HOVER & FOCUS STATES

### Navigation Item Hover
**Desktop & Mobile:**
```tsx
className="hover:text-aged-brass hover:bg-white/5 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]"
```

**Visual Changes:**
- Text color: `white/60%` → `#B8956A`
- Icon color: `white/60%` → `#B8956A`
- Background: `transparent` → `rgba(255,255,255,0.05)`
- Shadow: None → `drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]`
- Duration: 200ms
- Easing: Default (ease)

### Button Hover (Collapse/Settings/Sign Out)
**Collapse Button:**
```tsx
className="group-hover:brightness-110"
```
- Brightness: `100%` → `110%`
- Transition: 200ms

**Settings Button:**
```tsx
className="hover:text-aged-brass hover:bg-white/5 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]"
```

**Sign Out Button:**
```tsx
className="hover:text-red-400 hover:bg-white/5"
```

### Focus States
**Current Implementation:**
- Default browser focus outline
- Ring color: `--ring` (aged-brass)

**Recommended Enhancement:**
```tsx
className="focus-visible:ring-2 focus-visible:ring-aged-brass focus-visible:ring-offset-2"
```

---

## 8. TOUCH GESTURES (MOBILE)

### Swipe Gesture
**Component:** Sheet (Radix UI handles this)
- **Direction:** Swipe left (from right edge of sidebar)
- **Action:** Close sidebar
- **Threshold:** ~50px swipe distance
- **Velocity:** Minimum velocity threshold
- **Visual Feedback:** Sidebar follows finger during drag

### Tap Behavior
**Navigation Items:**
- Single tap: Navigate + close sidebar
- No double-tap required
- Touch target: Full 48px height (accessibility compliant)

**Overlay Tap:**
- Tap outside sidebar: Close sidebar
- Tap on overlay background: Close sidebar

---

## 9. PERSISTENT STATE

### Cookie Management
**Cookie Name:** `sidebar:state`
**Max Age:** 604,800 seconds (7 days)
**Scope:** Path `/` (entire application)

**Set Cookie (Desktop Only):**
```typescript
document.cookie = `sidebar:state=${openState}; path=/; max-age=604800`;
```

**State Values:**
- `true`: Sidebar expanded
- `false`: Sidebar collapsed

**Mobile Behavior:**
- Cookie is NOT set for mobile
- Mobile sidebar always starts closed
- No persistence across page loads

**Read Cookie on Load:**
```typescript
const [_open, _setOpen] = React.useState(defaultOpen);
// defaultOpen can be read from cookie on initial load
```

---

## 10. Z-INDEX LAYERING

### Desktop Sidebar
```tsx
className="fixed inset-y-0 z-10"
```
- **Z-Index:** 10
- **Position:** Fixed left
- **Purpose:** Stays above content but below modals

### Mobile Header
```tsx
className="fixed top-0 left-0 right-0 z-40"
```
- **Z-Index:** 40
- **Position:** Fixed top
- **Purpose:** Stays above sidebar overlay

### Mobile Sidebar Overlay
**Sheet Background:** Managed by Radix UI (typically z-50)
**Sheet Content:** Managed by Radix UI (typically z-50)

**Layering Order (Bottom to Top):**
1. Page content (z-0)
2. Desktop sidebar (z-10)
3. Mobile header (z-40)
4. Mobile overlay background (z-50)
5. Mobile sidebar content (z-50)

---

## 11. ACCESSIBILITY FEATURES

### ARIA Attributes
**Current Implementation:**
```tsx
aria-label="Open menu"        // Mobile menu button
aria-label="Collapse sidebar" // Collapse button
aria-label="Toggle Sidebar"   // SidebarTrigger
```

**Screen Reader Text:**
```tsx
<span className="sr-only">Toggle Sidebar</span>
```

### Focus Management
- Default browser focus handling
- Keyboard shortcut (`Cmd/Ctrl + B`) announced to screen readers
- NavLink components provide semantic navigation

### Color Contrast
**Checked Against WCAG AA:**
- Inactive text (white/60%) on black: ✅ Pass
- Active text (white) on black: ✅ Pass
- Aged brass (#B8956A) on black: ✅ Pass
- Aged brass (#B8956A) on white/5% background: ✅ Pass

### Touch Targets
**Mobile:**
- All interactive elements: Minimum 48px height
- Navigation items: 48px height in collapsed state
- Buttons: Minimum 40px × 40px (user avatar, settings)

---

## 12. DESIGN TOKENS

### Widths
```typescript
SIDEBAR_WIDTH:        "16rem"  // 256px - Desktop expanded
SIDEBAR_WIDTH_MOBILE: "18rem"  // 288px - Mobile overlay
SIDEBAR_WIDTH_ICON:   "3rem"   // 48px - Desktop collapsed
```

### Durations
```typescript
Sidebar Width:        200ms
Logo Scale:           200ms
Hover States:         200ms
Mobile Slide:         200ms (Sheet default)
Overlay Fade:         200ms (Sheet default)
```

### Easing Functions
```typescript
Sidebar:              ease-linear
Animations:           cubic-bezier(0.4, 0, 0.2, 1)
Hover:                ease (default)
```

### Shadows
```typescript
Brass Glow (Hover):   drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
Collapse Button:      2px 2px 6px rgba(0,0,0,0.3)
```

---

## 13. REACT + TAILWIND CODE

### SidebarProvider Setup
```tsx
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          {/* Page content */}
        </main>
      </div>
    </SidebarProvider>
  );
}
```

### Toggle Sidebar Function
```tsx
import { useSidebar } from "@/components/ui/sidebar";

const { open, toggleSidebar, isMobile } = useSidebar();

// Desktop: Collapse/expand
// Mobile: Open/close overlay
<button onClick={toggleSidebar}>Toggle</button>
```

### Responsive Conditional Rendering
```tsx
// Show different content based on sidebar state
{open && (
  <div className="flex-1 min-w-0">
    {/* Expanded state content */}
  </div>
)}

{!open && (
  <div className="px-2 pb-4">
    {/* Collapsed state content */}
  </div>
)}

// Show different layout based on viewport
{isMobile && (
  <header className="fixed top-0 h-16">
    {/* Mobile header */}
  </header>
)}
```

### Auto-Close on Mobile Navigation
```tsx
<NavLink 
  to={item.url} 
  onClick={() => isMobile && toggleSidebar()}
>
  {/* Navigation item content */}
</NavLink>
```

---

## 14. INTERACTION FLOW DIAGRAMS

### Desktop Collapse Flow
```
User clicks collapse button
  ↓
toggleSidebar() called
  ↓
setOpen(false) executed
  ↓
Cookie set: sidebar:state=false
  ↓
Sidebar width transitions: 240px → 56px (200ms)
  ↓
Logo scales: 64px → 48px (200ms)
  ↓
Text content hidden (conditional rendering)
  ↓
Icons centered in 48px containers
```

### Mobile Open Flow
```
User clicks hamburger menu
  ↓
toggleSidebar() called
  ↓
setOpenMobile(true) executed
  ↓
Sheet overlay fades in (200ms)
  ↓
Sidebar slides in from left: -288px → 0px (200ms)
  ↓
Sidebar visible at full 288px width
  ↓
Body scroll locked (Sheet behavior)
```

### Mobile Navigate & Close Flow
```
User taps navigation item
  ↓
NavLink onClick fires
  ↓
isMobile check: true
  ↓
toggleSidebar() called
  ↓
setOpenMobile(false) executed
  ↓
Sidebar slides out: 0px → -288px (200ms)
  ↓
Overlay fades out (200ms)
  ↓
React Router navigates to new route
  ↓
Body scroll restored
```

---

## 15. TESTING CHECKLIST

### Desktop Interactions
- [ ] Click collapse button → Sidebar collapses to 56px
- [ ] Click expand trigger → Sidebar expands to 240px
- [ ] Width transition smooth (200ms ease-linear)
- [ ] Logo scales correctly (64px ↔ 48px)
- [ ] Brand text appears/disappears
- [ ] Navigation labels hide in collapsed state
- [ ] Icons remain centered when collapsed
- [ ] Active left border still visible when collapsed
- [ ] User info hides when collapsed
- [ ] Sign out button hides when collapsed
- [ ] State persists across page refresh (cookie)
- [ ] Keyboard shortcut (Cmd/Ctrl + B) toggles sidebar

### Mobile Interactions
- [ ] Mobile header visible below 768px
- [ ] Hamburger menu button opens sidebar
- [ ] Sidebar slides in from left (288px width)
- [ ] Overlay background appears
- [ ] Click navigation item navigates AND closes sidebar
- [ ] Click overlay closes sidebar
- [ ] Swipe left gesture closes sidebar
- [ ] Escape key closes sidebar
- [ ] Keyboard shortcut opens/closes sidebar
- [ ] Body scroll locks when sidebar open
- [ ] No cookie persistence (always closed on load)

### Responsive Breakpoints
- [ ] Sidebar becomes overlay at 768px
- [ ] Desktop sidebar persistent above 768px
- [ ] Mobile header appears below 768px
- [ ] Content padding adjusts for mobile header
- [ ] Resize from mobile to desktop works smoothly
- [ ] Resize from desktop to mobile works smoothly

### Hover States
- [ ] Navigation items change color on hover
- [ ] Brass glow shadow appears on hover
- [ ] Collapse button brightness increases on hover
- [ ] Settings button shows brass glow on hover
- [ ] Sign out button changes to red on hover
- [ ] All transitions smooth (200ms)

### Accessibility
- [ ] ARIA labels present on buttons
- [ ] Screen reader text announces actions
- [ ] Keyboard navigation works (Tab, Enter)
- [ ] Focus visible on interactive elements
- [ ] Touch targets minimum 48px on mobile
- [ ] Color contrast passes WCAG AA

---

## NEXT STEPS

**Phase 4: Global Styles & Design Tokens** will export:
- Complete color palette with HSL values
- Typography scale (font families, sizes, weights, line heights)
- Spacing system (padding, margin, gap scales)
- Shadow system (levels 1-3, brass glow)
- Border radius values
- Gradient definitions
- Complete Tailwind config extensions
- CSS custom properties in index.css

Ready for Phase 4 export?
