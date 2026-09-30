import createMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { isSiteKey, normalizeHost } from "./sites/config";

const handleI18nRouting = createMiddleware(routing);

/** Development only: `?site=hikview` previews a site on plain localhost (remembered in a cookie). */
const SITE_PREVIEW_COOKIE = "site-preview";
const allowSitePreview = process.env.NODE_ENV !== "production";

/**
 * 1. Locale detection / redirects (next-intl): `/` → `/fr`, …
 * 2. Multi-site: every localized URL is rewritten internally to
 *    `/<hostname>/<locale>/…` (app/(frontend)/[domain]/[locale]), so each
 *    domain gets its own statically cached pages. The page resolves which
 *    site the hostname belongs to from the domains set in the admin
 *    (src/lib/site.ts). Browser URLs never change.
 */
export default function middleware(request: NextRequest) {
  let host = normalizeHost(request.headers.get("host"));

  const previewParam = allowSitePreview ? request.nextUrl.searchParams.get("site") : null;
  if (allowSitePreview) {
    const preview = previewParam ?? request.cookies.get(SITE_PREVIEW_COOKIE)?.value;
    if (preview && isSiteKey(preview)) host = `${preview}.localhost`;
  }

  const response = handleI18nRouting(request);

  const rewrite = response.headers.get("x-middleware-rewrite");
  if (rewrite) {
    const url = new URL(rewrite);
    url.pathname = `/${host}${url.pathname}`;
    response.headers.set("x-middleware-rewrite", url.toString());
  }

  if (previewParam !== null) {
    if (isSiteKey(previewParam)) response.cookies.set(SITE_PREVIEW_COOKIE, previewParam, { path: "/", sameSite: "lax" });
    else response.cookies.delete(SITE_PREVIEW_COOKIE); // ?site= (empty/unknown) clears the preview
  }
  return response;
}

export const config = {
  // Match all pathnames except:
  //  - /api, /_next, /_vercel
  //  - the Payload admin and its API
  //  - anything containing a dot (static files: images, fonts, favicon, …)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
