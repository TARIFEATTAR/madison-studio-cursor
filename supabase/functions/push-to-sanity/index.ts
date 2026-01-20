/**
 * Push to Sanity Edge Function
 *
 * Pushes Madison Studio content to Sanity.io
 *
 * Usage:
 * POST /functions/v1/push-to-sanity
 * {
 *   contentId: string,
 *   contentType: 'master' | 'derivative' | 'output',
 *   sanityDocumentType: 'post' | 'article' | 'emailCampaign' | 'socialPost',
 *   publish: boolean (optional, default: false)
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@sanity/client@6.8.6";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SanityConfig {
  projectId: string;
  dataset: string;
  token: string;
  apiVersion: string;
}

interface PushRequest {
  contentId: string;
  contentType: "master" | "derivative" | "output";
  sanityDocumentType: string;
  publish?: boolean;
  fieldMapping?: Record<string, string>; // Custom field mapping
}

/**
 * Get Sanity configuration from Supabase secrets
 */
async function getSanityConfig(): Promise<SanityConfig> {
  const projectId = Deno.env.get("SANITY_PROJECT_ID") || "8h5l91ut";
  const dataset = Deno.env.get("SANITY_DATASET") || "production";
  const token = Deno.env.get("SANITY_WRITE_TOKEN");
  const apiVersion = Deno.env.get("SANITY_API_VERSION") || "2024-01-01";

  if (!projectId || !token) {
    throw new Error(
      "Missing Sanity configuration. Set SANITY_PROJECT_ID and SANITY_WRITE_TOKEN in Supabase secrets."
    );
  }

  return { projectId, dataset, token, apiVersion };
}

/**
 * Convert Markdown to Sanity Portable Text blocks
 * Simple implementation - can be enhanced with full markdown parser
 */
function markdownToPortableText(markdown: string): any[] {
  if (!markdown) return [];

  const lines = markdown.split("\n");
  const blocks: any[] = [];
  let currentParagraph: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith("# ")) {
      if (currentParagraph.length > 0) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
              text: currentParagraph.join(" "),
              marks: [],
            },
          ],
        });
        currentParagraph = [];
      }
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
        style: "h1",
        children: [
          {
            _type: "span",
            _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
            text: trimmed.substring(2),
            marks: [],
          },
        ],
      });
    } else if (trimmed.startsWith("## ")) {
      if (currentParagraph.length > 0) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
              text: currentParagraph.join(" "),
              marks: [],
            },
          ],
        });
        currentParagraph = [];
      }
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
        style: "h2",
        children: [
          {
            _type: "span",
            _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
            text: trimmed.substring(3),
            marks: [],
          },
        ],
      });
    } else if (trimmed.startsWith("### ")) {
      if (currentParagraph.length > 0) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
              text: currentParagraph.join(" "),
              marks: [],
            },
          ],
        });
        currentParagraph = [];
      }
      blocks.push({
        _type: "block",
        _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
        style: "h3",
        children: [
          {
            _type: "span",
            _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
            text: trimmed.substring(4),
            marks: [],
          },
        ],
      });
    } else if (trimmed === "") {
      // Empty line - end current paragraph
      if (currentParagraph.length > 0) {
        blocks.push({
          _type: "block",
          _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
          style: "normal",
          children: [
            {
              _type: "span",
              _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
              text: currentParagraph.join(" "),
              marks: [],
            },
          ],
        });
        currentParagraph = [];
      }
    } else {
      currentParagraph.push(trimmed);
    }
  }

  // Add remaining paragraph
  if (currentParagraph.length > 0) {
    blocks.push({
      _type: "block",
      _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
      style: "normal",
      children: [
        {
          _type: "span",
          _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
          text: currentParagraph.join(" "),
          marks: [],
        },
      ],
    });
  }

  return blocks.length > 0 ? blocks : [
    {
      _type: "block",
      _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
      style: "normal",
      children: [
        {
          _type: "span",
          _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
          text: markdown,
          marks: [],
        },
      ],
    },
  ];
}

/**
 * Transform Madison content to Sanity document
 */
async function transformContentToSanity(
  content: any,
  contentType: string,
  sanityDocumentType: string,
  sanityClient: any,
  extraMetadata?: any
): Promise<any> {
  const baseDoc: any = {
    _type: sanityDocumentType,
    _id: `madison-${content.id}`,
  };

  // Default field mappings
  const mappings: Record<string, any> = {
    title: content.title || "Untitled",
    madisonId: content.id,
    madisonContentType: contentType,
    madisonSyncStatus: "synced",
    madisonSyncedAt: new Date().toISOString(),
  };

  // Add content based on document type
  if (sanityDocumentType === "post" || sanityDocumentType === "article" || sanityDocumentType === "blog_article") {
    // Standard fields for Sanity Inboxes/Workflows
    mappings.status = 'draft';
    mappings.readyForReview = true;
    mappings.lastSyncedFromMadison = new Date().toISOString();

    const contentField = contentType === "master"
      ? content.full_content
      : content.generated_content || content.content || "";

    mappings.content = markdownToPortableText(contentField);
    mappings.slug = {
      _type: "slug",
      current: content.title
        ?.toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || `post-${content.id.substring(0, 8)}`,
    };
    mappings.publishedAt = content.published_at || content.created_at || new Date().toISOString();

    if (content.featured_image_url) {
      try {
        console.log("[push-to-sanity] Uploading image to Sanity:", content.featured_image_url);

        // Fetch the image from the URL
        const imageRes = await fetch(content.featured_image_url);
        if (!imageRes.ok) throw new Error(`Failed to fetch image: ${imageRes.statusText}`);

        const imageBlob = await imageRes.blob();

        // Upload to Sanity
        const asset = await sanityClient.assets.upload('image', imageBlob, {
          filename: content.title ? `${content.title.substring(0, 20)}.jpg` : 'featured-image.jpg'
        });

        mappings.featuredImage = {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        };
        console.log("[push-to-sanity] Image uploaded successfully:", asset._id);
      } catch (imgError) {
        console.error("[push-to-sanity] Image upload failed, skipping image:", imgError);
        // We continue without the image rather than failing the whole push
      }
    }
  } else if (sanityDocumentType === "emailCampaign") {
    mappings.subject = content.metadata?.subject || content.title;
    mappings.htmlContent = content.full_content || content.generated_content;
    mappings.plainText = (content.full_content || content.generated_content || "")
      .replace(/<[^>]*>/g, ""); // Strip HTML
  } else if (sanityDocumentType === "socialPost") {
    mappings.platform = content.asset_type || content.content_type;
    mappings.caption = content.generated_content || content.content;
    mappings.scheduledAt = content.scheduled_date || null;
  }

  // Apply extra metadata if provided
  if (extraMetadata) {
    Object.entries(extraMetadata).forEach(([key, value]) => {
      mappings[key] = value;
    });
  }

  return { ...baseDoc, ...mappings };
}

/**
 * Fetch content from Supabase
 */
async function fetchContent(
  supabaseUrl: string,
  supabaseKey: string,
  contentId: string,
  contentType: string
): Promise<any> {
  const tableMap: Record<string, string> = {
    master: "master_content",
    derivative: "derivative_assets",
    output: "outputs",
  };

  const table = tableMap[contentType];
  if (!table) {
    throw new Error(`Invalid contentType: ${contentType}`);
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/${table}?id=eq.${contentId}&select=*`,
    {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch content: ${response.statusText}`);
  }

  const data = await response.json();
  if (!data || data.length === 0) {
    throw new Error(`Content not found: ${contentId}`);
  }

  return data[0];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      contentId,
      contentType,
      sanityDocumentType,
      publish = false,
      fieldMapping,
    }: PushRequest = await req.json();

    if (!contentId || !contentType || !sanityDocumentType) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: contentId, contentType, sanityDocumentType",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("[push-to-sanity] Request received:", { contentId, contentType, sanityDocumentType, publish });

    // Get Supabase config
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log("[push-to-sanity] Supabase URL exists:", !!supabaseUrl);
    console.log("[push-to-sanity] Service key exists:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase configuration");
    }

    // Fetch content from Supabase
    console.log("[push-to-sanity] Fetching content from table...");
    const content = await fetchContent(supabaseUrl, supabaseKey, contentId, contentType);
    console.log("[push-to-sanity] Content fetched:", content?.title || content?.id);

    // Get Sanity config
    const sanityConfig = await getSanityConfig();

    // Initialize Sanity client
    const sanityClient = createClient({
      projectId: sanityConfig.projectId as string,
      dataset: sanityConfig.dataset as string,
      token: sanityConfig.token as string,
      apiVersion: sanityConfig.apiVersion as string,
      useCdn: false,
    });

    // Standard fields for Sanity Inboxes/Workflows
    const inboxMetadata = {
      status: 'inbox',
      state: 'inbox',
      workflow: 'inbox',
      readyForReview: true,
      lastSyncedFromMadison: new Date().toISOString(),
    };

    // Transform content to Sanity format
    const sanityDoc = await transformContentToSanity(
      content,
      contentType,
      sanityDocumentType,
      sanityClient,
      inboxMetadata
    );

    // Create or update document in Sanity
    // We prefix with drafts. to ensure it shows up in the Sanity Studio inbox
    const draftId = `drafts.madison-${content.id}`;
    const finalDoc = { ...sanityDoc, _id: draftId };

    console.log("[push-to-sanity] Attempting createOrReplace for:", draftId);
    const result = await sanityClient.createOrReplace(finalDoc);

    // Verify it exists right after creation
    const verify = await sanityClient.getDocument(result._id);
    console.log("[push-to-sanity] Verification - Document exists in Sanity:", !!verify);

    // Publish if requested (this removes the drafts. prefix for a live version)
    if (publish) {
      console.log("[push-to-sanity] Publishing document...");
      await sanityClient.createOrReplace({
        ...result,
        _id: `madison-${content.id}`
      });
      // Optionally delete the draft after publishing
      await sanityClient.delete(draftId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        sanityDocumentId: result._id,
        verified: !!verify,
        published: publish,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error pushing to Sanity:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to push content to Sanity",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});



