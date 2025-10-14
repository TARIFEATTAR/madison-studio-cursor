# PolyMet Export - Phase 2: Navigation Items & States

## Overview
This document exports the Scriptora navigation items with their interaction states, icons, and behavior patterns. It builds upon Phase 1's layout structure.

---

## 1. NATURAL LANGUAGE UI SPECIFICATION

### Navigation Item Structure
**Component:** SidebarMenuItem (Main Navigation)
- **Container:** SidebarMenu wrapper
- **Padding:** 8px horizontal, 16px vertical (px-2 py-4)
- **Layout:** Flex column, items stacked vertically

#### Individual Navigation Item
**Component:** SidebarMenuButton + NavLink
- **Height States:**
  - Expanded: Auto height with 12px vertical padding (py-3)
  - Collapsed: Fixed 48px height (h-12)
- **Layout:** Flex row, items centered
- **Gap:** 12px between icon and text (gap-3)
- **Transition:** All properties 200ms duration

#### Icon Element
- **Size:** 20px × 20px (w-5 h-5)
- **Shrink:** No (flex-shrink-0)
- **Color States:**
  - **Inactive:** White/60% opacity
  - **Hover:** `#B8956A` (aged-brass)
  - **Active:** `#B8956A` (aged-brass)

#### Text Layout (Expanded Only)
**Container:** Flex column, items start-aligned
- **Title Text:**
  - Font: Sans-serif (Lato)
  - Size: 14px (text-sm)
  - Weight: Semibold (600)
  - Color: White (#FFFFFF)
- **Subtitle Text:**
  - Font: Sans-serif (Lato)
  - Size: 12px (text-xs)
  - Color: White/60% opacity
  - Purpose: Describes item function

#### Text Hidden (Collapsed State)
- Only icon visible
- Centered in 48px height container
- Tooltip optional (not currently implemented)

---

## 2. NAVIGATION ITEM STATES

### State 1: Inactive (Default)
**Visual Properties:**
- **Background:** Transparent
- **Text Color:** White/60% opacity (`rgba(255,255,255,0.6)`)
- **Icon Color:** White/60% opacity
- **Border:** None
- **Shadow:** None

**Behavior:**
- Clickable/tappable
- Navigation via React Router NavLink

### State 2: Hover
**Visual Properties:**
- **Background:** White/5% opacity (`rgba(255,255,255,0.05)`)
- **Text Color:** `#B8956A` (aged-brass)
- **Icon Color:** `#B8956A` (aged-brass)
- **Border:** None
- **Shadow:** `drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]` (brass glow)
- **Transition:** All properties 200ms

**Trigger:**
- Mouse hover (desktop)
- Touch feedback (mobile)

### State 3: Active (Current Route)
**Visual Properties:**
- **Background:** White/5% opacity (`rgba(255,255,255,0.05)`)
- **Text Color:** White (#FFFFFF) - Full opacity
- **Icon Color:** `#B8956A` (aged-brass)
- **Border Left:** 4px solid `#B8956A` (aged-brass)
- **Shadow:** None (subtle accent)

**Trigger:**
- Current route matches item URL
- Determined by `isActive()` function checking `location.pathname`

**Active Route Logic:**
```typescript
const isActive = (path: string) => {
  if (path === "/" && location.pathname === "/") return true;
  if (path !== "/" && location.pathname.startsWith(path)) return true;
  return false;
}
```

---

## 3. NAVIGATION ITEMS DATA

### Main Navigation Items (7 items)

1. **Dashboard**
   - Icon: `Home` (lucide-react)
   - Title: "Dashboard"
   - Subtitle: "Overview & Actions"
   - URL: `/dashboard`

2. **The Archives**
   - Icon: `Archive` (lucide-react)
   - Title: "The Archives"
   - Subtitle: "Content Library"
   - URL: `/library`

3. **Create**
   - Icon: `Pencil` (lucide-react)
   - Title: "Create"
   - Subtitle: "Content Creation"
   - URL: `/create`

4. **Multiply**
   - Icon: `Share2` (lucide-react)
   - Title: "Multiply"
   - Subtitle: "Repurpose Content"
   - URL: `/multiply`

5. **Schedule**
   - Icon: `Calendar` (lucide-react)
   - Title: "Schedule"
   - Subtitle: "Content Calendar"
   - URL: `/schedule`

6. **Prompt Library**
   - Icon: `FileText` (lucide-react)
   - Title: "Prompt Library"
   - Subtitle: "AI Prompt Templates"
   - URL: `/templates`

7. **Meet Madison**
   - Icon: `User` (lucide-react)
   - Title: "Meet Madison"
   - Subtitle: "Editorial Director"
   - URL: `/meet-madison`

### Secondary Section (Below Separator)

**Video Tutorials**
- Icon: `Video` (lucide-react)
- Title: "Video Tutorials"
- Subtitle: "Learn & Get Help"
- URL: Not implemented (no navigation)
- State: No active state, only hover

---

## 4. SEPARATOR COMPONENT

### Visual Separator Between Sections
**Component:** Separator (Shadcn UI)
- **Margin:** 16px horizontal (mx-4)
- **Background:** White/10% opacity
- **Height:** 1px (default separator height)
- **Purpose:** Visual division between main nav and secondary items

**Placement:**
- Between main navigation items (7 items)
- And secondary items (Video Tutorials)

---

## 5. DESIGN TOKENS

### Colors
```
Navigation Item States:
- Inactive Text:        rgba(255,255,255,0.6) (white/60%)
- Hover Text:           #B8956A (aged-brass)
- Active Text:          #FFFFFF (white)
- Inactive Icon:        rgba(255,255,255,0.6)
- Hover Icon:           #B8956A
- Active Icon:          #B8956A

Backgrounds:
- Inactive:             transparent
- Hover/Active:         rgba(255,255,255,0.05)

Borders:
- Active Left Border:   4px solid #B8956A

Separator:
- Background:           rgba(255,255,255,0.1)
```

### Typography
```
Title (Nav Item):
- Font:                 'Lato' (sans-serif)
- Size:                 14px (text-sm)
- Weight:               600 (semibold)
- Color:                white (with state variations)

Subtitle (Nav Item):
- Font:                 'Lato' (sans-serif)
- Size:                 12px (text-xs)
- Weight:               400 (normal)
- Color:                rgba(255,255,255,0.6) (white/60%)
```

### Spacing
```
Navigation Container:
- Padding:              8px horizontal, 16px vertical (px-2 py-4)

Navigation Item (Expanded):
- Padding:              12px vertical (py-3)
- Height:               Auto
- Gap:                  12px (gap-3 between icon & text)

Navigation Item (Collapsed):
- Height:               48px (h-12)
- Icon:                 Centered

Separator:
- Margin:               16px horizontal (mx-4)
```

### Shadows
```
Hover Glow:             drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
```

### Transitions
```
All States:             transition-all duration-200
```

---

## 6. REACT + TAILWIND CODE

### Navigation Items Data Structure
```tsx
const navItems = [
  { 
    title: "Dashboard", 
    subtitle: "Overview & Actions",
    url: "/dashboard", 
    icon: Home 
  },
  { 
    title: "The Archives", 
    subtitle: "Content Library",
    url: "/library", 
    icon: Archive 
  },
  { 
    title: "Create", 
    subtitle: "Content Creation",
    url: "/create", 
    icon: Pencil 
  },
  { 
    title: "Multiply", 
    subtitle: "Repurpose Content",
    url: "/multiply", 
    icon: Share2 
  },
  { 
    title: "Schedule", 
    subtitle: "Content Calendar",
    url: "/schedule", 
    icon: Calendar 
  },
  { 
    title: "Prompt Library", 
    subtitle: "AI Prompt Templates",
    url: "/templates", 
    icon: FileText 
  },
  { 
    title: "Meet Madison", 
    subtitle: "Editorial Director",
    url: "/meet-madison", 
    icon: User
  },
];
```

### Active Route Helper Function
```tsx
const isActive = (path: string) => {
  if (path === "/" && location.pathname === "/") return true;
  if (path !== "/" && location.pathname.startsWith(path)) return true;
  return false;
};
```

### Main Navigation Rendering
```tsx
import { NavLink, useLocation } from "react-router-dom";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

// Inside SidebarContent component:
<SidebarContent>
  {/* Main Navigation */}
  <div className="px-2 py-4">
    <SidebarMenu>
      {navItems.map((item) => {
        const isActiveRoute = isActive(item.url);
        return (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              className={`
                ${isActiveRoute 
                  ? 'border-l-4 border-aged-brass bg-white/5 text-white' 
                  : 'text-white/60 hover:text-aged-brass hover:bg-white/5'
                }
                ${open ? 'h-auto py-3' : 'h-12'}
                transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
              `}
            >
              <NavLink to={item.url} onClick={() => isMobile && toggleSidebar()}>
                <item.icon className={`w-5 h-5 shrink-0 ${isActiveRoute ? 'text-aged-brass' : ''}`} />
                {open && (
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-sm">{item.title}</span>
                    <span className="text-xs text-white/60">{item.subtitle}</span>
                  </div>
                )}
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  </div>

  {/* Separator */}
  <Separator className="mx-4 bg-white/10" />

  {/* Secondary Section - Video Tutorials */}
  <div className="px-2 py-4">
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          className={`
            text-white/60 hover:text-aged-brass hover:bg-white/5
            ${open ? 'h-auto py-3' : 'h-12'}
            transition-all duration-200 hover:drop-shadow-[0_0_8px_rgba(184,149,106,0.3)]
          `}
        >
          <Video className="w-5 h-5 shrink-0" />
          {open && (
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm">Video Tutorials</span>
              <span className="text-xs text-white/60">Learn & Get Help</span>
            </div>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  </div>
</SidebarContent>
```

### Required Icon Imports
```tsx
import { 
  Home, 
  Archive, 
  Pencil, 
  Share2, 
  Calendar, 
  FileText, 
  User,
  Video 
} from "lucide-react";
```

---

## 7. INTERACTION BEHAVIORS

### Desktop Behavior
1. **Click Navigation Item:**
   - Navigate to route via React Router
   - Active state applies immediately
   - Previous active item returns to inactive state

2. **Hover Navigation Item:**
   - Text changes to aged-brass
   - Icon changes to aged-brass
   - Background changes to white/5%
   - Brass glow shadow appears
   - Smooth 200ms transition

3. **Collapsed State:**
   - Only icons visible
   - Icons centered in 48px height container
   - Hover state still applies to icon
   - Click still navigates
   - Active left border still visible

### Mobile Behavior
1. **Click Navigation Item:**
   - Navigate to route
   - **Sidebar automatically closes** (`onClick={() => isMobile && toggleSidebar()}`)
   - User sees content immediately

2. **Touch Feedback:**
   - Hover styles apply on touch
   - Standard mobile tap behavior

### Keyboard Navigation
**Not currently implemented** - Would add:
- Tab focus on items
- Enter/Space to activate
- Arrow keys to navigate
- Escape to close mobile sidebar

---

## 8. SCALABILITY NOTES

### Adding New Navigation Items
To add a new item:
```tsx
const navItems = [
  // ... existing items
  { 
    title: "New Section", 
    subtitle: "Description here",
    url: "/new-route", 
    icon: NewIcon 
  },
];
```

### Creating Navigation Groups
For expandable groups (future enhancement):
```tsx
// Collapsible group structure example:
<SidebarGroup>
  <SidebarGroupLabel>Content</SidebarGroupLabel>
  <SidebarGroupContent>
    {/* Nav items here */}
  </SidebarGroupContent>
</SidebarGroup>
```

### Dynamic Icons
Icons are component references from Lucide React:
- Import icon: `import { IconName } from "lucide-react"`
- Use in array: `icon: IconName`
- Render: `<item.icon className="..." />`

---

## 9. ACCESSIBILITY CONSIDERATIONS

### Current Implementation
- ✅ Semantic HTML via NavLink
- ✅ ARIA labels on mobile menu button
- ✅ Focus states (default browser behavior)
- ⚠️ No keyboard navigation beyond Tab

### Recommended Enhancements
- Add `aria-current="page"` to active items
- Implement keyboard navigation (Arrow keys)
- Add tooltips for collapsed state items
- Ensure sufficient color contrast (currently good)
- Add focus visible styles matching hover

---

## 10. TESTING CHECKLIST

### Visual Verification
- [ ] All 7 navigation items display correctly
- [ ] Subtitle text shows in expanded state
- [ ] Icon colors match states (inactive/hover/active)
- [ ] Active left border (4px brass) appears on current route
- [ ] Separator displays between main and secondary items
- [ ] Video Tutorials item displays correctly
- [ ] Text hidden in collapsed state, icons centered
- [ ] Brass glow shadow appears on hover

### Interaction Verification
- [ ] Click navigation item navigates to correct route
- [ ] Active state applies to current route
- [ ] Hover state applies on mouse over
- [ ] Hover state removes on mouse out
- [ ] Transitions smooth at 200ms
- [ ] Mobile sidebar closes after navigation
- [ ] Icons remain visible in collapsed state

### Responsive Verification
- [ ] Items stack vertically
- [ ] Collapsed state shows icons only
- [ ] Expanded state shows icon + title + subtitle
- [ ] Mobile touch targets adequate (48px height)
- [ ] Text truncates gracefully if needed (not currently an issue)

---

## NEXT STEPS

**Phase 3: Interactions & Transitions** will export:
- Sidebar collapse/expand animations
- Mobile overlay slide-in/slide-out
- Route change transitions
- Responsive breakpoint behaviors
- Touch gesture handling (mobile swipe)

Ready for Phase 3 export?
