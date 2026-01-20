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
  organizationId?: string;
  linkedProductId?: string;
  linkedProductName?: string;
  publish?: boolean;
  fieldMapping?: Record<string, string>; // Custom field mapping
}

/**
 * Get Sanity configuration from Supabase secrets or DB
 * TODO: Fetch from organizations.brand_config if available
 */
async function getSanityConfig(organizationId?: string): Promise<SanityConfig> {
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

  // Remove potential HTML tags if any (very simple)
  const cleanMarkdown = markdown.replace(/<[^>]*>/g, "");
  const lines = cleanMarkdown.split("\n");
  const blocks: any[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(" ");
      blocks.push(buildTextBlock(text, "normal"));
      currentParagraph = [];
    }
  };

  const buildTextBlock = (text: string, style: string) => {
    // Basic bold/italic parsing
    // This is still simple but handles standard markdown patterns
    const children = [];
    let lastIndex = 0;

    // Pattern for bold (** or __) and italic (* or _)
    // Simplified regex for basic cases
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      // Add plain text before match
      if (match.index > lastIndex) {
        children.push({
          _type: "span",
          _key: crypto.randomUUID().substring(0, 10),
          text: text.substring(lastIndex, match.index),
          marks: [],
        });
      }

      const isBold = match[1] === "**" || match[1] === "__";
      const isItalic = match[3] === "*" || match[3] === "_";
      const content = isBold ? match[2] : match[4];

      children.push({
        _type: "span",
        _key: crypto.randomUUID().substring(0, 10),
        text: content,
        marks: isBold ? ["strong"] : isItalic ? ["em"] : [],
      });

      lastIndex = regex.lastIndex;
    }

    // Add remaining plain text
    if (lastIndex < text.length) {
      children.push({
        _type: "span",
        _key: crypto.randomUUID().substring(0, 10),
        text: text.substring(lastIndex),
        marks: [],
      });
    }

    return {
      _type: "block",
      _key: crypto.randomUUID().substring(0, 10),
      style: style,
      children: children.length > 0 ? children : [{
        _type: "span",
        _key: crypto.randomUUID().substring(0, 10),
        text: text,
        marks: [],
      }],
    };
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      blocks.push(buildTextBlock(trimmed.substring(2), "h1"));
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push(buildTextBlock(trimmed.substring(3), "h2"));
    } else if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push(buildTextBlock(trimmed.substring(4), "h3"));
    } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      flushParagraph();
      blocks.push({
        ...buildTextBlock(trimmed.substring(2), "normal"),
        listItem: "bullet",
        level: 1,
      });
    } else if (/^\d+\. /.test(trimmed)) {
      flushParagraph();
      blocks.push({
        ...buildTextBlock(trimmed.replace(/^\d+\. /, ""), "normal"),
        listItem: "number",
        level: 1,
      });
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();

  return blocks.length > 0 ? blocks : [buildTextBlock(markdown, "normal")];
}

/**
 * Transform Madison content to Sanity document
 */
async function transformContentToSanity(
  content: any,
  contentType: string,
  sanityDocumentType: string,
  sanityClient: any,
  extraMetadata?: any,
  linkedProduct?: { id: string; name: string; sanityId: string }
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
  if (sanityDocumentType === "post" || sanityDocumentType === "article" || sanityDocumentType === "blog_article" || sanityDocumentType === "journal" || sanityDocumentType === "fieldJournal") {
    // Standard fields for Sanity Inboxes/Workflows
    mappings.status = 'draft';
    mappings.readyForReview = true;
    mappings.lastSyncedFromMadison = new Date().toISOString();

    const contentField = contentType === "master"
      ? content.full_content
      : content.generated_content || content.content || "";

    const portableText = markdownToPortableText(contentField);

    // Brute force content mapping to cover all possible schema names
    mappings.content = portableText;
    mappings.body = portableText;
    mappings.longDescription = portableText;
    mappings.description = portableText;
    mappings.text = portableText;
    mappings.blocks = portableText;
    mappings.article_body = portableText;

    const slugValue = content.title
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `post-${content.id.substring(0, 8)}`;

    const slugRef = {
      _type: "slug",
      current: slugValue,
    };

    mappings.slug = slugRef;
    mappings.path = slugRef; // Some schemas use 'path'
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

        const imageRef = {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        };

        // Brute force image mapping
        mappings.featuredImage = imageRef;
        mappings.mainImage = imageRef;
        mappings.image = imageRef;
        mappings.media = imageRef;
        mappings.heroImage = imageRef;
        mappings.thumbnail = imageRef;
        mappings.coverImage = imageRef;
        mappings.asset = imageRef;
        mappings.landscape_image = imageRef;
        mappings.article_image = imageRef;

        console.log("[push-to-sanity] Image uploaded successfully:", asset._id);
      } catch (imgError) {
        console.error("[push-to-sanity] Image upload failed, skipping image:", imgError);
        // We continue without the image rather than failing the whole push
      }
    }

    // Add product reference if linked
    if (linkedProduct?.sanityId) {
      const productRef = {
        _type: "reference",
        _ref: linkedProduct.sanityId,
      };
      mappings.product = productRef;
      mappings.perfume = productRef; // Some schemas use 'perfume'
      mappings.relatedProduct = productRef;
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
      organizationId,
      linkedProductId,
      linkedProductName,
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

    console.log("[push-to-sanity] Request received:", { contentId, contentType, sanityDocumentType, organizationId, publish });

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
    const sanityConfig = await getSanityConfig(organizationId);

    // Initialize Sanity client
    const sanityClient = createClient({
      projectId: sanityConfig.projectId as string,
      dataset: sanityConfig.dataset as string,
      token: sanityConfig.token as string,
      apiVersion: sanityConfig.apiVersion as string,
      useCdn: false,
    });

    // Lookup linked product in Sanity if provided
    let linkedProductData = null;
    if (linkedProductId && linkedProductName) {
      console.log(`[push-to-sanity] Looking up linked product: ${linkedProductName}`);
      try {
        const existingProducts = await sanityClient.fetch(
          `*[_type in ["product", "tarifeProduct"] && (title == $title || sku == $sku || madisonProductId == $id)][0]`,
          { title: linkedProductName, id: linkedProductId, sku: linkedProductId }
        );
        if (existingProducts) {
          linkedProductData = {
            id: linkedProductId,
            name: linkedProductName,
            sanityId: existingProducts._id
          };
          console.log(`[push-to-sanity] Found linked product in Sanity: ${existingProducts._id}`);
        }
      } catch (err) {
        console.warn(`[push-to-sanity] Failed to lookup linked product:`, err);
      }
    }

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
      inboxMetadata,
      linkedProductData
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



