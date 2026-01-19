# Sanity.io Integration Setup Guide

## 🚀 Quick Start

This guide will help you set up the integration between Madison Studio and Sanity.io.

---

## Prerequisites

1. **Sanity.io Account** - You already have projects: `gv4os6ef` (Best Bottles)
2. **Sanity Project ID** - `gv4os6ef`
3. **Sanity Dataset** - `production` (or your preferred dataset)
4. **Sanity API Token** - With write permissions

---

## Step 1: Create Sanity API Token

1. Go to [Sanity Manage](https://www.sanity.io/manage)
2. Select your project (`gv4os6ef` - Best Bottles)
3. Navigate to **API** → **Tokens**
4. Click **Add API token**
5. Name it: `Madison Studio Integration`
6. Set permissions: **Editor** (read + write)
7. Copy the token (starts with `sk...`)

**⚠️ Important:** Save this token securely - you'll need it for Step 2.

---

## Step 2: Add Sanity Secrets to Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Edge Functions** → **Secrets**
4. Add the following secrets:

### Required Secrets:

| Secret Name | Value | Description |
|------------|-------|-------------|
| `SANITY_PROJECT_ID` | `gv4os6ef` | Your Sanity project ID |
| `SANITY_DATASET` | `production` | Your Sanity dataset name |
| `SANITY_API_TOKEN` | `sk...` | The API token from Step 1 |
| `SANITY_API_VERSION` | `2024-01-01` | Sanity API version (optional, defaults to this) |

**Example:**
```
SANITY_PROJECT_ID = gv4os6ef
SANITY_DATASET = production
SANITY_API_TOKEN = skAbCdEf1234567890...
SANITY_API_VERSION = 2024-01-01
```

---

## Step 3: Deploy the Edge Function

1. **Deploy the function:**
   ```bash
   cd supabase/functions/push-to-sanity
   supabase functions deploy push-to-sanity
   ```

   Or if you're using the Supabase CLI from the project root:
   ```bash
   supabase functions deploy push-to-sanity --project-ref YOUR_PROJECT_REF
   ```

2. **Verify deployment:**
   - Go to Supabase Dashboard → **Edge Functions**
   - You should see `push-to-sanity` in the list
   - Status should be "Active"

---

## Step 4: Create Sanity Document Schemas

You need to create document types in Sanity that match your Madison content. Here are recommended schemas:

### Option A: Use Sanity MCP Tools (Recommended)

If you have the Sanity MCP server configured, you can deploy schemas directly:

```typescript
// Example: Create a 'post' schema for blog posts
{
  name: 'post',
  type: 'document',
  title: 'Blog Post',
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      validation: (Rule) => Rule.required()
    },
    {
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      options: {
        source: 'title'
      }
    },
    {
      name: 'content',
      type: 'array',
      title: 'Content',
      of: [{type: 'block'}]
    },
    {
      name: 'featuredImage',
      type: 'image',
      title: 'Featured Image'
    },
    {
      name: 'publishedAt',
      type: 'datetime',
      title: 'Published At'
    },
    {
      name: 'madisonId',
      type: 'string',
      title: 'Madison Content ID',
      readOnly: true
    },
    {
      name: 'madisonSyncStatus',
      type: 'string',
      title: 'Sync Status',
      readOnly: true,
      options: {
        list: ['synced', 'pending', 'error']
      }
    }
  ]
}
```

### Option B: Manual Schema Creation

1. Go to your Sanity Studio
2. Navigate to **Schema** → **Add schema type**
3. Create document types matching your content:
   - `post` - For blog posts
   - `article` - For articles
   - `emailCampaign` - For email content
   - `socialPost` - For social media posts

---

## Step 5: Test the Integration

1. **Open Madison Studio**
2. **Navigate to Library** → Select any content item
3. **Click "Publish to Sanity"** button
4. **Select document type** (e.g., "Blog Post")
5. **Choose publish option** (draft or published)
6. **Click "Publish to Sanity"**

### Expected Result:
- ✅ Success message: "Published to Sanity"
- ✅ Sanity document ID displayed
- ✅ Link to open in Sanity Studio

### Troubleshooting:

**Error: "Missing Sanity configuration"**
- Check that all secrets are set in Supabase
- Verify secret names match exactly (case-sensitive)

**Error: "Failed to fetch content"**
- Verify the content ID exists in Supabase
- Check RLS policies allow access

**Error: "Invalid document type"**
- Ensure the document type exists in your Sanity schema
- Check spelling matches exactly

---

## Step 6: Verify in Sanity Studio

1. Go to your Sanity Studio: `https://gv4os6ef.sanity.studio`
2. Navigate to the document type you published to
3. You should see your Madison content as a new document
4. Check that:
   - Title is correct
   - Content is formatted properly
   - `madisonId` field contains the Madison content ID
   - `madisonSyncStatus` is set to "synced"

---

## Advanced Configuration

### Custom Field Mapping

You can customize how Madison fields map to Sanity fields by modifying the Edge Function or adding field mapping in the UI component.

### Bi-Directional Sync

For two-way sync (Sanity → Madison), you'll need to:
1. Create a webhook in Sanity
2. Add a Supabase Edge Function to receive webhooks
3. Update Madison content when Sanity changes

### Image Sync

Currently, images are referenced by URL. To upload images to Sanity:
1. Modify the Edge Function to download images
2. Upload to Sanity asset library
3. Reference the Sanity asset ID

---

## Content Type Mappings

| Madison Content | Sanity Document Type | Recommended Schema |
|----------------|---------------------|-------------------|
| `master_content` (blog_post) | `post` | Blog post with full content |
| `master_content` (email_newsletter) | `emailCampaign` | Email with HTML/plain text |
| `derivative_assets` (instagram) | `socialPost` | Social post with images |
| `derivative_assets` (twitter) | `socialPost` | Social post with thread |
| `outputs` | `contentDraft` | Generic content draft |

---

## Security Best Practices

1. **Never commit API tokens** to Git
2. **Use Supabase secrets** for all sensitive data
3. **Set appropriate RLS policies** in Supabase
4. **Use read-only tokens** when possible (for read operations)
5. **Rotate tokens** periodically

---

## Support & Troubleshooting

### Common Issues

**"Function not found"**
- Verify the function is deployed
- Check function name matches exactly: `push-to-sanity`

**"Permission denied"**
- Verify API token has write permissions
- Check Sanity project permissions

**"Invalid document type"**
- Ensure schema exists in Sanity
- Check document type name matches exactly

### Getting Help

1. Check function logs in Supabase Dashboard
2. Review Sanity API documentation
3. Verify all secrets are set correctly
4. Test with a simple content item first

---

## Next Steps

1. ✅ Set up Sanity schemas for your content types
2. ✅ Test with a few content items
3. ✅ Customize field mappings if needed
4. ✅ Set up webhooks for bi-directional sync (optional)
5. ✅ Configure image upload to Sanity (optional)

---

## Resources

- [Sanity Client Documentation](https://www.sanity.io/docs/js-client)
- [Sanity GROQ Queries](https://www.sanity.io/docs/groq)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Portable Text Specification](https://www.sanity.io/docs/block-content)



