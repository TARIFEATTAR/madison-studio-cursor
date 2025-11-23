# Adding J. Peterman Documents - Complete Guide

## 🎯 Two Ways to Add Peterman Documents Globally

### Option 1: Upload as Training Documents (Recommended for Large/Detailed Docs)
**Best for:** Comprehensive guides, detailed examples, extensive documentation

**How it works:**
- Documents are uploaded via UI → Stored in database → Automatically included in all prompts
- **Global availability:** ✅ Yes, used by all edge functions
- **Easy to update:** Just upload new version
- **No code deployment needed**

### Option 2: Embed in Codebase (Best for Core Profiles)
**Best for:** Essential author profiles, quick reference guides

**How it works:**
- Documents are embedded in `authorProfiles.ts` → Included in code → Deployed with functions
- **Global availability:** ✅ Yes, used by all edge functions
- **Version control:** ✅ Tracked in Git
- **Requires deployment:** Need to redeploy edge functions

---

## 📋 Step-by-Step: Upload Training Documents

### Step 1: Prepare Your Documents

1. **Format:** Use `.txt` or `.md` files (recommended for 100% accuracy)
2. **Naming:** Use descriptive names like:
   - `peterman-narrative-techniques.md`
   - `peterman-adventure-romance-guide.md`
   - `peterman-product-storytelling.md`
3. **Content:** Structure with clear sections:
   ```markdown
   # J. Peterman - [Topic]
   
   ## Core Principles
   ...
   
   ## Techniques
   ...
   
   ## Examples
   ...
   ```

### Step 2: Upload via UI

1. **Navigate to:** Settings → Madison Training tab
2. **Scroll to:** "Training Documents" section
3. **Click:** "Upload Document" button
4. **Select:** Your Peterman document file
5. **Wait:** Processing takes 10-30 seconds
6. **Verify:** Status should show "Completed" with green checkmark

### Step 3: Verify It's Working

Use the verification script below to check if documents are being ingested.

---

## 🔍 Verification System

I'll create a verification script to check:
- ✅ Documents are uploaded
- ✅ Documents are processed
- ✅ Documents are being included in prompts
- ✅ Content is accessible to Madison

---

## 📝 Current Peterman Integration

### Already Integrated:
1. **Condensed Profile** (`prompts/authors/peterman.md`)
   - Quick reference guide
   - Embedded in `authorProfiles.ts`
   - ✅ Globally available

2. **Complete Profile** (`prompts/authors/peterman_complete.md`)
   - Comprehensive 1,656-line guide
   - Can be uploaded as training document
   - ✅ Available for upload

### What to Add:
- Additional Peterman techniques
- More examples of adventure/romance attachment
- Modern applications of Peterman style
- Product-specific Peterman approaches

---

## 🚀 Quick Start Checklist

- [ ] Prepare your Peterman document(s) as `.md` or `.txt` files
- [ ] Go to Settings → Madison Training
- [ ] Upload document(s)
- [ ] Wait for processing (10-30 seconds)
- [ ] Verify status shows "Completed"
- [ ] Run verification script (below) to confirm ingestion
- [ ] Test by generating content with Peterman style

---

## ⚠️ Important Notes

1. **Document Limit:** System loads 3 most recent training documents (can be increased if needed)
2. **Content Length:** Each document truncated to 3,000 chars in prompts (for performance)
3. **Processing Time:** Text files process instantly, PDFs take longer
4. **Global Access:** Once processed, documents are available to ALL edge functions automatically

---

## 🔧 Troubleshooting

**Document not showing in prompts?**
- Check processing status (should be "completed")
- Verify document is in top 3 most recent
- Check edge function logs for errors

**Content not being used?**
- Verify document has substantial content (>100 chars)
- Check that document name includes "peterman" (for easy identification)
- Ensure document is marked as "completed" status

**Want to prioritize Peterman documents?**
- Upload them most recently (system uses 3 most recent)
- Or we can modify the query to prioritize by name/filter

---

## 📊 Verification Script

Run this to verify Peterman documents are properly ingested:

```sql
-- Check Peterman training documents
SELECT 
    id,
    file_name,
    processing_status,
    LENGTH(extracted_content) as content_length,
    created_at,
    CASE 
        WHEN processing_status = 'completed' 
             AND LENGTH(extracted_content) > 100
        THEN '✅ Ready'
        ELSE '⚠️ Not Ready'
    END as status
FROM madison_training_documents
WHERE LOWER(file_name) LIKE '%peterman%'
ORDER BY created_at DESC;
```

---

**Next Steps:** Upload your Peterman documents and I'll help verify they're being ingested properly!

