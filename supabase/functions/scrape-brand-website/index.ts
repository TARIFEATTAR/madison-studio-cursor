import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  generateGeminiContent,
  extractTextFromGeminiResponse,
} from "../_shared/geminiClient.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper to clean HTML
const cleanHtml = (html: string) => {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

    // 1. Fetch Homepage
    const homeResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BrandScraper/1.0)",
      },
    });

    if (!homeResponse.ok) {
      throw new Error(`Failed to fetch website: ${homeResponse.status}`);
    }

    const homeHtml = await homeResponse.text();
    let combinedText = cleanHtml(homeHtml);

    // 2. Look for "About" page
    // Simple regex to find hrefs containing "about", "story", "mission"
    const aboutMatch = homeHtml.match(/<a[^>]+href=["']([^"']*(?:about|story|mission|brand)[^"']*)["'][^>]*>/i);
    
    if (aboutMatch && aboutMatch[1]) {
      let aboutPath = aboutMatch[1];
      // Resolve relative URL
      if (!aboutPath.startsWith('http')) {
        try {
          const baseUrl = new URL(url);
          if (aboutPath.startsWith('/')) {
            aboutPath = `${baseUrl.origin}${aboutPath}`;
          } else {
            // Handle relative paths without leading slash
            const pathParts = baseUrl.pathname.split('/');
            pathParts.pop(); // Remove filename
            aboutPath = `${baseUrl.origin}${pathParts.join('/')}/${aboutPath}`;
          }
        } catch (e) {
          console.warn("Error resolving URL:", e);
        }
      }

      console.log("Found potential About page:", aboutPath);
      
      try {
        const aboutResponse = await fetch(aboutPath, {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; BrandScraper/1.0)" },
        });
        
        if (aboutResponse.ok) {
            const aboutHtml = await aboutResponse.text();
            const aboutText = cleanHtml(aboutHtml);
            // Prioritize About text by putting it first
            combinedText = `ABOUT PAGE CONTENT:\n${aboutText}\n\nHOMEPAGE CONTENT:\n${combinedText}`;
            console.log("Added About page content length:", aboutText.length);
        }
      } catch (e) {
          console.warn("Failed to fetch About page:", e);
      }
    }

    // Limit to 12000 chars for AI processing
    const textContent = combinedText.substring(0, 12000);

    console.log("Final extracted text length:", textContent.length);

    const analysisPrompt = `You are a brand voice analyst. Analyze the website content and extract:
1. Brand voice characteristics (tone, personality)
2. Common vocabulary and key phrases
3. Writing style patterns
4. Brand values and messaging themes

Return your analysis as a structured JSON object with these fields:
- tone: array of 3-5 tone descriptors (e.g., "warm", "professional", "playful")
- vocabulary: array of 10-15 commonly used brand-specific words
- writingStyle: string describing the writing style
- brandValues: array of 3-5 core brand values or themes
- recommendations: array of 3-5 content guidelines based on the analysis`;

    const aiData = await generateGeminiContent({
      systemPrompt: analysisPrompt,
      messages: [
        {
          role: "user",
          content: `Analyze this website content and extract brand voice:\n\n${textContent}\n\nRespond ONLY with JSON.`,
        },
      ],
      responseMimeType: "application/json",
      maxOutputTokens: 1536,
      temperature: 0.35,
    });

    const analysisText = extractTextFromGeminiResponse(aiData);

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
