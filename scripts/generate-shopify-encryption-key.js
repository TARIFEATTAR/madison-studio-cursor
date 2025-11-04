#!/usr/bin/env node
/**
 * Generate a secure encryption key for Shopify token encryption
 * 
 * Usage: node scripts/generate-shopify-encryption-key.js
 * 
 * This generates a 32-byte (256-bit) key suitable for AES-256-GCM encryption
 * and outputs it as a base64-encoded string ready to use as SHOPIFY_TOKEN_ENCRYPTION_KEY
 */

import crypto from 'crypto';

// Generate a secure random 32-byte key (256 bits for AES-256)
const key = crypto.randomBytes(32);

// Encode to base64 for storage
const keyBase64 = key.toString('base64');

console.log('\n🔐 Shopify Token Encryption Key Generated\n');
console.log('=' .repeat(60));
console.log('\nCopy this key and set it as an environment variable:\n');
console.log(`SHOPIFY_TOKEN_ENCRYPTION_KEY=${keyBase64}\n`);
console.log('=' .repeat(60));
console.log('\n📝 To set in Supabase:\n');
console.log('  Local Development:');
console.log('    supabase secrets set SHOPIFY_TOKEN_ENCRYPTION_KEY="' + keyBase64 + '"\n');
console.log('  Production (via Dashboard):');
console.log('    Go to Project Settings > Edge Functions > Secrets');
console.log('    Add: SHOPIFY_TOKEN_ENCRYPTION_KEY');
console.log('    Value: ' + keyBase64 + '\n');
console.log('⚠️  IMPORTANT: Store this key securely!');
console.log('   - Never commit it to version control');
console.log('   - Keep it in a secure password manager');
console.log('   - Use the same key for all environments OR generate separate keys\n');

