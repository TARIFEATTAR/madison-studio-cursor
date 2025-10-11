import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { extractedText, organizationId, documentName } = await req.json();

    if (!extractedText || !organizationId) {
      throw new Error('extractedText and organizationId are required');
    }

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Extracting brand knowledge from ${documentName || 'document'} for org: ${organizationId}`);

    // Extraction prompt for Claude
    const extractionPrompt = `You are a brand strategist analyzing brand guidelines to extract structured knowledge for AI-powered content generation.

Analyze the following brand document and extract:

1. **BRAND VOICE PROFILE**: Tone attributes, personality traits, writing style patterns
2. **VOCABULARY RULES**: Approved terms, forbidden phrases, industry-specific terminology
3. **WRITING EXAMPLES**: Good examples (on-brand), bad examples (off-brand) with analysis
4. **STRUCTURAL GUIDELINES**: Sentence patterns, paragraph style, punctuation preferences

DOCUMENT TO ANALYZE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${extractedText.slice(0, 50000)} 
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return your analysis as a JSON object with this exact structure:

{
  "voice": {
    "toneAttributes": ["sophisticated", "warm", "knowledgeable"],
    "personalityTraits": ["confident", "authentic", "refined"],
    "writingStyle": "description of overall writing approach",
    "keyCharacteristics": ["concise sentences", "sensory language", "etc"]
  },
  "vocabulary": {
    "approvedTerms": ["fragrance", "composition", "notes"],
    "forbiddenPhrases": ["game-changing", "must-have", "revolutionary"],
    "industryTerminology": ["olfactory", "sillage", "longevity"],
    "preferredPhrasing": {
      "use_this": "not_that",
      "composition": "formula"
    }
  },
  "examples": {
    "goodExamples": [
      {
        "text": "Example of on-brand copy from the document",
        "analysis": "Why this works: uses sensory language, avoids clichés, maintains sophistication"
      }
    ],
    "badExamples": [
      {
        "text": "Example of what to avoid",
        "analysis": "Why to avoid: uses generic marketing speak, lacks brand voice"
      }
    ]
  },
  "structure": {
    "sentenceStructure": "Mix of short declarative and flowing descriptive",
    "paragraphLength": "Short to medium (3-5 sentences)",
    "punctuationStyle": "Strategic use of em-dashes and semicolons",
    "rhythmPatterns": "Varied cadence with emphasis on sensory beats"
  }
}

CRITICAL INSTRUCTIONS:
- Extract ONLY what is explicitly present in the document
- If a section has no relevant information, use empty arrays or "Not specified"
- For examples, pull direct quotes from the document
- Be specific and actionable—avoid vague descriptions
- Return ONLY valid JSON, no additional commentary`;

    // Call Lovable AI (Claude)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: extractionPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices[0].message.content;

    console.log('Raw AI response:', extractedContent.substring(0, 500));

    // Parse JSON from response (handle markdown code blocks if present)
    let parsedKnowledge;
    try {
      // Remove markdown code blocks if present
      const cleanJson = extractedContent
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedKnowledge = JSON.parse(cleanJson);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('Response was:', extractedContent);
      
      // Return partial data if parsing fails
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to parse extraction results',
          rawResponse: extractedContent.substring(0, 1000)
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log(`Successfully extracted brand knowledge from ${documentName}`);
    console.log('Voice attributes:', parsedKnowledge.voice?.toneAttributes);
    console.log('Approved terms count:', parsedKnowledge.vocabulary?.approvedTerms?.length);

    return new Response(
      JSON.stringify({
        success: true,
        voice: parsedKnowledge.voice,
        vocabulary: parsedKnowledge.vocabulary,
        examples: parsedKnowledge.examples,
        structure: parsedKnowledge.structure
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-brand-knowledge:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
