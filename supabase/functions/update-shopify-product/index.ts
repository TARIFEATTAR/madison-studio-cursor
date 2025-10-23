import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { listing_id, shopify_product_id } = await req.json();
    
    if (!listing_id) {
      return new Response(JSON.stringify({ error: 'listing_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching listing:', listing_id);

    // Fetch the listing
    const { data: listing, error: listingError } = await supabaseClient
      .from('marketplace_listings')
      .select('*, brand_products(*)')
      .eq('id', listing_id)
      .single();

    if (listingError || !listing) {
      console.error('Error fetching listing:', listingError);
      return new Response(JSON.stringify({ error: 'Listing not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Use passed shopify_product_id or fall back to listing's external_id
    const effectiveShopifyId = shopify_product_id || listing.external_id;
    if (!effectiveShopifyId) {
      return new Response(JSON.stringify({ error: 'Shopify Product ID required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching Shopify connection for org:', listing.organization_id);

    // Fetch Shopify connection
    const { data: connection, error: connectionError } = await supabaseClient
      .from('shopify_connections')
      .select('*')
      .eq('organization_id', listing.organization_id)
      .single();

    if (connectionError || !connection) {
      console.error('Error fetching Shopify connection:', connectionError);
      return new Response(JSON.stringify({ error: 'Shopify not connected for this organization' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const platformData = listing.platform_data as any;
    
    // Build the product update payload - only title, description, tags, type, vendor
    // No variants = Shopify preserves existing price, inventory, SKU, weight
    const productUpdate = {
      product: {
        id: effectiveShopifyId,
        title: listing.title || platformData?.title || '',
        body_html: platformData?.description || '',
        product_type: platformData?.product_type || '',
        vendor: platformData?.vendor || '',
        tags: Array.isArray(platformData?.tags) ? platformData.tags.join(', ') : '',
      },
    };

    console.log('Pushing to Shopify:', productUpdate);

    // Call Shopify Admin API
    const shopifyUrl = `https://${connection.shop_domain}/admin/api/2024-01/products/${effectiveShopifyId}.json`;
    const shopifyResponse = await fetch(shopifyUrl, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': connection.access_token_encrypted,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productUpdate),
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error('Shopify API error:', errorText);
      
      // Update listing with error
      await supabaseClient
        .from('marketplace_listings')
        .update({
          push_status: 'failed',
          push_error: errorText,
        })
        .eq('id', listing_id);

      return new Response(JSON.stringify({ 
        error: 'Failed to push to Shopify',
        details: errorText 
      }), {
        status: shopifyResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const shopifyData = await shopifyResponse.json();
    console.log('Shopify update successful:', shopifyData);

    // Update listing with success and save the effective Shopify ID
    await supabaseClient
      .from('marketplace_listings')
      .update({
        external_id: effectiveShopifyId,
        push_status: 'success',
        push_error: null,
        last_pushed_at: new Date().toISOString(),
      })
      .eq('id', listing_id);

    // Log to publish history
    await supabaseClient
      .from('shopify_publish_log')
      .insert({
        organization_id: listing.organization_id,
        product_id: listing.product_id,
        shopify_product_id: effectiveShopifyId,
        published_content: platformData,
        published_by: user.id,
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        shopify_product_id: effectiveShopifyId,
        message: 'Successfully pushed to Shopify'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-shopify-product function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
