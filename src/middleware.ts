import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except:
  //  - /api, /_next, /_vercel
  //  - the Payload admin (Phase 1) and its API
  //  - anything containing a dot (static files: images, fonts, favicon, …)
  matcher: ["/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
