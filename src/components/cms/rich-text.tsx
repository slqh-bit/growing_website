import {
  LinkJSXConverter,
  RichText as LexicalRichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react";
import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** Where an internal link (to a CMS document) points on the public site. */
const docRoutes: Record<string, (slug: string) => string> = {
  services: (slug) => `/services/${slug}`,
  projects: (slug) => `/projects/${slug}`,
  pages: (slug) => (slug === "home" ? "" : `/${slug}`),
};

function converters(locale: Locale): JSXConvertersFunction {
  return ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }) => {
        const doc = linkNode.fields.doc;
        const value = doc?.value;
        const slug = value && typeof value === "object" ? (value as { slug?: string }).slug : undefined;
        const route = doc && slug ? docRoutes[doc.relationTo]?.(slug) : undefined;
        return route === undefined ? `/${locale}` : `/${locale}${route}`;
      },
    }),
  });
}

/** Renders Lexical rich text from the CMS with the site's prose styles. */
export function RichText({
  data,
  locale,
  className,
}: {
  data: unknown;
  locale: Locale;
  className?: string;
}) {
  if (!data || typeof data !== "object" || !("root" in data)) return null;
  return (
    <LexicalRichText
      data={data as SerializedEditorState}
      converters={converters(locale)}
      className={cn("prose-cms", className)}
    />
  );
}
