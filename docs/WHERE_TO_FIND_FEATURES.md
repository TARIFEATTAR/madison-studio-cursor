# Where to Find New Features

Quick reference guide for locating all newly implemented features in the UI.

---

## 🎨 Brand Quick View Panel

### Location 1: Dashboard Top Bar (Desktop)
**File:** `src/pages/DashboardNew.tsx` (line 100-110)

**What you'll see:**
- Top right corner of dashboard
- Minimal variant button showing color dots (if brand DNA exists)
- Text: "Brand" 
- Click to open slide-out panel

**Visual:**
```
┌─────────────────────────────────────────────┐
│ Dashboard              [🎨 Brand] [Ask Madison] │
└─────────────────────────────────────────────┘
```

---

### Location 2: Dashboard Top Bar (Mobile)
**File:** `src/pages/DashboardNew.tsx` (line 113-122)

**What you'll see:**
- Top right corner (mobile header)
- Icon-only variant (palette icon)
- Small color dot indicator if brand DNA exists

**Visual:**
```
┌──────────────────────────┐
│ Dashboard    [🎨] [✨]   │
└──────────────────────────┘
```

---

### Location 3: Brand Health Card
**File:** `src/components/dashboard/BrandHealthCard.tsx` (line 129-141)

**What you'll see:**
- Inside Brand Health Card (when expanded)
- Button next to "View Full Report"
- Minimal variant showing color dots

**Visual:**
```
┌─────────────────────────────┐
│ Brand Health: 78%           │
│ ───────────────────────────  │
│ [🎨 Brand] [📊 Full Report] │
└─────────────────────────────┘
```

---

## ✂️ Background Removal

### Location: Image Editor Modal
**File:** `src/components/image-editor/ImageEditorModal.tsx` (line 604-615)

**What you'll see:**
- Open any image in Dark Room or Library
- Image Editor Modal appears
- New tab: "BG Remove" (with scissors icon)
- Click tab to access background removal

**Visual:**
```
┌─────────────────────────────────────┐
│ [Refine] [Variations] [Text] [Ad] [✂️ BG Remove] │
├─────────────────────────────────────┤
│                                     │
│   Background Removal Interface     │
│                                     │
└─────────────────────────────────────┘
```

**How to access:**
1. Go to Dark Room or Image Library
2. Click on any image
3. Image Editor Modal opens
4. Click "BG Remove" tab
5. Click "Remove Background" button

---

## 🔍 Brand Scanner (Enhanced)

### Location 1: Settings → Brand Guidelines
**File:** Settings page (existing upload interface)

**What you'll see:**
- Upload brand document button
- Uses new `scan-brand-document` edge function
- Extracts voice, mission, colors, typography

**How to use:**
1. Go to Settings → Brand Guidelines
2. Click "Upload Brand Document"
3. Upload PDF/DOCX
4. Wait for processing
5. Review extracted data

---

### Location 2: Website Scanner (API)
**File:** `supabase/functions/scan-website-enhanced/index.ts`

**What it does:**
- Pomelli-style visual analysis
- Screenshot capture → Gemini Flash analysis
- Squad auto-assignment
- Design token generation

**How to trigger:**
- Via API call (programmatic)
- Or integrate into Settings UI (future enhancement)

---

## 🤖 4-Agent Pipeline

### Location: Code (Not UI yet)
**File:** `src/lib/agents/pipeline.ts`

**What it does:**
- Router → Assembler → Generator → Editor
- Creates brand-aligned content
- Uses Three Silos architecture

**How to use:**
```typescript
import { madisonPipeline } from '@/lib/agents';

const result = await madisonPipeline({
  brief: "Write a blog post about...",
  organizationId: "your-org-id",
  userId: "your-user-id"
});
```

**Future:** Will be integrated into Forge content creation UI

---

## 📊 Brand Health Score

### Location: Dashboard (Existing)
**File:** `src/components/dashboard/BrandHealthCard.tsx`

**What's new:**
- Now includes Brand Quick View button
- Quick access to brand DNA panel

---

## 🎯 Quick Access Summary

| Feature | Where to Find | How to Access |
|---------|---------------|---------------|
| **Brand Quick View** | Dashboard top bar | Click "Brand" button |
| **Brand Quick View** | Brand Health Card | Expand card → Click "Brand" |
| **Background Removal** | Image Editor | Open image → "BG Remove" tab |
| **Brand Scanner** | Settings | Upload brand document |
| **4-Agent Pipeline** | Code | Import and use `madisonPipeline()` |

---

## 🧪 Testing Checklist

After deployment, test these locations:

- [ ] Dashboard loads → See "Brand" button in top bar
- [ ] Click "Brand" → Panel slides out from right
- [ ] Panel shows logo, colors, typography, squads
- [ ] Open Image Editor → See "BG Remove" tab
- [ ] Upload image → Click "Remove Background" → Works
- [ ] Brand Health Card → Expand → See "Brand" button
- [ ] Click Brand button → Panel opens

---

**Last Updated:** December 10, 2025










