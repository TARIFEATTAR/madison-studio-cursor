# PDF Generation Setup Guide

## Overview

The PDF generation system uses headless browsers to render the report page as PDF. Since Supabase Edge Functions run in Deno and don't have direct access to browser binaries, we use external services.

## Options

### Option 1: Browserless.io (Recommended)

**Pros:**
- Reliable, managed service
- No infrastructure to maintain
- Fast and scalable

**Setup:**
1. Sign up at [browserless.io](https://www.browserless.io/)
2. Get your API token
3. Set Supabase secret:
   ```bash
   npx supabase secrets set BROWSERLESS_API_KEY=your-api-key --project-ref your-project-ref
   ```
4. Optional: Set custom URL if using self-hosted:
   ```bash
   npx supabase secrets set BROWSERLESS_URL=https://your-browserless-instance.com --project-ref your-project-ref
   ```

**Cost:** Free tier available, paid plans start at $25/month

### Option 2: Playwright in Edge Function (May Not Work)

Playwright requires browser binaries which may not be available in Supabase Edge Functions. The code attempts this as a fallback, but it may fail.

### Option 3: Self-Hosted Browserless

Run browserless.io on your own infrastructure:
- Docker: `docker run -p 3000:3000 browserless/chrome`
- Set `BROWSERLESS_URL` to your instance

### Option 4: Puppeteer via External Service

Similar to browserless.io, but using Puppeteer:
- [Puppeteer-as-a-Service](https://pptr.dev/)
- [ScrapingBee](https://www.scrapingbee.com/)
- Custom Puppeteer service

## Current Implementation

The `generate-report-pdf` function tries methods in this order:

1. **Browserless.io** (if `BROWSERLESS_API_KEY` is set)
2. **Playwright via esm.sh** (fallback, may not work)
3. **Browser print instructions** (final fallback)

## Testing

### Test PDF Generation

```bash
curl -X POST https://your-project.supabase.co/functions/v1/generate-report-pdf \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "domain": "example.com",
    "scanId": "latest"
  }'
```

### Expected Response (Success)

```json
{
  "pdfUrl": "https://...supabase.co/storage/v1/object/public/reports/example.com/1234567890.pdf",
  "latestPdfUrl": "https://...supabase.co/storage/v1/object/public/reports/example.com/latest.pdf",
  "generatedAt": "2024-01-01T00:00:00.000Z",
  "size": 123456
}
```

### Expected Response (Fallback)

```json
{
  "message": "PDF generation service not available",
  "reportUrl": "https://mapsystem.io/reports/example.com?scanId=latest",
  "fallback": {
    "instructions": [...]
  },
  "note": "To enable automatic PDF generation, configure BROWSERLESS_API_KEY..."
}
```

## Storage Setup

The function automatically creates a `reports` bucket in Supabase Storage if it doesn't exist. PDFs are stored at:

- `reports/{domain}/{timestamp}.pdf` - Timestamped version
- `reports/{domain}/latest.pdf` - Always latest version

Make sure the bucket is public for direct PDF access.

## Troubleshooting

### PDF Generation Fails

1. **Check Browserless API Key:**
   ```bash
   npx supabase secrets list --project-ref your-project-ref
   ```

2. **Check Function Logs:**
   - Supabase Dashboard → Edge Functions → generate-report-pdf → Logs
   - Look for errors related to browserless.io or Playwright

3. **Test Browserless Connection:**
   ```bash
   curl -X POST "https://chrome.browserless.io/pdf?token=YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"url": "https://example.com"}'
   ```

### Font Loading Issues

The report page uses web fonts. Make sure:
- Fonts are loaded from CDN (Google Fonts)
- Report page waits for fonts to load before PDF generation
- Browserless service has internet access to load fonts

### Storage Upload Fails

1. Check bucket exists: `reports`
2. Check bucket is public
3. Check file size limits (default: 50MB)
4. Check RLS policies allow uploads

## Alternative: Use Report Page Print

If PDF generation services aren't available, users can:
1. Visit the report page
2. Use browser print (Cmd/Ctrl + P)
3. Select "Save as PDF"
4. Choose A4 paper size
5. Enable "Background graphics"

The report template is optimized for print with proper page breaks.

## Next Steps

1. **Set up Browserless.io** (recommended)
2. **Test PDF generation** with a real domain
3. **Monitor PDF generation** in Supabase logs
4. **Optimize report page** for PDF rendering (fonts, images, layout)

