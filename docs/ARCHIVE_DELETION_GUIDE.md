# Archive Deletion Guide & Cost Analysis

## Issue Summary

**Problem:** User has 100-113 pieces of archived content that cannot be deleted.

**Root Cause:** The delete functionality exists and works correctly, but requires specific steps:
1. Content must be **archived first** (not active)
2. User must toggle **"Show Archived"** view
3. Only then does the **Delete button** become visible

---

## How to Delete Archived Content (Step-by-Step)

### Method 1: Bulk Delete Multiple Items

1. **Navigate to Library/Archives** page
2. **Toggle "Show Archived" switch** (top of page in filters section)
   - This displays only archived content
3. **Select items to delete:**
   - Click the checkbox next to each item
   - OR click "Select all" checkbox at top to select all archived items
4. **Click the red "Delete" button** that appears in the bulk actions toolbar
   - Button only appears when:
     - Items are selected AND
     - "Show Archived" is enabled
5. **Confirm deletion** (cannot be undone)

### Method 2: Single Item Archive → Delete

1. **Find the item** in your active content library
2. **Archive it first:**
   - Click the item card
   - Click "Archive" button in the detail modal
3. **Toggle "Show Archived"** view
4. **Select the archived item**
5. **Click "Delete"** button in bulk toolbar

---

## Why This Two-Step Process?

**Safety Measure:** The system prevents accidental deletion of active content by requiring:
1. Explicit archiving (soft delete)
2. View toggle confirmation
3. Selection + deletion confirmation

This protects against scenarios like:
- Accidentally clicking delete on a published piece
- Bulk selecting and deleting active campaigns
- Losing content that's still in use

**Code Location:** `src/pages/Library.tsx` lines 193-277
- **Line 203-210:** Validation that only archived items can be deleted
- **Line 375-386:** Delete button only visible when `showArchived` is true

---

## Cost Implications of Archived Content

### Database Storage Costs

**Lovable Cloud (Supabase) Pricing:**
- **Database Storage:** Free up to 500 MB, then $0.125/GB per month
- **Bandwidth:** Free up to 2 GB, then $0.09/GB

**Your 113 Archived Items:**
- **Text-based content** (master_content, outputs, derivative_assets):
  - Average size: ~5-10 KB per item
  - 113 items × 10 KB = ~1.13 MB
  - **Cost:** $0.00014/month (negligible)

- **Image assets** (generated_images):
  - Average size: ~500 KB - 2 MB per image (depending on resolution/format)
  - If 50 images × 1 MB = 50 MB
  - **Cost:** ~$0.006/month (less than a penny)

**Total Estimated Storage Cost:** Less than $0.01/month for 113 archived items

### When Storage Costs Become Significant

**Threshold:** ~10,000+ archived items OR 100+ GB of images
- At 100 GB: ~$12.50/month storage cost
- At 500 GB: ~$62.50/month storage cost

**Your Current Scale:** You're at ~0.1% of where costs become noticeable

---

## Recommendations

### Immediate Action:
1. ✅ **Delete the 113 archived items** using the method above
   - This clears clutter from your database
   - Keeps your library clean and organized
   - No performance impact either way at this scale

### Long-Term Strategy:
1. **Quarterly Cleanup:**
   - Every 3 months, review archived content
   - Delete truly obsolete items (old drafts, test content)
   - Keep archived items that might be repurposed later

2. **Archive Threshold:**
   - Don't archive content "just in case" - be intentional
   - Archive only if you might reference/reuse it
   - Delete immediately if it's a failed draft or test

3. **Image Asset Management:**
   - Images take up more space than text
   - Consider downloading important images before deleting
   - Use the "Download" button before bulk deleting image-heavy archives

### When to Worry About Costs:
- ❌ **Don't worry** until you have 10,000+ archived items
- ❌ **Don't worry** until you're storing 50+ GB of images
- ✅ **Do monitor** your Supabase usage dashboard monthly
- ✅ **Do clean** archives quarterly to prevent accumulation

---

## Database Schema Reference

**Tables Affected by Deletion:**
- `master_content` - Long-form original content
- `outputs` - Generated content from prompts
- `derivative_assets` - Repurposed content from masters
- `generated_images` - AI-generated product photos

**Columns Used:**
- `is_archived` (boolean) - Soft delete flag
- `archived_at` (timestamp) - When item was archived
- `deleted_at` (timestamp) - FUTURE: Hard delete tracking (not implemented)

**RLS Policies:**
- Users can only delete their own content OR content in their organization
- Security function: `is_organization_member(auth.uid(), organization_id)`
- Prevents cross-organization deletion

---

## Technical Details (For Debugging)

### If Delete Fails with RLS Error:

**Symptom:** "new row violates row-level security policy"

**Cause:** User not member of organization that owns the content

**Solution:**
1. Verify you're logged in as the correct user
2. Check organization membership in Settings → Team
3. Contact team admin to verify permissions

### If Delete Button Not Appearing:

**Symptom:** "Delete" button never shows even with items selected

**Checklist:**
- [ ] "Show Archived" toggle is ON (should see only archived items)
- [ ] At least 1 item is selected (checkbox checked)
- [ ] Browser cache cleared (try hard refresh: Cmd+Shift+R / Ctrl+Shift+F5)
- [ ] JavaScript errors in console (F12 → Console tab)

---

## Summary

**Current Situation:**
- 113 archived items
- ~$0.01/month storage cost (negligible)
- No performance impact
- Deletion possible, just requires correct workflow

**Action Required:**
1. Toggle "Show Archived" view
2. Select all archived items
3. Click "Delete" button
4. Confirm deletion

**Future Prevention:**
- Quarterly archive review
- Delete failed drafts immediately
- Download important images before deleting
- Monitor usage only if you exceed 10,000 items or 50 GB

**Bottom Line:** Storage costs are not a concern at your scale. Delete the archived items for organizational cleanliness, not cost savings.
