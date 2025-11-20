# Phase 1 Security Fixes - Deployment Guide

This guide walks you through deploying the Phase 1 critical security fixes for Shopify token encryption.

## Prerequisites

- [x] Supabase CLI installed and configured
- [x] Access to Supabase project (local or production)
- [x] Admin access to set environment variables

## Step-by-Step Deployment

### Step 1: Generate Encryption Key

Generate a secure encryption key for Shopify token encryption:

```bash
# Using Node.js helper script
node scripts/generate-shopify-encryption-key.js

# Or manually generate:
# Using openssl (if available)
openssl rand -base64 32

# Or using Node.js directly
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Save this key securely** - you'll need it for the next step.

### Step 2: Set Environment Variable

#### For Local Development:

```bash
supabase secrets set SHOPIFY_TOKEN_ENCRYPTION_KEY="<your-generated-key>"
```

#### For Production (Supabase Dashboard):

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **Edge Functions** > **Secrets**
3. Click **Add new secret**
4. Name: `SHOPIFY_TOKEN_ENCRYPTION_KEY`
5. Value: Paste your generated key
6. Click **Save**

### Step 3: Run Database Migration

```bash
# For local development
supabase migration up

# For production (via CLI)
supabase db push

# Or apply migration manually via Dashboard:
# Project Settings > Database > Migrations > Apply migration
```

The migration will:
- Add `access_token_iv` column to `shopify_connections` table
- Clear existing unencrypted tokens (users will need to reconnect)

### Step 4: Deploy Edge Function

```bash
# Deploy the connect-shopify function
supabase functions deploy connect-shopify

# Verify deployment
supabase functions list
```

The function should appear in your functions list with `verify_jwt = true`.

### Step 5: Regenerate TypeScript Types

After running the migration, regenerate your TypeScript types:

```bash
# For local development
supabase gen types typescript --local > src/integrations/supabase/types.ts

# For production (if connected)
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

Verify that `access_token_iv` appears in the `shopify_connections` type definition.

### Step 6: Test the Implementation

1. **Test New Connection**:
   - Go to Settings > Integrations > Shopify
   - Try connecting a new Shopify account
   - Verify connection succeeds

2. **Verify Encryption**:
   ```sql
   -- Check that tokens are encrypted
   SELECT 
     id,
     shop_domain,
     access_token_encrypted IS NOT NULL as has_encrypted_token,
     access_token_iv IS NOT NULL as has_iv
   FROM shopify_connections
   LIMIT 5;
   ```
   
   Both `has_encrypted_token` and `has_iv` should be `true`.

3. **Test Product Sync**:
   - After connecting, try syncing products
   - Verify sync works with encrypted tokens

4. **Test Product Update**:
   - Try updating a Shopify product
   - Verify update works with encrypted tokens

## Troubleshooting

### Error: "Shopify token encryption key not configured"

**Solution**: Make sure you've set `SHOPIFY_TOKEN_ENCRYPTION_KEY` in your environment variables.

```bash
# Verify secret is set
supabase secrets list
```

### Error: "Failed to decrypt Shopify access token"

**Possible Causes**:
1. Encryption key mismatch (wrong key used)
2. Token was encrypted with different key
3. Token data is corrupted

**Solution**: User needs to reconnect their Shopify account to re-encrypt with the correct key.

### Error: "Shopify connection is missing encrypted token data"

**Cause**: Existing connection was created before migration and doesn't have IV.

**Solution**: User needs to reconnect their Shopify account.

### Migration Fails

If migration fails, check:

1. **Database connection**: Ensure you can connect to Supabase
2. **Permissions**: Ensure you have admin access
3. **Migration conflicts**: Check if migration has already been applied

```bash
# Check migration status
supabase migration list

# Check if column exists
supabase db diff
```

## Post-Deployment Checklist

- [ ] Encryption key is set in all environments (dev, staging, production)
- [ ] Migration has been applied successfully
- [ ] Edge function is deployed and accessible
- [ ] TypeScript types have been regenerated
- [ ] New Shopify connections work correctly
- [ ] Product sync works with encrypted tokens
- [ ] Product update works with encrypted tokens
- [ ] Users notified about reconnection requirement (if applicable)

## User Communication

If you have existing Shopify connections, notify users:

> **Important Update**: We've upgraded Shopify token security with encryption. 
> If you have an existing Shopify connection, please reconnect it:
> 1. Go to Settings > Integrations > Shopify
> 2. Click "Disconnect"
> 3. Click "Connect" and re-enter your credentials
> 
> This ensures your tokens are properly encrypted and secure.

## Rollback Plan

If you need to rollback:

1. **Revert Migration**: 
   ```sql
   -- Remove IV column (if needed)
   ALTER TABLE shopify_connections DROP COLUMN IF EXISTS access_token_iv;
   ```

2. **Revert Code**: 
   - Restore previous version of `ShopifyConnection.tsx`
   - Remove `connect-shopify` edge function
   - Restore previous versions of sync functions

3. **Note**: Existing encrypted tokens will be unusable after rollback. Users must reconnect.

## Security Notes

- ✅ Encryption key is stored securely in Supabase secrets
- ✅ Keys never exposed to client-side code
- ✅ Encryption happens server-side in edge functions
- ✅ IVs stored separately for additional security
- ✅ AES-256-GCM encryption (industry standard)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review Supabase logs: `supabase functions logs connect-shopify`
3. Check database logs in Supabase Dashboard
4. Verify all environment variables are set correctly
























