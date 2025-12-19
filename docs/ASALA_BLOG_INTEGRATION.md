# Asala Blog Integration Guide

This guide explains how to fetch blog content from Madison Studio and display it on your Asala website.

## Overview

Madison Studio provides a public API endpoint that returns published blog content. Your Asala site can fetch this content and display it without any authentication.

## API Endpoint

```
GET https://likkskifwsrvszxdvufw.supabase.co/functions/v1/public-blog-feed
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `org` | string | Organization slug (optional, filters by org) |
| `limit` | number | Number of posts to return (default: 10) |
| `offset` | number | Pagination offset (default: 0) |
| `type` | string | Content type filter (e.g., "blog_article") |
| `id` | string | Get single post by ID |
| `slug` | string | Get single post by slug |

### Response Format

```json
{
  "posts": [
    {
      "id": "uuid",
      "title": "Blog Post Title",
      "slug": "blog-post-title",
      "content": "Raw markdown/plain text content...",
      "content_html": "<h2>Rendered HTML</h2><p>Beautiful formatted content...</p>",
      "excerpt": "First 200 characters...",
      "content_type": "blog_article",
      "published_at": "2025-12-18T00:00:00Z",
      "created_at": "2025-12-17T00:00:00Z",
      "updated_at": "2025-12-18T00:00:00Z",
      "author": null,
      "featured_image": null,
      "tags": [],
      "meta_description": "SEO description..."
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

**Key fields:**
- `content` - Raw content (markdown/plain text) for custom rendering
- `content_html` - **Pre-rendered HTML** ready to display directly

---

## Integration Code for Asala

### 1. Create a Blog Service

Create a new file `src/services/blogService.ts`:

```typescript
// src/services/blogService.ts

const MADISON_API_URL = 'https://likkskifwsrvszxdvufw.supabase.co/functions/v1/public-blog-feed';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;           // Raw markdown/text
  content_html: string;      // Pre-rendered HTML (use this for display!)
  excerpt: string;
  content_type: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  author?: string;
  featured_image?: string;
  tags?: string[];
  meta_description?: string;
}

export interface BlogFeedResponse {
  posts: BlogPost[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export async function fetchBlogPosts(options?: {
  limit?: number;
  offset?: number;
  type?: string;
}): Promise<BlogFeedResponse> {
  const params = new URLSearchParams();
  
  if (options?.limit) params.set('limit', options.limit.toString());
  if (options?.offset) params.set('offset', options.offset.toString());
  if (options?.type) params.set('type', options.type);
  
  const response = await fetch(`${MADISON_API_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch blog posts');
  }
  
  return response.json();
}

export async function fetchBlogPost(id: string): Promise<BlogPost | null> {
  const response = await fetch(`${MADISON_API_URL}?id=${id}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch blog post');
  }
  
  const data = await response.json();
  return data.post;
}

export async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await fetch(`${MADISON_API_URL}?slug=${slug}`);
  
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch blog post');
  }
  
  const data = await response.json();
  return data.post;
}
```

### 2. Create a React Hook

Create `src/hooks/useBlog.ts`:

```typescript
// src/hooks/useBlog.ts
import { useState, useEffect } from 'react';
import { BlogPost, BlogFeedResponse, fetchBlogPosts, fetchBlogPost } from '../services/blogService';

export function useBlogPosts(options?: { limit?: number; offset?: number }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<BlogFeedResponse['pagination'] | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchBlogPosts(options);
        setPosts(data.posts);
        setPagination(data.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts');
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [options?.limit, options?.offset]);

  return { posts, loading, error, pagination };
}

export function useBlogPost(id: string) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchBlogPost(id);
        setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post');
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [id]);

  return { post, loading, error };
}
```

### 3. Blog List Component

Create `src/components/Blog/BlogList.tsx`:

```tsx
// src/components/Blog/BlogList.tsx
import { motion } from 'framer-motion';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useBlogPosts } from '../../hooks/useBlog';
import { BlogPost } from '../../services/blogService';

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function estimateReadTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

function BlogCard({ post, index }: BlogCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      {/* Featured Image Placeholder */}
      <div className="aspect-video bg-gradient-to-br from-agedBrass/20 to-vellum relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-20">📝</span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-stone-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {formatDate(post.published_at)}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {estimateReadTime(post.content)} min read
          </span>
        </div>
        
        {/* Title */}
        <h2 className="font-serif text-2xl text-inkBlack mb-3 group-hover:text-agedBrass transition-colors">
          {post.title}
        </h2>
        
        {/* Excerpt */}
        <p className="text-stone-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>
        
        {/* Read More */}
        <a
          href={`/journal/${post.slug}`}
          className="inline-flex items-center gap-2 text-agedBrass font-medium hover:gap-3 transition-all"
        >
          Read More
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </motion.article>
  );
}

export function BlogList() {
  const { posts, loading, error, pagination } = useBlogPosts({ limit: 9 });

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-stone-200 rounded-2xl mb-4" />
            <div className="h-4 bg-stone-200 rounded w-1/3 mb-3" />
            <div className="h-6 bg-stone-200 rounded w-3/4 mb-3" />
            <div className="h-4 bg-stone-200 rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-stone-500">No blog posts yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post, index) => (
          <BlogCard key={post.id} post={post} index={index} />
        ))}
      </div>
      
      {pagination?.hasMore && (
        <div className="text-center">
          <button className="px-6 py-3 bg-agedBrass text-white rounded-full hover:bg-agedBrass/90 transition-colors">
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
```

### 4. Single Blog Post Page (Uses Pre-Rendered HTML!)

Create `src/pages/BlogPost.tsx`:

```tsx
// src/pages/BlogPost.tsx
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react';
import { useBlogPost } from '../hooks/useBlog';

export function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { post, loading, error } = useBlogPost(id!);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-stone-200 rounded w-3/4 mb-4" />
        <div className="h-4 bg-stone-200 rounded w-1/3 mb-8" />
        <div className="space-y-4">
          <div className="h-4 bg-stone-200 rounded" />
          <div className="h-4 bg-stone-200 rounded" />
          <div className="h-4 bg-stone-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-serif text-inkBlack mb-4">Post not found</h1>
        <a href="/journal" className="text-agedBrass hover:underline">
          ← Back to Journal
        </a>
      </div>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto px-4 py-12"
    >
      {/* Back Link */}
      <a
        href="/journal"
        className="inline-flex items-center gap-2 text-stone-500 hover:text-agedBrass mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Journal
      </a>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-serif text-4xl md:text-5xl text-inkBlack mb-4">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-4 text-stone-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
          <button className="flex items-center gap-1 hover:text-agedBrass transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </header>

      {/* Content - Uses pre-rendered HTML from the API! */}
      <div 
        className="prose prose-lg prose-stone max-w-none
          prose-headings:font-serif prose-headings:text-inkBlack
          prose-p:text-stone-700 prose-p:leading-relaxed
          prose-a:text-agedBrass prose-a:no-underline hover:prose-a:underline
          prose-strong:text-inkBlack
          prose-blockquote:border-l-agedBrass prose-blockquote:text-stone-600
          prose-code:bg-stone-100 prose-code:px-1 prose-code:rounded"
        dangerouslySetInnerHTML={{ __html: post.content_html }}
      />
    </motion.article>
  );
}
```

**Note:** No external markdown library needed! The API returns `content_html` which is already rendered.

---

## Deployment Steps

### 1. Deploy the Madison API

```bash
cd madison-app
npx supabase functions deploy public-blog-feed
```

### 2. Add Code to Asala

Copy the files above into your Asala project:
- `src/services/blogService.ts`
- `src/hooks/useBlog.ts`
- `src/components/Blog/BlogList.tsx`
- `src/pages/BlogPost.tsx`

### 3. Install Dependencies

No additional dependencies needed! The API returns pre-rendered HTML.

(If you want custom markdown rendering, you can optionally use `content` field with `react-markdown`)

### 4. Add Routes

In your Asala router, add:
```tsx
<Route path="/journal" element={<BlogList />} />
<Route path="/journal/:id" element={<BlogPostPage />} />
```

---

## Testing

1. Create and publish a blog post in Madison Studio
2. Visit your Asala site's `/journal` page
3. The post should appear automatically!

---

## Customization

### Filtering by Content Type

To only show blog articles:
```typescript
const { posts } = useBlogPosts({ type: 'blog_article' });
```

### Styling

The example uses Tailwind classes matching your Asala brand:
- `inkBlack` - Primary text
- `agedBrass` - Accent color
- `vellum` - Background tones

Adjust as needed to match your exact brand tokens.

---

---

## Styling the Blog Content

The API returns semantic HTML that works beautifully with Tailwind's `prose` classes.

### Recommended Prose Styling

Add to your Asala's global CSS:

```css
/* src/styles/blog.css */

/* Beautiful blog typography using Asala brand */
.prose-asala {
  /* Headings */
  --tw-prose-headings: #1A1816; /* inkBlack */
  
  /* Body text */
  --tw-prose-body: #374151; /* stone-700 */
  
  /* Links */
  --tw-prose-links: #B8956A; /* agedBrass */
  
  /* Blockquote border */
  --tw-prose-quote-borders: #B8956A;
  
  /* Code backgrounds */
  --tw-prose-pre-bg: #F5F1E8; /* vellum */
}

/* Custom blockquote styling */
.prose blockquote {
  border-left-width: 4px;
  font-style: italic;
  padding-left: 1.5rem;
}

/* Code block styling */
.prose pre {
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.prose code {
  font-size: 0.875em;
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
}

/* Links with Asala gold hover */
.prose a {
  text-decoration: none;
  transition: color 0.2s;
}

.prose a:hover {
  text-decoration: underline;
}
```

### Using with Tailwind Prose

```tsx
<div 
  className="prose prose-lg max-w-none
    prose-headings:font-serif 
    prose-headings:text-inkBlack
    prose-p:text-stone-700 
    prose-p:leading-relaxed
    prose-a:text-agedBrass 
    prose-a:no-underline 
    hover:prose-a:underline
    prose-strong:text-inkBlack
    prose-blockquote:border-l-agedBrass 
    prose-blockquote:text-stone-600 
    prose-blockquote:italic
    prose-code:bg-vellum 
    prose-code:px-1 
    prose-code:rounded
    prose-pre:bg-vellum"
  dangerouslySetInnerHTML={{ __html: post.content_html }}
/>
```

---

## How Formatting is Guaranteed

The Madison API automatically converts your content to beautiful HTML:

| You Write (in Madison) | API Returns (HTML) |
|------------------------|-------------------|
| `# Heading` | `<h1>Heading</h1>` |
| `## Subheading` | `<h2>Subheading</h2>` |
| `**bold text**` | `<strong>bold text</strong>` |
| `*italic text*` | `<em>italic text</em>` |
| `[link](url)` | `<a href="url">link</a>` |
| `> quote` | `<blockquote>quote</blockquote>` |
| `- item` | `<ul><li>item</li></ul>` |
| ` ```code``` ` | `<pre><code>code</code></pre>` |
| Double newlines | `<p>paragraph</p>` |

---

## Questions?

This integration gives you:
- ✅ Real-time blog content from Madison
- ✅ **Pre-rendered HTML** - no client-side parsing needed
- ✅ SEO-friendly with proper semantic tags
- ✅ Responsive grid layout
- ✅ Pagination support
- ✅ Loading states with skeletons
- ✅ Error handling
- ✅ Beautiful typography out of the box
