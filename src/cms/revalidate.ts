import { revalidateTag } from "next/cache";
import { after } from "next/server";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
  RequestContext,
} from "payload";

/**
 * Cache tag of a collection or global. Every cached query in src/lib/cms lists
 * the tags of all data it reads (including populated relations and media), so
 * revalidating one tag refreshes exactly the pages that show that data.
 */
export const cmsTag = (slug: string) => `cms:${slug}`;

function schedule(tag: string, req: PayloadRequest, context: RequestContext) {
  // Seed / scripts pass `context: { disableRevalidate: true }`.
  if (context.disableRevalidate) return;
  try {
    // `after` runs once the response is sent — i.e. after Payload committed the
    // DB transaction — so a concurrent request can't re-cache the old data.
    after(() => revalidateTag(tag));
  } catch {
    // Outside a Next.js request (Payload CLI): this process has no page cache.
    req.payload.logger.debug(`Skipped revalidation of "${tag}" (no request scope).`);
  }
}

/** afterChange + afterDelete hooks that revalidate `cms:<slug>`. */
export function revalidateCollection(slug: string): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} {
  return {
    afterChange: [
      ({ doc, req, context }) => {
        schedule(cmsTag(slug), req, context);
        return doc;
      },
    ],
    afterDelete: [
      ({ doc, req, context }) => {
        schedule(cmsTag(slug), req, context);
        return doc;
      },
    ],
  };
}

export function revalidateGlobal(slug: string): GlobalAfterChangeHook[] {
  return [
    ({ doc, req, context }) => {
      schedule(cmsTag(slug), req, context);
      return doc;
    },
  ];
}
