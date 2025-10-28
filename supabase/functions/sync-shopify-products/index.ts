import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { organization_id } = await req.json();

    if (!organization_id) {
      throw new Error('organization_id is required');
    }

    console.log(`Starting Shopify product sync for organization: ${organization_id}`);

    // Fetch Shopify connection details
    const { data: connection, error: connectionError } = await supabase
      .from('shopify_connections')
      .select('*')
      .eq('organization_id', organization_id)
      .single();

    if (connectionError || !connection) {
      throw new Error('Shopify connection not found');
    }

    const { shop_domain, access_token_encrypted } = connection;

    console.log(`Fetching products from Shopify store: ${shop_domain}`);

    // Fetch products from Shopify Admin API
    const shopifyResponse = await fetch(
      `https://${shop_domain}/admin/api/2024-01/products.json`,
      {
        headers: {
          'X-Shopify-Access-Token': access_token_encrypted,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error:', errorText);
      throw new Error(`Shopify API error: ${shopifyResponse.status} ${errorText}`);
    }

    const shopifyData = await shopifyResponse.json();
    const products = shopifyData.products || [];

    console.log(`Fetched ${products.length} products from Shopify`);

    // Log tag parsing for debugging
    if (products.length > 0) {
      const sampleProduct = products[0];
      console.log(`Sample product tags: ${sampleProduct.tags}`);
      console.log(`Sample product type: ${sampleProduct.product_type}`);
    }

    // Map Shopify products to brand_products schema
    const mappedProducts = products.map((product: any) => {
      const variant = product.variants?.[0] || {};
      
      // Generate handle from product title if not provided
      const handle = product.handle || product.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Parse Shopify tags for Madison-specific metadata
      const tags = product.tags ? product.tags.split(',').map((t: string) => t.trim()) : [];

      // Extract collection from tags (e.g., "collection:Humanities")
      const collectionTag = tags.find((tag: string) => tag.startsWith('collection:'));
      const collection = collectionTag 
        ? collectionTag.replace('collection:', '').trim()
        : product.product_type || 'Uncategorized';

      // Extract scent_family from tags (e.g., "scent_family:warm")
      const scentFamilyTag = tags.find((tag: string) => tag.startsWith('scent_family:'));
      const scent_family = scentFamilyTag 
        ? scentFamilyTag.replace('scent_family:', '').trim()
        : null;
      
      // Extract tone from tags (e.g., "tone:elegant")
      const toneTag = tags.find((tag: string) => tag.startsWith('tone:'));
      const tone = toneTag ? toneTag.replace('tone:', '').trim() : null;
      
      // Strip HTML from body_html for description
      const description = product.body_html 
        ? product.body_html
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
            .replace(/&amp;/g, '&')  // Decode &amp;
            .replace(/&lt;/g, '<')   // Decode &lt;
            .replace(/&gt;/g, '>')   // Decode &gt;
            .replace(/&quot;/g, '"') // Decode &quot;
            .replace(/&#39;/g, "'")  // Decode &#39;
            .trim()
        : null;
      
      return {
        organization_id,
        name: product.title,
        handle: handle,
        collection: collection,
        scent_family: scent_family,
        category: 'personal_fragrance',
        product_type: product.product_type,
        shopify_product_id: product.id.toString(),
        shopify_variant_id: variant.id?.toString(),
        shopify_sync_status: 'synced',
        last_shopify_sync: new Date().toISOString(),
        description: description,
        usp: null, // To be filled manually with selling points
        tone: tone,
      };
    });

    console.log(`Processing ${mappedProducts.length} products for sync`);

    // Fetch existing products by NAME (since CSV products don't have handles)
    const names = mappedProducts.map((p: any) => p.name);
    
    const { data: existingProducts } = await supabase
      .from('brand_products')
      .select('id, name, handle, shopify_product_id, description, collection, scent_family, tone')
      .eq('organization_id', organization_id)
      .in('name', names);

    const existingByName = new Map(existingProducts?.map(p => [p.name, p]) || []);
    const existingByShopifyId = new Map(existingProducts?.map(p => [p.shopify_product_id, p]) || []);
    
    let updatedCount = 0;
    let insertedCount = 0;

    // Process each product - match by NAME first (for CSV products), fallback to shopify_product_id
    for (const product of mappedProducts) {
      const existingByNameMatch = existingByName.get(product.name);
      const existingByShopifyMatch = existingByShopifyId.get(product.shopify_product_id);
      const existing = existingByNameMatch || existingByShopifyMatch;
      
      if (existing) {
        // Update existing product - ONLY update Shopify-specific fields
        // DO NOT overwrite rich 49-field CSV data (visual DNA, archetypes, etc.)
        const updateData: any = {
          shopify_product_id: product.shopify_product_id,
          shopify_variant_id: product.shopify_variant_id,
          shopify_sync_status: product.shopify_sync_status,
          last_shopify_sync: product.last_shopify_sync,
        };
        
        // Only update these fields if they're currently empty
        if (!existing.description || existing.description.length < 50) {
          updateData.description = product.description;
        }
        if (!existing.collection) {
          updateData.collection = product.collection;
        }
        if (!existing.scent_family) {
          updateData.scent_family = product.scent_family;
        }
        if (!existing.tone) {
          updateData.tone = product.tone;
        }
        
        const { error } = await supabase
          .from('brand_products')
          .update(updateData)
          .eq('id', existing.id);
        
        if (error) throw error;
        updatedCount++;
      } else {
        // Insert new product from Shopify
        const { error } = await supabase
          .from('brand_products')
          .insert([product]);
        
        if (error) throw error;
        insertedCount++;
      }
    }

    console.log(`Successfully synced: ${updatedCount} updated, ${insertedCount} new products`);

    // Update connection sync timestamp
    await supabase
      .from('shopify_connections')
      .update({ 
        last_synced_at: new Date().toISOString(),
        sync_status: 'idle'
      })
      .eq('id', connection.id);

    return new Response(
      JSON.stringify({
        success: true,
        updated: updatedCount,
        inserted: insertedCount,
        total: updatedCount + insertedCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error syncing Shopify products:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
