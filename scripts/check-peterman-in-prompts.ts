/**
 * Verification Script: Check if Peterman Documents are being used
 * 
 * This script helps verify that J. Peterman documents are properly
 * integrated into Madison's prompt system.
 * 
 * Run this to check:
 * 1. Are Peterman documents uploaded?
 * 2. Are they processed?
 * 3. Are they being included in prompts?
 * 4. What content is available?
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function verifyPetermanDocuments() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  console.log('🔍 Verifying J. Peterman Document Integration...\n');
  
  // 1. Check uploaded Peterman documents
  const { data: petermanDocs, error: docsError } = await supabase
    .from('madison_training_documents')
    .select('id, file_name, processing_status, extracted_content, created_at')
    .or('file_name.ilike.%peterman%,file_name.ilike.%j.%peterman%')
    .order('created_at', { ascending: false });
  
  if (docsError) {
    console.error('❌ Error fetching documents:', docsError);
    return;
  }
  
  console.log(`📄 Found ${petermanDocs?.length || 0} Peterman document(s):\n`);
  
  if (!petermanDocs || petermanDocs.length === 0) {
    console.log('⚠️  No Peterman documents found!');
    console.log('   → Upload documents via Settings → Madison Training\n');
    return;
  }
  
  // 2. Check status of each document
  petermanDocs.forEach((doc, index) => {
    const status = doc.processing_status === 'completed' && 
                  doc.extracted_content && 
                  doc.extracted_content.length > 100
      ? '✅ READY'
      : doc.processing_status === 'completed'
      ? '⚠️  COMPLETED BUT EMPTY'
      : doc.processing_status === 'processing'
      ? '⏳ PROCESSING'
      : doc.processing_status === 'failed'
      ? '❌ FAILED'
      : '⏳ PENDING';
    
    console.log(`${index + 1}. ${doc.file_name}`);
    console.log(`   Status: ${status}`);
    console.log(`   Content Length: ${doc.extracted_content?.length || 0} chars`);
    console.log(`   Uploaded: ${new Date(doc.created_at).toLocaleDateString()}\n`);
  });
  
  // 3. Check if Peterman docs are in top 5 (will be loaded)
  const { data: allDocs, error: allError } = await supabase
    .from('madison_training_documents')
    .select('file_name, created_at')
    .eq('processing_status', 'completed')
    .not('extracted_content', 'is', null)
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (!allError && allDocs) {
    const petermanInTop = allDocs
      .slice(0, 5)
      .filter(doc => 
        doc.file_name.toLowerCase().includes('peterman') ||
        doc.file_name.toLowerCase().includes('j. peterman')
      );
    
    console.log('📊 Integration Status:');
    if (petermanInTop.length > 0) {
      console.log(`   ✅ ${petermanInTop.length} Peterman document(s) in top 5 - WILL BE LOADED`);
      petermanInTop.forEach(doc => {
        console.log(`      • ${doc.file_name}`);
      });
    } else {
      console.log('   ⚠️  No Peterman documents in top 5 - may not be loaded automatically');
      console.log('   → Upload more recent Peterman documents to ensure they\'re included');
    }
    console.log('');
  }
  
  // 4. Sample content preview
  const readyDocs = petermanDocs.filter(doc => 
    doc.processing_status === 'completed' && 
    doc.extracted_content && 
    doc.extracted_content.length > 100
  );
  
  if (readyDocs.length > 0) {
    console.log('📝 Content Preview (first 200 chars of each ready document):\n');
    readyDocs.forEach((doc, index) => {
      const preview = doc.extracted_content?.substring(0, 200) || '';
      console.log(`${index + 1}. ${doc.file_name}:`);
      console.log(`   "${preview}..."\n`);
    });
  }
  
  // 5. Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Summary:');
  console.log(`   Total Peterman Documents: ${petermanDocs.length}`);
  console.log(`   Ready Documents: ${readyDocs.length}`);
  console.log(`   In Top 5 (Will Load): ${petermanInTop?.length || 0}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  if (readyDocs.length > 0 && (petermanInTop?.length || 0) > 0) {
    console.log('✅ SUCCESS: Peterman documents are properly integrated!');
    console.log('   Madison will reference these documents in all prompts.\n');
  } else {
    console.log('⚠️  ACTION NEEDED:');
    if (readyDocs.length === 0) {
      console.log('   • Upload and process Peterman documents');
    }
    if ((petermanInTop?.length || 0) === 0) {
      console.log('   • Upload more recent Peterman documents to ensure they\'re in top 5');
    }
    console.log('');
  }
}

// Run verification
verifyPetermanDocuments().catch(console.error);

