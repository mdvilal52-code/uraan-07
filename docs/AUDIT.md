# Production Readiness Audit

Full-project audit of the Ariana Gems & Jewellery storefront (Next.js 14 · TypeScript ·
Tailwind · Prisma/PostgreSQL). This records what was verified, what was fixed, and the
one item deliberately deferred.

## Verification results

| Check | Command | Result |
| --- | --- | --- |
| TypeScript | `npx tsc --noEmit` | 0 errors |
| ESLint | `npm run lint` | 0 errors, 0 warnings |
| Production build | `npm run build` | Compiled successfully, 44/44 pages generated, 0 warnings |
| Runtime smoke test | `next start` + route probes | All 19 routes correct (200 / 307 redirect / 404 as expected) |

The runtime smoke test was run with the database intentionally unreachable to confirm the
static-catalogue fallback: `/api/products` served all 12 products, every public page
returned 200, `/admin` correctly 307-redirected to `/login`, and an unknown path returned
a real 404. The `prisma:error` / `[db] … failed` lines in server logs are the **intended,
caught** degradation path — they never reach the browser console and disappear when a live
database is configured.

## Areas reviewed (no defects found)

- **Security.** Passwords hashed with `scrypt` + per-user random salt, compared with
  `timingSafeEqual` (length-guarded). Session tokens are 32 random bytes with enforced
  absolute expiry. Login is rate-limited per IP+email with brute-force lockout and generic
  anti-enumeration error messages. Cookies are `httpOnly` + `secure` (prod) + `sameSite=lax`.
  Authorization is enforced server-side in the admin layout and every mutating API route —
  middleware is only a first-redirect gate (documented awareness of CVE-2025-29927). Full
  security-header suite present (HSTS, `X-Frame-Options: DENY`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`). All DB access goes through Prisma
  (parameterized — no SQL injection). No hardcoded credentials (admin bootstrapped from env).
- **SEO.** `metadataBase`, title template, description, keywords, Open Graph, Twitter cards,
  robots directives, `sitemap.xml`, and `robots.txt` all present; per-page metadata on
  content routes; admin pages set `robots: noindex`.
- **Accessibility.** Icon-only controls carry `aria-label`; images have `alt`; nav uses
  `aria-current`; `role="img"` on decorative image surfaces; RTL (`dir="rtl"`, `lang="ar"`).
- **React correctness.** No hydration hazards — client state (cart, wishlist, profile)
  initializes empty (matching SSR) and hydrates from `localStorage` inside `useEffect`, with
  a `ready` guard so persistence never clobbers storage pre-hydration. Observers/timers in
  `useScrollAnimation` are fully cleaned up; async cart pricing uses an `ignore` race-guard.
- **Hygiene.** No `TODO`/`FIXME`/`@ts-ignore`/`eslint-disable`, no `dangerouslySetInnerHTML`,
  no raw `<img>`, no unreferenced source files, no unused dependencies, no browser-side
  `console` noise. `tsconfig` runs `strict`.

## Fixed

- **postcss advisories (high).** Next's nested `postcss@8.4.31` was flagged
  (GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-r28c-9q8g-f849, GHSA-fxqj-rqcc-2cmp). The
  top-level dependency was already patched; a `"postcss": "$postcss"` override plus bumping
  the direct dev dependency to `^8.5.25` forces every instance to the patched line. This is
  API-stable within postcss 8.x — the build stays green. `npm audit` no longer reports any
  postcss finding.

## Deferred (decision recorded)

- **Next.js core advisories on `14.2.35`.** `14.2.35` is the newest 14.x release; the only
  fix is a **major upgrade to Next 15/16**, which is a breaking change (synchronous
  `cookies()` → `await cookies()` across 6+ call sites, plus Next 15's changed caching
  defaults) that cannot be fully E2E-validated in CI without a live database and browser
  suite. Applicability to *this* app:

  | Advisory | Applies here? |
  | --- | --- |
  | GHSA-955p-x3mx-jcvp (Server Function endpoint disclosure) | No — app uses no Server Actions |
  | GHSA-m99w-x7hq-7vfj (DoS via Server Actions) | No — no Server Actions |
  | GHSA-89xv-2m56-2m9x (SSRF in Server Actions on custom server) | No — no Server Actions, no custom server |
  | GHSA-4c39-4ccg-62r3 (unbounded Server Action payload) | No — no Server Actions |
  | GHSA-36qx-fr4f-26g5 (i18n Pages Router middleware bypass) | No — App Router, no i18n |
  | GHSA-p9j2-gv94-2wf4 (SSRF via rewrites) | No — no `rewrites` configured |
  | GHSA-wfc6-r584-vfw7, GHSA-68g3-v927-f742, GHSA-4633-3j49-mh5q, GHSA-c4j6-fc7j-m34r (cache/SSRF) | Deployment-dependent |

  **Recommended follow-up:** schedule the Next 15 → 16 upgrade as a dedicated, separately
  tested effort (migrate `cookies()`/`params`/`searchParams` to async, review caching
  behavior, run full regression) rather than folding it into an automated audit pass.
