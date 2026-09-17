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
    remotePatterns: [],
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
          // allowance to expose.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
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
