# Madison Studio - Comprehensive Testing Guide
**Version:** 1.0  
**Date:** December 20, 2025  
**Covers:** Weeks 1-13 Feature Implementation

---

## 📋 Table of Contents

1. [Pre-Testing Setup](#pre-testing-setup)
2. [Dashboard Testing](#1-dashboard-testing)
3. [Products List Page](#2-products-list-page)
4. [Product Hub - Core](#3-product-hub---core)
5. [Product Hub - Media](#4-product-hub---media)
6. [Product Hub - Formulation](#5-product-hub---formulation)
7. [Product Hub - Ingredients](#6-product-hub---ingredients)
8. [Product Hub - SDS (Safety Data Sheets)](#7-product-hub---sds)
9. [Product Hub - Packaging](#8-product-hub---packaging)
10. [Product Hub - Tasks](#9-product-hub---tasks)
11. [Role-Based Views](#10-role-based-views)
12. [Digital Asset Management (DAM)](#11-digital-asset-management-dam)
13. [Bug Report Template](#bug-report-template)

---

## Pre-Testing Setup

### Required SQL Scripts

Before testing, run these scripts in the **Supabase SQL Editor** (in order):

| Order | Script | Purpose |
|-------|--------|---------|
| 1 | `scripts/fix_missing_tables.sql` | Creates packaging, SDS, certifications tables |
| 2 | `scripts/apply_team_roles.sql` | Enables role-based view system |
| 3 | `scripts/apply_task_system.sql` | Enables task management system |

### Test Accounts

Create or use accounts with different roles for comprehensive testing:

| Role | Purpose | Team Role to Assign |
|------|---------|---------------------|
| Owner Account | Full access testing | `founder` (auto-assigned) |
| Creative User | Limited access testing | `creative` |
| Compliance User | Compliance-focused testing | `compliance` |
| Marketing User | Marketing-focused testing | `marketing` |

### Assigning Test Roles

Run in Supabase SQL Editor:
```sql
UPDATE organization_members 
SET team_role = 'creative' 
WHERE user_id = 'USER_UUID_HERE';
```

---

## 1. Dashboard Testing

**URL:** `/dashboard`

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| D-01 | Dashboard loads | Navigate to /dashboard | Page loads without errors |
| D-02 | Stats display | Check header stats | Shows content counts, streak info |
| D-03 | Quick links work | Click each quick link | Navigates to correct page |
| D-04 | Brand health card | View brand health card | Shows brand health metrics |
| D-05 | Content pipeline | View pipeline card | Shows content in pipeline stages |
| D-06 | Role widgets display | Scroll to role section | Shows role badge and role-specific widgets |
| D-07 | Madison AI button | Click "Ask Madison" | Opens Madison AI panel |

### Role-Specific Widget Testing

| Role | Expected Widgets |
|------|------------------|
| Founder | Pipeline Overview, Team Activity, Revenue Metrics |
| Creative | Content Queue, Review Needed |
| Compliance | SDS Status, Expiring Certs, Allergen Alerts |
| Marketing | Scheduled Posts, Campaign Performance |

---

## 2. Products List Page

**URL:** `/products`

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| P-01 | Page loads | Navigate to /products | Shows product grid/list |
| P-02 | Create product | Click "Add Product" → Fill form → Submit | Product created, appears in list |
| P-03 | Product card display | View any product card | Shows image, name, status, category |
| P-04 | Product card click | Click product card | Navigates to product detail page |
| P-05 | Search products | Type in search bar | Filters products by name |
| P-06 | Filter by status | Use status dropdown | Shows only matching products |
| P-07 | Filter by category | Use category dropdown | Shows only matching products |
| P-08 | Download CSV template | Click Templates → Download CSV | Downloads product-import-template.csv |
| P-09 | Download import guide | Click Templates → Download Guide | Downloads product-import-guide.md |
| P-10 | View toggle | Toggle grid/list view | Switches between view modes |

---

## 3. Product Hub - Core

**URL:** `/products/{product-id}`

### Header Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PH-01 | Header displays | Open any product | Shows product name, image, status, SKU |
| PH-02 | Role badge shows | Check header | Shows your team role badge (e.g., "Founder") |
| PH-03 | Edit mode toggle | Click "Edit" button | Enables edit mode, button changes to "Cancel" |
| PH-04 | Save changes | Edit fields → Click "Save" | Changes saved, toast confirmation |
| PH-05 | More menu | Click ⋮ menu | Shows Duplicate, Visibility, Archive, Delete |
| PH-06 | Duplicate product | More → Duplicate | Creates copy of product |
| PH-07 | Toggle visibility | More → Make Private/Public | Visibility toggles |
| PH-08 | Archive product | More → Archive | Product status changes to archived |
| PH-09 | Delete product | More → Delete | Product deleted, redirects to list |

### Info Tab Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PI-01 | Tab loads | Click "Info" tab | Shows product information form |
| PI-02 | Edit name | Edit mode → Change name → Save | Name updates |
| PI-03 | Edit SKU | Edit mode → Change SKU → Save | SKU updates |
| PI-04 | Change category | Edit → Select category | Product type options update |
| PI-05 | Edit descriptions | Edit tagline, short, long descriptions | All save correctly |
| PI-06 | Key benefits | Add/edit benefits (one per line) | Benefits list updates |
| PI-07 | Differentiators | Add/edit differentiators | Differentiators list updates |

### Sidebar Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PS-01 | Status dropdown | Edit mode → Change status | Status updates |
| PS-02 | Development stage | Edit mode → Change stage | Stage updates |
| PS-03 | Quick stats | View sidebar | Shows created/updated dates |

---

## 4. Product Hub - Media

**URL:** `/products/{product-id}` → Media Tab

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PM-01 | Tab loads | Click "Media" tab | Shows media grid |
| PM-02 | Add external URL | Click "Add External URL" → Paste URL → Submit | Asset added with external badge |
| PM-03 | URL auto-detection | Paste Google Drive/Dropbox URL | Provider auto-detected |
| PM-04 | Set image type | Select hero/gallery/lifestyle etc. | Type saved correctly |
| PM-05 | Set as primary | Click star icon on asset | Asset marked as primary |
| PM-06 | Open external link | Click external link icon | Opens URL in new tab |
| PM-07 | Delete asset | Click delete → Confirm | Asset removed |
| PM-08 | Filter by type | Use type filter dropdown | Shows only matching assets |
| PM-09 | Empty state | View with no assets | Shows helpful empty state |

### Supported External Providers

Test with URLs from:
- [ ] Google Drive
- [ ] Dropbox
- [ ] Direct image URLs (.jpg, .png, .webp)
- [ ] YouTube/Vimeo (for video)

---

## 5. Product Hub - Formulation

**URL:** `/products/{product-id}` → Formulation Tab

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PF-01 | Tab loads | Click "Formulation" tab | Shows formulation section |
| PF-02 | Scent profile | View scent profile section | Shows top/heart/base notes |
| PF-03 | Add top note | Click add in Top Notes → Search/Select | Note added to top section |
| PF-04 | Add heart note | Click add in Heart Notes → Search/Select | Note added to heart section |
| PF-05 | Add base note | Click add in Base Notes → Search/Select | Note added to base section |
| PF-06 | Remove note | Click X on any note | Note removed |
| PF-07 | Notes autocomplete | Start typing note name | Shows matching suggestions |
| PF-08 | Fragrance family | View/edit fragrance family | Family updates |
| PF-09 | Concentration | Edit concentration % | Saves correctly |
| PF-10 | Formulation notes | Add/edit notes | Notes save |

---

## 6. Product Hub - Ingredients

**URL:** `/products/{product-id}` → Ingredients Tab

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PIN-01 | Tab loads | Click "Ingredients" tab | Shows ingredients section |
| PIN-02 | Add ingredient | Click "Add Ingredient" → Fill form | Ingredient added to list |
| PIN-03 | INCI name field | Enter INCI name | Saves correctly |
| PIN-04 | Percentage field | Enter % concentration | Validates and saves |
| PIN-05 | Allergen flag | Mark as allergen | Shows allergen badge |
| PIN-06 | Origin field | Enter origin | Saves correctly |
| PIN-07 | Library lookup | Search ingredient library | Shows autocomplete results |
| PIN-08 | Add to library | Add new ingredient → Check "Add to library" | Added to org's library |
| PIN-09 | Reorder ingredients | Drag to reorder | Order persists on save |
| PIN-10 | Delete ingredient | Click delete on ingredient | Removed from list |
| PIN-11 | INCI list generator | Click "Generate INCI List" | Generates formatted INCI list |
| PIN-12 | Allergen detection | Add allergen ingredient | Auto-flags allergens |

### Certifications Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PC-01 | Certifications section | View certifications | Shows checklist |
| PC-02 | Toggle certification | Check/uncheck certification | Status updates |
| PC-03 | Add cert details | Click cert → Add number, dates | Details save |
| PC-04 | Cert types | Test all types | All save correctly |

Certification types to test:
- [ ] Cruelty-free
- [ ] Vegan
- [ ] Organic
- [ ] Natural
- [ ] Halal
- [ ] Kosher
- [ ] Fair Trade
- [ ] EcoCert
- [ ] COSMOS
- [ ] Leaping Bunny
- [ ] PETA

---

## 7. Product Hub - SDS

**URL:** `/products/{product-id}` → SDS Tab

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| SDS-01 | Tab loads | Click "SDS" tab | Shows SDS section without errors |
| SDS-02 | Status indicator | Check SDS status | Shows current/outdated/missing |
| SDS-03 | Generate SDS | Click "Generate SDS" | Creates new SDS document |
| SDS-04 | View SDS | Click on existing SDS | Opens SDS viewer/details |
| SDS-05 | Version history | View version history | Shows all versions |
| SDS-06 | GHS classification | Check GHS data | Shows pictograms, hazard statements |
| SDS-07 | Edit SDS details | Edit mode → Change fields | Updates save |
| SDS-08 | Empty state | View with no SDS | Shows "Generate SDS" CTA |

---

## 8. Product Hub - Packaging

**URL:** `/products/{product-id}` → Packaging Tab

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| PK-01 | Tab loads | Click "Packaging" tab | Shows packaging section without errors |
| PK-02 | Container type | Select container type | Saves correctly |
| PK-03 | Container material | Select material | Saves correctly |
| PK-04 | Closure type | Select closure | Saves correctly |
| PK-05 | Box required toggle | Toggle on/off | Shows/hides box fields |
| PK-06 | Net weight | Enter weight + unit | Saves correctly |
| PK-07 | Dimensions | Enter dimensions | Saves correctly |
| PK-08 | Sustainability fields | Check recyclable, enter recycling code | Saves correctly |
| PK-09 | Supplier info | Enter supplier name, SKU, cost | Saves correctly |
| PK-10 | Generate barcode | Click "Generate Barcode" | Creates UPC/EAN barcode |
| PK-11 | Barcode types | Test UPC-A, EAN-13, Code-128 | All generate correctly |
| PK-12 | Empty state | View with no packaging | Shows form to add |

---

## 9. Product Hub - Tasks

**URL:** `/products/{product-id}` → Tasks Tab

### Task Creation Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| T-01 | Tab loads | Click "Tasks" tab | Shows task list |
| T-02 | Open create modal | Click "Add Task" | Modal opens |
| T-03 | Create basic task | Fill title → Submit | Task created |
| T-04 | Full task creation | Fill all fields → Submit | All fields save |
| T-05 | Priority selection | Select each priority | Saves correctly |
| T-06 | Section selection | Select section | Saves, affects suggestions |
| T-07 | Smart suggestions | Select section → Check suggestions | Shows relevant assignees |
| T-08 | Due date picker | Select date | Saves correctly |
| T-09 | Due date type | Select flexible/firm/blocker | Type saves, displays correctly |
| T-10 | Add tags | Type tag → Enter/Add | Tags added |
| T-11 | Remove tags | Click tag X | Tag removed |
| T-12 | Context notes | Add notes | Saves correctly |
| T-13 | Cancel creation | Click Cancel | Modal closes, no task created |

### Task List Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TL-01 | View all tasks | Check "All" tab | Shows all tasks |
| TL-02 | Pending filter | Click "Pending" tab | Shows only pending |
| TL-03 | In Progress filter | Click "In Progress" tab | Shows only in progress |
| TL-04 | Completed filter | Click "Completed" tab | Shows only completed |
| TL-05 | Overdue filter | Click "Overdue" tab (if visible) | Shows only overdue |
| TL-06 | Search tasks | Type in search | Filters by title/description |
| TL-07 | Section filter | Select section dropdown | Filters by section |
| TL-08 | Sort by due date | Select "Due Date" sort | Sorts correctly |
| TL-09 | Sort by priority | Select "Priority" sort | Sorts correctly |
| TL-10 | Sort by created | Select "Created" sort | Sorts correctly |
| TL-11 | Empty state | View with no tasks | Shows empty state with CTA |

### Task Card Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TC-01 | Card display | View task card | Shows title, due, assignee, status |
| TC-02 | Quick complete | Click circle icon | Toggles completed status |
| TC-03 | Overdue styling | View overdue task | Shows red styling |
| TC-04 | Blocker badge | View blocker task | Shows "Blocker" badge |
| TC-05 | Priority badge | View high/urgent task | Shows priority badge |
| TC-06 | Click to open | Click task card | Opens detail modal |
| TC-07 | Dropdown menu | Click ⋮ → Select status | Status changes |
| TC-08 | Delete from dropdown | Click ⋮ → Delete | Task deleted |

### Task Detail Modal Testing

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| TD-01 | Modal opens | Click any task | Modal opens with full details |
| TD-02 | All fields shown | Check modal | Shows all task data |
| TD-03 | Status dropdown | Change status | Status updates |
| TD-04 | Add comment | Type comment → Send | Comment added |
| TD-05 | Comments display | View comments | Shows all comments with author/time |
| TD-06 | Delete task | Click trash icon → Confirm | Task deleted, modal closes |
| TD-07 | Close modal | Click outside or X | Modal closes |

---

## 10. Role-Based Views

### Setup

Test with different user accounts assigned different team roles.

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| R-01 | Role badge | View product header | Shows correct role badge |
| R-02 | Tab visibility | Check visible tabs | Hidden tabs don't appear |
| R-03 | Full access tabs | Check tabs with ring | Full access tabs highlighted |
| R-04 | View-only indicator | Check tabs with 👁️ | Shows view-only icon |
| R-05 | Edit mode - full access | Edit mode on full access tab | Can edit fields |
| R-06 | Edit mode - view only | Edit mode on view-only tab | Shows "View Only" banner |
| R-07 | Your sections highlight | Check "Your sections" | Shows correct sections |
| R-08 | Dashboard widgets | Check dashboard | Shows role-specific widgets |

### Role Access Matrix

| Section | Founder | Creative | Compliance | Marketing |
|---------|---------|----------|------------|-----------|
| Info | ✏️ Full | 👁️ View | 👁️ View | 👁️ View |
| Media | ✏️ Full | ✏️ Full | 👁️ View | ✏️ Full |
| Formulation | ✏️ Full | 👁️ View | ✏️ Full | ❌ Hidden |
| Ingredients | ✏️ Full | 👁️ View | ✏️ Full | 👁️ View |
| Compliance | ✏️ Full | ❌ Hidden | ✏️ Full | ❌ Hidden |
| Packaging | ✏️ Full | 👁️ View | ✏️ Full | 👁️ View |
| Marketing | ✏️ Full | ✏️ Full | ❌ Hidden | ✏️ Full |
| Analytics | ✏️ Full | 👁️ View | 👁️ View | ✏️ Full |

---

## 11. Digital Asset Management (DAM)

**URL:** `/dam` or `/assets`

### Test Cases

| ID | Test Case | Steps | Expected Result |
|----|-----------|-------|-----------------|
| DAM-01 | Page loads | Navigate to DAM | Shows asset library |
| DAM-02 | Upload asset | Click upload → Select file | Asset uploads |
| DAM-03 | Create folder | Click "New Folder" → Name it | Folder created |
| DAM-04 | Navigate folders | Click folder | Shows folder contents |
| DAM-05 | Search assets | Type in search | Filters results |
| DAM-06 | Filter by type | Use type dropdown | Shows matching assets |
| DAM-07 | Asset preview | Click asset | Shows preview modal |
| DAM-08 | Asset details | View asset details | Shows metadata |
| DAM-09 | Delete asset | Select → Delete | Asset removed |
| DAM-10 | Bulk select | Shift+click multiple | Multiple selected |

---

## Bug Report Template

Use this template when reporting issues:

```markdown
### Bug Report

**Feature Area:** [Dashboard / Products / Product Hub / Tasks / etc.]
**Test Case ID:** [e.g., T-03]

**Environment:**
- Browser: 
- Device: 
- User Role: 

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:**


**Actual Result:**


**Screenshots:**
[Attach if applicable]

**Console Errors:**
[Paste any browser console errors]

**Priority:** [Critical / High / Medium / Low]
```

---

## Testing Completion Checklist

### Core Features
- [ ] Dashboard loads and displays correctly
- [ ] Products list page works
- [ ] Can create/edit/delete products
- [ ] CSV templates download

### Product Hub Tabs
- [ ] Info tab - all fields work
- [ ] Media tab - external URLs work
- [ ] Formulation tab - scent notes work
- [ ] Ingredients tab - all features work
- [ ] SDS tab - loads without errors
- [ ] Packaging tab - loads without errors
- [ ] Tasks tab - full CRUD works

### Task System
- [ ] Create tasks with all fields
- [ ] Smart assignee suggestions work
- [ ] Status transitions work
- [ ] Comments work
- [ ] Filters and sorting work
- [ ] Delete works

### Role-Based Views
- [ ] Role badge displays
- [ ] Tab visibility correct per role
- [ ] Edit locks work
- [ ] Dashboard widgets vary by role

### Performance
- [ ] Pages load in < 3 seconds
- [ ] No excessive 404 errors in console
- [ ] Tab switching is smooth

---

**Testing Guide Version:** 1.0  
**Last Updated:** December 20, 2025  
**Contact:** [Your team lead]
