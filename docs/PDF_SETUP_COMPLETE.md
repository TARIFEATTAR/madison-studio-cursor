# PDF Generation Setup - Complete ✅

## Configuration Status

✅ **Browserless.io API Key**: Configured in Supabase secrets
✅ **PDF Generation Function**: Implemented and ready
✅ **Storage Bucket**: Will be created automatically on first use

## What's Ready

1. **PDF Generation Endpoint**: `generate-report-pdf`
   - Location: `supabase/functions/generate-report-pdf/index.ts`
   - Uses Browserless.io for headless browser rendering
   - Uploads PDFs to Supabase Storage

2. **Report Page**: `/reports/[domain]`
   - Optimized for PDF rendering
   - Print-friendly styles
   - Page breaks configured

3. **Download Button**: "Download Latest PDF"
   - Calls PDF generation endpoint
   - Handles multiple response formats
   - Falls back to browser print if needed

## Next Steps

### 1. Deploy the Function

```bash
cd /Users/jordanrichter/Projects/Madison\ Studio/madison-app
npx supabase functions deploy generate-report-pdf --project-ref likkskifwsrvszxdvufw
```

### 2. Test PDF Generation

After deployment, test with:

```bash
curl -X POST https://likkskifwsrvszxdvufw.supabase.co/functions/v1/generate-report-pdf \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "scanId": "latest"
  }'
```

Or test from the frontend:
1. Navigate to a report page: `/reports/example.com`
2. Click "Download Latest PDF" button
3. PDF should generate and download automatically

### 3. Verify Storage Bucket

The function will automatically create a `reports` bucket on first use. Verify in:
- Supabase Dashboard → Storage → Buckets
- Should see `reports` bucket (public)

## How It Works

1. **User clicks "Download Latest PDF"**
   - Frontend calls `generate-report-pdf` function
   - Passes domain and scanId

2. **Function generates PDF**
   - Calls Browserless.io API with report URL
   - Browserless.io renders the page as PDF
   - Returns PDF buffer

3. **PDF uploaded to Storage**
   - Saves as `reports/{domain}/{timestamp}.pdf`
   - Also saves as `reports/{domain}/latest.pdf`
   - Returns public URLs

4. **User downloads PDF**
   - Frontend receives PDF URL
   - Triggers download automatically

## Troubleshooting

### PDF Generation Fails

1. **Check Browserless.io API Key**:
   ```bash
   npx supabase secrets list --project-ref likkskifwsrvszxdvufw
   ```
   Should see `BROWSERLESS_API_KEY`

2. **Check Function Logs**:
   - Supabase Dashboard → Edge Functions → generate-report-pdf → Logs
   - Look for Browserless.io errors

3. **Test Browserless.io Directly**:
   ```bash
   curl -X POST "https://chrome.browserless.io/pdf?token=2TVUy0fT9qk5RCT75e5d3f756cedcca5074246d4ba9f03620" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   ```

### Storage Upload Fails

1. Check bucket exists: `reports`
2. Check bucket is public
3. Check file size limits (default: 50MB)

### Font Loading Issues

The report page uses web fonts. Make sure:
- Fonts load from CDN (Google Fonts)
- Report page waits for fonts before PDF generation
- Browserless.io has internet access

## Cost Monitoring

Browserless.io usage:
- Free tier: 6 hours/month
- Check usage: https://www.browserless.io/dashboard

Monitor in Supabase logs for PDF generation frequency.

## Success Indicators

✅ PDF generates successfully
✅ PDF downloads automatically
✅ PDF quality is high (fonts, colors, layout)
✅ PDFs stored in Storage bucket
✅ `latest.pdf` updates on each generation

## Notes

- PDFs are stored permanently in Storage
- Each generation creates a new timestamped file
- `latest.pdf` is always the most recent
- Old PDFs can be cleaned up manually if needed

