/**
 * Push Product to Sanity Edge Function
 *
 * Pushes Madison Studio product data to Sanity.io as `tarifeProduct` documents
 * Includes rich descriptions, scent notes, variants, and SEO data
 *
 * Usage:
 * POST /functions/v1/push-product-to-sanity
 * {
 *   productId: string (Madison product_hubs.id),
 *   publish: boolean (optional, default: false)
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient as createSanityClient } from "https://esm.sh/@sanity/client@6.8.6";
import { createClient as createSupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

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

interface PushProductRequest {
  productId: string;
  publish?: boolean;
}

/**
 * Get Sanity configuration from environment
 */
function getSanityConfig(): SanityConfig {
  const projectId = Deno.env.get("SANITY_PROJECT_ID");
  const dataset = Deno.env.get("SANITY_DATASET") || "production";
  const token = Deno.env.get("SANITY_API_TOKEN");
  const apiVersion = Deno.env.get("SANITY_API_VERSION") || "2024-01-01";

  if (!projectId || !token) {
    throw new Error(
      "Missing Sanity configuration. Set SANITY_PROJECT_ID and SANITY_API_TOKEN in Supabase secrets."
    );
  }

  return { projectId, dataset, token, apiVersion };
}

/**
 * Convert markdown text to Sanity Portable Text blocks
 */
function textToPortableText(text: string): any[] {
  if (!text) return [];

  const lines = text.split("\n");
  const blocks: any[] = [];
  let currentParagraph: string[] = [];

  const createBlock = (style: string, text: string) => ({
    _type: "block",
    _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
    style,
    children: [
      {
        _type: "span",
        _key: crypto.randomUUID().replace(/-/g, "").substring(0, 10),
        text,
        marks: [],
      },
    ],
  });

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push(createBlock("normal", currentParagraph.join(" ")));
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("# ")) {
      flushParagraph();
      blocks.push(createBlock("h1", trimmed.substring(2)));
    } else if (trimmed.startsWith("## ")) {
      flushParagraph();
      blocks.push(createBlock("h2", trimmed.substring(3)));
    } else if (trimmed.startsWith("### ")) {
      flushParagraph();
      blocks.push(createBlock("h3", trimmed.substring(4)));
    } else if (trimmed === "") {
      flushParagraph();
    } else {
      currentParagraph.push(trimmed);
    }
  }

  flushParagraph();

  return blocks.length > 0 ? blocks : [createBlock("normal", text)];
}

/**
 * Parse scent notes from product metadata or description
 */
function parseScentNotes(product: any): { top: string[]; heart: string[]; base: string[] } | null {
  // Check metadata first
  if (product.metadata?.scent_notes) {
    return product.metadata.scent_notes;
  }

  // Try to parse from description
  const description = product.long_description || product.short_description || "";
  const notes = { top: [] as string[], heart: [] as string[], base: [] as string[] };

  // Common patterns: "Top Notes: X, Y" or "Top: X, Y"
  const topMatch = description.match(/top\s*notes?:?\s*([^.\n]+)/i);
  const heartMatch = description.match(/(?:heart|middle)\s*notes?:?\s*([^.\n]+)/i);
  const baseMatch = description.match(/base\s*notes?:?\s*([^.\n]+)/i);

  if (topMatch) notes.top = topMatch[1].split(/[,&]/).map((s: string) => s.trim()).filter(Boolean);
  if (heartMatch) notes.heart = heartMatch[1].split(/[,&]/).map((s: string) => s.trim()).filter(Boolean);
  if (baseMatch) notes.base = baseMatch[1].split(/[,&]/).map((s: string) => s.trim()).filter(Boolean);

  return (notes.top.length || notes.heart.length || notes.base.length) ? notes : null;
}

/**
 * Map Madison product to Sanity tarifeProduct document
 */
function transformProductToSanity(product: any, shopifyData?: any): any {
  // Parent SKU (no size suffix) - for the product family
  const parentSku = (product.metadata?.parent_sku as string) || null;
  
  // Primary SKU (default variant - typically 6ml)
  const primarySku = product.sku || null;
  
  // Extract variant SKUs from metadata (6ml and 12ml)
  const sku6ml = (product.metadata?.sku_6ml as string) || null;
  const sku12ml = (product.metadata?.sku_12ml as string) || null;
  
  const doc: any = {
    _type: "tarifeProduct",
    _id: `madison-product-${product.id}`,
    title: product.name,
    slug: {
      _type: "slug",
      current: product.slug || product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    },
    // Parent SKU (no size - e.g., "PETAL-RITUAL")
    parentSku: parentSku,
    // Primary variant SKU (default size - e.g., "PETAL-RITUAL-6ML")
    sku: primarySku,
    // Individual variant SKUs
    sku6ml: sku6ml,
    sku12ml: sku12ml,
    shortDescription: product.short_description || product.tagline || null,
    price: product.price || null,
    compareAtPrice: product.compare_at_price || null,
    inStock: product.status === "active",
    isNew: product.tags?.includes("new") || false,
    isBestseller: product.tags?.includes("bestseller") || false,
    madisonProductId: product.id,
    madisonSyncedAt: new Date().toISOString(),
  };

  // Long description as Portable Text
  if (product.long_description) {
    doc.longDescription = textToPortableText(product.long_description);
  }

  // Scent notes
  const scentNotes = parseScentNotes(product);
  if (scentNotes) {
    doc.scentNotes = scentNotes;
  }

  // Collection mapping
  if (product.collections?.length > 0) {
    const collectionMap: Record<string, string> = {
      "terra": "terra",
      "petal": "petal",
      "tidal": "tidal",
      "relic": "relic",
      "atlas": "atlas",
      "humanities": "humanities",
    };
    const collection = product.collections.find((c: string) => collectionMap[c.toLowerCase()]);
    if (collection) doc.collection = collectionMap[collection.toLowerCase()];
  }

  // Product type → scent family mapping
  if (product.product_type) {
    const scentFamilyMap: Record<string, string> = {
      "woody": "woody",
      "floral": "floral",
      "fresh": "fresh",
      "oriental": "oriental",
      "aquatic": "aquatic",
      "spicy": "spicy",
      "gourmand": "gourmand",
    };
    const family = Object.keys(scentFamilyMap).find(
      (f) => product.product_type.toLowerCase().includes(f)
    );
    if (family) doc.scentFamily = scentFamilyMap[family];
  }

  // Key benefits and features
  if (product.key_benefits?.length > 0) {
    doc.keyBenefits = product.key_benefits;
  }
  if (product.key_differentiators?.length > 0) {
    doc.features = product.key_differentiators;
  }

  // SEO
  if (product.seo_title || product.seo_description || product.seo_keywords?.length > 0) {
    doc.seo = {
      title: product.seo_title || null,
      description: product.seo_description || null,
      keywords: product.seo_keywords || [],
    };
  }

  // Tags as features
  if (product.tags?.length > 0 && !doc.features) {
    doc.features = product.tags;
  }

  // Shopify link if available
  if (product.external_ids?.shopify_product_id) {
    doc.shopifyProductId = product.external_ids.shopify_product_id;
  } else if (shopifyData?.id) {
    doc.shopifyProductId = `gid://shopify/Product/${shopifyData.id}`;
  }

  return doc;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { productId, publish = false }: PushProductRequest = await req.json();

    if (!productId) {
      return new Response(
        JSON.stringify({ error: "Missing required field: productId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

    // Fetch product from Madison
    const { data: product, error: productError } = await supabase
      .from("product_hubs")
      .select("*")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Product fetch error:", productError);
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Sanity config and client
    const sanityConfig = getSanityConfig();
    const sanityClient = createSanityClient({
      projectId: sanityConfig.projectId,
      dataset: sanityConfig.dataset,
      token: sanityConfig.token,
      apiVersion: sanityConfig.apiVersion,
      useCdn: false,
    });

    // Transform and push to Sanity
    const sanityDoc = transformProductToSanity(product);
    console.log("Pushing product to Sanity:", sanityDoc._id);

    const result = await sanityClient.createOrReplace(sanityDoc);

    // Optionally publish
    if (publish) {
      // Sanity doesn't have a direct publish action via API
      // The document is already created - "publish" would involve removing draft prefix
      console.log("Document created/updated:", result._id);
    }

    // Update Madison product with Sanity sync status
    await supabase
      .from("product_hubs")
      .update({
        metadata: {
          ...product.metadata,
          sanity_synced_at: new Date().toISOString(),
          sanity_document_id: result._id,
        },
      })
      .eq("id", productId);

    return new Response(
      JSON.stringify({
        success: true,
        sanityDocumentId: result._id,
        sanityDocument: result,
        message: `Product "${product.name}" synced to Sanity`,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error pushing product to Sanity:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to push product to Sanity",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
