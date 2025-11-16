# How to Upload Functions to Supabase Dashboard - Step by Step

## 🎯 Your Project
**Project ID:** `likkskifwsrvszxdvufw`  
**Functions Page:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions

---

## 📍 Step-by-Step Upload Instructions

### Step 1: Navigate to Functions Page
1. **Go to:** https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
2. You should see a list of functions (or an empty list if none deployed yet)
3. Look for a button that says:
   - **"Deploy Function"** (green/blue button, usually top right)
   - **"New Function"**
   - **"Deploy a new function"**
   - Or a **"+"** icon

### Step 2: Click Deploy Function Button
- Click the deploy button mentioned above
- A modal/popup or new page will appear

### Step 3: Choose Upload Method
You'll typically see options like:
- **"Upload folder"** or **"Upload from folder"**
- **"Deploy from folder"**
- **"Import from file system"**
- Or a **folder icon** 📁

**Click on the folder/upload option** (not "Write code" or "Edit code")

### Step 4: Navigate to Your Function Folder
1. A file browser window will open
2. Navigate to your project folder:
   ```
   /Users/jordanrichter/Documents/Asala Projects/Asala Studio/asala-studio/supabase/functions/
   ```
3. **Find the function folder** you want to deploy:
   - For `create-portal-session`: Look for `create-portal-session` folder
   - For `create-checkout-session`: Look for `create-checkout-session` folder
   - For `get-subscription`: Look for `get-subscription` folder

### Step 5: Select the ENTIRE Folder
- **Important:** Select the **entire folder** (e.g., `create-portal-session`)
- **NOT** just the `index.ts` file inside it
- The folder should contain `index.ts` and potentially other files

### Step 6: Confirm and Deploy
1. After selecting the folder, you should see:
   - The folder name displayed
   - Or a confirmation message
2. **Enter the function name** (if prompted):
   - Should match the folder name: `create-portal-session`
3. Click **"Deploy"** or **"Upload"** button
4. Wait 30-60 seconds for deployment

### Step 7: Verify Deployment
- You should see a success message
- The function should appear in your functions list
- Status should show "Active" or "Deployed"

---

## 🖼️ What You Might See (Visual Guide)

### Option A: Drag & Drop Interface
Some Supabase dashboards have drag-and-drop:
1. **Open Finder** (Mac) or **File Explorer** (Windows)
2. Navigate to: `asala-studio/supabase/functions/create-portal-session`
3. **Drag the entire folder** onto the upload area in Supabase dashboard
4. Drop it and click "Deploy"

### Option B: File Browser Upload
1. Click "Upload folder" or folder icon
2. File browser opens
3. Navigate to: `asala-studio/supabase/functions/create-portal-session`
4. **Select the folder** (click once to highlight it)
5. Click "Open" or "Select"
6. Click "Deploy"

### Option C: Code Editor (Alternative)
If upload doesn't work, you can paste code:
1. Click "Edit code" or "Write code"
2. Function name: `create-portal-session`
3. Copy the code from `supabase/functions/create-portal-session/index.ts`
4. Paste it into the editor
5. Click "Deploy"

---

## 📁 Folder Structure You're Looking For

Your function folders should look like this:
```
asala-studio/
  └── supabase/
      └── functions/
          ├── create-portal-session/
          │   └── index.ts          ← This file contains the code
          ├── create-checkout-session/
          │   └── index.ts
          └── get-subscription/
              └── index.ts
```

**You need to upload the entire folder** (e.g., `create-portal-session`), not just the `index.ts` file.

---

## 🔍 Troubleshooting

### "I can't find the upload folder button"
- Look for: "Deploy Function", "New Function", "+" icon, or "Import"
- Check if you're on the correct page (Functions, not Settings)

### "It's asking for a file, not a folder"
- Some interfaces require selecting the folder, then clicking "Open"
- Make sure you're selecting the **folder**, not the file inside it
- Try right-clicking the folder → "Open" or "Select"

### "I can only upload a ZIP file"
- Some Supabase versions require a ZIP:
  1. Right-click the `create-portal-session` folder
  2. Select "Compress" (Mac) or "Send to → Compressed folder" (Windows)
  3. Upload the ZIP file
  4. Supabase will extract it automatically

### "The function name doesn't match"
- Make sure the function name you enter matches the folder name exactly
- For `create-portal-session` folder → function name should be `create-portal-session`

---

## ✅ Quick Checklist

Before uploading:
- [ ] I'm on the Functions page: https://supabase.com/dashboard/project/likkskifwsrvszxdvufw/functions
- [ ] I know which function I'm deploying (e.g., `create-portal-session`)
- [ ] I know where the folder is: `asala-studio/supabase/functions/create-portal-session`
- [ ] I'm selecting the **entire folder**, not just the `index.ts` file

After uploading:
- [ ] Function appears in the functions list
- [ ] Status shows "Active" or "Deployed"
- [ ] No error messages

---

## 🆘 Still Having Trouble?

If you're still stuck, try this alternative:

1. **Open the function code file:**
   - `asala-studio/supabase/functions/create-portal-session/index.ts`
   - Copy ALL the code (Cmd+A, Cmd+C)

2. **In Supabase Dashboard:**
   - Click "Deploy Function"
   - Click "Edit code" or "Write code"
   - Function name: `create-portal-session`
   - Paste the code
   - Click "Deploy"

This method works if folder upload isn't available in your Supabase version.






