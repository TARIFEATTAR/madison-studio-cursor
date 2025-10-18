import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to fetch Madison's system config
async function getMadisonSystemConfig() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('madison_system_config')
      .select('*')
      .limit(1)
      .maybeSingle();
    
    if (error || !data) return '';
    
    const configParts = [];
    if (data.persona) configParts.push(`PERSONA: ${data.persona}`);
    if (data.editorial_philosophy) configParts.push(`\nEDITORIAL PHILOSOPHY: ${data.editorial_philosophy}`);
    if (data.writing_influences) configParts.push(`\nWRITING INFLUENCES: ${data.writing_influences}`);
    if (data.voice_spectrum) configParts.push(`\nVOICE SPECTRUM: ${data.voice_spectrum}`);
    if (data.forbidden_phrases) configParts.push(`\nFORBIDDEN PHRASES: ${data.forbidden_phrases}`);
    if (data.quality_standards) configParts.push(`\nQUALITY STANDARDS: ${data.quality_standards}`);
    
    return configParts.join('\n');
  } catch (error) {
    console.error('Error fetching Madison config:', error);
    return '';
  }
}

// Helper to fetch brand knowledge
async function getBrandKnowledge(organizationId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('brand_knowledge')
      .select('content, knowledge_type')
      .eq('organization_id', organizationId)
      .eq('is_active', true);
    
    if (error || !data) return '';
    
    const knowledgeParts = data.map(k => {
      const contentStr = typeof k.content === 'object' 
        ? JSON.stringify(k.content, null, 2) 
        : k.content;
      return `${k.knowledge_type.toUpperCase()}:\n${contentStr}`;
    });
    
    return knowledgeParts.join('\n\n');
  } catch (error) {
    console.error('Error fetching brand knowledge:', error);
    return '';
  }
}

// Helper to fetch product data
async function getProductData(productId: string, organizationId: string) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  try {
    const { data, error } = await supabase
      .from('brand_products')
      .select('*')
      .eq('id', productId)
      .eq('organization_id', organizationId)
      .single();
    
    if (error || !data) return null;
    return data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, platform, organizationId, formData, productId, actionType } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Marketplace assistant request:', { platform, actionType, hasProduct: !!productId });

    // Gather context
    const [madisonConfig, brandKnowledge, productData] = await Promise.all([
      getMadisonSystemConfig(),
      organizationId ? getBrandKnowledge(organizationId) : Promise.resolve(''),
      productId && organizationId ? getProductData(productId, organizationId) : Promise.resolve(null)
    ]);

    // Platform-specific templates
    const platformTemplates: Record<string, any> = {
      etsy: {
        name: 'Etsy',
        description: 'Handmade & vintage marketplace - Artisan storytelling',
        validation: { titleMaxLength: 140, descriptionMaxLength: 5000, tagsMax: 13 },
        aiTemplate: `Create Etsy listing content with:
- Story-driven, emotional language emphasizing craft and artistry
- Sensory, evocative descriptions
- SEO-optimized long-tail keywords
- Personal connection and authenticity
- Artisan craftsmanship focus`,
        categories: ['Bath & Beauty', 'Home Fragrance', 'Perfume & Cologne', 'Candles']
      },
      tiktok_shop: {
        name: 'TikTok Shop',
        description: 'Social commerce for Gen Z - Viral-worthy products',
        validation: { titleMaxLength: 255, descriptionMaxLength: 3000, tagsMax: 10 },
        aiTemplate: `Create TikTok Shop listing with viral appeal:
- Snappy Gen Z slang with emojis ✨🔥
- FOMO-driven language ("limited", "trending", "going viral")
- Short, punchy sentences
- Social proof and trends
- Excitement and energy`,
        categories: ['Beauty & Personal Care', 'Home & Garden', 'Fashion', 'Lifestyle']
      }
    };

    const platformInfo = platformTemplates[platform] || platformTemplates.etsy;

    // Build system prompt
    let systemContent = `You are Madison, Editorial Director helping create marketplace listings.`;
    
    if (madisonConfig) {
      systemContent += `\n\n=== YOUR CORE TRAINING ===\n${madisonConfig}\n`;
    }
    
    systemContent += `\n\n=== PLATFORM CONTEXT ===
MARKETPLACE: ${platformInfo.name} - ${platformInfo.description}

PLATFORM REQUIREMENTS:
- Title: Max ${platformInfo.validation.titleMaxLength} characters
- Description: Max ${platformInfo.validation.descriptionMaxLength} characters
- Tags: Max ${platformInfo.validation.tagsMax} tags
- Popular Categories: ${platformInfo.categories.join(', ')}

${platformInfo.aiTemplate}
`;

    if (brandKnowledge) {
      systemContent += `\n\n=== BRAND KNOWLEDGE ===\n${brandKnowledge}\n`;
    }

    if (productData) {
      systemContent += `\n\n=== PRODUCT DATA ===
Name: ${productData.name}
Collection: ${productData.collection || 'N/A'}
Category: ${productData.category || 'N/A'}
Scent Family: ${productData.scent_family || 'N/A'}
Top Notes: ${productData.top_notes || 'N/A'}
Middle Notes: ${productData.middle_notes || 'N/A'}
Base Notes: ${productData.base_notes || 'N/A'}
Key Ingredients: ${productData.key_ingredients || 'N/A'}
Benefits: ${productData.benefits || 'N/A'}
USP: ${productData.usp || 'N/A'}
`;
    }

    if (formData) {
      systemContent += `\n\n=== CURRENT LISTING STATE ===
${JSON.stringify(formData, null, 2)}
`;
    }

    systemContent += `\n\nYOUR ROLE:
- Generate marketplace-optimized content that stays true to the brand voice
- Balance platform requirements with brand authenticity
- Provide specific, actionable suggestions
- Format responses for easy copying into listing fields
- When generating tags, provide them as a comma-separated list

QUICK ACTIONS:
- "Generate Description": Create full product description
- "Suggest Tags": Provide SEO-optimized tag list
- "Optimize Title": Craft compelling, keyword-rich title

Always maintain brand voice while optimizing for the platform's audience and algorithm.`;

    // Call Lovable AI with streaming
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemContent },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits depleted. Please add funds to your workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    // Return streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Marketplace assistant error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
