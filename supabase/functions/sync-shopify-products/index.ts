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

    console.log(`Upserting ${mappedProducts.length} products to database`);

    // Upsert products into brand_products table
    const { data: upsertedProducts, error: upsertError } = await supabase
      .from('brand_products')
      .upsert(mappedProducts, {
        onConflict: 'shopify_product_id',
        ignoreDuplicates: false,
      })
      .select();

    if (upsertError) {
      console.error('Error upserting products:', upsertError);
      throw upsertError;
    }

    console.log(`Successfully synced ${upsertedProducts?.length || 0} products`);

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
        count: upsertedProducts?.length || 0,
        products: upsertedProducts,
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
