# PolyMet Export - Phase 1: Side Navigation Layout & Structure

## Overview
This document exports the Scriptora side navigation UI for import into PolyMet. It includes both React/Tailwind code and structured natural language specifications.

---

## 1. NATURAL LANGUAGE UI SPECIFICATION

### Container Structure
**Component:** AppSidebar
- **Layout Type:** Fixed sidebar, collapsible
- **Width States:**
  - Expanded: 240px (15rem)
  - Collapsed: 56px (3.5rem)
- **Background:** Solid `#0A0A0A` (pure black)
- **Border:** Right border with white/10% opacity (`border-white/10`)
- **Position:** Fixed left, full height
- **Z-Index:** Auto (default sidebar layering)

### Mobile Header (Mobile Only)
**Component:** Mobile Navigation Header
- **Position:** Fixed top, full width
- **Height:** 64px (16 units)
- **Background:** Gradient from `#1A1816` (ink-black) to `#2F2A26` (charcoal)
- **Border:** Bottom border `#B8956A` with 20% opacity
- **Layout:** Flex row, space-between alignment
- **Contains:**
  - Menu trigger button (left)
  - Scriptora logo (center, 32px height)
  - Spacer (right, for centering)

### Header Section
**Component:** SidebarHeader
- **Border:** Bottom border white/10% opacity
- **Padding:** 0 (custom padding in children)
- **Layout:** Flex column

#### Logo & Branding
- **Container:**
  - Flex row, 12px gap
  - Padding: 16px horizontal, 24px vertical (px-4 py-6)
- **Logo Image:**
  - Expanded: 64px × 64px
  - Collapsed: 48px × 48px
  - Transition: 200ms duration
  - Asset: `pen-nib-logo.png`
- **Brand Text (Expanded only):**
  - **Title:** "Scriptora"
    - Font: Serif (Cormorant Garamond)
    - Size: 24px (text-2xl)
    - Color: White (`#FFFFFF`)
    - Tracking: Tight (tracking-tight)
  - **Tagline:** "EDITORIAL INTELLIGENCE"
    - Font: Sans-serif (Lato)
    - Size: 10px (text-[10px])
    - Color: `#B8956A` (aged-brass)
    - Transform: Uppercase
    - Tracking: Wider (tracking-wider)

#### Collapse/Expand Controls
**Expanded State:**
- **Button Container:**
  - Padding: 16px horizontal, 16px bottom (px-4 pb-4)
  - Alignment: Flex end (right-aligned)
- **Collapse Button:**
  - Width: 80px, Height: 32px
  - Border radius: Right side only (`rounded-r-md`)
  - Background: Linear gradient `135deg, #B8956A 0%, #D4AF37 100%`
  - Shadow: `2px 2px 6px rgba(0,0,0,0.3)`
  - Margin right: -22px (extends beyond sidebar)
  - Icon: ChevronLeft, 16px × 16px, color `#1A1816`
  - Hover: Brightness +10%
  - Transition: 200ms

**Collapsed State:**
- **Trigger Button:**
  - Width: Full
  - Height: 40px (h-10)
  - Hover: White/5% background
  - Padding: 8px (px-2 pb-4)

### Navigation Content Section
**Component:** SidebarContent
- **Padding:** 8px horizontal, 16px vertical (px-2 py-4)
- **Overflow:** Auto (scrollable)

### Footer Section
**Component:** SidebarFooter
- **Border:** Top border white/10% opacity
- **Padding:** 16px all sides (p-4)
- **Background:** Transparent
- **Layout:** Flex row, 12px gap, items centered

#### User Avatar
- **Size:** 40px × 40px
- **Shape:** Circle (rounded-full)
- **Background:** `#B8956A` (aged-brass)
- **Text:** User initials
  - Color: `#1A1816` (ink-black)
  - Font weight: Bold
  - Size: 14px (text-sm)
- **Shrink:** No (flex-shrink-0)

#### User Info (Expanded Only)
- **Container:** Flex column, flex-1, min-width-0
- **Name:**
  - Color: White
  - Size: 14px (text-sm)
  - Weight: Semibold (600)
  - Truncate: Yes
- **Email:**
  - Color: White/60% opacity
  - Size: 12px (text-xs)
  - Truncate: Yes

#### Action Buttons
**Settings Button:**
- Color: White/60%, hover: `#B8956A`
- Padding: 8px
- Hover background: White/5%
- Hover glow: `drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]`
- Icon: Settings, 20px × 20px
- Transition: 200ms

**Sign Out Button (Expanded Only):**
- Color: White/60%, hover: Red-400
- Padding: 8px
- Hover background: White/5%
- Icon: LogOut, 20px × 20px
- Transition: 200ms

---

## 2. DESIGN TOKENS

### Colors
```
Backgrounds:
- Sidebar BG:           #0A0A0A (pure black)
- Hover BG:             rgba(255,255,255,0.05)
- Active Item BG:       rgba(255,255,255,0.05)

Text:
- Primary Text:         #FFFFFF (white)
- Secondary Text:       rgba(255,255,255,0.6) (white/60%)
- Accent Text:          #B8956A (aged-brass)

Accents:
- Primary Brass:        #B8956A
- Brass Glow:           #D4AF37
- Active Border:        #B8956A

Borders:
- Dividers:             rgba(255,255,255,0.1)
- Active Left Border:   #B8956A (4px width)
```

### Typography
```
Fonts:
- Serif:                'Cormorant Garamond'
- Sans:                 'Lato'

Sizes:
- Brand Title:          24px (text-2xl)
- Brand Tagline:        10px (text-[10px])
- Nav Item Title:       14px (text-sm)
- Nav Item Subtitle:    12px (text-xs)
- User Name:            14px (text-sm)
- User Email:           12px (text-xs)
```

### Spacing
```
Padding:
- Header Container:     16px horizontal, 24px vertical (px-4 py-6)
- Nav Items:            8px horizontal, 16px vertical (px-2 py-4)
- Footer:               16px all sides (p-4)

Gaps:
- Logo/Text:            12px (gap-3)
- Footer Items:         12px (gap-3)

Heights:
- Mobile Header:        64px (h-16)
- Nav Item (expanded):  Auto, 12px vertical padding (py-3)
- Nav Item (collapsed): 48px (h-12)
- Collapse Button:      32px (h-8)
```

### Shadows
```
Collapse Button:        2px 2px 6px rgba(0,0,0,0.3)
Hover Glow:             drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
```

### Transitions
```
Standard:               200ms all properties
Collapse/Expand:        200ms width, 200ms opacity
```

### Border Radius
```
Collapse Button:        rounded-r-md (right side only)
User Avatar:            rounded-full
Action Buttons:         rounded-lg (8px)
```

---

## 3. REACT + TAILWIND CODE

### Main Container Structure
```tsx
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";

interface AppSidebarProps {
  // Add props as needed
}

export function AppSidebar({ }: AppSidebarProps) {
  const { open, toggleSidebar, isMobile } = useSidebar();

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      {isMobile && (
        <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-gradient-to-r from-ink-black to-charcoal border-b border-aged-brass/20 flex items-center justify-between px-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-parchment-white" />
          </button>
          
          <img src="/logo.png" alt="Scriptora" className="h-8 w-auto" />
          
          <div className="w-10" /> {/* Spacer */}
        </header>
      )}

      <Sidebar
        collapsible="icon"
        className="border-r-0"
        style={{ backgroundColor: "#0A0A0A" }}
      >
        {/* Header Section */}
        <SidebarHeader className="border-b border-white/10 p-0">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 px-4 py-6">
            <img 
              src="/assets/pen-nib-logo.png"
              alt="Scriptora"
              className={`${open ? 'w-16 h-16' : 'w-12 h-12'} shrink-0 object-contain transition-all duration-200`}
            />
            {open && (
              <div className="flex-1 min-w-0">
                <h1 className="text-white text-2xl font-serif tracking-tight">
                  Scriptora
                </h1>
                <p className="text-aged-brass text-[10px] font-sans uppercase tracking-wider">
                  EDITORIAL INTELLIGENCE
                </p>
              </div>
            )}
          </div>

          {/* Collapse Button (Expanded) */}
          {open && (
            <div className="px-4 pb-4 flex justify-end">
              <button 
                onClick={toggleSidebar}
                className="relative group"
              >
                <div
                  className="w-20 h-8 rounded-r-md flex items-center justify-center transition-all duration-200 group-hover:brightness-110"
                  style={{
                    background: 'linear-gradient(135deg, #B8956A 0%, #D4AF37 100%)',
                    boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
                    marginRight: '-22px'
                  }}
                >
                  <ChevronLeft className="w-4 h-4 text-ink-black" />
                </div>
              </button>
            </div>
          )}

          {/* Expand Trigger (Collapsed) */}
          {!open && (
            <div className="px-2 pb-4">
              <SidebarTrigger className="w-full h-10 hover:bg-white/5" />
            </div>
          )}
        </SidebarHeader>

        {/* Main Content - Navigation items go here (Phase 2) */}
        <SidebarContent>
          {/* Navigation items will be added in Phase 2 */}
        </SidebarContent>

        {/* Footer Section */}
        <SidebarFooter className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-aged-brass rounded-full flex items-center justify-center text-ink-black font-bold text-sm shrink-0">
              TA
            </div>

            {/* User Info (Expanded) */}
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">
                  User Name
                </p>
                <p className="text-white/60 text-xs truncate">
                  user@example.com
                </p>
              </div>
            )}

            {/* Settings Button */}
            <button 
              className="text-white/60 hover:text-aged-brass p-2 rounded-lg hover:bg-white/5 transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Sign Out Button (Expanded) */}
            {open && (
              <button 
                className="text-white/60 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
```

### Required Tailwind Config Extensions
```js
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        'ink-black': 'hsl(26, 6%, 9%)',
        'charcoal': 'hsl(20, 10%, 17%)',
        'aged-brass': 'hsl(38, 33%, 56%)',
        'parchment-white': 'hsl(48, 100%, 99%)',
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Lato', 'sans-serif'],
      },
    },
  },
}
```

---

## 4. KEY INTERACTION STATES

### Collapsed State Behavior
- Sidebar width: 56px (3.5rem)
- Logo scales down to 48px × 48px
- Brand text hidden
- Navigation item labels hidden (Phase 2)
- User info hidden
- Sign out button hidden
- Only icons visible with centered alignment

### Expanded State Behavior
- Sidebar width: 240px (15rem)
- Logo scales up to 64px × 64px
- Brand text visible with fade-in
- Navigation item labels visible (Phase 2)
- User info visible with truncation
- Sign out button visible
- Collapse button extends 22px beyond sidebar edge

### Mobile Behavior
- Fixed header appears at top
- Sidebar becomes overlay (handled by SidebarProvider)
- Full-width mobile header with menu trigger
- Logo centered in header
- Sidebar slides in/out from left

### Hover States
- Collapse button: Brightness +10%
- Settings button: Color changes to aged-brass, adds glow shadow
- Sign out button: Color changes to red-400
- All interactive elements: White/5% background

---

## 5. IMPLEMENTATION NOTES FOR POLYMET

### Dependencies
This component relies on:
- Shadcn UI Sidebar primitives
- Lucide React icons
- React Router (for navigation, Phase 2)
- Custom hooks: `useSidebar()` from Shadcn

### Asset Requirements
- `/assets/pen-nib-logo.png` - Logo image (SVG recommended)
- `/logo.png` - Mobile header logo

### State Management
- `open`: Boolean, sidebar expanded/collapsed state
- `isMobile`: Boolean, detects mobile viewport
- `toggleSidebar()`: Function to toggle open state

### Responsive Breakpoints
- Desktop: Persistent sidebar, collapsible
- Mobile: Overlay sidebar with fixed header
- Breakpoint: 768px (md:) for mobile/desktop switch

### Integration Points
**Phase 2 will add:**
- Navigation menu items
- Active route highlighting
- Expand/collapse animations for grouped items
- Icon + label layout for menu items

**Phase 3 will add:**
- Slide/fade transitions
- Mobile swipe gestures
- Keyboard navigation

**Phase 4 will add:**
- Complete design token system
- Animation curves
- Accessibility enhancements

---

## 6. TESTING CHECKLIST

### Visual Verification
- [ ] Sidebar width correct in expanded state (240px)
- [ ] Sidebar width correct in collapsed state (56px)
- [ ] Logo scales smoothly between states
- [ ] Brand text appears/disappears correctly
- [ ] Collapse button extends beyond sidebar edge
- [ ] Mobile header displays on small screens
- [ ] User avatar displays initials correctly
- [ ] Settings/logout buttons positioned correctly

### Interaction Verification
- [ ] Collapse button toggles sidebar state
- [ ] Expand trigger (collapsed) opens sidebar
- [ ] Mobile menu button opens sidebar overlay
- [ ] Settings button hover state works
- [ ] Sign out button hover state works
- [ ] Transitions smooth at 200ms duration

### Responsive Verification
- [ ] Mobile header visible below 768px
- [ ] Sidebar becomes overlay on mobile
- [ ] Desktop sidebar persistent above 768px
- [ ] Logo centering correct in mobile header

---

## NEXT STEPS

**Phase 2: Navigation Items** will export:
- Menu item structure (icon + label + subtitle)
- Active/inactive/hover states
- Left border accent for active route
- Icon-only layout for collapsed state
- Separator between nav groups

Ready for Phase 2 export?
