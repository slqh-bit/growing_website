import type { Locale } from "@/i18n/routing";
import type { Page } from "@/payload-types";
import {
  ActivityGridBlockView,
  CtaBlockView,
  FaqBlockView,
  FeaturesBlockView,
  HeroBlockView,
  LogosBlockView,
  ProjectsBlockView,
  RichTextBlockView,
  StatsBlockView,
} from "./renderers";

type LayoutBlock = NonNullable<Page["layout"]>[number];

/** Renders a page's `layout` (block builder) in order. */
export function RenderBlocks({ blocks, locale }: { blocks: Page["layout"]; locale: Locale }) {
  if (!blocks?.length) return null;
  return (
    <>
      {blocks.map((block, i) => (
        <BlockView key={block.id ?? i} block={block} locale={locale} />
      ))}
    </>
  );
}

function BlockView({ block, locale }: { block: LayoutBlock; locale: Locale }) {
  switch (block.blockType) {
    case "hero":
      return <HeroBlockView block={block} locale={locale} />;
    case "stats":
      return <StatsBlockView block={block} locale={locale} />;
    case "activityGrid":
      return <ActivityGridBlockView block={block} locale={locale} />;
    case "features":
      return <FeaturesBlockView block={block} locale={locale} />;
    case "projects":
      return <ProjectsBlockView block={block} locale={locale} />;
    case "cta":
      return <CtaBlockView block={block} locale={locale} />;
    case "richText":
      return <RichTextBlockView block={block} locale={locale} />;
    case "logos":
      return <LogosBlockView block={block} locale={locale} />;
    case "faq":
      return <FaqBlockView block={block} locale={locale} />;
    default: {
      // Compile-time exhaustiveness: a new block type must get a renderer.
      const unknown: never = block;
      return unknown;
    }
  }
}
