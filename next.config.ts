import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Payload serves uploads from /api/media/file/<filename>.
    localPatterns: [{ pathname: "/api/media/file/**" }],
  },
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

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false });
