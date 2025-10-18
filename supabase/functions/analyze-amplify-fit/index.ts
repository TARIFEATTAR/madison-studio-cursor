import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { masterContent } = await req.json();
    
    if (!masterContent) {
      throw new Error("Master content is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Build system prompt for Smart Amplify analysis
    const systemPrompt = `You are a content amplification strategist analyzing master content to recommend the best derivative formats.

Available derivative types:
- email: Newsletter-style email
- email_3part: 3-part email nurture sequence
- email_5part: 5-part email sequence
- email_7part: 7-part email sequence
- instagram: Instagram posts and captions
- linkedin: Professional network posts
- facebook: Community engagement posts
- youtube: Video descriptions & scripts
- product: Product page descriptions
- pinterest: Pinterest pin descriptions
- sms: SMS marketing messages
- tiktok: TikTok video scripts
- twitter: Twitter/X threads

Analyze the provided content and recommend 4-6 derivative types that would work best for amplifying this specific content.

For each recommendation, provide:
1. derivativeType: The type ID
2. confidence: "high", "medium", or "low"
3. reason: Brief explanation (30-50 words) why this derivative would work well
4. priority: Number 1-6 (1 being highest priority)

Consider:
- Content length and depth
- Subject matter and tone
- Audience fit for each platform
- Potential for engagement
- Content structure and format compatibility`;

    const userPrompt = `Analyze this master content and recommend the best derivative formats:

Title: ${masterContent.title}
Content Type: ${masterContent.contentType || 'general'}
Content Preview: ${masterContent.content}

Return 4-6 recommendations prioritized by fit and potential impact.`;

    // Call Lovable AI Gateway with tool calling for structured output
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "recommend_derivatives",
              description: "Return 4-6 derivative type recommendations for the master content",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        derivativeType: { 
                          type: "string",
                          enum: ["email", "email_3part", "email_5part", "email_7part", "instagram", "linkedin", "facebook", "youtube", "product", "pinterest", "sms", "tiktok", "twitter"]
                        },
                        confidence: { 
                          type: "string", 
                          enum: ["high", "medium", "low"] 
                        },
                        reason: { type: "string" },
                        priority: { type: "number" }
                      },
                      required: ["derivativeType", "confidence", "reason", "priority"],
                      additionalProperties: false
                    },
                    minItems: 4,
                    maxItems: 6
                  }
                },
                required: ["recommendations"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "recommend_derivatives" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify({ recommendations: result.recommendations }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in analyze-amplify-fit:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        recommendations: [] 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
