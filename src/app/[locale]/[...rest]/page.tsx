import { notFound } from "next/navigation";

/**
 * Catch-all for unknown paths under a locale (e.g. /fr/does-not-exist).
 * Without it Next.js renders its built-in 404; calling notFound() here renders
 * the localized `[locale]/not-found.tsx` inside the site layout instead.
 */
export default function CatchAllPage() {
  notFound();
}
