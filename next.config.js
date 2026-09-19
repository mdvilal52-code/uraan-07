/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // AVIF intentionally omitted: next@14.2.35 is affected by a critical
    // unauthenticated RCE in the AVIF decode path (libheif via sharp —
    // GHSA-2xp9-vwfh-vxw4), only patched in next@15.5.24+/16.3.3+. Disabling
    // AVIF optimization is the Next.js team's own interim mitigation until
    // this app can take that (breaking, async cookies()/headers()) upgrade.
    formats: ["image/webp"],
    // Uploaded product/banner photos live in Supabase Storage (see
    // lib/storage.ts) — a wildcard subdomain pattern rather than one fixed
    // project ref, so this doesn't silently break if the project changes.
    // Nothing else is allowed: local /public/images stays the only other
    // source.
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
    // Product art rarely changes — let optimized variants live in the CDN
    // cache for 31 days instead of the 60s default (fewer re-optimizations,
    // faster repeat loads).
    minimumCacheTTL: 2678400,
    // Local, self-authored SVG product art lives in /public/images.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async headers() {
    return [
      {
        // Static product/collection art under /public/images — cache hard.
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2678400, stale-while-revalidate=86400",
          },
        ],
      },
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // App-wide CSP. script-src/style-src need 'unsafe-inline' because
          // the App Router streams un-nonced inline RSC-hydration <script>
          // tags and next/font injects inline @font-face <style> tags —
          // nonce-based CSP would need new per-request middleware plumbing.
          // Everything else is locked to 'self'/'none': no third-party
          // scripts, fonts, or embeds exist in this app, and there's no
          // dangerouslySetInnerHTML anywhere for the residual inline-script
          // allowance to expose. 'unsafe-eval' is added to script-src only
          // in development: Next's dev-mode Fast Refresh/HMR client uses
          // eval() internally, and without it the whole client bundle throws
          // on load (breaking hydration on every page) — production builds
          // don't need or get it.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${
                process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"
              }`,
              "style-src 'self' 'unsafe-inline'",
              // https://*.supabase.co: uploaded product/banner photos —
              // matches the next/image remotePatterns entry above.
              "img-src 'self' data: https://*.supabase.co",
              "font-src 'self' data:",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
