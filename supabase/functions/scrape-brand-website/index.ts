import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateText } from "../_shared/aiProviders.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, organizationId } = await req.json();

    if (!url || !organizationId) {
      return new Response(
        JSON.stringify({ error: "URL and organizationId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Scraping website:", url, "for organization:", organizationId);

    // Fetch website content
    const websiteResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BrandScraper/1.0)",
      },
    });

    if (!websiteResponse.ok) {
      throw new Error(`Failed to fetch website: ${websiteResponse.status}`);
    }

    const htmlContent = await websiteResponse.text();

    // Extract text content from HTML (simple approach - strip tags)
    const textContent = htmlContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 8000); // Limit to first 8000 chars for AI processing

    console.log("Extracted text length:", textContent.length);

    const analysisText = await generateText({
      systemPrompt: `You are a brand voice analyst. Analyze the website content and extract:
1. Brand voice characteristics (tone, personality)
2. Common vocabulary and key phrases
3. Writing style patterns
4. Brand values and messaging themes

Return your analysis as a structured JSON object with these fields:
- tone: array of 3-5 tone descriptors (e.g., "warm", "professional", "playful")
- vocabulary: array of 10-15 commonly used brand-specific words
- writingStyle: string describing the writing style
- brandValues: array of 3-5 core brand values or themes
- recommendations: array of 3-5 content guidelines based on the analysis`,
      prompt: `Analyze this website content and extract brand voice:\n\n${textContent}`,
    });

    console.log("AI Analysis:", analysisText);

    // Parse AI response (try to extract JSON if present)
    let brandAnalysis;
    try {
      // Try to find JSON in the response
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        brandAnalysis = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON, structure the text response
        brandAnalysis = {
          rawAnalysis: analysisText,
          sourceUrl: url,
          extractedAt: new Date().toISOString(),
        };
      }
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      brandAnalysis = {
        rawAnalysis: analysisText,
        sourceUrl: url,
        extractedAt: new Date().toISOString(),
      };
    }

    // Save to Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error: insertError } = await supabase.from("brand_knowledge").insert({
      organization_id: organizationId,
      knowledge_type: "website_scrape",
      content: brandAnalysis,
    });

    if (insertError) {
      console.error("Error saving to database:", insertError);
      throw insertError;
    }

    console.log("Brand knowledge saved successfully");

    return new Response(
      JSON.stringify({ success: true, analysis: brandAnalysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scrape-brand-website:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
