# Madison Studio — Remediation Plan

**Goal:** Get `main` to a clean, production-ready baseline before branching for new features.
**Approach:** Five sequential workstreams — Security → Maintainability → Performance → Reliability → DevEx — each leaving `main` in a better state before the next begins.

---

## How To Execute This Plan

Each workstream is a branch off `main`. After completing a workstream, merge to `main` before starting the next. This ensures every branch starts from the cleanest possible base.

```
main ──┬── security/remediation ──► merge to main
       ├── maintainability/cleanup ──► merge to main
       ├── performance/bundle-optimization ──► merge to main
       ├── reliability/testing-infra ──► merge to main
       └── devex/tooling-ci ──► merge to main
```

---

## Workstream 1: SECURITY (D+ → B+)

**Branch:** `security/remediation`
**Estimated effort:** 1-2 days
**Why first:** Active vulnerabilities in production. Everything else is secondary.

### 1.1 Fix Etsy Token Encryption (Critical)

**Files:**
- `supabase/functions/etsy-oauth-callback/index.ts` (lines 130-133)
- `supabase/functions/etsy-push-listing/index.ts` (lines 16-22, 65-66)

**What to do:**
Copy the proven AES-GCM pattern from `supabase/functions/connect-shopify/index.ts` (lines 10-34). Create a shared encryption module so all integrations use the same code.

1. Create `supabase/functions/_shared/encryption.ts`:
```typescript
// Reusable AES-GCM encryption for all integration tokens
export function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export function base64ToBytes(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function encryptToken(
  plaintext: string,
  keyB64: string
): Promise<{ ciphertextB64: string; ivB64: string }> {
  const keyBytes = base64ToBytes(keyB64);
  const keyCopy = new Uint8Array(keyBytes.length);
  keyCopy.set(keyBytes);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyCopy.buffer, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, encoded);
  return { ciphertextB64: bytesToBase64(new Uint8Array(ciphertext)), ivB64: bytesToBase64(iv) };
}

export async function decryptToken(
  ciphertextB64: string,
  ivB64: string,
  keyB64: string
): Promise<string> {
  const keyBytes = base64ToBytes(keyB64);
  const keyCopy = new Uint8Array(keyBytes.length);
  keyCopy.set(keyBytes);
  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyCopy.buffer, { name: 'AES-GCM' }, false, ['decrypt']
  );
  const iv = base64ToBytes(ivB64);
  const ciphertext = base64ToBytes(ciphertextB64);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(decrypted);
}
```

2. In `etsy-oauth-callback/index.ts`, replace lines 130-133:
```typescript
// BEFORE (base64 — NOT encryption):
const encryptedAccessToken = `enc:${btoa(access_token)}`;
const encryptedRefreshToken = `enc:${btoa(refresh_token)}`;

// AFTER (AES-GCM):
import { encryptToken } from "../_shared/encryption.ts";
const ETSY_ENC_KEY = Deno.env.get('ETSY_TOKEN_ENCRYPTION_KEY');
if (!ETSY_ENC_KEY) throw new Error('Etsy token encryption key not configured');
const { ciphertextB64: encAccess, ivB64: ivAccess } = await encryptToken(access_token, ETSY_ENC_KEY);
const { ciphertextB64: encRefresh, ivB64: ivRefresh } = await encryptToken(refresh_token, ETSY_ENC_KEY);
```
   Update the DB write to store `iv` columns alongside the ciphertext.

3. In `etsy-push-listing/index.ts`, replace the `decryptToken` function (lines 16-22) with the shared `decryptToken` import.

4. **Database migration:** Add `access_token_iv` and `refresh_token_iv` columns to `etsy_connections` table. Write a one-time migration to re-encrypt existing base64 tokens.

5. **Env var:** Add `ETSY_TOKEN_ENCRYPTION_KEY` (generate with `openssl rand -base64 32`) to Supabase project secrets.

**Definition of Done:** Etsy tokens encrypted with AES-GCM in DB. Old base64 tokens migrated. `decryptToken` uses `crypto.subtle`.

### 1.2 Fix Klaviyo API Key Encryption (Critical)

**File:** `supabase/functions/connect-klaviyo/index.ts` (lines 9-15)

**What to do:**
Replace the XOR cipher with the same `_shared/encryption.ts` module.

```typescript
// BEFORE (XOR — cryptographically broken):
function encryptApiKey(apiKey: string, encryptionKey: string): string {
  const encrypted = Array.from(apiKey).map((char, i) =>
    String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(i % encryptionKey.length))
  ).join('');
  return btoa(encrypted);
}

// AFTER:
import { encryptToken } from "../_shared/encryption.ts";
// ...then in the handler:
const ENC_KEY = Deno.env.get('KLAVIYO_TOKEN_ENCRYPTION_KEY');
const { ciphertextB64, ivB64 } = await encryptToken(api_key, ENC_KEY);
```

**Database migration:** Add `api_key_iv` column to `klaviyo_connections`. Re-encrypt existing keys.

**Definition of Done:** Klaviyo keys encrypted with AES-GCM. Old XOR-encrypted keys re-encrypted.

### 1.3 Fix Wildcard CORS on All 70 Edge Functions (Critical)

**What to do:**
Create a shared CORS module and update all 70 functions.

1. Create `supabase/functions/_shared/cors.ts`:
```typescript
const ALLOWED_ORIGINS = [
  'https://app.madisonstudio.io',
  'https://app.madisonstudio.ai',
  'https://madisonstudio.ai',
  // Local development
  ...(Deno.env.get('ENVIRONMENT') === 'development'
    ? ['http://localhost:8080', 'http://localhost:5173', 'http://localhost:3000']
    : []),
];

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin') || '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

export function handleCorsOptions(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  return null;
}
```

2. In each edge function, replace the hardcoded pattern:
```typescript
// BEFORE (in every function):
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AFTER:
import { getCorsHeaders, handleCorsOptions } from "../_shared/cors.ts";
// ...in the handler:
const corsHeaders = getCorsHeaders(req);
const optionsResponse = handleCorsOptions(req);
if (optionsResponse) return optionsResponse;
```

**Exception:** `stripe-webhook` — this function validates via Stripe signature (not JWT), and Stripe sends webhooks server-to-server with no `Origin` header. Keep its CORS as-is or make it permissive since it validates the Stripe signature.

**Approach:** This is a mechanical find-and-replace across 70 files. Do it systematically — 10-15 functions at a time, test each batch.

**Definition of Done:** `grep -r "Allow-Origin.*\*" supabase/functions/*/index.ts` returns 0 results (except `stripe-webhook`).

### 1.4 Remove `--no-verify-jwt` from CI (High)

**File:** `.github/workflows/deploy.yml` (line 44)

```yaml
# BEFORE:
npx supabase functions deploy "$func" \
  --project-ref "$SUPABASE_PROJECT_ID" \
  --no-verify-jwt || echo "Warning: Failed to deploy $func"

# AFTER — default JWT verification for all functions:
npx supabase functions deploy "$func" \
  --project-ref "$SUPABASE_PROJECT_ID" || echo "Warning: Failed to deploy $func"
```

**Exception handling:** `stripe-webhook` genuinely needs `--no-verify-jwt` because Stripe sends webhooks without a JWT. Handle this with a whitelist:

```yaml
# Functions that legitimately need public (no-JWT) access
NO_JWT_FUNCTIONS="stripe-webhook"

for func in $FUNCTIONS; do
  if [ -f "supabase/functions/$func/index.ts" ]; then
    if echo "$NO_JWT_FUNCTIONS" | grep -qw "$func"; then
      echo "Deploying (public): $func"
      npx supabase functions deploy "$func" \
        --project-ref "$SUPABASE_PROJECT_ID" \
        --no-verify-jwt || echo "Warning: Failed to deploy $func"
    else
      echo "Deploying (JWT-protected): $func"
      npx supabase functions deploy "$func" \
        --project-ref "$SUPABASE_PROJECT_ID" || echo "Warning: Failed to deploy $func"
    fi
  fi
done
```

**Definition of Done:** Only `stripe-webhook` deployed with `--no-verify-jwt`. All other 69 functions require JWT.

### 1.5 Move Hardcoded Project ID to GitHub Secret (Medium)

**Files:**
- `.github/workflows/deploy.yml` (line 31)
- `.github/workflows/deploy-optimized.yml` (line 73)

```yaml
# BEFORE:
SUPABASE_PROJECT_ID: likkskifwsrvszxdvufw

# AFTER:
SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

**Manual step:** Add `SUPABASE_PROJECT_ID` to GitHub repo Settings → Secrets → Actions.

**Definition of Done:** No hardcoded project IDs in any workflow file. CI still deploys successfully.

### 1.6 Fix Critical npm Vulnerabilities (High)

**Commands (run in order, test after each):**

```bash
# Step 1: Non-breaking fixes (should fix ~11 issues)
npm audit fix

# Step 2: Update react-router-dom (fixes XSS — GHSA-2w69-qvjg-hvjx)
npm i react-router-dom@latest

# Step 3: Update jspdf (fixes 8 critical CVEs)
npm i jspdf@latest jspdf-autotable@latest

# Step 4: Update fabric.js (fixes stored XSS via SVG)
npm i fabric@latest
```

**After each step:** Run `npm run build` to verify nothing broke. fabric v7 has breaking API changes — check `src/pages/ImageEditor.tsx` and any canvas-related components.

**Definition of Done:** `npm audit` shows 0 critical, 0 high vulnerabilities. Build passes.

### 1.7 Add Rate Limiting to Sensitive Endpoints (Medium)

Create `supabase/functions/_shared/rateLimit.ts`:

```typescript
// Simple in-memory rate limiter (resets on cold start, which is fine for edge functions)
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowSeconds: number
): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true };
  }

  if (bucket.count >= maxRequests) {
    return { allowed: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }

  bucket.count++;
  return { allowed: true };
}
```

Apply to these functions:
| Function | Limit | Key |
|----------|-------|-----|
| `generate-with-claude` | 10 req/min | `user_id` |
| `create-checkout-session` | 5 req/min | `user_id` |
| `send-welcome-email` | 3 req/min | `user_id` |
| `send-report-email` | 3 req/min | `user_id` |
| All OAuth endpoints | 5 req/min | `user_id` |

**Definition of Done:** Rate-limited endpoints return `429 Too Many Requests` when limit exceeded.

### Security Workstream Checklist

- [ ] `_shared/encryption.ts` created with AES-GCM encrypt/decrypt
- [ ] Etsy tokens migrated to AES-GCM
- [ ] Klaviyo API keys migrated to AES-GCM
- [ ] `_shared/cors.ts` created with origin allowlist
- [ ] All 70 edge functions updated to use shared CORS (except `stripe-webhook`)
- [ ] `--no-verify-jwt` removed from deploy.yml (except `stripe-webhook`)
- [ ] Supabase project ID moved to GitHub Secret
- [ ] `npm audit` shows 0 critical, 0 high
- [ ] `_shared/rateLimit.ts` created and applied to sensitive endpoints
- [ ] Env vars added: `ETSY_TOKEN_ENCRYPTION_KEY`, `KLAVIYO_TOKEN_ENCRYPTION_KEY`
- [ ] DB migration: `etsy_connections` gains `access_token_iv`, `refresh_token_iv`
- [ ] DB migration: `klaviyo_connections` gains `api_key_iv`
- [ ] Build passes, edge functions deploy successfully

**Expected grade after:** D+ → **B+**

---

## Workstream 2: MAINTAINABILITY (C → B+)

**Branch:** `maintainability/cleanup`
**Estimated effort:** 3-5 days
**Why second:** A cleaner codebase makes every subsequent fix easier and faster.

### 2.1 Clean Up 78 Loose Root Files (Medium)

The repo root currently has 78 `.md`, `.sql`, and `.sh` files that don't belong there. This creates confusion and makes the project look unprofessional.

```bash
# Create proper directory structure
mkdir -p docs/internal docs/setup docs/troubleshooting
mkdir -p scripts/sql/fixes scripts/sql/diagnostics scripts/deploy

# Move documentation
mv ASALA_DEBUG_GUIDE.md BEST_BOTTLES_*.md BRAND_*.md docs/internal/
mv *_SETUP*.md *_GUIDE*.md COMPLETE_*.md docs/setup/
mv TROUBLESHOOT_*.md *_DEBUG*.md *_FIX*.md docs/troubleshooting/
mv *_SUMMARY*.md *_STATUS*.md *IMPLEMENTATION*.md docs/internal/
mv DASHBOARD_REDESIGN_SPEC.md USER_JOURNEY_MAP.md docs/internal/
mv TOOLTIP_*.md CONTEXTUAL_TOOLTIPS_SUMMARY.md docs/internal/
mv ONBOARDING_*.md docs/setup/
mv *EXPORT*.md *DEPLOY*.md docs/setup/
mv API_LIMITS_EXPLAINED.md WHAT_TO_USE_FOR_EMERGENT.md docs/internal/
mv PERFUME_BOTTLING_COMPANY_TEMPLATE.md docs/internal/
mv MADISON_*.md docs/internal/
mv CODE_AUDIT_REPORT.md docs/internal/

# Move SQL scripts
mv *.sql scripts/sql/fixes/

# Move shell deploy scripts
mv deploy-*.sh DEPLOY_*.sh scripts/deploy/
mv verify-stripe-setup.sh scripts/deploy/
mv save-json-export.sh scripts/deploy/

# Delete dead code files (code snippets from debugging)
rm FIXED_CHECKOUT_CODE.ts
rm FINAL_GET_SUBSCRIPTION_CODE.ts
rm gateway.ts
rm test-cors-command.js
rm test-cors.html
rm save-json-export.js
rm madison_system_confiq_export_json

# Investigate and likely delete (222 KB possible data dump)
# CHECK CONTENTS FIRST: head -20 Supabase_
rm Supabase_
```

**Also:** Remove the nested `src/src/` directory:
```bash
# These use Node.js fs module — they can't run in the browser
rm -rf src/src/
```

**Definition of Done:** `ls -1 *.md *.sql *.sh *.ts *.js 2>/dev/null | wc -l` at root returns < 5 (just README.md and config files).

### 2.2 Enable `strictNullChecks` (High)

**File:** `tsconfig.app.json`

This is the single highest-leverage TypeScript flag. It catches `undefined is not an object` crashes at compile time instead of production.

```json
{
  "compilerOptions": {
    "strict": false,
    "strictNullChecks": true,    // ← ADD THIS
    "noImplicitAny": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true  // ← CHANGE to true (free safety)
  }
}
```

**Approach:** Turn it on, then fix errors file by file. Start with:
1. `src/contexts/` (4 files — auth and org context are critical)
2. `src/hooks/` (data fetching hooks — most likely to have null access)
3. `src/lib/` (agent pipeline, supabase client)
4. `src/pages/` (fix as you go)

**Tips for fixing:**
- Use optional chaining (`user?.id`) instead of `!` where possible
- For hooks that return `undefined` before data loads, type them explicitly: `data: Product | undefined`
- Don't suppress with `// @ts-expect-error` — fix the actual null handling

**Definition of Done:** `npx tsc --noEmit` passes with `strictNullChecks: true`.

### 2.3 Fix 303 `any` Types (Incremental)

**After** strictNullChecks is stable, enable `noImplicitAny`:

```json
"noImplicitAny": true
```

303 `any` usages across 104 files. Prioritize by risk:
1. **Auth/payment flows** — type these first (security-sensitive)
2. **API response handlers** — use Zod schemas or explicit interfaces
3. **Event handlers** — usually `React.ChangeEvent<HTMLInputElement>` etc.
4. **Catch blocks** — use `catch (error: unknown)` pattern

**Definition of Done:** `npx tsc --noEmit` passes with `noImplicitAny: true`. Zero `any` in `src/contexts/`, `src/hooks/`, and `src/lib/`.

### 2.4 Enable `no-unused-vars` ESLint Rule (Medium)

**File:** `eslint.config.js` (line 23)

```javascript
// BEFORE:
"@typescript-eslint/no-unused-vars": "off",

// AFTER (Phase 1 — warning):
"@typescript-eslint/no-unused-vars": ["warn", {
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
}],
```

Then run `npm run lint` and fix the warnings. After cleanup, change to `"error"`.

**Definition of Done:** Rule set to `"warn"`, fewer than 50 warnings remaining.

### 2.5 Remove `src/src/` Nested Directory (Medium)

```bash
# Files that use Node.js `fs` module in a browser project
rm -rf src/src/
```

If these files contain needed logic, move them to `scripts/` where they'd actually be runnable.

**Definition of Done:** `ls src/src/` returns "No such file or directory".

### 2.6 Remove Deprecated react-beautiful-dnd (Low)

`package.json` ships both `react-beautiful-dnd` (deprecated, 109 KB chunk) and `@dnd-kit/*` (active replacement).

```bash
# Find usages
grep -r "react-beautiful-dnd" src/ --include="*.tsx" --include="*.ts" -l
```

Migrate each usage to `@dnd-kit`, then:
```bash
npm uninstall react-beautiful-dnd @types/react-beautiful-dnd
```

**Definition of Done:** `react-beautiful-dnd` removed from `package.json`. Build passes.

### Maintainability Workstream Checklist

- [ ] 78 root files moved to `docs/`, `scripts/`, or deleted
- [ ] `src/src/` removed
- [ ] `Supabase_` file investigated and removed
- [ ] `strictNullChecks: true` enabled and compiling
- [ ] `noFallthroughCasesInSwitch: true` enabled
- [ ] `no-unused-vars` set to `"warn"` with < 50 warnings
- [ ] `noImplicitAny: true` enabled (stretch goal)
- [ ] `react-beautiful-dnd` removed
- [ ] Build passes, lint error count < 200

**Expected grade after:** C → **B+**

---

## Workstream 3: PERFORMANCE (C+ → B+)

**Branch:** `performance/bundle-optimization`
**Estimated effort:** 2-3 days
**Why third:** Now that the code is cleaner, we can effectively analyze and reduce the bundle.

### 3.1 Analyze Bundle Composition

```bash
# Install analyzer
npm i -D rollup-plugin-visualizer

# Add to vite.config.ts temporarily:
# import { visualizer } from 'rollup-plugin-visualizer';
# plugins: [..., visualizer({ open: true, gzipSize: true })]

npm run build
# Opens treemap showing exactly what's in each chunk
```

### 3.2 Reduce Main Chunk (1.97 MB → target < 800 KB)

The main `index-*.js` chunk is 1.97 MB (626 KB gzip). It likely contains components that should be lazy-loaded.

**Check what's eager vs lazy in `src/App.tsx`:**
- Every `import` at the top of App.tsx lands in the main chunk
- Every `React.lazy(() => import(...))` gets its own chunk

**Fix:** Ensure ALL page-level components use `React.lazy`:
```typescript
// BEFORE (lands in main chunk):
import Settings from '@/pages/Settings';

// AFTER (gets its own chunk):
const Settings = lazy(() => import('@/pages/Settings'));
```

**Heavy components to also lazy-load (even if not pages):**
- `ImageEditor` (67 KB chunk already — good)
- `EmailBuilderV2` (70 KB — good)
- `ContentEditor` (46 KB — good)
- Check if `Library` (838 KB!) is lazy-loaded — if not, this is the biggest win

### 3.3 Optimize Images

```bash
# The 1.3 MB Instagram icon PNG is absurd
# Convert to WebP (lossy, ~200 KB) or better yet, use an SVG
npx sharp-cli --input src/assets/instagram-icon-clean.png --output src/assets/instagram-icon-clean.webp --quality 80

# Also check other large PNGs in the build:
# brass-vault-knob-*.png     490 KB
# madison-auth-logo-*.png    319 KB
# fanned-pages-new-*.jpg     338 KB
```

For all images > 100 KB:
1. Convert PNGs to WebP
2. Add proper `width`/`height` attributes (prevents layout shift)
3. Use `loading="lazy"` for below-the-fold images

### 3.4 Improve Manual Chunks

Current `vite.config.ts` already has good manual chunking, but we can improve:

```typescript
manualChunks: {
  // Keep existing chunks...

  // ADD: Split heavy libraries into their own chunks
  'vendor-fabric': ['fabric'],
  'vendor-jspdf': ['jspdf', 'jspdf-autotable'],
  'vendor-html2canvas': ['html-to-image'],
  'vendor-dnd': ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
},
```

### 3.5 Add Compression

```bash
npm i -D vite-plugin-compression2
```

```typescript
// vite.config.ts
import { compression } from 'vite-plugin-compression2';

plugins: [
  react(),
  compression({ algorithm: 'gzip' }),
  compression({ algorithm: 'brotliCompress' }),
],
```

Vercel serves pre-compressed assets automatically when `.br` and `.gz` files exist.

### Performance Workstream Checklist

- [ ] Bundle analyzed with visualizer
- [ ] All page components lazy-loaded
- [ ] `Library` component lazy-loaded (biggest win — 838 KB)
- [ ] Images > 100 KB converted to WebP
- [ ] Manual chunks updated for fabric, jspdf, html2canvas, dnd-kit
- [ ] Brotli/gzip pre-compression added
- [ ] Main chunk < 800 KB raw (< 300 KB gzip)
- [ ] Total initial load (gzip) < 500 KB

**Expected grade after:** C+ → **B+**

---

## Workstream 4: RELIABILITY (C- → B)

**Branch:** `reliability/testing-infra`
**Estimated effort:** 3-5 days
**Why fourth:** Now that code is clean and fast, we can write meaningful tests against stable code.

### 4.1 Install Test Infrastructure

```bash
npm i -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

Add to `package.json` scripts:
```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom';
```

### 4.2 Write Critical Path Tests (Priority Order)

**Tier 1 — Auth & Authorization (must not break):**
1. `src/contexts/AuthContext.test.tsx` — session loading, redirect on unauthenticated, token refresh
2. `src/components/ProtectedRoute.test.tsx` — redirects unauthenticated users, allows authenticated

**Tier 2 — Payment & Billing (money flows):**
3. `src/hooks/useCheckout.test.ts` — checkout session creation, error handling
4. `src/components/settings/BillingTab.test.tsx` — subscription display, plan upgrade flow

**Tier 3 — Core Product Features:**
5. `src/hooks/useProducts.test.ts` — product CRUD, validation
6. `src/hooks/useOrganization.test.ts` — org creation, member management
7. `src/lib/agents/router.test.ts` — AI agent routing logic

**Tier 4 — Data Integrity:**
8. `src/hooks/useAutoSave.test.ts` — debounce behavior, conflict resolution
9. `src/utils/exportHelpers.test.ts` — PDF/CSV export correctness

### 4.3 Add Error Boundary Coverage

An `ErrorBoundary` already exists. Verify it:
- Catches render errors in all routes
- Logs errors (will connect to Sentry in DevEx phase)
- Shows a user-friendly fallback UI
- Provides a "try again" action

### 4.4 Add Sentry Error Tracking

```bash
npm i @sentry/react
```

Initialize in `src/main.tsx`:
```typescript
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.05,
  });
}
```

Wrap the app router with `Sentry.wrapCreateBrowserRouter` or add `Sentry.ErrorBoundary`.

### Reliability Workstream Checklist

- [ ] vitest installed and configured
- [ ] `npm run test:run` works (even with 0 tests)
- [ ] 5+ critical path tests written and passing
- [ ] Auth flow tested (login, logout, protected routes)
- [ ] Payment flow tested (checkout creation, error states)
- [ ] ErrorBoundary verified on all routes
- [ ] Sentry installed and initialized (DSN in env)
- [ ] `src/test/setup.ts` configured

**Expected grade after:** C- → **B**

---

## Workstream 5: DEVEX (C+ → A-)

**Branch:** `devex/tooling-ci`
**Estimated effort:** 1-2 days
**Why last:** This locks in all previous improvements with automation and guardrails.

### 5.1 Add CI Quality Gate Workflow

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on:
  pull_request:
    branches: [main]

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Lint, Type Check, Test, Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npx tsc --noEmit

      - name: Test
        run: npm run test:run

      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_PUBLISHABLE_KEY: ${{ secrets.VITE_SUPABASE_PUBLISHABLE_KEY }}

      - name: Bundle size check
        run: |
          MAX_SIZE=2100000  # 2.1 MB (reduce over time)
          MAIN_SIZE=$(stat -c%s dist/assets/index-*.js)
          echo "Main chunk: $MAIN_SIZE bytes (limit: $MAX_SIZE)"
          if [ "$MAIN_SIZE" -gt "$MAX_SIZE" ]; then
            echo "::error::Main bundle too large: $MAIN_SIZE > $MAX_SIZE"
            exit 1
          fi

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: npm audit
        run: npm audit --audit-level=high
```

### 5.2 Add Prettier + Pre-commit Hooks

```bash
npm i -D prettier husky lint-staged
```

Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100
}
```

Create `.prettierignore`:
```
dist/
node_modules/
supabase/
*.sql
*.md
```

Initialize husky:
```bash
npx husky init
```

Create `.husky/pre-commit`:
```bash
npx lint-staged
```

Add to `package.json`:
```json
"lint-staged": {
  "src/**/*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix --max-warnings 0"
  ]
}
```

**One-time format of entire codebase:**
```bash
npx prettier --write "src/**/*.{ts,tsx}"
```
Commit this as a single "chore: format codebase with prettier" commit.

### 5.3 Add Dependabot Configuration

Create `.github/dependabot.yml`:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      radix:
        patterns: ["@radix-ui/*"]
      tiptap:
        patterns: ["@tiptap/*"]
      testing:
        patterns: ["vitest", "@testing-library/*"]
```

### 5.4 Fix react-hooks/exhaustive-deps Warnings

There are ~15 `react-hooks/exhaustive-deps` warnings. These are real bugs (stale closures).

```bash
# Get the list
npm run lint 2>&1 | grep exhaustive-deps
```

For each warning, either:
1. Add the missing dependency to the array
2. Wrap the function in `useCallback` if adding it causes infinite loops
3. Move the function inside the effect if it's only used there

**Do NOT suppress with `// eslint-disable-next-line`** — these are real bugs.

### 5.5 Enable GitHub Branch Protection

In GitHub repo → Settings → Branches → Branch protection rules:

**Rule for `main`:**
- [x] Require a pull request before merging
  - [x] Require 1 approval
- [x] Require status checks to pass before merging
  - [x] `quality` (from ci.yml)
  - [x] `security` (from ci.yml)
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings

### 5.6 Update .gitignore

Add entries to prevent future clutter:
```gitignore
# IDE
.DS_Store
.vscode/
.idea/

# Build
dist/
*.tsbuildinfo

# Env (should already be there)
.env
.env.local
.env.*.local

# Debug artifacts
*.log
npm-debug.log*
```

### DevEx Workstream Checklist

- [ ] `.github/workflows/ci.yml` created and working
- [ ] Prettier installed and configured
- [ ] Husky + lint-staged pre-commit hooks working
- [ ] One-time format commit applied
- [ ] Dependabot configured
- [ ] All `exhaustive-deps` warnings fixed
- [ ] Branch protection enabled on `main`
- [ ] `.gitignore` updated
- [ ] `npm run lint` has < 50 errors (down from 771)

**Expected grade after:** C+ → **A-**

---

## Final State After All Workstreams

| Dimension | Before | After | Key Changes |
|-----------|--------|-------|-------------|
| Security | D+ | **B+** | AES-GCM encryption, CORS locked down, JWT enforced, 0 critical vulns, rate limits |
| Maintainability | C | **B+** | strictNullChecks, clean repo structure, no deprecated deps, reduced `any` |
| Performance | C+ | **B+** | < 300 KB gzip initial load, WebP images, lazy loading, compression |
| Reliability | C- | **B** | Test infra, 5+ critical path tests, Sentry, error boundaries |
| DevEx | C+ | **A-** | CI quality gates, Prettier, pre-commit hooks, branch protection, < 50 lint errors |

### Total Estimated Effort

| Workstream | Days | Risk |
|------------|------|------|
| Security | 1-2 | Medium (test after each change) |
| Maintainability | 3-5 | Low (mostly mechanical) |
| Performance | 2-3 | Low |
| Reliability | 3-5 | None |
| DevEx | 1-2 | None |
| **Total** | **10-17 days** | |

---

## Quick Reference: Commands to Run

```bash
# Security
openssl rand -base64 32  # Generate encryption keys
npm audit                # Check vulnerabilities
npm audit fix            # Fix non-breaking vulns

# Maintainability
npx tsc --noEmit         # Type check
npm run lint             # Lint check

# Performance
npm run build            # Build and check chunk sizes
npx vite-bundle-analyzer # Analyze bundle (after install)

# Reliability
npm run test:run         # Run tests
npm run test:coverage    # Coverage report

# DevEx
npx prettier --check .   # Check formatting
npx prettier --write .   # Fix formatting
```
