# Sanity.io Integration Proposal for Madison Studio

## 🎯 Overview

This document outlines creative ways to connect Madison Studio (madison-studio.io) with Sanity.io, enabling seamless content creation, management, and distribution workflows.

---

## 🏗️ Integration Architecture Options

### **Option 1: One-Way Push (Madison → Sanity)**
**Best for:** Publishing approved content to Sanity for website/blog

**Flow:**
1. Content created/edited in Madison
2. User clicks "Publish to Sanity" button
3. Content synced to Sanity as draft or published document
4. Sanity Studio can further edit/publish

**Use Cases:**
- Blog posts from `master_content`
- Product descriptions from `derivative_assets`
- Email newsletters as Sanity documents
- Social media posts for content calendar

---

### **Option 2: Bi-Directional Sync**
**Best for:** Collaborative editing between Madison and Sanity teams

**Flow:**
1. Content created in Madison → Pushed to Sanity
2. Sanity team edits in Sanity Studio
3. Changes sync back to Madison (optional)
4. Both systems stay in sync

**Use Cases:**
- Editorial workflows where Madison generates, Sanity refines
- Multi-channel content where Madison creates, Sanity distributes
- Content approval workflows

---

### **Option 3: Webhook-Based Real-Time Sync**
**Best for:** Automatic publishing when content is approved

**Flow:**
1. Content created in Madison
2. When status changes to "published" → Webhook triggers
3. Sanity document automatically created/updated
4. Optional: Sanity webhook notifies Madison of changes

**Use Cases:**
- Automated content distribution
- Multi-platform publishing
- Content pipeline automation

---

### **Option 4: Sanity as Content Source**
**Best for:** Using Sanity content in Madison workflows

**Flow:**
1. Pull content from Sanity into Madison
2. Use Madison AI to repurpose/amplify Sanity content
3. Push derivatives back to Sanity or other platforms

**Use Cases:**
- Repurposing existing Sanity blog posts
- Creating social media content from Sanity articles
- Email campaigns from Sanity product descriptions

---

## 📋 Content Type Mappings

### Madison → Sanity Schema Mapping

| Madison Content Type | Sanity Document Type | Fields Mapped |
|---------------------|---------------------|---------------|
| `master_content` (blog_post) | `post` or `article` | `title`, `content` (portable text), `slug`, `publishedAt`, `featuredImage` |
| `master_content` (email_newsletter) | `emailCampaign` | `subject`, `htmlContent`, `plainText`, `scheduledAt` |
| `derivative_assets` (instagram) | `socialPost` | `platform`, `caption`, `images[]`, `scheduledAt` |
| `derivative_assets` (twitter) | `socialPost` | `platform`, `text`, `thread[]` |
| `outputs` | `contentDraft` | `title`, `content`, `contentType`, `metadata` |
| `products` | `product` | `name`, `description`, `price`, `images[]`, `metadata` |

---

## 🛠️ Implementation Approaches

### **Approach A: Supabase Edge Function + Sanity Client**

**Location:** `supabase/functions/push-to-sanity/index.ts`

**Features:**
- Server-side authentication
- Batch content pushing
- Error handling & retries
- Content transformation (Markdown → Portable Text)

**Example Flow:**
```typescript
// User clicks "Push to Sanity" in Madison
// → Edge function receives content
// → Transforms content to Sanity format
// → Creates/updates Sanity document
// → Returns Sanity document ID
```

---

### **Approach B: Direct Client Integration**

**Location:** `src/components/library/PublishToSanity.tsx`

**Features:**
- UI component in ContentDetailModal
- Real-time sync status
- Preview before publish
- Selective field mapping

**Example UI:**
- Button: "Publish to Sanity"
- Modal: Field mapping, preview, publish options
- Status: "Synced", "Pending", "Error"

---

### **Approach C: Background Job Queue**

**Location:** `supabase/functions/sanity-sync-queue/index.ts`

**Features:**
- Queue-based processing
- Retry failed syncs
- Bulk operations
- Scheduled syncs

**Use Cases:**
- Sync all published content nightly
- Batch import historical content
- Scheduled content publishing

---

## 🎨 Creative Integration Ideas

### **1. "Sanity Amplify" Workflow**
- Create content in Sanity
- Import to Madison via API
- Use Madison AI to generate derivatives (email, social, etc.)
- Push derivatives back to Sanity

### **2. "Madison → Sanity → Web" Pipeline**
- Write in Madison
- Auto-publish to Sanity
- Sanity webhook triggers Next.js rebuild
- Content live on website instantly

### **3. "Content Calendar Sync"**
- Madison scheduled content → Sanity calendar
- Sanity scheduled posts → Madison calendar
- Unified view in both systems

### **4. "Multi-Channel Distribution Hub"**
- Madison creates master content
- Pushes to Sanity
- Sanity distributes to:
  - Website (via GROQ)
  - Mobile app (via API)
  - Email (via Sanity → ESP)
  - Social (via Sanity → Buffer/Hootsuite)

### **5. "AI-Enhanced Sanity Content"**
- Pull Sanity content into Madison
- Use Madison AI to:
  - Generate SEO meta descriptions
  - Create social media previews
  - Write email summaries
  - Generate related content suggestions

### **6. "Brand Voice Consistency Checker"**
- Sync content to Sanity
- Madison AI analyzes brand voice compliance
- Flags inconsistencies
- Suggests improvements

### **7. "Content Performance Feedback Loop"**
- Sanity tracks content performance (views, engagement)
- Data flows back to Madison
- Madison AI learns from top performers
- Future content optimized based on performance

---

## 🔧 Technical Implementation

### **Step 1: Sanity Schema Setup**

Create Sanity document types that match Madison content:

```groq
// post.schema.ts
{
  name: 'post',
  type: 'document',
  fields: [
    { name: 'title', type: 'string' },
    { name: 'slug', type: 'slug' },
    { name: 'content', type: 'array', of: [{type: 'block'}] },
    { name: 'featuredImage', type: 'image' },
    { name: 'publishedAt', type: 'datetime' },
    { name: 'madisonId', type: 'string' }, // Link back to Madison
    { name: 'madisonSyncStatus', type: 'string' } // 'synced', 'pending', 'error'
  ]
}
```

### **Step 2: Sanity Client Configuration**

Store Sanity credentials in Supabase secrets:
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_TOKEN` (with write permissions)

### **Step 3: Content Transformation**

Convert Madison content formats to Sanity:

**Markdown → Portable Text:**
```typescript
import { toPlainText, PortableText } from '@portabletext/react';
import { marked } from 'marked';

function markdownToPortableText(markdown: string): PortableText {
  // Parse markdown
  // Convert to Sanity block structure
  // Return PortableText array
}
```

**Rich Text → Portable Text:**
```typescript
// If Madison uses Tiptap JSON
function tiptapToPortableText(json: JSONContent): PortableText {
  // Transform Tiptap blocks to Sanity blocks
}
```

### **Step 4: Sync UI Component**

Add "Publish to Sanity" button to:
- `ContentDetailModal.tsx`
- `ContentEditor.tsx` (toolbar)
- Library bulk actions

---

## 📊 Recommended Starting Point

**Phase 1: One-Way Push (MVP)**
1. Create Supabase Edge Function for Sanity push
2. Add "Publish to Sanity" button to ContentDetailModal
3. Support `master_content` → `post` mapping
4. Basic error handling

**Phase 2: Enhanced Push**
1. Support all content types
2. Field mapping UI
3. Preview before publish
4. Sync status tracking

**Phase 3: Bi-Directional (Advanced)**
1. Pull from Sanity
2. Conflict resolution
3. Webhook integration
4. Real-time sync

---

## 🔐 Security Considerations

1. **API Token Storage:** Use Supabase secrets (never client-side)
2. **RLS Policies:** Ensure only authorized users can sync
3. **Rate Limiting:** Respect Sanity API limits
4. **Content Validation:** Validate before pushing to Sanity
5. **Error Handling:** Don't expose Sanity credentials in errors

---

## 📈 Success Metrics

- **Sync Success Rate:** % of successful pushes
- **Sync Latency:** Time from click to Sanity document creation
- **Content Volume:** Number of documents synced per day/week
- **User Adoption:** % of users using Sanity sync feature

---

## 🚀 Next Steps

1. **Choose integration approach** (recommend Option 1 for MVP)
2. **Set up Sanity project** (already have `gv4os6ef`)
3. **Create Sanity schemas** matching Madison content types
4. **Build Edge Function** for content transformation & push
5. **Add UI components** for sync actions
6. **Test with sample content**
7. **Iterate based on feedback**

---

## 📚 Resources

- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Sanity GROQ Query Language](https://www.sanity.io/docs/groq)
- [Portable Text Specification](https://www.sanity.io/docs/block-content)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

## 💡 Questions to Consider

1. **Which content types should sync first?** (Recommend: `master_content` blog posts)
2. **Should sync be automatic or manual?** (Recommend: Manual with "Publish" button)
3. **How to handle conflicts?** (If bi-directional: Last-write-wins or merge strategy)
4. **What metadata to preserve?** (Madison ID, sync timestamp, quality rating, etc.)
5. **Should images sync?** (Yes, upload to Sanity asset library)



