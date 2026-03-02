# Madison Studio - Production Readiness Audit

**Date:** 2026-03-02
**Auditor:** Staff+ SWE / Engineering Manager (Automated Audit)
**Repo:** madison-studio-cursor
**Branch:** `claude/audit-production-readiness-zdynS`
**Status:** ~30% built, single-repo, client-side SPA + Supabase Edge Functions

---

## A) Executive Summary

### Overall Health Grades

| Dimension       | Grade | Rationale |
|----------------|-------|-----------|
| **Security**       | **D+** | 2 critical encryption vulns (Etsy base64, Klaviyo XOR), wildcard CORS on all 74 edge functions, `--no-verify-jwt` in CI, 19 npm audit vulns (2 critical) |
| **Maintainability** | **C**  | 140K LOC across 581 files, 303 `any` usages, TypeScript `strict: false`, good design-token system but 10+ files over 1000 lines |
| **Performance**    | **C+** | Good code-splitting with `manualChunks`, but main chunk is 1.97 MB (626 KB gzip), `Library` chunk 838 KB, and 1.3 MB unoptimized PNG shipped in build |
| **Reliability**    | **C-** | Zero tests, no typecheck in CI, ErrorBoundary exists but no integration/e2e coverage, no health-check endpoint |
| **DevEx**          | **C+** | Build works, ESLint configured, good `.cursorrules`, but 771 lint errors, no formatter enforced, no pre-commit hooks, 88 loose files in repo root |

### Top 10 Risks (Ranked)

| # | Risk | Impact | Likelihood | Category |
|---|------|--------|------------|----------|
| 1 | **Etsy & Klaviyo tokens stored as base64/XOR** — trivially reversible if DB is compromised | Critical | High | Security |
| 2 | **Wildcard CORS (`*`) on all 74 edge functions** — allows CSRF-style attacks from any origin | Critical | High | Security |
| 3 | **Zero test coverage** — no unit, integration, or e2e tests exist anywhere | High | Certain | Testing |
| 4 | **`--no-verify-jwt` flag in deploy.yml** — edge functions deployed without JWT verification | High | High | Security |
| 5 | **1.97 MB main JS bundle** (626 KB gzip) — poor initial load on mobile/slow networks | High | High | Performance |
| 6 | **19 npm vulnerabilities** (2 critical: jsPDF path traversal, PDF injection) | High | Medium | Security |
| 7 | **TypeScript `strict: false`** with 303 `any` usages — runtime errors will only be found in production | Medium | High | Correctness |
| 8 | **No CI quality gates** — no lint, typecheck, or test step required before merge | Medium | High | CI/CD |
| 9 | **88 loose files in repo root** (SQL, MD, SH) — documentation and script sprawl | Medium | Medium | DX |
| 10 | **No rate limiting on payment/auth endpoints** — abuse potential on checkout, OAuth, AI generation | Medium | Medium | Security |

---

## B) Repo Snapshot

### Architecture (Evidence-Based)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Vite SPA)                         │
│  React 18 + TypeScript + Tailwind + shadcn/ui + Radix       │
│  React Router v6 (BrowserRouter)                            │
│  TanStack React Query (data caching)                        │
│  TipTap (rich text), Fabric.js (canvas), Framer Motion      │
└──────────────────────┬──────────────────────────────────────┘
                       │ supabase-js client
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              SUPABASE (Backend-as-a-Service)                 │
│  Auth (email/password, OAuth)                               │
│  PostgreSQL (with RLS policies)                             │
│  74 Deno Edge Functions (AI, payments, integrations)        │
│  Storage (DAM assets)                                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   Anthropic       Stripe        3rd-Party
   (Claude)     (Payments)     (Etsy, Shopify,
   + Gemini                     Klaviyo, LinkedIn,
   + fal.ai                     Sanity, Google)
```

**Hosting:** Vercel (frontend SPA) + Supabase (backend/DB/edge)

### Key Folders & Responsibilities

| Path | Files | Responsibility |
|------|-------|---------------|
| `src/pages/` | 40+ pages | Route-level page components (lazy-loaded) |
| `src/components/` | 300+ | UI components organized by feature domain |
| `src/hooks/` | 50+ hooks | Data fetching, state, utilities |
| `src/contexts/` | 4 contexts | Auth, Organization, Dashboard state |
| `src/lib/agents/` | 6 files | Madison 4-agent AI pipeline (Router → Assembler → Generator → Editor) |
| `src/integrations/supabase/` | 2 files | Supabase client + auto-generated types |
| `src/design/` | 2 files | Design tokens + component standards |
| `src/utils/` | 18 files | Email templates, export helpers, formatters |
| `supabase/functions/` | 74 functions | Edge Functions (AI, payments, integrations, CRUD) |
| `supabase/migrations/` | 160 files | PostgreSQL schema migrations |
| `scripts/` | 20+ files | SQL diagnostics, seed data, migration helpers |
| `docs/` | many | Documentation files |

### Metrics Summary

| Metric | Value |
|--------|-------|
| Total source files (src/) | 581 .ts/.tsx |
| Total lines of code | ~140,000 |
| Supabase Edge Functions | 74 |
| DB Migrations | 160 |
| npm dependencies | 67 direct (808 total installed) |
| Build output size | 15 MB uncompressed |
| Main JS chunk (gzip) | 626 KB |
| ESLint errors | 771 |
| ESLint warnings | 118 |
| npm audit vulnerabilities | 19 (2 critical, 7 high, 10 moderate) |
| Test files | 0 |
| `any` type usages | 303 across 104 files |

---

## C) Detailed Findings

### C1. CRITICAL — Etsy OAuth Tokens Stored as Base64 (Not Encrypted)

- **Category:** Security
- **Severity:** Critical
- **Evidence:** `supabase/functions/etsy-oauth-callback/index.ts` lines 130-133
  ```typescript
  const encryptedAccessToken = `enc:${btoa(access_token)}`;
  const encryptedRefreshToken = `enc:${btoa(refresh_token)}`;
  ```
  And decryption in `supabase/functions/etsy-push-listing/index.ts` lines 17-22:
  ```typescript
  function decryptToken(encrypted: string): string {
    if (encrypted.startsWith("enc:")) {
      return atob(encrypted.slice(4));
    }
    return encrypted;
  }
  ```
- **Why it matters:** Base64 is encoding, not encryption. If the database is compromised (SQL injection, leaked service role key, Supabase breach), all Etsy OAuth tokens are immediately readable. This gives attackers full access to connected Etsy shops.
- **Fix approach:** Replace with AES-GCM encryption (already implemented correctly for Shopify in `connect-shopify/index.ts` lines 23-34). Copy that pattern.
- **Effort:** S | Low risk

### C2. CRITICAL — Klaviyo API Keys Use XOR "Encryption"

- **Category:** Security
- **Severity:** Critical
- **Evidence:** `supabase/functions/connect-klaviyo/index.ts` lines 9-14
  ```typescript
  function encryptApiKey(apiKey: string, encryptionKey: string): string {
    const encrypted = Array.from(apiKey).map((char, i) =>
      String.fromCharCode(char.charCodeAt(0) ^ encryptionKey.charCodeAt(i % encryptionKey.length))
    ).join('');
    return btoa(encrypted);
  }
  ```
- **Why it matters:** XOR cipher is cryptographically broken. It's vulnerable to known-plaintext attacks (Klaviyo keys have a predictable prefix), frequency analysis, and the encryption key is reused. Effectively plaintext.
- **Fix approach:** Replace with the same AES-GCM pattern used for Shopify tokens. Use `crypto.subtle` with random IV per encryption.
- **Effort:** S | Low risk

### C3. CRITICAL — Wildcard CORS on All Edge Functions

- **Category:** Security
- **Severity:** Critical
- **Evidence:** All 74 edge functions use:
  ```typescript
  'Access-Control-Allow-Origin': '*'
  ```
  Including sensitive endpoints: `create-checkout-session`, `stripe-webhook`, `connect-shopify`, `etsy-oauth-callback`, `connect-klaviyo`, `google-calendar-oauth`.
- **Why it matters:** Any website can make authenticated requests to your edge functions if a user has a valid Supabase session. This enables cross-origin attacks against payment, OAuth, and data endpoints.
- **Fix approach:** Create a shared CORS utility in `supabase/functions/_shared/cors.ts`:
  ```typescript
  const ALLOWED_ORIGINS = [
    'https://app.madisonstudio.io',
    'https://app.madisonstudio.ai',
    ...(Deno.env.get('ENVIRONMENT') === 'development' ? ['http://localhost:8080'] : [])
  ];
  ```
  Apply to all functions.
- **Effort:** M | Low risk

### C4. HIGH — Zero Test Coverage

- **Category:** Testing
- **Severity:** High
- **Evidence:** `find src/ -name "*.test.*" -o -name "*.spec.*"` returns zero results. No test runner configured in `package.json`. No test dependencies (no vitest, jest, playwright, or cypress).
- **Why it matters:** At 140K LOC with payment processing, OAuth flows, and AI pipelines, every code change is a gamble. Regressions are only discovered by users in production.
- **Fix approach:**
  1. Install vitest: `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`
  2. Add to `package.json`: `"test": "vitest", "test:run": "vitest run"`
  3. Start with critical path tests: auth flow, checkout, organization creation
- **Effort:** L | No risk

### C5. HIGH — `--no-verify-jwt` in CI Deployment

- **Category:** Security / CI/CD
- **Severity:** High
- **Evidence:** `.github/workflows/deploy.yml` line 44:
  ```yaml
  npx supabase functions deploy "$func" \
    --project-ref "$SUPABASE_PROJECT_ID" \
    --no-verify-jwt || echo "Warning: Failed to deploy $func"
  ```
- **Why it matters:** This flag deploys all edge functions with JWT verification disabled, meaning any anonymous request can invoke them. Combined with wildcard CORS, this is a wide-open attack surface.
- **Fix approach:** Remove `--no-verify-jwt`. For functions that genuinely need public access (webhooks, public feeds), configure per-function JWT settings in `supabase/config.toml` or use `--no-verify-jwt` only for those specific functions.
- **Effort:** S | Medium risk (test each function first)

### C6. HIGH — npm Audit: 19 Vulnerabilities (2 Critical)

- **Category:** Security
- **Severity:** High
- **Evidence:** `npm audit` output:
  - **Critical:** jsPDF (8 CVEs: path traversal, PDF injection, DoS, XSS)
  - **Critical:** react-router-dom (XSS via open redirects) — `GHSA-2w69-qvjg-hvjx`
  - **High:** fabric.js (stored XSS via SVG), rollup (path traversal), minimatch (ReDoS), glob (command injection)
  - **Moderate:** lodash (prototype pollution), esbuild, markdown-it, prismjs, etc.
- **Why it matters:** jsPDF vulnerabilities are directly exploitable if users can upload or generate PDFs. The react-router XSS affects redirect logic.
- **Fix approach:**
  ```bash
  npm audit fix          # Fix 11 non-breaking
  npm i jspdf@latest     # Fix critical jsPDF (breaking)
  npm i react-router-dom@latest  # Fix react-router XSS (breaking)
  npm i fabric@7         # Fix fabric XSS (breaking)
  ```
- **Effort:** M | Medium risk (test breaking changes)

### C7. HIGH — 1.97 MB Main JS Bundle

- **Category:** Performance
- **Severity:** High
- **Evidence:** Build output shows:
  ```
  dist/assets/index-aRy8zrm-.js   1,967.27 kB │ gzip: 626.50 kB
  dist/assets/Library-OrTNNvNT.js    837.63 kB │ gzip: 258.39 kB
  ```
  Also: `instagram-icon-clean-BZEN2B5k.png` is 1,264 KB (unoptimized PNG in the build).
- **Why it matters:** Mobile users on 3G will wait 10+ seconds for initial load. Google Lighthouse/Core Web Vitals will score poorly, impacting SEO and UX.
- **Fix approach:**
  1. Audit what's in the 1.97 MB main chunk — likely too many components are imported eagerly
  2. Convert the 1.3 MB PNG to WebP (~200 KB)
  3. Move more page components to lazy imports
  4. Consider `React.lazy()` for heavy sub-components (Image editor, email builder)
  5. Add `vite-plugin-compression` for Brotli pre-compression
- **Effort:** M | Low risk

### C8. HIGH — TypeScript Strict Mode Disabled

- **Category:** Correctness
- **Severity:** High
- **Evidence:** `tsconfig.app.json`:
  ```json
  "strict": false,
  "noImplicitAny": false,
  "strictNullChecks": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false,
  "noFallthroughCasesInSwitch": false
  ```
  303 `any` type usages across 104 files (17.9% of source files).
- **Why it matters:** Without `strictNullChecks`, every property access is a potential runtime `TypeError: Cannot read properties of undefined`. Without `noImplicitAny`, function parameters have no type safety. This is the #1 source of production crashes in TypeScript apps.
- **Fix approach:** Incremental strictness:
  1. Enable `strictNullChecks` first (biggest safety win)
  2. Fix errors file-by-file (use `// @ts-expect-error` sparingly)
  3. Then enable `noImplicitAny`
  4. Finally `strict: true`
- **Effort:** L | Low risk (incremental)

### C9. MEDIUM — No CI Quality Gates

- **Category:** CI/CD
- **Severity:** Medium
- **Evidence:** `.github/workflows/deploy.yml` runs build but has no lint, typecheck, or test step. `.github/workflows/deploy-optimized.yml` same. No branch protection rules visible. No required checks before merge.
- **Why it matters:** Any broken code pushed to `main` goes directly to production. The 771 existing lint errors suggest this has been the pattern — errors accumulate because nothing blocks them.
- **Fix approach:** Add a `ci.yml` workflow:
  ```yaml
  on: [pull_request]
  jobs:
    quality:
      steps:
        - run: npm ci
        - run: npm run lint
        - run: npx tsc --noEmit
        - run: npm run test:run
        - run: npm run build
  ```
  Enable branch protection on `main` requiring this check.
- **Effort:** S | No risk

### C10. MEDIUM — Hardcoded Supabase Project ID in CI

- **Category:** Security
- **Severity:** Medium
- **Evidence:** `.github/workflows/deploy.yml` line 31 and `deploy-optimized.yml` line 73:
  ```yaml
  SUPABASE_PROJECT_ID: likkskifwsrvszxdvufw
  ```
- **Why it matters:** The project ID is public information anyway (it's in the Supabase URL), but hardcoding it in CI makes environment separation impossible and is a bad habit. It should be a secret for consistency and to enable staging/production separation.
- **Fix approach:** Move to `${{ secrets.SUPABASE_PROJECT_ID }}` and add the value to GitHub repository secrets.
- **Effort:** S | No risk

### C11. MEDIUM — 88 Loose Files in Repo Root

- **Category:** DX / Architecture
- **Severity:** Medium
- **Evidence:** Root directory contains 88 `.md`, `.sql`, `.sh`, `.ts`, and `.js` files including:
  - `APPLY_RLS_FIX_NOW.sql`, `RUN_THIS_NOW.sql`, `CLEANUP_USER_DATA.sql`
  - `ASALA_DEBUG_GUIDE.md`, `BEST_BOTTLES_BRAND_BRAIN.md`
  - `deploy-brand-dna.sh`, `verify-stripe-setup.sh`
  - `test-cors-command.js`, `test-cors.html`
  - `FINAL_GET_SUBSCRIPTION_CODE.ts`, `FIXED_CHECKOUT_CODE.ts`
  - `gateway.ts`, `save-json-export.js`
  - `Supabase_` (222 KB unnamed file)
- **Why it matters:** New developers cannot navigate the repo. Urgent-sounding filenames (`RUN_THIS_NOW.sql`) create confusion. SQL files with data operations are dangerous if accidentally run. The `Supabase_` file (222 KB) is likely a database dump.
- **Fix approach:**
  1. Move docs to `docs/`
  2. Move SQL scripts to `scripts/sql/`
  3. Move shell scripts to `scripts/`
  4. Delete files that are no longer relevant (code snippets like `FIXED_CHECKOUT_CODE.ts`)
  5. Investigate and remove `Supabase_` (possible data leak)
- **Effort:** S | No risk

### C12. MEDIUM — `@typescript-eslint/no-unused-vars: "off"`

- **Category:** DX / Correctness
- **Severity:** Medium
- **Evidence:** `eslint.config.js` line 23:
  ```javascript
  "@typescript-eslint/no-unused-vars": "off",
  ```
- **Why it matters:** Dead code accumulates silently. Unused imports increase bundle size. Unused variables mask logic errors.
- **Fix approach:** Change to `"warn"` first, then `"error"` after cleanup.
- **Effort:** S | No risk

### C13. MEDIUM — Suspicious Nested `src/src/` Path

- **Category:** Architecture
- **Severity:** Medium
- **Evidence:** `src/src/lib/madisonLLM.ts` and `src/src/lib/madisonPrompt.ts` exist at a nested `src/src/` path. These files use Node.js `fs` module (server-side) inside a Vite client-side project.
- **Why it matters:** These files will fail at runtime in the browser (no `fs` module). They're likely meant for a separate Node.js process but are accidentally in the client source tree. They increase confusion about the codebase structure.
- **Fix approach:** Move to `scripts/` or `server/` directory, or delete if unused.
- **Effort:** S | No risk

### C14. MEDIUM — No Rate Limiting on Sensitive Endpoints

- **Category:** Security
- **Severity:** Medium
- **Evidence:** Edge functions `create-checkout-session`, `generate-with-claude`, `send-welcome-email`, and all OAuth endpoints have no rate limiting.
- **Why it matters:** An attacker can spam checkout creation (generating Stripe API calls), exhaust AI credits (Claude API costs), or flood email sending (reputation damage).
- **Fix approach:** Implement rate limiting using Supabase's built-in rate limiting or a simple in-memory counter per user ID:
  ```typescript
  // In _shared/rateLimit.ts
  const RATE_LIMITS = { 'generate-with-claude': { window: 60, max: 10 } };
  ```
- **Effort:** M | Low risk

### C15. MEDIUM — No Prettier / Formatting Enforcement

- **Category:** DX
- **Severity:** Medium
- **Evidence:** No `.prettierrc`, no `prettier` in `package.json`, no `format` script, no pre-commit hooks (no husky/lint-staged).
- **Why it matters:** Inconsistent formatting creates noisy diffs, slows code review, and causes merge conflicts.
- **Fix approach:**
  ```bash
  npm i -D prettier husky lint-staged
  echo '{ "semi": true, "singleQuote": true, "trailingComma": "es5" }' > .prettierrc
  npx husky init
  ```
- **Effort:** S | No risk

### C16. LOW — 771 ESLint Errors

- **Category:** DX / Correctness
- **Severity:** Low (individually), Medium (collectively)
- **Evidence:** `npm run lint` output: `771 errors, 118 warnings`. Majority are `@typescript-eslint/no-explicit-any` (expected given C8) and `react-hooks/exhaustive-deps` warnings.
- **Why it matters:** Missing hook dependencies cause stale closures and subtle bugs. The `any` usages bypass type safety.
- **Fix approach:** Fix `react-hooks/exhaustive-deps` warnings first (these are real bugs). Then address `any` types incrementally as part of C8.
- **Effort:** M | Low risk

### C17. LOW — Large Components Need Decomposition

- **Category:** Maintainability
- **Severity:** Low
- **Evidence:** Files over 1000 lines:
  - `src/pages/ImageEditor.tsx` — 2,011 lines
  - `src/pages/Multiply.tsx` — 1,812 lines
  - `src/pages/LightTable.tsx` — 1,540 lines
  - `src/components/settings/ProductsTab.tsx` — 1,441 lines
  - `src/components/darkroom/RightPanel.tsx` — 1,403 lines
  - `src/components/onboarding/BrandKnowledgeCenter.tsx` — 1,383 lines
  - `src/pages/ProductHub.tsx` — 1,189 lines
  - `src/components/products/SDSSection.tsx` — 1,148 lines
  - `src/components/ContentEditor.tsx` — 1,099 lines
- **Why it matters:** Large files are hard to review, test, and maintain. They tend to accumulate bugs.
- **Fix approach:** Extract sub-components and custom hooks. Target < 400 lines per component.
- **Effort:** L | Low risk

### C18. LOW — No Observability / Error Tracking

- **Category:** Observability
- **Severity:** Low (now), High (at scale)
- **Evidence:** Logger utility exists (`src/lib/logger.ts`) but only logs to console. No Sentry, no LogRocket, no OpenTelemetry, no structured logging in edge functions.
- **Why it matters:** When production issues occur, you'll have no way to diagnose them. Console logs are lost when the page refreshes.
- **Fix approach:** Add Sentry for error tracking:
  ```bash
  npm i @sentry/react
  ```
  Initialize in `main.tsx` with environment-based DSN.
- **Effort:** S | No risk

### C19. LOW — No Database Migration Strategy Documented

- **Category:** Data
- **Severity:** Low
- **Evidence:** 160 migration files exist in `supabase/migrations/` but no documentation on migration workflow, rollback strategy, or how to apply them locally. Root-level SQL files (`APPLY_RLS_FIX_NOW.sql`, `RUN_THIS_NOW.sql`) suggest migrations are sometimes applied manually.
- **Why it matters:** Manual SQL execution is error-prone and non-reproducible. Lack of rollback strategy means a bad migration can cause data loss.
- **Fix approach:** Document the migration workflow. Use `supabase db reset` for local development. Never apply SQL manually in production — always use migration files.
- **Effort:** S | No risk

### C20. LOW — react-beautiful-dnd is Deprecated

- **Category:** Maintainability
- **Severity:** Low
- **Evidence:** `package.json` includes both `react-beautiful-dnd` (deprecated, no React 18 support) and `@dnd-kit/core` + `@dnd-kit/sortable` (active replacement). The deprecated library generates a 109 KB chunk.
- **Why it matters:** react-beautiful-dnd is unmaintained and has known issues with React 18 strict mode. You're shipping both libraries (duplicate functionality).
- **Fix approach:** Migrate remaining `react-beautiful-dnd` usages to `@dnd-kit`, then `npm uninstall react-beautiful-dnd @types/react-beautiful-dnd`.
- **Effort:** M | Low risk

---

## D) "Fix First" Plan (Prioritized)

### Phase 1: 0-2 Days — Quick Wins

| # | Task | Owner | Steps | Definition of Done |
|---|------|-------|-------|-------------------|
| 1 | **Fix Etsy token encryption** | BE | 1. Copy AES-GCM encrypt/decrypt from `connect-shopify/index.ts` into `etsy-oauth-callback/index.ts` and `etsy-push-listing/index.ts`. 2. Add migration function to re-encrypt existing tokens. 3. Deploy & verify. | Etsy tokens encrypted with AES-GCM, old base64 tokens migrated |
| 2 | **Fix Klaviyo encryption** | BE | 1. Replace XOR cipher in `connect-klaviyo/index.ts` with AES-GCM. 2. Add env var `KLAVIYO_TOKEN_ENCRYPTION_KEY`. 3. Re-encrypt stored keys. | Klaviyo keys encrypted with AES-GCM |
| 3 | **Remove `--no-verify-jwt`** | DevOps | 1. Remove flag from `deploy.yml` line 44. 2. For public endpoints (webhooks, public-blog-feed), add per-function config. 3. Test deployment. | JWT verification enforced on all non-public functions |
| 4 | **Fix CORS on edge functions** | BE | 1. Create `supabase/functions/_shared/cors.ts` with allowed origins. 2. Import in all functions. 3. Replace `'*'` everywhere. | CORS restricted to `app.madisonstudio.io` and `app.madisonstudio.ai` |
| 5 | **Move project ID to secret** | DevOps | 1. Add `SUPABASE_PROJECT_ID` to GitHub secrets. 2. Replace hardcoded value in both workflow files. | No hardcoded project IDs in CI |
| 6 | **Add CI quality gate** | DevOps | 1. Create `.github/workflows/ci.yml` with lint + build steps. 2. Enable branch protection on `main`. | PRs blocked if build fails |
| 7 | **Clean up repo root** | FE | 1. `mkdir -p docs/internal scripts/sql scripts/deploy`. 2. Move `.md` files to `docs/`. 3. Move `.sql` files to `scripts/sql/`. 4. Move `.sh` files to `scripts/deploy/`. 5. Investigate and remove `Supabase_` file. 6. Remove dead code files (`FIXED_CHECKOUT_CODE.ts`, `FINAL_GET_SUBSCRIPTION_CODE.ts`). | Root has < 15 config files |

### Phase 2: 1-2 Weeks — Foundational Fixes

| # | Task | Owner | Steps | Definition of Done |
|---|------|-------|-------|-------------------|
| 8 | **Fix critical npm vulnerabilities** | FE | 1. `npm audit fix` (non-breaking). 2. `npm i jspdf@latest react-router-dom@latest`. 3. Test PDF generation and routing. 4. `npm i fabric@7` and fix breaking API changes. | `npm audit` shows 0 critical, 0 high |
| 9 | **Add test infrastructure** | FE | 1. `npm i -D vitest @testing-library/react @testing-library/jest-dom jsdom`. 2. Add vitest config. 3. Write 5 critical-path tests: auth context, organization creation, protected route redirect, checkout flow, content generation hook. 4. Add `npm run test:run` to CI. | 5+ tests passing, CI runs tests |
| 10 | **Enable `strictNullChecks`** | FE | 1. Set `"strictNullChecks": true` in `tsconfig.app.json`. 2. Fix type errors file-by-file (prioritize pages/, hooks/, contexts/). 3. Use `!` non-null assertions sparingly. | TypeScript compiles with `strictNullChecks` |
| 11 | **Optimize main bundle** | FE | 1. Analyze with `npx vite-bundle-analyzer`. 2. Lazy-load more page components. 3. Convert 1.3 MB instagram PNG to WebP. 4. Move heavy components (ImageEditor, EmailBuilder) behind `React.lazy()`. | Main chunk < 500 KB gzip |
| 12 | **Add Prettier + pre-commit hooks** | FE | 1. `npm i -D prettier husky lint-staged`. 2. Configure `.prettierrc`. 3. Add `lint-staged` config. 4. Run `npx prettier --write src/` once to format. | All new code auto-formatted on commit |
| 13 | **Add rate limiting** | BE | 1. Create rate limit utility in `_shared/`. 2. Apply to: `generate-with-claude` (10/min), `create-checkout-session` (5/min), `send-*-email` (3/min). 3. Return 429 when exceeded. | Rate limits active on sensitive endpoints |
| 14 | **Fix react-hooks/exhaustive-deps** | FE | 1. Run `npm run lint 2>&1 \| grep exhaustive-deps` to get list. 2. Fix each by adding deps or extracting to useCallback. | Zero `exhaustive-deps` warnings |

### Phase 3: 1-2 Months — Longer-Term Improvements

| # | Task | Owner | Steps | Definition of Done |
|---|------|-------|-------|-------------------|
| 15 | **Enable `strict: true`** | FE | Continue from Phase 2 strictNullChecks. Enable `noImplicitAny`, fix 303 `any` usages. | `strict: true` compiles cleanly |
| 16 | **Add Sentry error tracking** | FE/BE | 1. `npm i @sentry/react`. 2. Init in `main.tsx`. 3. Add Sentry to edge functions. 4. Set up alerts. | Production errors captured and alerted |
| 17 | **Add e2e tests** | FE | 1. `npm i -D playwright`. 2. Write e2e tests: login flow, create content, checkout. 3. Add to CI (run on deploy preview). | 3+ e2e tests in CI |
| 18 | **Decompose large components** | FE | Break down 9 files over 1000 lines. Extract sub-components, custom hooks. Target < 400 lines. | No component > 500 lines |
| 19 | **Remove react-beautiful-dnd** | FE | Migrate to `@dnd-kit`. Remove deprecated package. | Only `@dnd-kit` in package.json |
| 20 | **Environment separation** | DevOps | Set up staging environment on Supabase. Add `staging` branch with deploy-on-push. | Staging env mirrors production |
| 21 | **Document migration strategy** | BE | Write `MIGRATIONS.md` covering: local dev, staging, production, rollbacks. Remove root SQL files. | Migration workflow documented and followed |

---

## E) Quality Gates (Prevent Regressions)

### Required Checks Before Merge

```yaml
# .github/workflows/ci.yml
name: CI
on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20', cache: 'npm' }
      - run: npm ci
      - name: Lint
        run: npm run lint -- --max-warnings 0
      - name: Typecheck
        run: npx tsc --noEmit
      - name: Test
        run: npm run test:run
      - name: Build
        run: npm run build
      - name: Bundle size check
        run: |
          MAIN_SIZE=$(stat -f%z dist/assets/index-*.js 2>/dev/null || stat -c%s dist/assets/index-*.js)
          if [ "$MAIN_SIZE" -gt 2100000 ]; then
            echo "Main bundle too large: $MAIN_SIZE bytes"
            exit 1
          fi
```

### Thresholds

| Check | Current | Target (Phase 1) | Target (Phase 3) |
|-------|---------|-------------------|-------------------|
| Lint errors | 771 | < 200 (disable `no-explicit-any` initially) | 0 |
| Lint warnings | 118 | < 50 | 0 |
| TypeScript errors | 0 (strict off) | 0 (strictNullChecks on) | 0 (strict: true) |
| Test coverage | 0% | 10% critical paths | 40% |
| npm audit critical | 2 | 0 | 0 |
| npm audit high | 7 | 0 | 0 |
| Main bundle (gzip) | 626 KB | < 500 KB | < 350 KB |

### Branching & PR Workflow

1. **Branch protection on `main`:**
   - Require PR reviews (1 minimum)
   - Require CI checks to pass
   - No direct pushes
   - Require linear history (squash merge)

2. **Branch naming:**
   - `feat/` — new features
   - `fix/` — bug fixes
   - `chore/` — maintenance
   - `security/` — security fixes (fast-track review)

3. **PR requirements:**
   - Title follows conventional commits
   - Description includes "What" and "Why"
   - Screenshots for UI changes
   - Security changes get 2 reviewers

### Release Checklist for Production

- [ ] All CI checks pass (lint, types, tests, build)
- [ ] `npm audit` shows 0 critical, 0 high vulnerabilities
- [ ] Bundle size within threshold
- [ ] Database migrations tested on staging first
- [ ] Edge functions tested with JWT verification enabled
- [ ] No new `any` types introduced
- [ ] Error tracking (Sentry) configured and verified
- [ ] Feature flags configured for gradual rollout (if applicable)
- [ ] Smoke test on staging: login, create content, checkout

---

## F) Tooling Recommendations

### Static Analysis

| Tool | Purpose | Priority |
|------|---------|----------|
| **ESLint** (already installed) | Code quality. Enable `no-unused-vars: "warn"`, fix `exhaustive-deps`. | Now |
| **TypeScript strict mode** | Type safety. Enable incrementally per C8. | Phase 2 |
| **Prettier** | Formatting. Add with husky pre-commit hook. | Phase 2 |
| **eslint-plugin-security** | Detect security anti-patterns in JS/TS. | Phase 2 |
| **knip** | Detect unused files, dependencies, exports. | Phase 2 |

### Security Scanning

| Tool | Purpose | Priority |
|------|---------|----------|
| **npm audit** (built-in) | Dependency vulnerabilities. Run in CI. | Now |
| **gitleaks** | Detect secrets in git history. Run once, then add to CI. Install: `brew install gitleaks && gitleaks detect` | Now |
| **GitHub Dependabot** | Auto-PR for vulnerable deps. Enable in repo settings. | Now |
| **Socket.dev** | Supply chain attack detection. Free GitHub app. | Phase 2 |

### Secrets Detection

```bash
# One-time scan for leaked secrets in git history
npx gitleaks detect --source . --verbose

# Add to CI
# .github/workflows/ci.yml
- name: Secrets scan
  uses: gitleaks/gitleaks-action@v2
```

### Observability (Phase 3)

| Tool | Purpose | Effort |
|------|---------|--------|
| **Sentry** | Error tracking, performance monitoring. | S |
| **Vercel Analytics** | Web Vitals, page load times. Already available on Vercel. | S |
| **Supabase Dashboard** | Edge function logs, DB performance. Already available. | None |
| **OpenTelemetry** (optional) | Distributed tracing for AI pipeline. | L |

---

## G) Questions (Highest Leverage)

1. **Is the `Supabase_` file (222 KB) in repo root a database export?** If so, it may contain sensitive data and should be removed from git history using `git filter-branch` or BFG Repo Cleaner.

2. **Are there any active Etsy/Klaviyo integrations in production?** If yes, the encryption vulnerabilities (C1, C2) need emergency remediation with token rotation.

3. **Is the `deploy.yml` workflow actively deploying to production on every push to `main`?** If yes, the `--no-verify-jwt` flag is a live vulnerability.

4. **Do you have a staging Supabase project?** Environment separation is critical before you can safely test migrations and edge function changes.

5. **Are the `FIXED_CHECKOUT_CODE.ts` and `FINAL_GET_SUBSCRIPTION_CODE.ts` files in the root still needed?** They appear to be code snippets from debugging sessions and should likely be deleted.

6. **How many active users/organizations are currently in the system?** This informs the urgency of the token re-encryption migration (C1, C2).

7. **Is there a product manager or designer reviewing the 40+ pages?** Several pages (ComponentDemo, MadisonTest) appear to be development/testing pages that shouldn't ship to production.

---

*End of Audit. Total findings: 20 (3 Critical, 5 High, 9 Medium, 3 Low).*
*Estimated remediation: 2-3 engineer-weeks for Phase 1+2, 1-2 engineer-months for Phase 3.*
