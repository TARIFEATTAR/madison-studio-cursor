# Email Flow Diagram

## Before Fix (Emails Going to Spam)

```
┌─────────────────┐
│  Your App       │
│  (Madison)      │
└────────┬────────┘
         │
         │ Sends email via Resend API
         ▼
┌─────────────────────────────────────┐
│  Resend API                         │
│  From: onboarding@resend.dev ❌     │
│  - No SPF/DKIM for your domain      │
│  - Using development domain         │
└────────┬────────────────────────────┘
         │
         │ Delivers email
         ▼
┌─────────────────────────────────────┐
│  Gmail/Outlook Spam Filter          │
│  ⚠️  Checks:                         │
│  ❌ Domain mismatch                  │
│  ❌ No authentication                │
│  ❌ Generic sender                   │
│  ❌ Development domain               │
└────────┬────────────────────────────┘
         │
         │ SPAM SCORE: 8/10
         ▼
┌─────────────────┐
│  📁 SPAM FOLDER │  ❌
└─────────────────┘
```

## After Fix (Emails Going to Inbox)

```
┌─────────────────┐
│  Your App       │
│  (Madison)      │
└────────┬────────┘
         │
         │ Sends email via Resend API
         ▼
┌──────────────────────────────────────────┐
│  Resend API                              │
│  From: hello@madisonstudio.io ✅         │
│  - SPF authenticated                     │
│  - DKIM signed                           │
│  - DMARC compliant                       │
│  - Verified custom domain                │
└────────┬─────────────────────────────────┘
         │
         │ Delivers email with authentication
         ▼
┌──────────────────────────────────────────┐
│  Gmail/Outlook Spam Filter               │
│  ✅ Checks:                               │
│  ✅ Domain verified (madisonstudio.io)   │
│  ✅ SPF: PASS                             │
│  ✅ DKIM: PASS                            │
│  ✅ DMARC: PASS                           │
│  ✅ Professional sender                   │
└────────┬─────────────────────────────────┘
         │
         │ SPAM SCORE: 1/10
         ▼
┌─────────────────┐
│  📬 INBOX       │  ✅
└─────────────────┘
```

## DNS Records Setup

```
Your Domain Registrar (GoDaddy/Cloudflare/etc.)
├── madisonstudio.io
    │
    ├── TXT Record (SPF)
    │   Name: @
    │   Value: v=spf1 include:resend.com ~all
    │   Purpose: Authorizes Resend to send on your behalf
    │
    ├── TXT Record (DKIM)
    │   Name: resend._domainkey
    │   Value: [Provided by Resend]
    │   Purpose: Cryptographic signature for authentication
    │
    └── TXT Record (DMARC)
        Name: _dmarc
        Value: v=DMARC1; p=none; rua=mailto:dmarc@madisonstudio.io
        Purpose: Email authentication policy
```

## Environment Variables Flow

```
Supabase Dashboard
└── Edge Functions
    └── Secrets
        └── EMAIL_FROM = "Madison Studio <hello@madisonstudio.io>"
                │
                │ Used by
                ▼
        ┌───────────────────────────────┐
        │  send-report-email function   │
        │  send-team-invitation function│
        └───────────────────────────────┘
                │
                │ Sends emails as
                ▼
        "Madison Studio <hello@madisonstudio.io>"
```

## Setup Timeline

```
Day 1
├── ✅ Update code (DONE)
├── ⏳ Add domain to Resend
├── ⏳ Copy DNS records
└── ⏳ Add DNS records to registrar

Day 1-2
├── ⏳ Wait for DNS propagation
└── ⏳ Resend verifies domain

Day 2
├── ✅ Domain verified in Resend
├── ✅ Add EMAIL_FROM to Supabase
├── ✅ Deploy functions
└── ✅ Test email delivery

Day 2+
└── ✅ Emails land in inbox! 🎉
```

## Quick Reference

### Current Status
- ✅ Code updated
- ⏳ Domain setup pending
- ⏳ DNS records pending
- ⏳ Deployment pending

### What You Need
1. Resend account
2. Access to domain registrar (where you bought madisonstudio.io)
3. Supabase dashboard access
4. Supabase CLI (already installed ✅)

### Commands
```bash
# Deploy functions (after domain setup)
./deploy-email-functions.sh

# Or manually:
supabase functions deploy send-report-email
supabase functions deploy send-team-invitation
```

### Testing
```bash
# Send test email through your app
# Then check headers show:
# - From: hello@madisonstudio.io
# - SPF: PASS
# - DKIM: PASS
# - DMARC: PASS
```
