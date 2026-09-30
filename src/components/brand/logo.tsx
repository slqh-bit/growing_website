import { useId } from "react";
import Image from "next/image";
import type { Site } from "@/payload-types";
import { imageSource, type ImageSource } from "@/lib/cms/media";
import { cn } from "@/lib/utils";

/** What the header/footer need to draw a site's logo (serializable for client components). */
export interface Brand {
  name: string;
  monogram: string;
  logo: ImageSource | null;
  logoDark: ImageSource | null;
  /** The uploaded logo is a full lockup: don't write the name next to it. */
  includesName: boolean;
}

/** "Hikview Engineering" → "HE". */
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0] ?? "")
    .join("")
    .toUpperCase();
}

/** Site (Sites → Marque) → Brand. */
export function brandOf(site: Site): Brand {
  const logo = imageSource(site.logo);
  return {
    name: site.companyName,
    monogram: site.monogram?.trim() || initials(site.companyName),
    logo,
    logoDark: logo ? imageSource(site.logoDark) : null,
    includesName: Boolean(logo && site.logoIncludesName),
  };
}

/** Initials badge in the site's primary colours — used when no logo is uploaded. */
export function LogoMark({ monogram, className }: { monogram: string; className?: string }) {
  // Unique per instance: the logo renders in both header and footer.
  const gradientId = useId();
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: "var(--color-primary-400)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-primary-600)" }} />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill={`url(#${gradientId})`} />
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize={monogram.length > 2 ? 26 : 34}
        fontWeight="800"
        letterSpacing="-1"
      >
        {monogram}
      </text>
    </svg>
  );
}

function LogoImage({ image, className }: { image: ImageSource; className?: string }) {
  // Fixed height, natural width (a square badge or a wide lockup).
  const width = Math.round((image.width / image.height) * 36);
  return (
    <Image
      src={image.src}
      alt=""
      width={width}
      height={36}
      priority
      className={cn("h-9 w-auto shrink-0 object-contain", className)}
    />
  );
}

/**
 * Large standalone mark (hero panel, on the brand gradient): the initials
 * badge, the uploaded logo, or — for a full lockup with the name — the logo
 * on a white tile so dark lettering stays readable.
 */
export function BrandMark({ brand }: { brand: Brand }) {
  if (!brand.logo) return <LogoMark monogram={brand.monogram} className="size-20 rounded-2xl shadow-lg ring-1 ring-white/30" />;
  if (!brand.includesName) {
    return (
      <Image
        src={brand.logo.src}
        alt=""
        width={Math.round((brand.logo.width / brand.logo.height) * 80)}
        height={80}
        className="h-20 w-auto rounded-2xl object-contain shadow-lg"
      />
    );
  }
  return (
    <span className="inline-flex h-20 min-w-20 items-center justify-center rounded-2xl bg-white p-3 shadow-lg ring-1 ring-white/30">
      <Image
        src={brand.logo.src}
        alt=""
        width={Math.round((brand.logo.width / brand.logo.height) * 56)}
        height={56}
        className="h-14 w-auto object-contain"
      />
    </span>
  );
}

/**
 * Site logo: the uploaded image (with its dark-mode variant) or the initials
 * badge, followed by the two-line wordmark ("GROWING / TECHNOLOGIES") unless
 * the logo already contains the name.
 */
export function Logo({ brand, className }: { brand: Brand; className?: string }) {
  const [first, ...rest] = brand.name.trim().split(/\s+/);
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      {brand.logo ? (
        <>
          <LogoImage image={brand.logo} className={brand.logoDark ? "dark:hidden" : undefined} />
          {brand.logoDark && <LogoImage image={brand.logoDark} className="hidden dark:block" />}
        </>
      ) : (
        <LogoMark monogram={brand.monogram} />
      )}
      {brand.includesName ? (
        <span className="sr-only">{brand.name}</span>
      ) : (
        <span className="flex flex-col uppercase leading-none">
          <span className="sr-only">{brand.name}</span>
          <span aria-hidden className="text-[17px] font-extrabold tracking-wide text-primary-800 dark:text-primary-300">
            {first}
          </span>
          {rest.length > 0 && (
            <span aria-hidden className="mt-0.5 text-[10.5px] font-semibold tracking-[0.12em] text-foreground/75">
              {rest.join(" ")}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
