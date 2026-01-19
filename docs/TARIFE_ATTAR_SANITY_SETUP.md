# Tarife Attar - Madison → Sanity Integration

## ✅ Already Complete

| Step | Status | Details |
|------|--------|---------|
| Sanity Project | ✅ | `8h5l91ut` - Tarife-Attar-Sanity |
| Dataset | ✅ | `production` |
| **Blog Post Schema** | ✅ | `post` type with 12 fields |
| **Author Schema** | ✅ | `author` type with 4 fields |
| **Product Schema** | ✅ | `tarifeProduct` type for enriched product data |
| Shopify Sync | ✅ | Products syncing from `vasana-perfumes.myshopify.com` |

---

## 🔧 Configuration Needed

### Step 1: Create Sanity API Token

1. Go to [Sanity Manage → Tarife-Attar-Sanity](https://www.sanity.io/manage/project/8h5l91ut)
2. Navigate to **API** → **Tokens**
3. Click **Add API token**
4. Configure:
   - **Name:** `Madison Studio Integration`
   - **Permissions:** `Editor` (read + write)
5. Copy the token (starts with `sk...`)

### Step 2: Add Secrets to Supabase

Go to [Supabase Dashboard](https://supabase.com/dashboard) → Settings → Edge Functions → Secrets

Add these secrets:

```
SANITY_PROJECT_ID = 8h5l91ut
SANITY_DATASET = production
SANITY_API_TOKEN = sk... (paste your token here)
SANITY_API_VERSION = 2024-01-01
```

### Step 3: Deploy the Edge Functions

```bash
cd /Users/jordanrichter/Projects/Madison\ Studio/madison-app

# Deploy blog post sync
npx supabase functions deploy push-to-sanity

# Deploy product sync
npx supabase functions deploy push-product-to-sanity
```

---

## 📝 How to Use

### Blog Posts (from Madison Library):

1. **Create a blog post** in Madison
2. Go to **Library** → Select the content
3. Click **"Publish to Sanity"**
4. Choose **"Blog Post"** as the document type
5. Select **Draft** or **Publish** 
6. Click **Publish to Sanity**

### Products (from Madison Products):

1. **Create/edit a product** in Madison Product Hub
2. Fill in descriptions, scent notes, benefits, SEO
3. Click **"Push to Sanity"** button
4. Product syncs to `tarifeProduct` document
5. Your headless site displays enriched product data

---

## 🛍️ Product Sync Details

### What Gets Synced (Products):

| Madison Field | → | Sanity Field |
|--------------|---|--------------|
| `name` | → | `title` |
| `slug` | → | `slug` |
| `sku` | → | `sku` |
| `short_description` | → | `shortDescription` |
| `long_description` | → | `longDescription` (Portable Text) |
| `price` | → | `price` |
| `collections` | → | `collection` (terra/petal/tidal/etc) |
| `key_benefits` | → | `keyBenefits` |
| `key_differentiators` | → | `features` |
| `seo_title` | → | `seo.title` |
| `seo_description` | → | `seo.description` |
| Product ID | → | `madisonProductId` |

### Scent Notes Parsing

If your product description contains scent notes in this format:

```
Top Notes: Bergamot, Lemon
Heart Notes: Rose, Jasmine
Base Notes: Sandalwood, Musk
```

They'll automatically be parsed into structured `scentNotes` data.

---

## 📄 Blog Post Sync Details

### What Gets Synced (Blog Posts):

| Madison Field | → | Sanity Field |
|--------------|---|--------------|
| `title` | → | `title` |
| `full_content` | → | `content` (Portable Text) |
| `featured_image_url` | → | `featuredImage` |
| `published_at` | → | `publishedAt` |
| Content ID | → | `madisonId` |
| - | → | `madisonSyncStatus: "synced"` |

---

## 🌐 Your Headless Site

Your headless site should fetch from Sanity using GROQ:

### Product Queries

```typescript
// Fetch all products
const productsQuery = `*[_type == "tarifeProduct" && inStock == true] | order(title asc) {
  _id,
  title,
  slug,
  shortDescription,
  price,
  mainImage,
  collection,
  scentFamily,
  scentNotes,
  isNew,
  isBestseller,
  shopifyProductId
}`;

// Fetch single product by slug
const productQuery = `*[_type == "tarifeProduct" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  shortDescription,
  longDescription,
  price,
  compareAtPrice,
  mainImage,
  gallery,
  collection,
  scentFamily,
  scentNotes,
  features,
  keyBenefits,
  ingredients,
  usage,
  longevity,
  sillage,
  seo,
  variants,
  shopifyProductId
}`;

// Fetch products by collection
const collectionQuery = `*[_type == "tarifeProduct" && collection == $collection] | order(title asc)`;
```

### Blog Post Queries

```typescript
// Fetch all blog posts
const postsQuery = `*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  content,
  excerpt,
  featuredImage,
  publishedAt,
  author,
  tags
}`;

// Fetch single post by slug
const postQuery = `*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  content,
  featuredImage,
  publishedAt,
  author,
  tags
}`;
```

### With Sanity Client:

```typescript
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: '8h5l91ut',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01',
});

// Fetch all products
const products = await client.fetch(`*[_type == "tarifeProduct" && inStock == true]`);

// Fetch products in Terra collection
const terraProducts = await client.fetch(
  `*[_type == "tarifeProduct" && collection == $collection]`,
  { collection: 'terra' }
);

// Fetch single product
const product = await client.fetch(
  `*[_type == "tarifeProduct" && slug.current == $slug][0]`,
  { slug: 'riyadh' }
);
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| Sanity Studio | https://8h5l91ut.sanity.studio |
| Sanity Manage | https://www.sanity.io/manage/project/8h5l91ut |
| Madison Library | https://madison.studio/library |

---

## 📊 Content Types Available

### `tarifeProduct` (Product) - **For Headless Site**
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Product name (required) |
| `slug` | slug | URL-friendly identifier |
| `sku` | string | Product SKU |
| `shortDescription` | text | Tagline/brief description |
| `longDescription` | Portable Text | Full product story |
| `scentNotes` | object | `{top: [], heart: [], base: []}` |
| `mainImage` | image | Hero product image |
| `gallery` | array of images | Additional product images |
| `price` | number | Product price |
| `compareAtPrice` | number | Original/compare price |
| `variants` | array | Size/price variants |
| `collection` | string | terra/petal/tidal/relic/atlas/humanities |
| `scentFamily` | string | woody/floral/fresh/oriental/etc |
| `features` | array of strings | Product features |
| `keyBenefits` | array of strings | Key benefits |
| `ingredients` | text | Ingredient list |
| `usage` | text | How to use |
| `longevity` | string | Duration (e.g., "24+ hours") |
| `sillage` | string | intimate/moderate/strong/beast |
| `inStock` | boolean | Availability |
| `isNew` | boolean | New arrival badge |
| `isBestseller` | boolean | Bestseller badge |
| `seo` | object | `{title, description, keywords}` |
| `shopifyProductId` | string | Links to Shopify for checkout |
| `madisonProductId` | string | Madison product ID (readonly) |
| `madisonSyncedAt` | datetime | Last sync time (readonly) |

### `post` (Blog Post)
| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Post title (required) |
| `slug` | slug | URL-friendly identifier |
| `content` | array of blocks | Rich text content |
| `excerpt` | text | Short summary |
| `featuredImage` | image | Hero image with hotspot |
| `publishedAt` | datetime | Publication date |
| `author` | string | Author name |
| `tags` | array of strings | Content tags |
| `madisonId` | string | Madison content ID (readonly) |
| `madisonSyncStatus` | string | Sync status (readonly) |
| `madisonSyncedAt` | datetime | Last sync time (readonly) |

### `author` (Author)
| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Author name (required) |
| `slug` | slug | URL-friendly identifier |
| `image` | image | Author photo |
| `bio` | text | Author biography |

---

## 🔄 Workflow Summary

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│     SHOPIFY     │      │  MADISON STUDIO │      │    SANITY.IO    │
│                 │      │                 │      │                 │
│  Product Names  │─────▶│  Enrich with    │─────▶│ tarifeProduct   │
│  SKUs, Prices   │ Sync │  Descriptions   │ Push │  (rich data)    │
│  Inventory      │      │  Scent Notes    │      │                 │
│                 │      │  SEO Content    │      │  Blog Posts     │
└─────────────────┘      │  Brand Voice    │      │  (post)         │
                         │                 │      │                 │
                         │  Create Blog    │─────▶│                 │
                         │  Posts with AI  │ Push │                 │
                         └─────────────────┘      └────────┬────────┘
                                                           │
                                                           │ Query
                                                           ▼
                         ┌─────────────────────────────────────────────┐
                         │              HEADLESS SITE                  │
                         │                                             │
                         │  • Products with rich descriptions          │
                         │  • Scent notes (top/heart/base)            │
                         │  • Blog posts with brand voice             │
                         │  • SEO-optimized content                   │
                         │  • Checkout via Shopify (shopifyProductId) │
                         └─────────────────────────────────────────────┘
```

### Key Points:
- **Shopify** = Inventory, pricing, checkout
- **Madison** = Content creation with AI + brand voice
- **Sanity** = Content delivery for headless site
- **Headless Site** = Reads from Sanity, checkout via Shopify

---

## 🧪 Testing the Integration

### 1. Test Query in Sanity Vision

Go to https://8h5l91ut.sanity.studio → Vision tab

Run:
```groq
*[_type == "post"]
```

Should return your Madison-synced posts.

### 2. Test from Madison

1. Create a test blog post in Madison
2. Publish to Sanity
3. Verify in Sanity Studio

---

## ❓ Troubleshooting

**"Missing Sanity configuration"**
- Verify all 4 secrets are set in Supabase

**"Permission denied"**  
- Check API token has Editor permissions

**"Document type not found"**
- Schema is deployed, refresh Sanity Studio

**"Content not syncing"**
- Check Edge Function logs in Supabase

---

## 📞 Support

- Madison docs: `/docs/SANITY_SETUP_GUIDE.md`
- Sanity docs: https://www.sanity.io/docs
- Edge function: `supabase/functions/push-to-sanity/index.ts`
