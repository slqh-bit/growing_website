import Image from "next/image";
import type { Media } from "@/payload-types";
import { imageSource, type ImageSize } from "@/lib/cms/media";
import { cn } from "@/lib/utils";

/**
 * next/image for a CMS upload (optimized, lazy by default, localized alt).
 * Renders nothing when the upload is missing, so callers can show a fallback.
 */
export function CmsImage({
  media,
  size,
  sizes,
  className,
  priority = false,
  fill = false,
}: {
  media: number | Media | null | undefined;
  size?: ImageSize;
  /** Responsive `sizes` hint, e.g. "(min-width: 1024px) 33vw, 100vw". */
  sizes?: string;
  className?: string;
  priority?: boolean;
  /** Fill the (relatively positioned) parent instead of intrinsic size. */
  fill?: boolean;
}) {
  const image = imageSource(media, size);
  if (!image) return null;

  return fill ? (
    <Image
      src={image.src}
      alt={image.alt}
      fill
      sizes={sizes ?? "100vw"}
      priority={priority}
      className={cn("object-cover", className)}
    />
  ) : (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className={className}
    />
  );
}
