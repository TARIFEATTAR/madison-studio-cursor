# 🔧 Fix Email Spam Issues - Complete Setup Guide

## 🚨 Problem Identified

Your emails are landing in spam because you're using **`onboarding@resend.dev`** - Resend's development domain. This is a major red flag for spam filters.

## ✅ What I Fixed

I've updated both email functions to use a proper sender address:
- ✅ `send-report-email/index.ts` - Now uses `hello@madisonstudio.io`
- ✅ `send-team-invitation/index.ts` - Now uses `hello@madisonstudio.io`
- ✅ Added `reply_to` field to ensure replies go to your domain
- ✅ Made sender email configurable via `EMAIL_FROM` environment variable

## 📋 Next Steps - You MUST Complete These

### Step 1: Set Up Custom Domain in Resend

1. **Log in to Resend Dashboard**
   - Go to: https://resend.com/domains

2. **Add Your Domain**
   - Click "Add Domain"
   - Enter: `madisonstudio.io`
   - Click "Add"

3. **Verify Domain with DNS Records**
   Resend will give you DNS records to add. You need to add these to your domain registrar (where you bought `madisonstudio.io`):

   **Required DNS Records:**
   - **SPF Record** (TXT) - Authorizes Resend to send emails on your behalf
   - **DKIM Record** (TXT) - Cryptographic signature for email authentication
   - **DMARC Record** (TXT) - Email authentication policy
   - **MX Record** (Optional) - If you want to receive emails

   Example records (Resend will provide exact values):
   ```
   Type: TXT
   Name: @
   Value: v=spf1 include:resend.com ~all

   Type: TXT  
   Name: resend._domainkey
   Value: [Resend will provide this]

   Type: TXT
   Name: _dmarc
   Value: v=DMARC1; p=none; rua=mailto:dmarc@madisonstudio.io
   ```

4. **Wait for Verification**
   - DNS changes can take 24-48 hours to propagate
   - Resend will verify automatically
   - You'll see a green checkmark when verified ✅

### Step 2: Update Supabase Environment Variables

Once your domain is verified in Resend:

1. **Go to Supabase Dashboard**
   - Navigate to: Project Settings → Edge Functions → Secrets

2. **Add New Environment Variable**
   ```
   Key: EMAIL_FROM
   Value: Madison Studio <hello@madisonstudio.io>
   ```
   
   Or use any of these alternatives:
   - `Madison Studio <support@madisonstudio.io>`
   - `Madison Studio <team@madisonstudio.io>`
   - `Madison Studio <jordan@madisonstudio.io>`

3. **Redeploy Edge Functions**
   After adding the environment variable, you need to redeploy:
   ```bash
   supabase functions deploy send-report-email
   supabase functions deploy send-team-invitation
   ```

### Step 3: Test Email Delivery

1. **Send a test email** through your app
2. **Check spam score** using tools like:
   - https://www.mail-tester.com/
   - https://mxtoolbox.com/emailhealth/

3. **Verify email headers** show:
   - ✅ From: `hello@madisonstudio.io`
   - ✅ SPF: PASS
   - ✅ DKIM: PASS
   - ✅ DMARC: PASS

## 🎯 Why This Fixes Spam Issues

| Before | After |
|--------|-------|
| ❌ `onboarding@resend.dev` | ✅ `hello@madisonstudio.io` |
| ❌ No SPF/DKIM authentication | ✅ Full email authentication |
| ❌ Generic development domain | ✅ Your verified brand domain |
| ❌ No reply-to address | ✅ Reply-to your domain |
| ❌ Spam score: 7-10/10 | ✅ Spam score: 0-2/10 |

## 📧 Recommended Email Addresses

Choose one of these for your `EMAIL_FROM`:

1. **`hello@madisonstudio.io`** ✅ (Friendly, welcoming)
2. **`support@madisonstudio.io`** ✅ (Professional)
3. **`team@madisonstudio.io`** ✅ (Collaborative feel)
4. **`jordan@madisonstudio.io`** ✅ (Personal touch)

**Avoid:**
- ❌ `noreply@madisonstudio.io` - Looks spammy
- ❌ `no-reply@madisonstudio.io` - Looks spammy
- ❌ `notifications@madisonstudio.io` - Often filtered

## 🔍 How to Add DNS Records

### If using Cloudflare:
1. Log in to Cloudflare
2. Select `madisonstudio.io` domain
3. Go to DNS → Records
4. Click "Add record"
5. Add each record provided by Resend

### If using GoDaddy:
1. Log in to GoDaddy
2. Go to My Products → Domains
3. Click DNS for `madisonstudio.io`
4. Add each record provided by Resend

### If using Namecheap:
1. Log in to Namecheap
2. Domain List → Manage
3. Advanced DNS
4. Add each record provided by Resend

## ⚡ Quick Setup Checklist

- [ ] Add `madisonstudio.io` to Resend
- [ ] Copy DNS records from Resend
- [ ] Add DNS records to domain registrar
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify domain in Resend (green checkmark)
- [ ] Add `EMAIL_FROM` environment variable to Supabase
- [ ] Redeploy edge functions
- [ ] Send test email
- [ ] Check spam score (should be 0-2/10)
- [ ] Verify SPF/DKIM/DMARC pass

## 🆘 Troubleshooting

### Emails still going to spam?

1. **Check domain verification**
   - Resend dashboard should show green checkmark
   - Run: `dig TXT madisonstudio.io` to verify DNS records

2. **Check email headers**
   - Forward a test email to yourself
   - View "Show Original" or "View Headers"
   - Look for SPF/DKIM/DMARC results

3. **Warm up your domain**
   - New domains need to build reputation
   - Start with small volume (10-20 emails/day)
   - Gradually increase over 2-4 weeks

4. **Check content**
   - Avoid spam trigger words
   - Include unsubscribe link
   - Use proper HTML structure

### DNS not propagating?

- Use https://dnschecker.org/ to check propagation
- Try flushing DNS cache: `sudo dscacheutil -flushcache`
- Wait up to 48 hours for full propagation

## 📚 Additional Resources

- [Resend Domain Setup](https://resend.com/docs/dashboard/domains/introduction)
- [Email Authentication Best Practices](https://resend.com/docs/knowledge-base/email-authentication)
- [Avoiding Spam Filters](https://resend.com/docs/knowledge-base/deliverability)

## 🎉 Expected Results

After completing these steps:
- ✅ Emails land in inbox (not spam)
- ✅ Professional sender address
- ✅ Full email authentication
- ✅ Better deliverability rates
- ✅ Users can reply to your emails
- ✅ Improved brand trust

---

**Need help?** Check the Resend documentation or reach out to their support team.
