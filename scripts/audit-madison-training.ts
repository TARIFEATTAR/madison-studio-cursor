/**
 * Audit script for Madison Training Documents
 * Queries the database to find all training documents and analyze their status
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface TrainingDocument {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  processing_status: string | null;
  extracted_content: string | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string | null;
}

async function auditTrainingDocuments() {
  console.log('🔍 Auditing Madison Training Documents...\n');

  try {
    // First, check the actual table structure
    const { data: allDocs, error } = await supabase
      .from('madison_training_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying database:', error);
      return;
    }

    if (!allDocs || allDocs.length === 0) {
      console.log('No training documents found in the database.');
      return;
    }

    console.log(`Found ${allDocs.length} total training document(s)\n`);

    // Check if table has category, slug, name, version columns
    const firstDoc = allDocs[0] as any;
    const hasCategory = 'category' in firstDoc;
    const hasSlug = 'slug' in firstDoc;
    const hasName = 'name' in firstDoc;
    const hasVersion = 'version' in firstDoc;

    console.log('📊 Table Structure Analysis:');
    console.log(`  - Has 'category' column: ${hasCategory ? '✅' : '❌'}`);
    console.log(`  - Has 'slug' column: ${hasSlug ? '✅' : '❌'}`);
    console.log(`  - Has 'name' column: ${hasName ? '✅' : '❌'}`);
    console.log(`  - Has 'version' column: ${hasVersion ? '✅' : '❌'}`);
    console.log(`  - Available columns: ${Object.keys(firstDoc).join(', ')}\n`);

    // If the table doesn't have the expected columns, we'll work with file_name
    // to infer category and other metadata
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    console.log('📋 Full Document List:\n');
    console.log('─'.repeat(100));

    const documents = allDocs as TrainingDocument[];
    const garyHalbertDocs: TrainingDocument[] = [];
    const writingStyleDocs: TrainingDocument[] = [];
    const visualIdentityDocs: TrainingDocument[] = [];

    documents.forEach((doc, index) => {
      const createdDate = new Date(doc.created_at);
      const isRecent = createdDate >= twelveMonthsAgo;
      const isActive = doc.processing_status === 'completed' && isRecent;

      // Check file_name for category indicators
      const fileNameLower = doc.file_name.toLowerCase();
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

      const isGaryHalbert = fileNameLower.includes('gary') && fileNameLower.includes('halbert') ||
                           fileNameLower.includes('halbert') ||
                           fileNameLower.includes('gary-halbert');

      if (isGaryHalbert) {
        garyHalbertDocs.push(doc);
      }
      if (isWritingStyle) {
        writingStyleDocs.push(doc);
      }
      if (isVisualIdentity) {
        visualIdentityDocs.push(doc);
      }

      // Determine active status
      let activeStatus = '❌ No';
      if (hasVersion) {
        // If version column exists, check if it's the latest
        const latestVersion = Math.max(...documents.map(d => (d as any).version || 1));
        const isLatestVersion = (doc as any).version === latestVersion;
        activeStatus = isLatestVersion && isRecent ? '✅ Yes' : '❌ No';
      } else {
        activeStatus = isActive ? '✅ Yes' : '❌ No';
      }

      console.log(`\n${index + 1}. Document ID: ${doc.id}`);
      console.log(`   File Name: ${doc.file_name}`);
      if (hasSlug) console.log(`   Slug: ${(doc as any).slug}`);
      if (hasName) console.log(`   Name: ${(doc as any).name}`);
      if (hasVersion) console.log(`   Version: ${(doc as any).version}`);
      console.log(`   Type: ${doc.file_type}`);
      console.log(`   Status: ${doc.processing_status || 'unknown'}`);
      console.log(`   Created: ${createdDate.toLocaleDateString()} (${Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24))} days ago)`);
      console.log(`   Active? ${activeStatus}`);
      
      if (isGaryHalbert) {
        console.log(`   ⚠️  GARY HALBERT REFERENCE DETECTED`);
      }
      if (isWritingStyle) {
        console.log(`   📝 Appears to be Writing Style related`);
      }
      if (isVisualIdentity) {
        console.log(`   🎨 Appears to be Visual Identity related`);
      }
    });

    console.log('\n' + '─'.repeat(100));
    console.log('\n📊 Summary:\n');

    console.log(`Total Documents: ${documents.length}`);
    console.log(`Writing Style Related: ${writingStyleDocs.length}`);
    console.log(`Visual Identity Related: ${visualIdentityDocs.length}`);
    console.log(`Gary Halbert References: ${garyHalbertDocs.length}`);

    if (garyHalbertDocs.length > 0) {
      console.log('\n⚠️  GARY HALBERT DOCUMENTS FOUND:');
      garyHalbertDocs.forEach(doc => {
        console.log(`  - ${doc.file_name} (ID: ${doc.id})`);
        console.log(`    Created: ${new Date(doc.created_at).toLocaleDateString()}`);
        console.log(`    Status: ${doc.processing_status || 'unknown'}`);
      });
    }

    // Propose cleanup steps
    console.log('\n' + '═'.repeat(100));
    console.log('🧹 PROPOSED CLEANUP STEPS:\n');

    const archivedDocs = documents.filter(doc => {
      const createdDate = new Date(doc.created_at);
      return createdDate < twelveMonthsAgo || doc.processing_status !== 'completed';
    });

    if (archivedDocs.length > 0) {
      console.log('1. ARCHIVE OLD/INCOMPLETE DOCUMENTS:');
      archivedDocs.forEach(doc => {
        console.log(`   - ${doc.file_name} (ID: ${doc.id})`);
        console.log(`     Reason: ${doc.processing_status !== 'completed' ? 'Processing incomplete' : 'Older than 12 months'}`);
      });
      console.log(`   SQL: UPDATE madison_training_documents SET processing_status = 'archived' WHERE id IN (${archivedDocs.map(d => `'${d.id}'`).join(', ')});\n`);
    }

    if (garyHalbertDocs.length > 0) {
      console.log('2. REVIEW GARY HALBERT DOCUMENTS:');
      console.log('   These documents reference Gary Halbert, which may not align with Madison Studio\'s current');
      console.log('   editorial direction (Ogilvy, Hopkins, Reeves, Schwartz). Consider:');
      console.log('   - Reviewing content for alignment with current training');
      console.log('   - Archiving if outdated');
      console.log('   - Renaming if keeping (remove "halbert" from filename)\n');
    }

    if (!hasCategory || !hasSlug || !hasName || !hasVersion) {
      console.log('3. SCHEMA ENHANCEMENT RECOMMENDATION:');
      console.log('   The table is missing expected columns (category, slug, name, version).');
      console.log('   Consider adding these columns for better organization:');
      console.log('   - category: TEXT (writing_style, visual_identity, etc.)');
      console.log('   - slug: TEXT UNIQUE (for URL-friendly identifiers)');
      console.log('   - name: TEXT (human-readable name)');
      console.log('   - version: INTEGER (for versioning)\n');
    }

    console.log('4. RENAME RECOMMENDATIONS:');
    documents.forEach(doc => {
      const fileNameLower = doc.file_name.toLowerCase();
      if (fileNameLower.includes('halbert') && !fileNameLower.includes('gary-halbert')) {
        console.log(`   - Consider renaming "${doc.file_name}" to include full "gary-halbert" slug`);
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the audit
auditTrainingDocuments()
  .then(() => {
    console.log('\n✅ Audit complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

















































