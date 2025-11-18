# 📧 Setup Madison Domain Email for Google OAuth

## 🎯 The Goal

Change the support email from `jordan@tarifeattar.com` to a Madison domain email like:
- `support@madisonstudio.io`
- `jordan@madisonstudio.io`
- `hello@madisonstudio.io`

---

## ✅ Option 1: Use Existing Madison Domain Email (Easiest)

If you already have a Madison domain email set up:

1. **Go to Google Cloud Console → OAuth consent screen**
2. **Update "User support email"** to your Madison email
3. **Update "Developer contact information"** to your Madison email
4. **Save**

**Done!** ✅

---

## 🔧 Option 2: Set Up New Madison Domain Email

If you don't have a Madison domain email yet, here are your options:

### Option A: Google Workspace (Recommended)

**Best for:** Professional email with your domain

1. **Sign up for Google Workspace:**
   - Go to: https://workspace.google.com/
   - Choose a plan (Business Starter is fine)
   - Domain: `madisonstudio.io` (or your Madison domain)

2. **Verify domain ownership:**
   - Add DNS records to your domain
   - Google will guide you through this

3. **Create email address:**
   - Create: `support@madisonstudio.io`
   - Or: `jordan@madisonstudio.io`

4. **Update Google Cloud Console:**
   - Go to OAuth consent screen
   - Update emails to your new Madison email
   - Save

**Cost:** ~$6/month per user

---

### Option B: Use Existing Email Service

If you already have email hosting for your Madison domain:

1. **Check your domain registrar:**
   - Go to where you registered `madisonstudio.io`
   - Check if email is included

2. **Create email address:**
   - Create: `support@madisonstudio.io`
   - Or use existing: `jordan@madisonstudio.io`

3. **Update Google Cloud Console:**
   - Go to OAuth consent screen
   - Update emails to your Madison email
   - Save

**Cost:** Usually free or included with domain

---

### Option C: Use Email Forwarding (Quick & Free)

**Best for:** Quick setup without full email service

1. **Set up email forwarding:**
   - Go to your domain registrar (where you bought `madisonstudio.io`)
   - Set up email forwarding:
     - `support@madisonstudio.io` → forwards to `jordan@tarifeattar.com`
     - Or `jordan@madisonstudio.io` → forwards to `jordan@tarifeattar.com`

2. **Update Google Cloud Console:**
   - Go to OAuth consent screen
   - Update "User support email" to: `support@madisonstudio.io`
   - Update "Developer contact information" to: `support@madisonstudio.io`
   - Save

**Note:** Google may need to verify the email, so you'll need to receive emails at that address.

**Cost:** Usually free

---

## 🎯 Recommended Approach

### Quick Solution (Use Forwarding):
1. Set up email forwarding: `support@madisonstudio.io` → `jordan@tarifeattar.com`
2. Update Google Cloud Console with `support@madisonstudio.io`
3. Done in 5 minutes!

### Professional Solution (Google Workspace):
1. Sign up for Google Workspace with your Madison domain
2. Create `support@madisonstudio.io`
3. Update Google Cloud Console
4. More professional, but costs ~$6/month

---

## 📋 Step-by-Step: Email Forwarding (Quickest)

### Step 1: Set Up Forwarding

**If your domain is with:**
- **Namecheap:** Settings → Email Forwarding → Add forwarding
- **GoDaddy:** Email & Office → Email Forwarding → Create
- **Google Domains:** Email → Email forwarding → Add
- **Other:** Check your registrar's email settings

**Create:**
- Forward: `support@madisonstudio.io` → To: `jordan@tarifeattar.com`

### Step 2: Verify It Works

1. Send a test email to `support@madisonstudio.io`
2. Check that it forwards to `jordan@tarifeattar.com`
3. If it works, proceed to Step 3

### Step 3: Update Google Cloud Console

1. **Go to:** Google Cloud Console → OAuth consent screen
2. **Update "User support email":** `support@madisonstudio.io`
3. **Update "Developer contact information":** `support@madisonstudio.io`
4. **Save**

### Step 4: Verify Email (If Required)

Google may send a verification email to `support@madisonstudio.io`. Since it forwards to your main email, you'll receive it and can verify.

---

## 🆘 Troubleshooting

### "Email not verified" Error

**Fix:**
1. Make sure email forwarding is working
2. Check spam folder for verification email
3. Click verify link in the email

### "Domain not verified" Error

**Fix:**
1. Google may need to verify domain ownership
2. Add your domain to "Authorized domains" in OAuth consent screen
3. Follow Google's domain verification steps

### Email Forwarding Not Working

**Fix:**
1. Check DNS records are correct
2. Wait 24-48 hours for DNS propagation
3. Contact your domain registrar support

---

## 📝 What Email Address to Use?

**Recommended:**
- `support@madisonstudio.io` - Professional, generic
- `hello@madisonstudio.io` - Friendly, common
- `jordan@madisonstudio.io` - Personal, if you want your name

**Avoid:**
- `admin@madisonstudio.io` - Too generic
- `info@madisonstudio.io` - Often spam-filtered

---

## ✅ Quick Checklist

- [ ] Decide on email address (e.g., `support@madisonstudio.io`)
- [ ] Set up email forwarding or Google Workspace
- [ ] Verify email works (send test email)
- [ ] Update Google Cloud Console OAuth consent screen
- [ ] Verify email in Google (if required)
- [ ] Test Google sign-in to see new email

---

**Need help with a specific step?** Let me know which email service you're using and I can provide more specific instructions!

