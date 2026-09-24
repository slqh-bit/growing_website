import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Self-contained server bundle for the Docker image (set in the Dockerfile).
  ...(process.env.NEXT_OUTPUT === "standalone" && { output: "standalone" as const }),
  images: {
    // Payload serves uploads from /api/media/file/<filename>.
    localPatterns: [{ pathname: "/api/media/file/**" }],
  },
  // Security headers for every response (HSTS is set by Caddy, HTTPS only).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
      {
        // Versioned file names (…-v15.woff2): safe to cache forever.
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Payload ships ESM that imports `.js` paths which resolve to TS sources.
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };
    return webpackConfig;
  },
};

const config = withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });

/**
 * withPayload adds `Critical-CH: Sec-CH-Prefers-Color-Scheme` to every route so
 * the admin can pick its theme on the server. On the public site that makes
 * Chrome discard the first response and re-request the page (one extra round
 * trip on every first visit — ~600 ms on mobile). Keep it for /admin only.
 */
const payloadHeaders = config.headers;
config.headers = async () =>
  ((await payloadHeaders?.()) ?? []).map((rule) =>
    rule.headers.some((h) => h.key === "Critical-CH") ? { ...rule, source: "/admin/:path*" } : rule,
  );

export default config;
