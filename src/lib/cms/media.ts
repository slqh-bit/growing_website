import type { Media } from "@/payload-types";

export type ImageSize = "thumbnail" | "card" | "hero";

/** A relation field is either an id (depth 0) or the populated document. */
export function populated<T extends object>(value: number | T | null | undefined): T | null {
  return value !== null && typeof value === "object" ? value : null;
}

export interface ImageSource {
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * Resolve an upload to a same-origin image source for next/image.
 * Payload returns absolute URLs when `serverURL` is set; we keep only the path
 * so images stay covered by `images.localPatterns` (/api/media/file/**).
 */
export function imageSource(
  value: number | Media | null | undefined,
  size?: ImageSize,
): ImageSource | null {
  const media = populated(value);
  if (!media) return null;
  const variant = size ? media.sizes?.[size] : undefined;
  const url = variant?.url || media.url;
  const width = (variant?.url && variant.width) || media.width;
  const height = (variant?.url && variant.height) || media.height;
  if (!url || !width || !height) return null;
  return { src: toPath(url), alt: media.alt ?? "", width, height };
}

function toPath(url: string): string {
  try {
    return new URL(url, "http://localhost").pathname;
  } catch {
    return url;
  }
}
