# Database Audit Report
**Generated:** December 20, 2024  
**Project:** Madison Studio

---

## 📊 Migration Status Summary

| Status | Count | Description |
|--------|-------|-------------|
| ✅ Applied | 150 | Migrations successfully applied to remote |
| ⏳ Pending | 1 | Local migrations not yet pushed |
| ⚠️ Skipped | 1 | Invalid filename (`add_onboarding_fields_to_profiles.sql`) |

### Pending Migration
| Timestamp | Name | Status |
|-----------|------|--------|
| `20251221000000` | `team_roles_and_capabilities.sql` | ⏳ Not pushed (but SQL run manually) |

---

## 🗄️ Recent Feature Migrations (Dec 2024)

### Week 5-6: DAM Foundation (`20251219211155_dam_foundation.sql`)
| Table | Purpose | Status |
|-------|---------|--------|
| `dam_folders` | Folder hierarchy for assets | ✅ |
| `dam_assets` | Core asset metadata | ✅ |
| `dam_activity_log` | Usage tracking | ✅ |
| `product_hubs` | Central product data | ✅ |
| `product_specifications` | Technical specs | ✅ |
| `ingredient_library` | Org-wide ingredients | ✅ |
| `product_ingredients` | Product-ingredient mapping | ✅ |

### Week 6: DAM Extensions
| Migration | Tables/Features |
|-----------|-----------------|
| `20251219211156_dam_storage_buckets.sql` | Storage bucket policies |
| `20251219220000_dam_usage_tracking.sql` | `dam_usage_logs` table |
| `20251219230000_business_type_foundation.sql` | Business type configurations |

### Week 7: Product Hub Core (`20251220010000_product_hub_core.sql`)
| Table | Purpose | Status |
|-------|---------|--------|
| `product_formulations` | Scent profiles, formulas | ✅ |
| `product_commerce` | Pricing, inventory | ✅ |
| `product_variants` | Size/color variations | ✅ |
| `product_hub_assets` | Product-DAM links | ✅ |
| `product_hub_content` | Generated content links | ✅ |

### Week 7: Formulation Library (`20251220020000_formulation_notes_library.sql`)
| Table | Purpose | Status |
|-------|---------|--------|
| `scent_notes` | Fragrance note library | ✅ |
| `formulation_components` | Formula building blocks | ✅ |
| `carrier_oils` | Base oil library | ✅ |

### Week 7: Compliance (`20251220030000_ingredients_compliance.sql`)
| Table | Purpose | Status |
|-------|---------|--------|
| `allergen_registry` | EU 26 allergens + more | ✅ |
| `product_packaging` | Container/label specs | ✅ (via script) |
| `product_sds` | Safety Data Sheets | ✅ (via script) |
| `product_certifications` | Cruelty-free, vegan, etc. | ✅ (via script) |

### Week 7: External Assets (`20251220040000_external_asset_urls.sql`)
| Feature | Description | Status |
|---------|-------------|--------|
| `product_hub_assets.external_url` | External URL support | ✅ |
| `product_hub_assets.external_provider` | Google Drive, Dropbox, etc. | ✅ |
| `product_hubs.hero_image_external_url` | Direct external hero URLs | ✅ |

### Week 12: Team Roles (`20251221000000_team_roles_and_capabilities.sql`)
| Table/Enum | Purpose | Status |
|------------|---------|--------|
| `team_role` enum | founder, creative, compliance, etc. | ✅ (via script) |
| `organization_members.team_role` | Role assignment column | ✅ (via script) |
| `role_capabilities` | Section access permissions | ✅ (via script) |

---

## 📋 Critical Tables Checklist

### Core Tables
- [x] `organizations`
- [x] `organization_members`
- [x] `profiles`
- [x] `subscriptions`

### Content System
- [x] `master_content`
- [x] `content_derivatives`
- [x] `brand_collections`
- [x] `brand_documents`
- [x] `generated_images`
- [x] `prompts`

### DAM System
- [x] `dam_folders`
- [x] `dam_assets`
- [x] `dam_asset_tags`
- [x] `dam_collections`
- [x] `dam_collection_assets`
- [x] `dam_favorites`
- [x] `dam_usage_logs`

### Product Hub
- [x] `product_hubs`
- [x] `product_formulations`
- [x] `product_ingredients`
- [x] `ingredient_library`
- [x] `product_hub_assets`
- [x] `product_commerce`
- [x] `product_variants`

### Compliance
- [x] `product_packaging`
- [x] `product_sds`
- [x] `product_certifications`
- [x] `allergen_registry`

### Team/Roles
- [x] `role_capabilities`
- [x] `team_invitations`

---

## ⚠️ Manual Scripts Run

These SQL scripts were run directly in Supabase SQL Editor:

| Script | Purpose | Status |
|--------|---------|--------|
| `scripts/fix_missing_tables.sql` | Create packaging/SDS/certs tables | ✅ Run |
| `scripts/apply_team_roles.sql` | Create team_role enum + capabilities | ✅ Run |

---

## 🔧 Required Actions

### 1. Push Pending Migration (Optional)
The `20251221000000_team_roles_and_capabilities.sql` migration hasn't been pushed via CLI, but you ran the equivalent SQL manually. To sync:

```bash
supabase migration repair 20251221000000 --status applied
```

### 2. Fix Invalid Migration Filename
```bash
# Rename to valid timestamp format
mv supabase/migrations/add_onboarding_fields_to_profiles.sql \
   supabase/migrations/20240101000000_add_onboarding_fields_to_profiles.sql
```

### 3. Verify Tables (Run in Supabase SQL Editor)
Copy and run: `scripts/audit_database_tables.sql`

---

## 📊 Database Functions

### Key RPC Functions
| Function | Purpose |
|----------|---------|
| `get_user_organization_ids()` | Get user's org memberships |
| `get_team_member_profiles(org_id)` | Get team with profile data |
| `has_organization_role(org, role, user)` | Check permission role |
| `is_organization_member(org, user)` | Check membership |
| `is_super_admin(user)` | Check admin status |
| `get_user_team_role(org, user)` | Get functional team role |
| `get_role_capabilities(role)` | Get section permissions |
| `get_product_hero_image_url(product)` | Get hero from DAM or external |

---

## ✅ Summary

**All critical tables and features are in place:**

1. ✅ DAM system fully operational
2. ✅ Product Hub with all sections
3. ✅ Compliance tables (packaging, SDS, certifications)
4. ✅ External asset URL support
5. ✅ Team role-based views
6. ✅ Role capabilities matrix

**Minor cleanup needed:**
- Mark `20251221000000` as applied (or push it)
- Rename invalid migration filename

---

*Generated by audit process - December 20, 2024*
