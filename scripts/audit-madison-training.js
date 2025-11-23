/**
 * Audit script for Madison Training Documents
 * Run with: node scripts/audit-madison-training.js
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function auditTrainingDocuments() {
  console.log('🔍 Auditing Madison Training Documents...\n');

  try {
    // Query all documents
    const { data: allDocs, error } = await supabase
      .from('madison_training_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error querying database:', error);
      return;
    }

    if (!allDocs || allDocs.length === 0) {
      console.log('📭 No training documents found in the database.');
      return;
    }

    console.log(`📊 Found ${allDocs.length} total training document(s)\n`);

    // Check table structure
    const firstDoc = allDocs[0];
    const hasCategory = 'category' in firstDoc;
    const hasSlug = 'slug' in firstDoc;
    const hasName = 'name' in firstDoc;
    const hasVersion = 'version' in firstDoc;

    console.log('📋 Table Structure:');
    console.log(`   Has 'category': ${hasCategory ? '✅' : '❌'}`);
    console.log(`   Has 'slug': ${hasSlug ? '✅' : '❌'}`);
    console.log(`   Has 'name': ${hasSlug ? '✅' : '❌'}`);
    console.log(`   Has 'version': ${hasVersion ? '✅' : '❌'}`);
    console.log(`   Available columns: ${Object.keys(firstDoc).join(', ')}\n`);

    // Calculate date thresholds
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);

    // Filter documents
    let filteredDocs = allDocs;

    if (hasCategory) {
      // If category column exists, filter by it
      filteredDocs = allDocs.filter(doc => {
        const category = (doc.category || '').toLowerCase();
        return category === 'writing style' || category === 'visual identity';
      });
      console.log(`📝 Filtered to ${filteredDocs.length} documents with category = "writing style" or "visual identity"\n`);
    } else {
      // Otherwise, infer from file_name
      console.log('⚠️  No category column found. Inferring category from file_name...\n');
      filteredDocs = allDocs.filter(doc => {
        const fileName = (doc.file_name || '').toLowerCase();
        return fileName.includes('writing') || 
               fileName.includes('style') || 
               fileName.includes('voice') ||
               fileName.includes('copy') ||
               fileName.includes('visual') ||
               fileName.includes('identity') ||
               fileName.includes('brand') ||
               fileName.includes('design') ||
               fileName.includes('halbert') ||
               fileName.includes('ogilvy');
      });
      console.log(`📝 Found ${filteredDocs.length} documents that appear to be writing style or visual identity related\n`);
    }

    // Analyze documents
    const garyHalbertDocs = [];
    const writingStyleDocs = [];
    const visualIdentityDocs = [];

    console.log('═'.repeat(100));
    console.log('📋 FULL DOCUMENT LIST:\n');

    filteredDocs.forEach((doc, index) => {
      const createdDate = new Date(doc.created_at);
      const daysAgo = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
      const isRecent = createdDate >= twelveMonthsAgo;
      
      // Determine active status
      let isActive = false;
      if (hasVersion) {
        const latestVersion = Math.max(...allDocs.map(d => d.version || 1));
        isActive = (doc.version === latestVersion) && isRecent;
      } else {
        isActive = (doc.processing_status === 'completed') && isRecent;
      }

      // Check for category indicators
      const fileNameLower = (doc.file_name || '').toLowerCase();
      const isWritingStyle = fileNameLower.includes('writing') || 
                            fileNameLower.includes('style') || 
                            fileNameLower.includes('voice') ||
                            fileNameLower.includes('copy') ||
                            fileNameLower.includes('halbert') ||
                            fileNameLower.includes('ogilvy') ||
                            fileNameLower.includes('hopkins');
      
      const isVisualIdentity = fileNameLower.includes('visual') || 
                               fileNameLower.includes('identity') ||
                               fileNameLower.includes('brand') ||
                               fileNameLower.includes('design');

      const isGaryHalbert = (fileNameLower.includes('gary') && fileNameLower.includes('halbert')) ||
                           fileNameLower.includes('halbert') ||
                           (doc.slug && doc.slug.includes('gary-halbert')) ||
                           (doc.slug && doc.slug.includes('halbert'));

      if (isGaryHalbert) garyHalbertDocs.push(doc);
      if (isWritingStyle) writingStyleDocs.push(doc);
      if (isVisualIdentity) visualIdentityDocs.push(doc);

      // Display document info
      console.log(`${index + 1}. Document`);
      console.log(`   ID: ${doc.id}`);
      if (hasSlug) console.log(`   Slug: ${doc.slug || 'N/A'}`);
      if (hasName) console.log(`   Name: ${doc.name || 'N/A'}`);
      console.log(`   File Name: ${doc.file_name || 'N/A'}`);
      if (hasVersion) console.log(`   Version: ${doc.version || 'N/A'}`);
      console.log(`   Type: ${doc.file_type || 'N/A'}`);
      console.log(`   Status: ${doc.processing_status || 'unknown'}`);
      console.log(`   Created: ${createdDate.toLocaleDateString()} (${daysAgo} days ago)`);
      console.log(`   Active? ${isActive ? '✅ Yes' : '❌ No'}`);
      
      if (isGaryHalbert) {
        console.log(`   ⚠️  GARY HALBERT REFERENCE DETECTED`);
      }
      if (hasCategory) {
        console.log(`   Category: ${doc.category || 'N/A'}`);
      }
      console.log('');
    });

    console.log('═'.repeat(100));
    console.log('\n📊 SUMMARY:\n');
    console.log(`Total Documents Analyzed: ${filteredDocs.length}`);
    console.log(`Writing Style Related: ${writingStyleDocs.length}`);
    console.log(`Visual Identity Related: ${visualIdentityDocs.length}`);
    console.log(`Gary Halbert References: ${garyHalbertDocs.length}`);

    if (garyHalbertDocs.length > 0) {
      console.log('\n⚠️  GARY HALBERT DOCUMENTS FOUND:');
      garyHalbertDocs.forEach(doc => {
        console.log(`   - ${doc.file_name || doc.name || 'Unnamed'} (ID: ${doc.id})`);
        if (doc.slug) console.log(`     Slug: ${doc.slug}`);
        console.log(`     Created: ${new Date(doc.created_at).toLocaleDateString()}`);
        console.log(`     Status: ${doc.processing_status || 'unknown'}`);
        console.log(`     Active: ${(doc.processing_status === 'completed' && new Date(doc.created_at) >= twelveMonthsAgo) ? 'Yes' : 'No'}`);
      });
    }

    // Propose cleanup steps
    console.log('\n' + '═'.repeat(100));
    console.log('🧹 PROPOSED CLEANUP STEPS:\n');

    const archivedDocs = filteredDocs.filter(doc => {
      const createdDate = new Date(doc.created_at);
      return createdDate < twelveMonthsAgo || doc.processing_status !== 'completed';
    });

    if (archivedDocs.length > 0) {
      console.log('1. ARCHIVE OLD/INCOMPLETE DOCUMENTS:');
      archivedDocs.forEach(doc => {
        const reason = doc.processing_status !== 'completed' 
          ? 'Processing incomplete' 
          : 'Older than 12 months';
        console.log(`   - ${doc.file_name || doc.name || 'Unnamed'} (ID: ${doc.id})`);
        console.log(`     Reason: ${reason}`);
      });
      const ids = archivedDocs.map(d => `'${d.id}'`).join(', ');
      console.log(`\n   SQL: UPDATE madison_training_documents SET processing_status = 'archived' WHERE id IN (${ids});\n`);
    }

    if (garyHalbertDocs.length > 0) {
      console.log('2. REVIEW GARY HALBERT DOCUMENTS:');
      console.log('   These documents reference Gary Halbert, which may not align with Madison Studio\'s');
      console.log('   current editorial direction (Ogilvy, Hopkins, Reeves, Schwartz). Consider:');
      console.log('   - Reviewing content for alignment with current training');
      console.log('   - Archiving if outdated or misaligned');
      console.log('   - Renaming slugs/files if keeping (e.g., "gary-halbert" → "halbert-archive")\n');
    }

    if (!hasCategory || !hasSlug || !hasName || !hasVersion) {
      console.log('3. SCHEMA ENHANCEMENT RECOMMENDATION:');
      console.log('   The table is missing expected columns. Consider adding:');
      if (!hasCategory) console.log('   - category: TEXT (writing_style, visual_identity, etc.)');
      if (!hasSlug) console.log('   - slug: TEXT UNIQUE (for URL-friendly identifiers)');
      if (!hasName) console.log('   - name: TEXT (human-readable name)');
      if (!hasVersion) console.log('   - version: INTEGER (for versioning)');
      console.log('');
    }

    console.log('4. RENAME RECOMMENDATIONS:');
    let hasRenames = false;
    filteredDocs.forEach(doc => {
      const fileNameLower = (doc.file_name || '').toLowerCase();
      if (fileNameLower.includes('halbert') && !fileNameLower.includes('gary-halbert')) {
        console.log(`   - "${doc.file_name}" → Consider adding "gary-" prefix for consistency`);
        hasRenames = true;
      }
    });
    if (!hasRenames) {
      console.log('   No rename recommendations at this time.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the audit
auditTrainingDocuments()
  .then(() => {
    console.log('\n✅ Audit complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });

