# Sanity.io Integration - Quick Reference

## 🚀 Quick Setup (5 Steps)

1. **Get Sanity API Token**
   - Sanity Manage → Project → API → Tokens → Add token (Editor permissions)

2. **Add Supabase Secrets**
   ```
   SANITY_PROJECT_ID = gv4os6ef
   SANITY_DATASET = production
   SANITY_API_TOKEN = sk...
   ```

3. **Deploy Edge Function**
   ```bash
   supabase functions deploy push-to-sanity
   ```

4. **Create Sanity Schemas**
   - `post`, `article`, `emailCampaign`, `socialPost`, `contentDraft`

5. **Test**
   - Library → Content → "Publish to Sanity"

---

## 📋 Content Type Mappings

| Madison | Sanity | Button Location |
|--------|--------|----------------|
| `master_content` (blog_post) | `post` | ContentDetailModal |
| `master_content` (email) | `emailCampaign` | ContentDetailModal |
| `derivative_assets` (social) | `socialPost` | ContentDetailModal |
| `outputs` | `contentDraft` | ContentDetailModal |

---

## 🎯 Usage

1. Open any content in Library
2. Click **"Publish to Sanity"**
3. Select document type
4. Choose draft/publish
5. Click **"Publish to Sanity"**

---

## 🔧 Troubleshooting

| Error | Solution |
|-------|----------|
| "Missing Sanity configuration" | Check Supabase secrets |
| "Failed to fetch content" | Verify content ID exists |
| "Invalid document type" | Create schema in Sanity |

---

## 📁 Key Files

- **Edge Function:** `supabase/functions/push-to-sanity/index.ts`
- **UI Component:** `src/components/library/PublishToSanity.tsx`
- **Integration:** `src/components/library/ContentDetailModal.tsx`

---

## 💡 Creative Ideas

✅ **Implemented:**
- One-way push (Madison → Sanity)
- Multi-content type support
- Draft/publish options

🚀 **Future:**
- Bi-directional sync
- Image upload to Sanity
- Webhook-based real-time sync
- Content calendar integration

---

**Full Docs:** See `SANITY_SETUP_GUIDE.md` and `SANITY_INTEGRATION_PROPOSAL.md`



