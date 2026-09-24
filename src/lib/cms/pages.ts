import type { Page } from "@/payload-types";

type LayoutBlock = NonNullable<Page["layout"]>[number];

/** Page slugs served by dedicated routes, never by the generic /[slug] route. */
export const RESERVED_PAGE_SLUGS = new Set(["home"]);

/** Default meta description: the subtitle of the page's first hero block. */
export function firstHeroSubtitle(page: Page | null): string | undefined {
  const hero = page?.layout?.find((b) => b.blockType === "hero");
  return (hero?.blockType === "hero" && hero.subtitle) || undefined;
}

/**
 * Split off a trailing CTA block so a route can insert its own section
 * (e.g. About's legal facts) just before the closing call to action.
 */
export function splitTrailingCta(layout: Page["layout"]): [LayoutBlock[], LayoutBlock[]] {
  const blocks = layout ?? [];
  const last = blocks.at(-1);
  return last?.blockType === "cta" ? [blocks.slice(0, -1), [last]] : [blocks, []];
}
