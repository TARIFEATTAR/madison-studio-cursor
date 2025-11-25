# Etsy API Integration - Technical Specification

## Overview
This document outlines the technical requirements and architecture for integrating Etsy's API to push marketplace listings from Madison directly to Etsy as draft listings.

**Status**: Planning Phase  
**Priority**: Next Milestone  
**Estimated Complexity**: High

---

## Goals
1. Allow users to connect their Etsy seller accounts to Madison
2. Push completed listings from Madison to Etsy as draft listings
3. Maintain sync status and link between Madison listings and Etsy listings
4. Provide clear feedback on sync status and errors

---

## Prerequisites

### Etsy API Access
- **API Version**: Etsy Open API v3
- **Authentication Method**: OAuth 2.0
- **Required Scopes**:
  - `listings_r` - Read listing data
  - `listings_w` - Create and update listings
  - `listings_d` - Delete listings
  - `shops_r` - Read shop information

### Required Credentials (Secure Storage)
All credentials must be stored using Lovable Cloud secrets:
- `ETSY_CLIENT_ID` - OAuth app keystring
- `ETSY_CLIENT_SECRET` - OAuth app shared secret
- Per-user access tokens (encrypted in database)
- Per-user refresh tokens (encrypted in database)

---

## Technical Architecture

### 1. Database Schema Changes

#### New Table: `etsy_connections`
```sql
CREATE TABLE etsy_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  shop_id TEXT NOT NULL, -- Etsy shop ID
  shop_name TEXT NOT NULL,
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  token_expiry TIMESTAMP WITH TIME ZONE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### Updates to `marketplace_listings` Table
- Add `etsy_listing_id` (BIGINT) - Etsy's listing ID
- Add `etsy_state` (TEXT) - Etsy listing state (draft, active, inactive, etc.)
- Add `last_etsy_sync` (TIMESTAMP) - Last successful sync time
- Add `etsy_sync_error` (TEXT) - Last error message if sync failed

### 2. Edge Functions

#### `etsy-oauth-callback`
**Purpose**: Handle OAuth 2.0 authorization flow  
**Endpoint**: `/functions/v1/etsy-oauth-callback`  
**Method**: GET  
**Public**: Yes (verify_jwt = false, validate state parameter)

**Flow**:
1. Receive authorization code from Etsy redirect
2. Exchange code for access token and refresh token
3. Fetch shop information
4. Encrypt and store tokens in database
5. Redirect back to settings page with success/error status

#### `etsy-push-listing`
**Purpose**: Push a Madison listing to Etsy as a draft  
**Endpoint**: `/functions/v1/etsy-push-listing`  
**Method**: POST  
**Authentication**: Required

**Request Body**:
```json
{
  "listingId": "uuid-of-madison-listing"
}
```

**Process**:
1. Fetch listing data from `marketplace_listings`
2. Fetch user's Etsy connection and decrypt tokens
3. Check token expiry, refresh if needed
4. Fetch associated product data if `product_id` exists
5. Map Madison data to Etsy format
6. Validate against Etsy's requirements
7. Call Etsy API to create draft listing
8. Upload images to Etsy
9. Update Madison listing with `etsy_listing_id` and `external_url`
10. Return success/error response

#### `etsy-refresh-token`
**Purpose**: Refresh expired OAuth tokens  
**Endpoint**: Internal function (called by other functions)  
**Authentication**: Service role

#### `etsy-disconnect`
**Purpose**: Disconnect Etsy account  
**Endpoint**: `/functions/v1/etsy-disconnect`  
**Method**: POST  
**Authentication**: Required

---

## Data Mapping

### Madison → Etsy Field Mapping

| Madison Field | Etsy Field | Notes |
|--------------|------------|-------|
| `title` | `title` | Max 140 chars |
| `platform_data.description` | `description` | Max 1000 chars, supports basic HTML |
| `platform_data.price` | `price` | Format: "XX.XX" |
| `platform_data.quantity` | `quantity` | Integer |
| `platform_data.tags` | `tags` | Max 13 tags, each max 20 chars |
| `platform_data.images` | Image uploads | Max 10 images, first is primary |
| `platform_data.category` | `taxonomy_id` | Requires mapping to Etsy taxonomy |
| `product_id` | `sku` | Optional SKU from product |

### Special Handling Required

#### Category Mapping
Etsy uses a hierarchical taxonomy system. We need:
- Static mapping file: `src/config/etsyTaxonomyMapping.ts`
- Map our simplified categories to Etsy taxonomy IDs
- Provide fallback to "Home & Living" (taxonomy_id: 1)

#### Shipping Profiles
- Fetch user's existing Etsy shipping profiles
- Let user select default profile in settings
- Store `default_shipping_profile_id` in `etsy_connections`

#### Required Etsy Fields
These fields are required by Etsy but not in our form:
- `who_made`: Options - "i_did", "someone_else", "collective"
- `when_made`: Options - year ranges or "made_to_order"
- `is_supply`: Boolean - is it a craft supply?

**Solution**: Add these as one-time setup questions when connecting Etsy account, store as defaults in `etsy_connections` table.

---

## Security Considerations

### Token Storage
- **NEVER** store tokens in plain text
- Use Lovable Cloud's built-in encryption for tokens
- Tokens should only be decrypted in edge functions with service role access
- Set appropriate RLS policies on `etsy_connections` table

### API Rate Limiting
- Etsy allows 10,000 requests per day per app
- Implement rate limiting tracking in edge function
- Queue requests if limit approaching
- Show clear error to user if limit exceeded

### Error Handling
- Log all API errors to edge function logs
- Never expose Etsy API errors directly to users
- Provide user-friendly error messages
- Store last error in `etsy_sync_error` for debugging

---

## UI/UX Requirements

### Settings Page - New "Etsy Integration" Tab

#### When Not Connected
- "Connect Etsy Account" button
- Explanation of what permissions are needed
- Link to Etsy Developer documentation

#### When Connected
- Display connected shop name
- Show connection status (active, token expired, error)
- "Disconnect Account" button
- Etsy account settings:
  - Default shipping profile selector
  - "Who Made" default selection
  - "When Made" default selection
  - "Is Supply" toggle

### Marketplace Library Enhancements

#### Listing Card Updates
- Show Etsy sync status badge:
  - "Not Synced" (gray)
  - "Syncing..." (blue, animated)
  - "Synced" (green) - show Etsy listing ID
  - "Sync Failed" (red) - show tooltip with error

#### Action Menu Additions
- "Push to Etsy" option (only if Etsy connected)
- "View on Etsy" link (if already synced)
- "Sync Status" info

### Etsy Listing Editor (if editing synced listing)
- Warning banner: "This listing is synced with Etsy"
- Option to "Push Changes to Etsy" after editing
- Show last sync time

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- [ ] Set up Etsy Developer account and create OAuth app
- [ ] Add secrets to Lovable Cloud (`ETSY_CLIENT_ID`, `ETSY_CLIENT_SECRET`)
- [ ] Create database schema (`etsy_connections` table)
- [ ] Update `marketplace_listings` table with Etsy fields
- [ ] Implement OAuth flow edge functions

### Phase 2: Settings UI (Week 2)
- [ ] Build "Etsy Integration" settings tab
- [ ] Implement "Connect Etsy Account" flow
- [ ] Add Etsy connection status display
- [ ] Implement disconnect functionality
- [ ] Add default settings configuration

### Phase 3: Core Sync Logic (Week 3)
- [ ] Create category taxonomy mapping
- [ ] Build `etsy-push-listing` edge function
- [ ] Implement data validation and mapping
- [ ] Handle image uploads to Etsy
- [ ] Implement token refresh logic

### Phase 4: UI Integration (Week 4)
- [ ] Add sync status badges to listing cards
- [ ] Add "Push to Etsy" action to listings
- [ ] Update listing editor with sync awareness
- [ ] Add sync status filtering in library
- [ ] Implement error display and retry logic

### Phase 5: Testing & Polish (Week 5)
- [ ] End-to-end testing with real Etsy sandbox account
- [ ] Error handling edge cases
- [ ] Rate limiting testing
- [ ] Token refresh testing
- [ ] Documentation and user guides

---

## API Endpoints Reference

### Etsy API Endpoints We'll Use

#### OAuth
- `GET https://www.etsy.com/oauth/connect` - Initial authorization
- `POST https://api.etsy.com/v3/public/oauth/token` - Token exchange & refresh

#### Listings
- `POST https://openapi.etsy.com/v3/application/shops/{shop_id}/listings` - Create listing
- `GET https://openapi.etsy.com/v3/application/shops/{shop_id}/listings/{listing_id}` - Get listing
- `PUT https://openapi.etsy.com/v3/application/shops/{shop_id}/listings/{listing_id}` - Update listing

#### Images
- `POST https://openapi.etsy.com/v3/application/shops/{shop_id}/listings/{listing_id}/images` - Upload image

#### Shop Info
- `GET https://openapi.etsy.com/v3/application/shops/{shop_id}` - Get shop details
- `GET https://openapi.etsy.com/v3/application/shops/{shop_id}/shipping-profiles` - Get shipping profiles

---

## Testing Strategy

### Development Testing
- Use Etsy's sandbox environment for testing
- Create test listings in sandbox
- Verify all field mappings
- Test error scenarios (invalid data, expired tokens, etc.)

### Test Cases
1. **OAuth Flow**
   - Successful connection
   - User denies permission
   - Invalid state parameter
   - Expired authorization code

2. **Listing Push**
   - New listing (success)
   - Missing required fields
   - Invalid category mapping
   - Image upload failures
   - Rate limit exceeded

3. **Token Management**
   - Successful token refresh
   - Refresh token expired
   - User revoked access on Etsy

4. **Error Recovery**
   - Retry after failure
   - Manual sync trigger
   - Disconnect and reconnect

---

## Success Metrics

- Users can successfully connect Etsy accounts (>95% success rate)
- Listings push to Etsy without errors (>90% success rate)
- Token refresh works seamlessly (no user intervention needed)
- Average time to push listing: <10 seconds
- Clear error messages help users resolve issues

---

## Future Enhancements (Post-MVP)

- **Bi-directional Sync**: Pull Etsy listings into Madison
- **Bulk Push**: Select multiple listings to push at once
- **Auto-sync**: Automatically push when listing is marked "ready"
- **Inventory Sync**: Keep quantity in sync between platforms
- **Analytics**: Track performance of Etsy vs other platforms
- **Multi-shop Support**: Connect multiple Etsy shops per organization

---

## Resources & Documentation

- [Etsy Open API v3 Documentation](https://developers.etsy.com/documentation/)
- [Etsy OAuth 2.0 Guide](https://developers.etsy.com/documentation/essentials/authentication)
- [Etsy Listing Fields Reference](https://developers.etsy.com/documentation/reference/#operation/createDraftListing)
- [Etsy API Rate Limits](https://developers.etsy.com/documentation/essentials/rate-limiting)

---

**Last Updated**: 2025-10-18  
**Next Review**: Before Phase 1 implementation begins
