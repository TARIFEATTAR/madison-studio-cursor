# Madison Training Documentation Status

## ✅ What's Already Set Up

### Database Structure (EXISTS)
The Supabase database has the infrastructure ready:

1. **`madison_system_config` table** - Stores Madison's core training:
   - `persona` - Her character and backstory
   - `editorial_philosophy` - Core beliefs about copywriting
   - `writing_influences` - The legendary copywriters that shape her approach
   - `forbidden_phrases` - Words/phrases she should never use
   - `quality_standards` - What makes content excellent
   - `voice_spectrum` - Range of voices she can adopt

2. **`madison_training_documents` table** - Stores uploaded PDF training documents:
   - Can upload PDF documents with extensive copywriting guidelines
   - Documents are processed and their content extracted
   - Used to train Madison's knowledge base

### UI Component (EXISTS)
- **Settings → Madison Training Tab** (Super Admin only)
- Allows editing all training fields
- Supports uploading PDF training documents
- Located at: `src/components/settings/MadisonTrainingTab.tsx`

### Code Integration (EXISTS)
The training data is actively used in:
- `repurpose-content` edge function
- `generate-with-claude` edge function
- `marketplace-assistant` edge function
- `think-mode-chat` edge function

All functions fetch `madison_system_config` and inject it into AI prompts.

---

## ❓ Current Status: NEEDS VERIFICATION

**You need to check if the data has been populated:**

### Option 1: Check via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/editor
2. Navigate to **Table Editor** → `madison_system_config`
3. Check if there's a row with data in:
   - `writing_influences` (should contain info about 8 legendary copywriters)
   - `editorial_philosophy` (should have extensive writing guidelines)
   - Other fields

### Option 2: Check via Your App
1. Log in as a Super Admin
2. Go to **Settings** → **Madison Training** tab
3. Check if the text fields are populated with:
   - Writing influences (8 copywriters)
   - Editorial philosophy
   - Forbidden phrases
   - Quality standards
   - Voice spectrum

### Option 3: Check Training Documents
1. In the **Madison Training** tab, scroll to "Training Documents" section
2. See if any PDF documents have been uploaded
3. Check their processing status

---

## 📝 If Data is Missing: How to Add It

### Step 1: Access Madison Training Tab
1. Ensure you're logged in as a **Super Admin**
2. Navigate to: **Settings** → **Madison Training** tab
3. If you see a lock icon, you need super admin access

### Step 2: Add Writing Influences (8 Legendary Copywriters)
In the **"Writing Influences & Style Masters"** field, add your documentation about:
- The 8 legendary copywriters
- Their techniques and philosophies
- How Madison should emulate each one
- When to use each style

**Example format:**
```
J. Peterman: Narrative storytelling, sensory details, adventure-driven copy...
David Ogilvy: Research-driven headlines, facts over hype, sophisticated persuasion...
Gary Halbert: Emotional urgency, direct response, benefit-focused...
[Continue for all 8 copywriters]
```

### Step 3: Add Editorial Philosophy
In the **"Editorial Philosophy"** field, add:
- Do's and don'ts
- Writing style guidelines
- Tone requirements
- Structure preferences

### Step 4: Add Other Fields
- **Forbidden Phrases**: Words/phrases to never use
- **Quality Standards**: Benchmarks for excellent content
- **Voice Spectrum**: Different voice modes and when to use them

### Step 5: Upload Training Documents (Optional)
If you have PDF documents with extensive guidelines:
1. Click **"Upload PDF"** button
2. Select your training document
3. Wait for processing (may take up to a minute)
4. Document content will be extracted and used in training

### Step 6: Save
Click **"Save Madison's System Training"** button

---

## 🔍 How to Verify It's Working

After adding the data, test by:

1. **Generate content** using Madison (e.g., in the Forge or Multiply)
2. **Check the output** - it should reflect:
   - The writing style of the legendary copywriters
   - The editorial philosophy you defined
   - Avoidance of forbidden phrases
   - Quality standards you set

3. **Check function logs** (optional):
   - Go to Supabase Dashboard → Edge Functions
   - View logs for `generate-with-claude` or `repurpose-content`
   - You should see Madison's training being injected into prompts

---

## 📋 Summary

| Component | Status | Action Needed |
|-----------|--------|---------------|
| Database Tables | ✅ EXISTS | None |
| UI Component | ✅ EXISTS | None |
| Code Integration | ✅ EXISTS | None |
| **Training Data** | ❓ **UNKNOWN** | **CHECK & POPULATE** |
| Training Documents | ❓ **UNKNOWN** | **CHECK & UPLOAD** |

---

## 🎯 Next Steps

1. **Check if data exists** (use one of the 3 methods above)
2. **If missing**: Add the 8 legendary copywriters documentation via the UI
3. **If exists but incomplete**: Update with full documentation
4. **Upload PDF documents** if you have extensive training materials
5. **Test** by generating content to verify Madison uses the training

---

## 📍 Where to Find the UI

**Path in App:**
- Settings → Madison Training Tab
- **Note:** Only visible to Super Admins

**File Location:**
- `src/components/settings/MadisonTrainingTab.tsx`

**Database Tables:**
- `madison_system_config` - Core training data
- `madison_training_documents` - Uploaded PDF documents




