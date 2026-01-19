/**
 * Sync Sanity Products - Pull products from Sanity.io into Madison Studio
 *
 * This edge function fetches all products from a Sanity dataset
 * and syncs them to the brand_products table.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Sanity API query helper
async function querySanity(projectId: string, dataset: string, query: string, token?: string) {
  const encodedQuery = encodeURIComponent(query);
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodedQuery}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Sanity API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.result;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (e) {
      throw new Error("Invalid request body. Expected JSON.");
    }

    const { organization_id, sanity_project_id, sanity_dataset } = requestBody;

    if (!organization_id) {
      return new Response(
        JSON.stringify({ success: false, error: "organization_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use provided values or defaults for Tarife Attar
    const projectId = sanity_project_id || Deno.env.get("SANITY_PROJECT_ID") || "8h5l91ut";
    const dataset = sanity_dataset || Deno.env.get("SANITY_DATASET") || "production";
    const token = Deno.env.get("SANITY_API_TOKEN"); // Optional, for private datasets

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    console.log(`[sync-sanity-products] Starting sync from Sanity project: ${projectId}, dataset: ${dataset}`);

    // Query for all products from Sanity
    // This query handles both custom tarifeProduct schema and Shopify-synced products
    const sanityQuery = `*[_type in ["tarifeProduct", "product", "shopifyProduct"]] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      title,
      "slug": slug.current,
      sku,
      shortDescription,
      longDescription,
      "description": coalesce(shortDescription, pt::text(longDescription)),
      price,
      compareAtPrice,
      "mainImage": mainImage.asset->url,
      "gallery": gallery[].asset->url,
      collection,
      scentFamily,
      "scentNotes": {
        "top": scentNotes.top,
        "heart": scentNotes.heart,
        "base": scentNotes.base
      },
      features,
      keyBenefits,
      ingredients,
      usage,
      longevity,
      sillage,
      inStock,
      isNew,
      isBestseller,
      "variants": variants[] {
        title,
        sku,
        price,
        size,
        inStock
      },
      "seo": {
        "title": seo.title,
        "description": seo.description
      },
      shopifyProductId,
      madisonProductId
    }`;

    const products = await querySanity(projectId, dataset, sanityQuery, token);

    console.log(`[sync-sanity-products] Fetched ${products?.length || 0} products from Sanity`);

    if (!products || products.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No products found in Sanity",
          updated: 0,
          inserted: 0,
          total: 0,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Map Sanity products to Madison brand_products schema
    const mappedProducts = products.map((product: any) => {
      // Build scent notes string from object
      const scentNotes = product.scentNotes || {};
      const topNotes = scentNotes.top?.join(", ") || null;
      const middleNotes = scentNotes.heart?.join(", ") || null;
      const baseNotes = scentNotes.base?.join(", ") || null;

      // Build variants JSONB
      const variants = (product.variants || []).map((v: any, index: number) => ({
        id: `sanity-${product._id}-${index}`,
        title: v.title || v.size || `Variant ${index + 1}`,
        sku: v.sku || null,
        price: v.price || product.price || 0,
        compare_at_price: null,
        inventory_quantity: v.inStock ? 10 : 0, // Default stock assumption
        option1: v.size || null,
        position: index + 1,
        sanity_variant_id: `${product._id}-${index}`,
      }));

      // Build images JSONB
      const images: any[] = [];
      if (product.mainImage) {
        images.push({
          id: "main",
          src: product.mainImage,
          position: 1,
          alt: product.title,
          sanity_image_id: "main",
        });
      }
      (product.gallery || []).forEach((url: string, index: number) => {
        images.push({
          id: `gallery-${index}`,
          src: url,
          position: index + 2,
          alt: product.title,
          sanity_image_id: `gallery-${index}`,
        });
      });

      // Handle description - could be string or Portable Text
      let description = product.description || product.shortDescription || null;
      if (typeof description === "object") {
        // If it's Portable Text, try to extract plain text
        description = JSON.stringify(description);
      }

      return {
        organization_id,
        name: product.title,
        handle: product.slug || product.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description,
        sku: product.sku || null,
        price: product.price || null,
        compare_at_price: product.compareAtPrice || null,
        collection: product.collection || null,
        scent_family: product.scentFamily || null,
        top_notes: topNotes,
        middle_notes: middleNotes,
        base_notes: baseNotes,
        benefits: product.keyBenefits?.join(", ") || null,
        usage: product.usage || null,
        longevity_hours: product.longevity || null,
        sillage_description: product.sillage || null,
        key_ingredients: product.ingredients || null,
        variants: JSON.stringify(variants),
        images: JSON.stringify(images),
        featured_image_url: product.mainImage || null,
        status: product.inStock ? "active" : "draft",
        tags: [
          product.isNew ? "new" : null,
          product.isBestseller ? "bestseller" : null,
        ].filter(Boolean),
        seo_title: product.seo?.title || null,
        seo_description: product.seo?.description || null,
        // Sanity-specific tracking
        shopify_product_id: product.shopifyProductId || null,
        // We'll use a custom field to track Sanity source
        usp: product.madisonProductId ? null : `sanity:${product._id}`, // Use USP temporarily to track Sanity ID
      };
    });

    // Fetch existing products to check for updates
    const sanityIds = mappedProducts.map((p: any) => `sanity:${p.usp?.replace("sanity:", "") || ""}`);
    const names = mappedProducts.map((p: any) => p.name);

    const { data: existingProducts } = await supabase
      .from("brand_products")
      .select("id, name, usp, description")
      .eq("organization_id", organization_id)
      .or(`name.in.(${names.map((n: string) => `"${n.replace(/"/g, '\\"')}"`).join(",")})`);

    const existingByName = new Map(existingProducts?.map((p) => [p.name, p]) || []);
    const existingByUsp = new Map(existingProducts?.map((p) => [p.usp, p]) || []);

    let updatedCount = 0;
    let insertedCount = 0;

    // Process each product
    for (const product of mappedProducts) {
      // Check if exists by name or Sanity ID in USP
      const existingByNameMatch = existingByName.get(product.name);
      const existingByUspMatch = existingByUsp.get(product.usp);
      const existing = existingByNameMatch || existingByUspMatch;

      if (existing) {
        // Update existing product
        const updateData: any = {
          handle: product.handle,
          price: product.price,
          compare_at_price: product.compare_at_price,
          collection: product.collection,
          scent_family: product.scent_family,
          top_notes: product.top_notes,
          middle_notes: product.middle_notes,
          base_notes: product.base_notes,
          variants: product.variants,
          images: product.images,
          featured_image_url: product.featured_image_url,
          status: product.status,
          tags: product.tags,
          seo_title: product.seo_title,
          seo_description: product.seo_description,
        };

        // Only update description if currently empty
        if (!existing.description || existing.description.length < 50) {
          updateData.description = product.description;
          updateData.benefits = product.benefits;
          updateData.usage = product.usage;
          updateData.key_ingredients = product.key_ingredients;
        }

        const { error } = await supabase
          .from("brand_products")
          .update(updateData)
          .eq("id", existing.id);

        if (error) throw error;
        updatedCount++;
      } else {
        // Insert new product
        const { error } = await supabase.from("brand_products").insert([product]);

        if (error) throw error;
        insertedCount++;
      }
    }

    console.log(`[sync-sanity-products] Sync complete: ${updatedCount} updated, ${insertedCount} new`);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        inserted: insertedCount,
        total: updatedCount + insertedCount,
        source: `sanity:${projectId}/${dataset}`,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[sync-sanity-products] Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
