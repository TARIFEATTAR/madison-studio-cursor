# Rebranding Checklist & Setup Verification

## ✅ Setup Verification

### 1. Environment Variables
- [x] `.env` file exists with:
  - `VITE_SUPABASE_URL=https://likkskifwsrvszxdvufw.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key`

### 2. Supabase Project
- [x] Supabase project: `likkskifwsrvszxdvufw`
- [x] All 111 database migrations applied successfully
- [x] Google Auth enabled and working
- [x] Auth redirect URLs configured:
  - Site URL: `http://localhost:8080`
  - Redirect URLs: `http://localhost:8080/*`

### 3. GitHub Repository
- [x] New GitHub repo created and connected
- [x] Code pushed to remote repository

### 4. Application
- [x] Dependencies installed (`npm install`)
- [x] Dev server runs (`npm run dev`)
- [x] App connects to new Supabase project
- [x] Google sign-in works

---

## 🎨 Rebranding Steps

### Phase 1: Core Branding (Start Here!)

#### 1.1 Update App Name & Meta Tags
**File:** `index.html`
- Change `<title>` tag (currently: "Madison- Brand Intelligence Amplified")
- Update meta description
- Update Open Graph tags (og:title, og:description)
- Update social image URLs if needed

#### 1.2 Replace Logo Assets
**Files to replace:**
- `public/logo.png` → Your new logo
- `public/logo-full.png` → Your full logo
- `public/favicon.png` → Your favicon
- `public/favicon.ico` → Your favicon (ICO format)

**Keep the same filenames** - no code changes needed!

#### 1.3 Update Color Scheme
**File:** `src/index.css`
- Update CSS variables for your brand colors:
  - `--aged-brass`, `--brass`, `--brass-glow` → Your primary colors
  - `--ink-black`, `--charcoal` → Your text colors
  - `--vellum-cream`, `--parchment-white` → Your background colors

**File:** `tailwind.config.ts`
- Update color values in the `colors` object to match your brand

---

### Phase 2: Brand Name Replacement

#### 2.1 Replace "Madison" References
**Files to update:**
- Search for "Madison" across the codebase
- Replace with your new brand name
- Common locations:
  - `src/pages/HelpCenter.tsx`
  - `src/components/onboarding/OnboardingSuccess.tsx`
  - `src/utils/exportHelpers.ts` (PDF footer text)
  - `src/utils/worksheetGenerator.ts`

#### 2.2 Replace "Image Studio" References
**Files to update:**
- `src/pages/ImageEditor.tsx` (header text)
- `src/components/prompt-library/PromptDetailModal.tsx`
- `src/components/layout/BottomNavigation.tsx`

#### 2.3 Update Export Filenames
**File:** `src/utils/exportHelpers.ts`
- Line 26: Change `madison-` prefix to your brand prefix
- Line 168: Update "Created with MADISON" footer text

**File:** `src/utils/worksheetGenerator.ts`
- Line 219: Update domain reference (currently: `madisonstudio.io`)

---

### Phase 3: Domain & URLs

#### 3.1 Update Domain References
**Search for:**
- `madisonstudio.io` → Your new domain
- Any hardcoded URLs that reference the old project

#### 3.2 Update Social Sharing
**File:** `index.html`
- Update `og:image` and `twitter:image` URLs
- Update any other social media meta tags

---

### Phase 4: Configuration Files

#### 4.1 Package.json
**File:** `package.json`
- Update `"name"` field (currently: `"vite_react_shadcn_ts"`)
- Update `"description"` if present

#### 4.2 README
**File:** `README.md`
- Update project name and description
- Update any references to old brand

---

### Phase 5: Test Everything

#### 5.1 Local Testing
1. Start dev server: `npm run dev`
2. Test sign-in flow
3. Navigate through all main pages
4. Check that all features work
5. Verify new branding appears everywhere

#### 5.2 Production Deployment
1. Set up hosting (Vercel/Netlify/etc.)
2. Add environment variables to hosting platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Update Supabase Auth URLs:
   - Add your production domain
   - Add production redirect URLs

---

## 🚀 Quick Start Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 📝 Files to Create/Update Summary

### Must Update:
1. `index.html` - Title, meta tags, social images
2. `public/logo*.png` - Logo files
3. `public/favicon.*` - Favicon files
4. `src/index.css` - Brand colors
5. `tailwind.config.ts` - Tailwind color values
6. `src/utils/exportHelpers.ts` - Export filename prefix
7. `package.json` - Project name

### Search & Replace:
- "Madison" → Your brand name
- "Image Studio" → Your feature name
- "madisonstudio.io" → Your domain
- `madison-` prefix → Your prefix

---

## ✅ Verification Checklist

After rebranding, verify:
- [ ] App title shows new name in browser tab
- [ ] Favicon shows new logo
- [ ] Sign-in page shows new branding
- [ ] Dashboard shows new name/logo
- [ ] All exported files use new prefix
- [ ] Colors match your brand
- [ ] No "Madison" references visible to users
- [ ] Google sign-in still works
- [ ] All features function correctly

---

## 🆘 Common Issues

### Issue: Colors not updating
**Solution:** Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

### Issue: Logo not showing
**Solution:** 
- Check file paths are correct
- Check filenames match exactly
- Clear browser cache

### Issue: Environment variables not loading
**Solution:**
- Verify `.env.local` exists in project root
- Restart dev server after changes
- Check variable names start with `VITE_`

---

## 📚 Next Steps After Rebranding

1. **Test thoroughly** - Go through all user flows
2. **Deploy to staging** - Test on a staging environment first
3. **Update documentation** - Update any docs with new brand
4. **Deploy to production** - When ready
5. **Monitor** - Watch for any issues after deployment

---

## 💡 Tips

- **Work incrementally** - Update one thing at a time, test, then move on
- **Use version control** - Commit changes frequently
- **Keep backups** - Save your old brand assets just in case
- **Test in incognito** - Clear cache issues when testing
- **Check mobile** - Verify branding works on mobile devices too

---

Good luck with your rebrand! 🎉

