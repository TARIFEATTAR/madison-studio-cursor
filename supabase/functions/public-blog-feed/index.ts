/**
 * Public Blog Feed API
 * 
 * Returns published blog content for external websites (like Asala)
 * No authentication required - only returns published, public content
 * 
 * Usage: GET /functions/v1/public-blog-feed?org=your-org-slug
 * Optional: ?limit=10&offset=0&type=blog_article
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow GET requests
  if (req.method !== "GET") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    
    // Query parameters
    const orgSlug = url.searchParams.get("org");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = parseInt(url.searchParams.get("offset") || "0");
    const contentType = url.searchParams.get("type"); // e.g., "blog_article", "blog_post"
    const postId = url.searchParams.get("id"); // Get single post by ID
    const postSlug = url.searchParams.get("slug"); // Get single post by slug

    // Create Supabase client with service role for read access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // If requesting a single post by ID
    if (postId) {
      const { data: post, error } = await supabase
        .from("master_content")
        .select(`
          id,
          title,
          full_content,
          content_type,
          status,
          published_at,
          created_at,
          updated_at,
          organization_id,
          organizations!inner(slug, name)
        `)
        .eq("id", postId)
        .eq("status", "published")
        .single();

      if (error || !post) {
        return new Response(
          JSON.stringify({ error: "Post not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const formattedPost = formatPost(post);
      return new Response(
        JSON.stringify({ post: formattedPost }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build query for multiple posts
    let query = supabase
      .from("master_content")
      .select(`
        id,
        title,
        full_content,
        content_type,
        status,
        published_at,
        created_at,
        updated_at,
        organization_id,
        organizations!inner(slug, name)
      `, { count: 'exact' })
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    // Filter by organization slug if provided
    if (orgSlug) {
      query = query.eq("organizations.slug", orgSlug);
    }

    // Filter by content type (blog posts)
    if (contentType) {
      query = query.ilike("content_type", `%${contentType}%`);
    } else {
      // Default: only blog-related content
      query = query.or("content_type.ilike.%blog%,content_type.ilike.%article%");
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: posts, error, count } = await query;

    if (error) {
      console.error("[public-blog-feed] Query error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to fetch posts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format posts for public consumption
    const formattedPosts: BlogPost[] = (posts || []).map(formatPost);

    return new Response(
      JSON.stringify({
        posts: formattedPosts,
        pagination: {
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit,
        },
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "public, max-age=60", // Cache for 1 minute
        } 
      }
    );

  } catch (error) {
    console.error("[public-blog-feed] Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function formatPost(post: any): BlogPost {
  // Generate slug from title if not available
  const slug = generateSlug(post.title);
  
  // Extract excerpt from content (first 200 chars, strip markdown/html)
  const excerpt = extractExcerpt(post.full_content, 200);
  
  return {
    id: post.id,
    title: post.title,
    slug: slug,
    content: post.full_content,
    excerpt: excerpt,
    content_type: post.content_type,
    published_at: post.published_at || post.created_at,
    created_at: post.created_at,
    updated_at: post.updated_at,
    // These can be added later when available in the schema
    author: undefined,
    featured_image: undefined,
    tags: [],
    meta_description: excerpt,
  };
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractExcerpt(content: string, maxLength: number): string {
  if (!content) return '';
  
  // Strip markdown/html tags
  let text = content
    .replace(/#{1,6}\s/g, '') // Remove markdown headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  if (text.length <= maxLength) return text;
  
  // Cut at word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 0 ? truncated.substring(0, lastSpace) : truncated) + '...';
}
