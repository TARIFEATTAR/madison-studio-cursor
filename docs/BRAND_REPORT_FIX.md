# Brand Report Page Fix

## Issue
The brand report page (`/reports/:domainId`) was showing 404 errors and "Report Not Found" because:
1. The query was expecting a domain, but the URL was using brand names
2. The `brand_scans` table migration may not have been run in production

## Fixes Applied

### 1. Updated BrandReport Query Logic
- Now handles both domain names and brand names in the URL
- If domain lookup fails, falls back to getting the latest scan for the organization
- Better error handling for missing tables/migrations

### 2. Improved Error Messages
- Shows helpful error messages when table doesn't exist
- Better "Report Not Found" UI with navigation options

## Migration Required

The `brand_scans` table needs to be created in production. Run this migration:

**File:** `supabase/migrations/20250101000000_create_brand_scans.sql`

### How to Run Migration

#### Option 1: Supabase Dashboard (Recommended)
1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open `supabase/migrations/20250101000000_create_brand_scans.sql` in your editor
5. Copy ALL contents (Cmd+A, Cmd+C)
6. Paste into SQL Editor
7. Click **Run** (or Cmd+Enter)
8. Verify success: Should see "Success. No rows returned"

#### Option 2: Supabase CLI
```bash
npx supabase db push --project-ref likkskifwsrvszxdvufw
```

### Verify Migration Ran Successfully

Run this query in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('brand_scans', 'domains');
```

You should see both tables listed.

## Testing

After migration:
1. Navigate to `/reports/[any-domain]` - should show "Report Not Found" (not 404 error)
2. Run a brand scan via onboarding or `/api/scan`
3. Navigate to `/reports/[scanned-domain]` - should show the report
4. Navigate to `/reports/[brand-name]` - should show latest scan for organization

## Notes

- The route accepts both domains and brand names
- If a domain is provided, it tries to match by domain first
- If no domain match or brand name provided, it gets the latest scan for the organization
- This allows flexibility for users who haven't scanned a website yet

