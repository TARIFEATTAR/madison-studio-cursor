# 📧 Future Feature: HTML Email Builder & ESP Integration

> **Status:** Planned  
> **Priority:** Medium  
> **Target:** Revisit in 1-2 weeks  
> **Last Updated:** December 7, 2025

---

## Overview

Enable Madison Studio users to create beautifully formatted HTML emails directly in the editor and push them to email service providers (ESPs) like MailerLite and Mailchimp.

## Goals

1. **Preserve formatting** - Content created in the editor maintains styling when exported to email
2. **Image support** - Upload and embed images in emails
3. **ESP integration** - Push campaigns directly to MailerLite, Mailchimp, Klaviyo
4. **Template system** - Save and reuse email designs

---

## Implementation Phases

### Phase 1: HTML Export (2 days) 🔴 HIGH PRIORITY
- [ ] Add "Export as Email HTML" button to editor toolbar
- [ ] Convert editor HTML to email-safe HTML (inline styles)
- [ ] Copy to clipboard functionality
- [ ] Preview modal showing email rendering

### Phase 2: Image Handling (3 days) 🔴 HIGH PRIORITY
- [ ] Image upload in editor → Supabase Storage
- [ ] Generate public URLs for email embedding
- [ ] Image optimization for email (max width, compression)
- [ ] Drag-drop image support

### Phase 3: Email Templates (1 week) 🟠 MEDIUM
- [ ] Save emails as reusable templates
- [ ] Template thumbnail generation
- [ ] Template library UI
- [ ] Edit existing templates

### Phase 4: MailerLite Integration (1 week) 🟠 MEDIUM
- [ ] OAuth connection flow
- [ ] API key storage (encrypted)
- [ ] Create draft campaign in MailerLite
- [ ] Sync audience lists
- [ ] "Push to MailerLite" button

### Phase 5: Mailchimp Integration (1 week) 🟡 LOWER
- [ ] OAuth connection flow
- [ ] Create draft campaign in Mailchimp
- [ ] Audience/list selection
- [ ] "Push to Mailchimp" button

### Phase 6: Visual Email Builder (2-3 weeks) 🟡 FUTURE
- [ ] Drag-drop block editor
- [ ] Pre-built components (header, footer, CTA buttons)
- [ ] Column layouts
- [ ] Mobile-responsive preview
- [ ] Madison-branded template library

---

## Technical Architecture

```
Editor Content → HTML Transformer → Email-Safe HTML → ESP API
                      ↓
              Image Upload → Supabase Storage → Public URL
```

## Database Schema (To Be Created)

```sql
-- Email templates
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  subject TEXT,
  html_content TEXT,
  json_design JSONB,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ESP connections
CREATE TABLE esp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  provider TEXT NOT NULL,  -- 'mailerlite', 'mailchimp', 'klaviyo'
  api_key_encrypted TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB
);

-- Email campaigns
CREATE TABLE email_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  template_id UUID REFERENCES email_templates(id),
  esp_provider TEXT,
  esp_campaign_id TEXT,
  subject TEXT,
  sent_at TIMESTAMPTZ,
  status TEXT  -- 'draft', 'scheduled', 'sent'
);
```

## Key Code Components Needed

### 1. HTML to Email Transformer
```typescript
// src/utils/emailHtmlTransformer.ts
export function convertToEmailHTML(editorHTML: string, options: EmailOptions): string
export function inlineStyles(html: string): string
export function wrapInEmailTemplate(content: string, branding: BrandingOptions): string
```

### 2. ESP Integration Service
```typescript
// src/services/espIntegration.ts
export class MailerLiteService { ... }
export class MailchimpService { ... }
```

### 3. Supabase Edge Functions
```
supabase/functions/
├── esp-connect-mailerlite/
├── esp-connect-mailchimp/
├── esp-push-campaign/
└── esp-sync-audiences/
```

---

## ESP API References

### MailerLite
- Docs: https://developers.mailerlite.com/docs
- Campaign creation: POST /api/campaigns
- OAuth: https://developers.mailerlite.com/docs/authentication

### Mailchimp
- Docs: https://mailchimp.com/developer/marketing/api/
- Campaign creation: POST /campaigns
- OAuth: https://mailchimp.com/developer/marketing/guides/access-user-data-oauth-2/

### Klaviyo (Future)
- Docs: https://developers.klaviyo.com/en/reference/api-overview

---

## Notes

- Start with MailerLite (simpler API, good for small businesses)
- Consider MJML for responsive email generation
- Email client testing: Litmus or Email on Acid integration possible
- May want to add email analytics tracking (opens, clicks)

---

## Related Files

- Editor: `src/pages/ContentEditor.tsx`
- Editor Component: `src/components/ContentEditor.tsx`
- Existing integrations pattern: `src/components/settings/IntegrationsTab.tsx`

---

*This document will be updated when implementation begins.*
