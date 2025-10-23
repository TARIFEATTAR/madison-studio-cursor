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

    // Map Shopify products to brand_products schema
    const mappedProducts = products.map((product: any) => {
      const variant = product.variants?.[0] || {};
      
      return {
        organization_id,
        name: product.title,
        collection: product.product_type || 'Uncategorized',
        category: 'personal_fragrance', // Default category, can be customized
        product_type: product.product_type,
        shopify_product_id: product.id.toString(),
        shopify_variant_id: variant.id?.toString(),
        shopify_sync_status: 'synced',
        last_shopify_sync: new Date().toISOString(),
        // Additional fields from Shopify
        usp: product.body_html ? product.body_html.substring(0, 500) : null,
        // Tags can be used for scent families or other metadata
        tone: product.tags ? product.tags.split(',')[0] : null,
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
