/**
 * OPTIONAL: One-time script to migrate existing Shopify tokens
 * 
 * This script is ONLY useful if you have access to the original plaintext tokens
 * before running the migration. Otherwise, users must reconnect their accounts.
 * 
 * Usage (if you have plaintext tokens):
 *   1. Export existing tokens from database
 *   2. Run this script with the tokens
 *   3. Script will encrypt and update the database
 * 
 * Note: This is a one-time operation. After migration, all new tokens
 * will be encrypted via the connect-shopify edge function.
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ENCRYPTION_KEY = process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

if (!ENCRYPTION_KEY) {
  console.error('Missing SHOPIFY_TOKEN_ENCRYPTION_KEY');
  console.error('Set this environment variable before running the migration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Encryption helper (same as edge function)
function encryptText(plain: string, keyB64: string): { ciphertextB64: string; ivB64: string } {
  const keyBytes = Buffer.from(keyB64, 'base64');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, iv);
  
  let ciphertext = cipher.update(plain, 'utf8');
  ciphertext = Buffer.concat([ciphertext, cipher.final()]);
  
  const authTag = cipher.getAuthTag();
  const encrypted = Buffer.concat([ciphertext, authTag]);
  
  return {
    ciphertextB64: encrypted.toString('base64'),
    ivB64: iv.toString('base64'),
  };
}

async function migrateTokens() {
  console.log('🔄 Starting Shopify token migration...\n');

  // Fetch connections that need migration
  const { data: connections, error } = await supabase
    .from('shopify_connections')
    .select('id, organization_id, shop_domain, access_token_encrypted')
    .is('access_token_iv', null);

  if (error) {
    console.error('Error fetching connections:', error);
    process.exit(1);
  }

  if (!connections || connections.length === 0) {
    console.log('✅ No connections need migration');
    return;
  }

  console.log(`Found ${connections.length} connections to migrate\n`);

  // IMPORTANT: This assumes you have the plaintext tokens
  // If you don't have plaintext tokens, users must reconnect
  console.log('⚠️  WARNING: This script requires access to plaintext tokens!');
  console.log('   If tokens are already encrypted or you don\'t have plaintext,');
  console.log('   users must reconnect their Shopify accounts.\n');

  let migrated = 0;
  let failed = 0;

  for (const connection of connections) {
    try {
      // NOTE: This assumes access_token_encrypted contains plaintext
      // If it's already encrypted, this will fail
      const plaintextToken = connection.access_token_encrypted;
      
      if (!plaintextToken) {
        console.log(`⚠️  Skipping ${connection.shop_domain} - no token found`);
        failed++;
        continue;
      }

      // Encrypt the token
      const { ciphertextB64, ivB64 } = encryptText(plaintextToken, ENCRYPTION_KEY);

      // Update the connection
      const { error: updateError } = await supabase
        .from('shopify_connections')
        .update({
          access_token_encrypted: ciphertextB64,
          access_token_iv: ivB64,
          updated_at: new Date().toISOString(),
        })
        .eq('id', connection.id);

      if (updateError) {
        console.error(`❌ Failed to update ${connection.shop_domain}:`, updateError);
        failed++;
      } else {
        console.log(`✅ Migrated ${connection.shop_domain}`);
        migrated++;
      }
    } catch (error) {
      console.error(`❌ Error migrating ${connection.shop_domain}:`, error);
      failed++;
    }
  }

  console.log(`\n📊 Migration complete:`);
  console.log(`   ✅ Migrated: ${migrated}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`\n⚠️  If migration failed, users must reconnect their Shopify accounts`);
}

// Run migration
migrateTokens()
  .then(() => {
    console.log('\n✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });






















