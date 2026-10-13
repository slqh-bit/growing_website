import { useId } from "react";
import Image from "next/image";
import type { Site } from "@/payload-types";
import { imageSource, type ImageSource } from "@/lib/cms/media";
import { brandColors } from "@/lib/theme";
import { cn } from "@/lib/utils";

/** What the header/footer need to draw a site's logo (serializable for client components). */
export interface Brand {
  name: string;
  monogram: string;
  logo: ImageSource | null;
  logoDark: ImageSource | null;
  /** The uploaded logo is a full lockup: don't write the name next to it. */
  includesName: boolean;
  /** Sites → Marque → Seconde ligne: the full name on line 1, this below ("GROUPE"). */
  subline: string | null;
  /** The site's own colours: its logo looks the same on any site of the group. */
  colors: ReturnType<typeof brandColors>;
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
  const colors = brandColors(site.theme);
  // The group's badge blends both brands: from its primary to its accent colour.
  if (site.key === "group" && site.theme?.accent) colors.markTo = brandColors({ primary: site.theme.accent }).markTo;
  return {
    name: site.companyName,
    monogram: site.monogram?.trim() || initials(site.companyName),
    logo,
    logoDark: logo ? imageSource(site.logoDark) : null,
    includesName: Boolean(logo && site.logoIncludesName),
    subline: site.logoSubline?.trim() || null,
    colors,
  };
}

/** Initials badge in the site's primary colours — used when no logo is uploaded. */
export function LogoMark({
  monogram,
  colors,
  className,
}: {
  monogram: string;
  colors: Brand["colors"];
  className?: string;
}) {
  // Unique per instance: the logo renders in both header and footer.
  const gradientId = useId();
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" style={{ stopColor: colors.markFrom }} />
          <stop offset="1" style={{ stopColor: colors.markTo }} />
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

/** 36px tall — less for a wide lockup (a wordmark), so it stays about 150px wide. */
function fitHeight(image: ImageSource, maxHeight = 36, maxWidth = 150): number {
  return Math.min(maxHeight, Math.max(22, Math.round((maxWidth * image.height) / image.width)));
}

function LogoImage({ image, className }: { image: ImageSource; className?: string }) {
  const height = fitHeight(image);
  return (
    <Image
      src={image.src}
      alt=""
      width={Math.round((image.width / image.height) * height)}
      height={height}
      priority
      style={{ height }}
      className={cn("w-auto shrink-0 object-contain", className)}
    />
  );
}

/**
 * Large standalone mark (hero panel, on the brand gradient): the initials
 * badge, the uploaded logo, or — for a full lockup with the name — the logo
 * on a white tile so dark lettering stays readable.
 */
export function BrandMark({ brand }: { brand: Brand }) {
  if (!brand.logo) {
    return (
      <LogoMark monogram={brand.monogram} colors={brand.colors} className="size-20 rounded-2xl shadow-lg ring-1 ring-white/30" />
    );
  }
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
  const height = fitHeight(brand.logo, 56, 220);
  return (
    <span className="inline-flex h-20 min-w-20 items-center justify-center rounded-2xl bg-white px-5 py-3 shadow-lg ring-1 ring-white/30">
      <Image
        src={brand.logo.src}
        alt=""
        width={Math.round((brand.logo.width / brand.logo.height) * height)}
        height={height}
        style={{ height }}
        className="w-auto object-contain"
      />
    </span>
  );
}

/**
 * Site logo: the uploaded image (with its dark-mode variant) or the initials
 * badge, followed by the two-line wordmark ("GROWING / TECHNOLOGIES") unless
 * the logo already contains the name.
 */
export function Logo({
  brand,
  className,
  tone = "default",
}: {
  brand: Brand;
  className?: string;
  /**
   * "default" follows the theme. On a background that doesn't: "light" (white
   * wordmark, dark-mode logo) for a dark one, "dark" for a white one.
   */
  tone?: "default" | "light" | "dark";
}) {
  const [firstWord, ...rest] = brand.name.trim().split(/\s+/);
  const first = brand.subline ? brand.name.trim() : firstWord;
  const second = brand.subline ?? rest.join(" ");
  return (
    <span
      className={cn("inline-flex max-w-full min-w-0 items-center gap-2.5", className)}
      dir="ltr"
      style={{ "--logo-ink": brand.colors.ink, "--logo-ink-dark": brand.colors.inkDark } as React.CSSProperties}
    >
      {brand.logo ? (
        tone === "default" ? (
          <>
            <LogoImage image={brand.logo} className={brand.logoDark ? "dark:hidden" : undefined} />
            {brand.logoDark && <LogoImage image={brand.logoDark} className="hidden dark:block" />}
          </>
        ) : (
          <LogoImage image={(tone === "light" && brand.logoDark) || brand.logo} />
        )
      ) : (
        <LogoMark monogram={brand.monogram} colors={brand.colors} />
      )}
      {brand.includesName ? (
        <span className="sr-only">{brand.name}</span>
      ) : (
        <span className="flex min-w-0 flex-col uppercase leading-none">
          <span className="sr-only">{brand.name}</span>
          <span
            aria-hidden
            className={cn(
              "truncate text-[17px] font-extrabold tracking-wide",
              // A long name ("HIKVIEW × GROWING") is set smaller on narrow phones.
              (first?.length ?? 0) > 12 && "max-[399px]:text-[15px] max-[399px]:tracking-normal",
              tone === "light" && "text-white",
              tone === "dark" && "text-[var(--logo-ink)]",
              tone === "default" && "text-[var(--logo-ink)] dark:text-[var(--logo-ink-dark)]",
            )}
          >
            {first}
          </span>
          {second && (
            <span
              aria-hidden
              className={cn(
                "mt-0.5 text-[10.5px] font-semibold tracking-[0.12em]",
                tone === "light" ? "text-white/70" : tone === "dark" ? "text-black/70" : "text-foreground/75",
              )}
            >
              {second}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
