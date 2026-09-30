import type { Locale } from "@/i18n/routing";
import type { Page } from "@/payload-types";
import type { SiteKey } from "@/sites/config";
import {
  ActivityGridBlockView,
  CtaBlockView,
  FaqBlockView,
  FeaturesBlockView,
  HeroBlockView,
  LogosBlockView,
  PartnersBlockView,
  ProjectsBlockView,
  RichTextBlockView,
  StatsBlockView,
} from "./renderers";

type LayoutBlock = NonNullable<Page["layout"]>[number];

/** Renders a page's `layout` (block builder) in order. */
export function RenderBlocks({ blocks, locale, site }: { blocks: Page["layout"]; locale: Locale; site: SiteKey }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={block.id ?? i} block={block} locale={locale} site={site} />
      ))}
    </>
  );
}

function BlockView({ block, locale, site }: { block: LayoutBlock; locale: Locale; site: SiteKey }) {
  switch (block.blockType) {
    case "hero":
      return <HeroBlockView block={block} locale={locale} site={site} />;
    case "stats":
      return <StatsBlockView block={block} locale={locale} site={site} />;
    case "activityGrid":
      return <ActivityGridBlockView block={block} locale={locale} site={site} />;
    case "features":
      return <FeaturesBlockView block={block} locale={locale} site={site} />;
    case "projects":
      return <ProjectsBlockView block={block} locale={locale} site={site} />;
    case "cta":
      return <CtaBlockView block={block} locale={locale} site={site} />;
    case "richText":
      return <RichTextBlockView block={block} locale={locale} site={site} />;
    case "logos":
      return <LogosBlockView block={block} locale={locale} site={site} />;
    case "partners":
      return <PartnersBlockView block={block} locale={locale} site={site} />;
    case "faq":
      return <FaqBlockView block={block} locale={locale} site={site} />;
    default: {
      // Compile-time exhaustiveness: a new block type must get a renderer.
      const unknown: never = block;
      return unknown;
    }
  }
}
