import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentId } = await req.json();

    if (!documentId) {
      throw new Error('documentId is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Processing document: ${documentId}`);

    // Get document details
    const { data: document, error: docError } = await supabase
      .from('brand_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !document) {
      throw new Error(`Failed to fetch document: ${docError?.message}`);
    }

    console.log(`Document found: ${document.file_name}, type: ${document.file_type}`);

    // Update status to processing
    await supabase
      .from('brand_documents')
      .update({ processing_status: 'processing' })
      .eq('id', documentId);

    // Download the file from storage (use full path, not just filename)
    console.log(`Downloading file from path: ${document.file_url}`);
    const { data: fileData, error: downloadError } = await supabase
      .storage
      .from('brand-documents')
      .download(document.file_url);

    if (downloadError || !fileData) {
      throw new Error(`Failed to download file: ${downloadError?.message}`);
    }

    console.log(`File downloaded, size: ${fileData.size} bytes`);

    let extractedText = '';

    // Extract text based on file type
    if (document.file_type === 'application/pdf') {
      console.log('Processing PDF with AI document understanding...');
      
      try {
        // Convert PDF to base64 for AI processing
        const arrayBuffer = await fileData.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        
        console.log('Sending PDF to AI for text extraction...');
        
        // Use Lovable AI with Gemini to extract text from PDF
        const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
        if (!lovableApiKey) {
          throw new Error('LOVABLE_API_KEY not configured');
        }

        const aiResponse = await fetch('https://api.lovable.app/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Extract all text content from this PDF document. Return ONLY the extracted text, preserving formatting and structure as much as possible. Do not add any commentary or explanations.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:application/pdf;base64,${base64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 16000,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          throw new Error(`AI extraction failed: ${aiResponse.status} - ${errorText}`);
        }

        const aiData = await aiResponse.json();
        extractedText = aiData.choices?.[0]?.message?.content || '';
        
        if (!extractedText) {
          throw new Error('No text extracted from PDF');
        }
        
        console.log(`PDF text extracted successfully: ${extractedText.length} characters`);
    } catch (pdfError) {
        console.error('PDF processing error:', pdfError);
        const errMsg = pdfError instanceof Error ? pdfError.message : 'Unknown PDF parsing error';
        
        // Still save whatever text we got, don't fail completely
        if (!extractedText || extractedText.length < 10) {
          throw new Error(`Failed to process PDF: ${errMsg}`);
        }
        console.warn('PDF processing had errors but continuing with extracted text');
      }
    } else if (document.file_type.includes('text') || document.file_type.includes('markdown')) {
      extractedText = await fileData.text();
    } else {
      throw new Error(`Unsupported file type: ${document.file_type}`);
    }

    console.log(`Extracted ${extractedText.length} characters`);

    if (!extractedText || extractedText.length < 50) {
      throw new Error('Failed to extract meaningful content from document');
    }

    // Create content preview (first 500 chars)
    const contentPreview = extractedText.slice(0, 500) + (extractedText.length > 500 ? '...' : '');

    // NEW: Extract structured brand knowledge using Claude
    console.log('Extracting structured brand knowledge with AI...');
    const { data: extractionData, error: extractionError } = await supabase.functions.invoke(
      'extract-brand-knowledge',
      {
        body: { 
          extractedText,
          organizationId: document.organization_id,
          documentName: document.file_name
        }
      }
    );

    if (extractionError) {
      console.error('Brand knowledge extraction failed:', extractionError);
      // Continue with basic save, don't fail entire process
    } else if (extractionData?.success) {
      console.log('Successfully extracted structured brand knowledge');
      
      // Save structured knowledge to brand_knowledge table
      const knowledgeInserts = [];
      
      if (extractionData.voice) {
        knowledgeInserts.push({
          organization_id: document.organization_id,
          document_id: documentId,
          knowledge_type: 'brand_voice',
          content: extractionData.voice,
          is_active: true,
          version: 1
        });
      }
      
      if (extractionData.vocabulary) {
        knowledgeInserts.push({
          organization_id: document.organization_id,
          document_id: documentId,
          knowledge_type: 'vocabulary',
          content: extractionData.vocabulary,
          is_active: true,
          version: 1
        });
      }
      
      if (extractionData.examples) {
        knowledgeInserts.push({
          organization_id: document.organization_id,
          document_id: documentId,
          knowledge_type: 'writing_examples',
          content: extractionData.examples,
          is_active: true,
          version: 1
        });
      }
      
      if (extractionData.structure) {
        knowledgeInserts.push({
          organization_id: document.organization_id,
          document_id: documentId,
          knowledge_type: 'structural_guidelines',
          content: extractionData.structure,
          is_active: true,
          version: 1
        });
      }
      
      // Save category-specific knowledge
      if (extractionData.categories) {
        if (extractionData.categories.personal_fragrance?.detected) {
          knowledgeInserts.push({
            organization_id: document.organization_id,
            document_id: documentId,
            knowledge_type: 'category_personal_fragrance',
            content: extractionData.categories.personal_fragrance,
            is_active: true,
            version: 1
          });
        }
        
        if (extractionData.categories.home_fragrance?.detected) {
          knowledgeInserts.push({
            organization_id: document.organization_id,
            document_id: documentId,
            knowledge_type: 'category_home_fragrance',
            content: extractionData.categories.home_fragrance,
            is_active: true,
            version: 1
          });
        }
        
        if (extractionData.categories.skincare?.detected) {
          knowledgeInserts.push({
            organization_id: document.organization_id,
            document_id: documentId,
            knowledge_type: 'category_skincare',
            content: extractionData.categories.skincare,
            is_active: true,
            version: 1
          });
        }
      }
      
      if (knowledgeInserts.length > 0) {
        const { error: insertError } = await supabase
          .from('brand_knowledge')
          .insert(knowledgeInserts);
        
        if (insertError) {
          console.error('Failed to save brand knowledge:', insertError);
        } else {
          console.log(`✓ Saved ${knowledgeInserts.length} structured brand knowledge entries`);
        }
      }
    } else {
      console.warn('Brand knowledge extraction returned no data');
    }

    // Save extracted content
    const { error: updateError } = await supabase
      .from('brand_documents')
      .update({
        extracted_content: extractedText,
        content_preview: contentPreview,
        processing_status: 'completed',
      })
      .eq('id', documentId);

    if (updateError) {
      throw new Error(`Failed to save extracted content: ${updateError.message}`);
    }

    console.log(`Successfully processed document: ${document.file_name}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        contentLength: extractedText.length,
        preview: contentPreview 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Update status to failed - use stored documentId from request
    try {
      const requestBody = await req.json();
      const documentId = requestBody.documentId;
      if (documentId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('brand_documents')
          .update({ 
            processing_status: 'failed',
            content_preview: `Error: ${errorMessage}`
          })
          .eq('id', documentId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }

    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
