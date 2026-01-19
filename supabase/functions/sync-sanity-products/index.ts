/**
 * Sync Sanity Products - Pull products from Sanity.io into Madison Studio
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    const { organization_id, sanity_project_id, sanity_dataset } = requestBody;

    if (!organization_id) {
      return new Response(
        JSON.stringify({ success: false, error: "organization_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const projectId = sanity_project_id || "8h5l91ut";
    const dataset = sanity_dataset || "production";

    console.log(`[sync-sanity-products] Starting sync: ${projectId}/${dataset}`);

    // Simple query to get products with titles - use simpler query format
    const query = '*[_type == "product" || _type == "tarifeProduct" || _type == "shopifyProduct"][title != null]{_id, title, sku, "slug": slug.current, "image": mainImage.asset->url}';
    const encodedQuery = encodeURIComponent(query);
    const sanityUrl = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodedQuery}`;
    
    console.log(`[sync-sanity-products] Query URL: ${sanityUrl}`);

    console.log(`[sync-sanity-products] Fetching from Sanity...`);
    const sanityResponse = await fetch(sanityUrl);

    if (!sanityResponse.ok) {
      const errorText = await sanityResponse.text();
      console.error(`[sync-sanity-products] Sanity API error:`, errorText);
      throw new Error(`Sanity API error: ${sanityResponse.status}`);
    }

    const sanityData = await sanityResponse.json();
    const products = sanityData.result || [];

    console.log(`[sync-sanity-products] Got ${products.length} products from Sanity`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: "No products found", total: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        if (!product.title) continue;

        const productData = {
          organization_id,
          name: product.title,
          handle: product.slug || product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          sku: product.sku || null,
          featured_image_url: product.image || null,
          usp: `sanity:${product._id}`,
        };

        // Check if product exists by name
        const { data: existing } = await supabase
          .from("brand_products")
          .select("id")
          .eq("organization_id", organization_id)
          .eq("name", product.title)
          .maybeSingle();

        if (existing) {
          // Update
          const { error } = await supabase
            .from("brand_products")
            .update({
              handle: productData.handle,
              sku: productData.sku,
              featured_image_url: productData.featured_image_url,
              usp: productData.usp,
            })
            .eq("id", existing.id);

          if (error) {
            console.error(`[sync-sanity-products] Update error for ${product.title}:`, error);
            errorCount++;
          } else {
            updatedCount++;
          }
        } else {
          // Insert
          const { error } = await supabase
            .from("brand_products")
            .insert([productData]);

          if (error) {
            console.error(`[sync-sanity-products] Insert error for ${product.title}:`, error);
            errorCount++;
          } else {
            insertedCount++;
          }
        }
      } catch (e) {
        console.error(`[sync-sanity-products] Error processing ${product.title}:`, e);
        errorCount++;
      }
    }

    console.log(`[sync-sanity-products] Done: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount,
        total: insertedCount + updatedCount,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[sync-sanity-products] Fatal error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
