# Phase 1: Data Model and Schema - Complete

## Overview

Phase 1 establishes the foundational data model and TypeScript types for the brand audit system. This provides a single source of truth for all brand scan data.

## TypeScript Types Created

### Core Types (`src/types/brandReport.ts`)

1. **`Domain`** - Represents a scanned website domain
   - Tracks domain metadata and scan history
   - Links to organization
   - Stores display name and notes

2. **`Scan`** - Represents a single scan execution
   - Links to domain and organization
   - Stores full BrandReport as JSONB
   - Tracks status, errors, and metadata
   - Includes extraction method tracking

3. **`BrandReport`** - The fully-aggregated report object
   - Used by both report page and PDF generation
   - Comprehensive structure covering:
     - Site information (domain, URLs, logos)
     - Brand profile (name, positioning, audience)
     - Colors (primary, secondary, neutrals, accents)
     - Typography
     - Brand voice
     - Strategic audit
     - Content strategy
     - Visual style
     - Scoring
     - Recommendations
   - Includes legacy fields for backward compatibility

4. **`ScanInput`** - Input for starting a scan
5. **`ScanResult`** - Result from a scan
6. **`ReportGenerationOptions`** - Options for PDF/HTML generation

### Utility Functions

- `isValidBrandReport()` - Type guard for validation
- `normalizeDomain()` - Domain normalization
- `createEmptyBrandReport()` - Factory function
- `mergeBrandReports()` - Combine multiple reports

## Database Schema

### Tables Created

1. **`brand_scans`** - Stores all scan results
   - `id` - UUID primary key
   - `organization_id` - Links to organization
   - `domain` - Normalized domain (denormalized for querying)
   - `domain_id` - Optional reference to domains table
   - `scan_type` - Type of scan ('brand_dna', 'website_scrape', etc.)
   - `scan_data` - Full BrandReport JSONB
   - `status` - Scan status
   - `error_message` - Error details if failed
   - `metadata` - Additional scan metadata (duration, methods, etc.)
   - Timestamps and indexes

2. **`domains`** - Domain management table
   - `id` - UUID primary key
   - `organization_id` - Links to organization
   - `domain` - Normalized domain
   - `display_name` - Friendly name
   - `metadata` - Scan history and notes
   - Unique constraint on (organization_id, domain)

### Indexes

- `idx_brand_scans_org_id` - Fast org queries
- `idx_brand_scans_domain` - Fast domain queries
- `idx_brand_scans_domain_id` - Fast domain_id lookups
- `idx_brand_scans_created_at` - Time-based queries
- `idx_brand_scans_org_domain` - Combined queries
- `idx_brand_scans_status` - Status filtering
- `idx_brand_scans_scan_type` - Type filtering
- `idx_domains_org_id` - Domain org queries
- `idx_domains_domain` - Domain lookups

### RLS Policies

**brand_scans:**
- Members can view their organization's scans
- Members can create scans
- Admins/owners can update scans

**domains:**
- Members can view their organization's domains
- Members can create domains
- Admins/owners can update domains

### Helper Functions

- `get_latest_scan(org_id, domain)` - Returns latest completed scan for a domain

## Conversion Utilities

### `src/utils/brandReportConverter.ts`

Provides conversion between legacy formats and new BrandReport:

1. **`convertLegacyBrandDNAToBrandReport()`**
   - Converts old analyze-brand-dna format to BrandReport
   - Handles color palette conversion
   - Maps legacy fields to new structure
   - Maintains backward compatibility

2. **`convertBrandReportToLegacy()`**
   - Converts BrandReport back to legacy format
   - Useful for backward compatibility

3. **`normalizeBrandReport()`**
   - Validates and normalizes BrandReport
   - Ensures required fields are present
   - Sets defaults for missing fields

## Integration Points

### Existing Functions to Update

1. **`analyze-brand-dna`** - Already saves to `brand_scans`, needs to use BrandReport type
2. **`scrape-brand-website`** - Should save results as BrandReport
3. **Report page** - Already uses BrandReport structure
4. **PDF generation** - Will use BrandReport type

## Next Steps (Phase 2+)

1. **Update analyze-brand-dna** to use BrandReport type
2. **Create domain management** functions
3. **Add scan orchestration** logic
4. **Implement report aggregation** (combining multiple scans)
5. **Add validation** middleware

## Benefits

1. **Type Safety** - Full TypeScript types for all data
2. **Single Source of Truth** - BrandReport is the canonical format
3. **Backward Compatible** - Legacy fields included
4. **Extensible** - Easy to add new fields
5. **Queryable** - JSONB allows flexible queries
6. **Versioned** - Scan history maintained

## Migration Path

1. ✅ Types created
2. ✅ Database schema created
3. ✅ Conversion utilities created
4. ⏳ Update existing functions to use new types
5. ⏳ Migrate existing data (if needed)

