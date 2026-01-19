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

    console.log("[sync-sanity-products] VERSION 9 - Request body:", JSON.stringify(requestBody));

    if (!organization_id) {
      return new Response(
        JSON.stringify({ success: false, error: "organization_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const projectId = sanity_project_id || "8h5l91ut";
    const dataset = sanity_dataset || "production";

    console.log(`[sync-sanity-products] Input project: ${sanity_project_id}, Input dataset: ${sanity_dataset}`);
    console.log(`[sync-sanity-products] Using project: ${projectId}, dataset: ${dataset}`);

    // Query with all relevant fields: title, SKUs, image, Shopify IDs, collection, slug
    // GROQ: *[_type == "product" && title != null][0...100]{_id, title, sku6ml, sku12ml, "slugCurrent": slug.current, collectionType, mainImage, shopifyProductId, legacyName, inStock}
    const groqQuery = '*[_type == "product" && title != null][0...100]{_id, title, sku6ml, sku12ml, "parentSku": parentSku, "slugCurrent": slug.current, collectionType, mainImage, shopifyProductId, legacyName, inStock}';

    const fullUrl = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(groqQuery)}`;

    console.log(`[sync-sanity-products] Fetching: ${fullUrl}`);

    const sanityResponse = await fetch(fullUrl);
    const responseText = await sanityResponse.text();

    console.log(`[sync-sanity-products] Response status: ${sanityResponse.status}`);
    console.log(`[sync-sanity-products] Response body (first 500 chars): ${responseText.substring(0, 500)}`);

    if (!sanityResponse.ok) {
      throw new Error(`Sanity API error: ${sanityResponse.status} - ${responseText}`);
    }

    let sanityData;
    try {
      sanityData = JSON.parse(responseText);
    } catch (e) {
      throw new Error(`Failed to parse Sanity response: ${responseText.substring(0, 200)}`);
    }

    const allProducts = sanityData.result || [];
    // Filter out drafts in code (IDs starting with "drafts.")
    const products = allProducts.filter((p: any) => !p._id.startsWith("drafts."));
    console.log(`[sync-sanity-products] Found ${allProducts.length} total, ${products.length} non-draft products`);

    if (products.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No products found in Sanity",
          total: 0,
          inserted: 0,
          updated: 0,
          version: 7,
          debug: {
            sanityUrl: fullUrl,
            sanityStatus: sanityResponse.status,
            totalFromSanity: allProducts.length,
            afterDraftFilter: products.length,
            rawResponsePreview: responseText.substring(0, 500),
            sampleRaw: allProducts.slice(0, 3)
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    console.log(`[sync-sanity-products] Supabase URL exists: ${!!supabaseUrl}`);
    console.log(`[sync-sanity-products] Service key exists: ${!!serviceRoleKey}`);

    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // ═══════════════════════════════════════════════════════════════════════════════
    // FETCH SHOPIFY PRICING & INVENTORY DATA
    // Look up brand_products to get pricing/inventory by SKU
    // ═══════════════════════════════════════════════════════════════════════════════

    console.log(`[sync-sanity-products] Fetching Shopify pricing/inventory data...`);

    // Build a SKU → pricing/inventory lookup map from brand_products (Shopify-synced)
    const { data: shopifyProducts, error: shopifyError } = await supabase
      .from("brand_products")
      .select("id, name, sku, price, compare_at_price, inventory_quantity, variants, featured_image_url")
      .eq("organization_id", organization_id);

    const skuPricingMap: Record<string, { price: number; compare_at_price: number | null; inventory_quantity: number; image_url?: string }> = {};

    if (shopifyProducts && !shopifyError) {
      console.log(`[sync-sanity-products] Found ${shopifyProducts.length} Shopify products to match`);

      for (const sp of shopifyProducts) {
        // Add main product SKU
        if (sp.sku) {
          skuPricingMap[sp.sku.toUpperCase()] = {
            price: sp.price || 0,
            compare_at_price: sp.compare_at_price || null,
            inventory_quantity: sp.inventory_quantity || 0,
            image_url: sp.featured_image_url || undefined
          };
        }

        // Parse variants and add each variant SKU
        if (sp.variants) {
          try {
            const variants = typeof sp.variants === 'string' ? JSON.parse(sp.variants) : sp.variants;
            if (Array.isArray(variants)) {
              for (const v of variants) {
                if (v.sku) {
                  skuPricingMap[v.sku.toUpperCase()] = {
                    price: v.price || 0,
                    compare_at_price: v.compare_at_price || null,
                    inventory_quantity: v.inventory_quantity || 0
                  };
                }
              }
            }
          } catch (e) {
            console.log(`[sync-sanity-products] Could not parse variants for ${sp.name}`);
          }
        }
      }

      console.log(`[sync-sanity-products] Built SKU pricing map with ${Object.keys(skuPricingMap).length} SKUs`);
      console.log(`[sync-sanity-products] Sample SKUs:`, Object.keys(skuPricingMap).slice(0, 5));
    } else {
      console.log(`[sync-sanity-products] No Shopify products found or error:`, shopifyError?.message);
    }

    let insertedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        if (!product.title) {
          console.log(`[sync-sanity-products] Skipping product without title: ${product._id}`);
          continue;
        }

        console.log(`[sync-sanity-products] Processing: ${product.title}`);
        console.log(`[sync-sanity-products] SKU 6ml: ${product.sku6ml}, SKU 12ml: ${product.sku12ml}, Parent SKU: ${product.parentSku}`);

        console.log(`[sync-sanity-products] Main image ref: ${JSON.stringify(product.mainImage)}`);

        // Generate slug from Sanity or title
        const slug = product.slugCurrent || product.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

        // Build variants array from SKUs (6ml and 12ml)
        // Look up pricing/inventory from Shopify data
        const variants: any[] = [];
        let primarySku = null;
        let primaryPrice = null;

        if (product.sku6ml) {
          const sku6mlUpper = product.sku6ml.toUpperCase();
          const shopifyData6ml = skuPricingMap[sku6mlUpper];

          if (shopifyData6ml) {
            console.log(`[sync-sanity-products] Found Shopify pricing for ${product.sku6ml}: $${shopifyData6ml.price}, qty: ${shopifyData6ml.inventory_quantity}`);
          }

          variants.push({
            id: `sanity-${product._id}-6ml`,
            title: "6ml",
            sku: product.sku6ml,
            price: shopifyData6ml?.price || 0,
            compare_at_price: shopifyData6ml?.compare_at_price || null,
            inventory_quantity: shopifyData6ml?.inventory_quantity || 0,
            inventory_policy: "deny",
            option1: "6ml", // Size option value
            position: 1,
            metadata: {
              source: "sanity",
              sanity_id: product._id,
              shopify_synced: !!shopifyData6ml
            }
          });
          primarySku = product.sku6ml;
          primaryPrice = shopifyData6ml?.price || null;
        }

        if (product.sku12ml) {
          const sku12mlUpper = product.sku12ml.toUpperCase();
          const shopifyData12ml = skuPricingMap[sku12mlUpper];

          if (shopifyData12ml) {
            console.log(`[sync-sanity-products] Found Shopify pricing for ${product.sku12ml}: $${shopifyData12ml.price}, qty: ${shopifyData12ml.inventory_quantity}`);
          }

          variants.push({
            id: `sanity-${product._id}-12ml`,
            title: "12ml",
            sku: product.sku12ml,
            price: shopifyData12ml?.price || 0,
            compare_at_price: shopifyData12ml?.compare_at_price || null,
            inventory_quantity: shopifyData12ml?.inventory_quantity || 0,
            inventory_policy: "deny",
            option1: "12ml", // Size option value
            position: 2,
            metadata: {
              source: "sanity",
              sanity_id: product._id,
              shopify_synced: !!shopifyData12ml
            }
          });
          // If no 6ml, use 12ml as primary
          if (!primarySku) {
            primarySku = product.sku12ml;
            primaryPrice = shopifyData12ml?.price || null;
          }
        }

        // Create product options for Size
        const options: any[] = [];
        if (variants.length > 0) {
          const sizeValues = variants.map(v => v.option1).filter(Boolean);
          if (sizeValues.length > 0) {
            options.push({
              name: "Size",
              values: sizeValues,
              position: 1
            });
          }
        }

        console.log(`[sync-sanity-products] Created ${variants.length} variants for ${product.title}`);
        console.log(`[sync-sanity-products] Variants:`, variants.map(v => ({ title: v.title, sku: v.sku })));

        // Build Sanity CDN image URL from asset reference
        // Format: image-{id}-{dimensions}-{format} → https://cdn.sanity.io/images/{project}/{dataset}/{id}-{dimensions}.{format}
        let heroImageUrl = null;
        if (product.mainImage?.asset?._ref) {
          const ref = product.mainImage.asset._ref;
          console.log(`[sync-sanity-products] Parsing image ref: ${ref}`);
          // Parse: image-380aadb0fb77f34d43713b9c9e6f7711d8c5cfaa-2048x2048-jpg
          const match = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
          if (match) {
            const [, id, dimensions, format] = match;
            heroImageUrl = `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${dimensions}.${format}`;
            console.log(`[sync-sanity-products] Built image URL: ${heroImageUrl}`);
          } else {
            console.log(`[sync-sanity-products] Failed to parse image ref: ${ref}`);
          }
        } else {
          console.log(`[sync-sanity-products] No mainImage found for ${product.title}`);
        }

        // Map collection type to product line
        const productLine = product.collectionType ?
          product.collectionType.charAt(0).toUpperCase() + product.collectionType.slice(1) : null;

        const productData: Record<string, any> = {
          organization_id: organization_id,
          name: product.title,
          slug: slug,
          sku: primarySku, // Primary SKU (prefer 6ml, fallback to 12ml)
          price: primaryPrice, // Price from Shopify (if found)
          status: product.inStock === false ? "archived" : "active",
          development_stage: "launched",
          category: "Fragrance",
          product_type: "Attär",
          product_line: productLine,
          hero_image_external_url: heroImageUrl,
          variants: variants, // Store variants as JSONB array with pricing/inventory
          options: options, // Store options as JSONB array
          external_ids: {
            sanity_id: product._id,
            shopify_product_id: product.shopifyProductId || null
          },
          metadata: {
            source: "sanity",
            imported_at: new Date().toISOString(),
            legacy_name: product.legacyName || null,
            shopify_pricing_synced: Object.keys(skuPricingMap).length > 0,
            // Keep SKUs in metadata for backward compatibility
            sku_6ml: product.sku6ml || null,
            sku_12ml: product.sku12ml || null,
            parent_sku: product.parentSku || null
          }

        };

        // Check if exists by name or slug
        const { data: existing, error: selectError } = await supabase
          .from("product_hubs")
          .select("id")
          .eq("organization_id", organization_id)
          .eq("name", product.title)
          .maybeSingle();

        if (selectError) {
          console.error(`[sync-sanity-products] Select error for ${product.title}:`, selectError);
          errors.push(`Select ${product.title}: ${selectError.message}`);
          errorCount++;
          continue;
        }

        if (existing) {
          console.log(`[sync-sanity-products] Updating existing product: ${product.title} (ID: ${existing.id})`);
          console.log(`[sync-sanity-products] Update data:`, {
            sku: productData.sku,
            variants_count: variants.length,
            hero_image_external_url: productData.hero_image_external_url,
            product_line: productData.product_line
          });

          const { error: updateError } = await supabase
            .from("product_hubs")
            .update({
              sku: productData.sku,
              slug: productData.slug,
              price: productData.price, // Update price from Shopify
              product_line: productData.product_line,
              hero_image_external_url: productData.hero_image_external_url,
              variants: productData.variants, // Update variants array with pricing/inventory
              options: productData.options, // Update options array
              external_ids: productData.external_ids,
              metadata: productData.metadata
            })
            .eq("id", existing.id);

          if (updateError) {
            console.error(`[sync-sanity-products] Update error:`, updateError);
            errors.push(`Update ${product.title}: ${updateError.message}`);
            errorCount++;
          } else {
            console.log(`[sync-sanity-products] Successfully updated ${product.title}`);
            updatedCount++;
          }
        } else {
          const { error: insertError } = await supabase
            .from("product_hubs")
            .insert([productData]);

          if (insertError) {
            console.error(`[sync-sanity-products] Insert error:`, insertError);
            errors.push(`Insert ${product.title}: ${insertError.message}`);
            errorCount++;
          } else {
            insertedCount++;
          }
        }
      } catch (e: any) {
        console.error(`[sync-sanity-products] Error processing ${product.title}:`, e);
        errors.push(`Process ${product.title}: ${e.message}`);
        errorCount++;
      }
    }

    console.log(`[sync-sanity-products] Complete: ${insertedCount} inserted, ${updatedCount} updated, ${errorCount} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        inserted: insertedCount,
        updated: updatedCount,
        errors: errorCount,
        total: insertedCount + updatedCount,
        errorDetails: errors.slice(0, 5),
        debug: {
          sanityUrl: fullUrl,
          sanityStatus: sanityResponse.status,
          totalFromSanity: allProducts.length,
          afterDraftFilter: products.length,
          sampleProducts: products.slice(0, 3).map((p: any) => ({ id: p._id, title: p.title }))
        }
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[sync-sanity-products] Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error",
        stack: error.stack
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
