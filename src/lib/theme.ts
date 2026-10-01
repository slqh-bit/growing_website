/**
 * Per-site brand colours (Sites → Thème). An editor picks one primary and one
 * accent colour; the CSS palettes in src/styles/globals.css are built from the
 * colour's hue and saturation (OKLCH) while their lightness steps stay fixed,
 * so text/background contrast (≥ 4.5:1) holds whatever colour is chosen.
 *
 * Dependency-free (used by the Payload field validator and the app).
 */

export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Reference chroma of the -500 shade in globals.css (factor 1 = the Growing palette). */
const REFERENCE_CHROMA = { primary: 0.16, accent: 0.18 } as const;
const MAX_CHROMA_FACTOR = 1.6;

export interface Oklch {
  l: number;
  c: number;
  h: number;
}

/** sRGB hex (#rrggbb) → OKLCH (Björn Ottosson's OKLab). */
export function hexToOklch(hex: string): Oklch {
  const channel = (i: number) => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = [channel(0), channel(1), channel(2)];

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const c = Math.sqrt(A * A + B * B);
  const h = c < 1e-4 ? 0 : ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return { l: L, c, h };
}

const round = (n: number, digits: number) => Number(n.toFixed(digits));

function paletteVars(name: "primary" | "accent", hex: string | null | undefined): Record<string, string> {
  if (!hex || !HEX_COLOR.test(hex)) return {};
  const { c, h } = hexToOklch(hex);
  const factor = Math.min(c / REFERENCE_CHROMA[name], MAX_CHROMA_FACTOR);
  return {
    [`--${name}-h`]: String(round(h, 1)),
    [`--${name}-c`]: String(round(factor, 3)),
  };
}

/**
 * CSS custom properties for a site's theme, set on <html>. Missing or invalid
 * colours fall back to the defaults declared in globals.css.
 */
export function themeVars(theme: { primary?: string | null; accent?: string | null } | null | undefined) {
  return { ...paletteVars("primary", theme?.primary), ...paletteVars("accent", theme?.accent) };
}

/** Default brand hue/intensity (the Growing palette in globals.css). */
const DEFAULT_PRIMARY = { h: 154, c: 1 };

/**
 * A site's own logo colours as explicit CSS colours (same formulas as the
 * primary palette), so its initials badge and wordmark keep their brand
 * colours on another site's pages (group band, "Le groupe" page).
 */
export function brandColors(theme: { primary?: string | null } | null | undefined) {
  const vars = paletteVars("primary", theme?.primary);
  const h = vars["--primary-h"] !== undefined ? Number(vars["--primary-h"]) : DEFAULT_PRIMARY.h;
  const c = vars["--primary-c"] !== undefined ? Number(vars["--primary-c"]) : DEFAULT_PRIMARY.c;
  const shade = (l: number, chroma: number, dh: number) => `oklch(${l} ${round(chroma * c, 3)} ${round(h + dh, 1)})`;
  return {
    markFrom: shade(0.72, 0.16, -1), // primary-400
    markTo: shade(0.51, 0.15, 0), // primary-600
    ink: shade(0.39, 0.1, 3), // primary-800
    inkDark: shade(0.8, 0.14, -2), // primary-300
  };
}

/** OKLCH → sRGB hex, clipped to the sRGB gamut (inverse of hexToOklch). */
export function oklchToHex({ l, c, h }: Oklch): string {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const linear = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return `#${linear
    .map((v) => {
      const x = Math.min(1, Math.max(0, v));
      const srgb = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
      return Math.round(srgb * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
}

const DEFAULT_ACCENT = { h: 82, c: 1 };

/**
 * A site's brand colours as hex (for places without CSS variables: generated
 * share images): primary-600 → primary-800 and accent-500 of its palettes.
 */
export function brandHex(theme: { primary?: string | null; accent?: string | null } | null | undefined) {
  const hue = (name: "primary" | "accent", fallback: { h: number; c: number }) => {
    const vars = paletteVars(name, theme?.[name]);
    return vars[`--${name}-h`] !== undefined
      ? { h: Number(vars[`--${name}-h`]), c: Number(vars[`--${name}-c`]) }
      : fallback;
  };
  const p = hue("primary", DEFAULT_PRIMARY);
  const a = hue("accent", DEFAULT_ACCENT);
  return {
    from: oklchToHex({ l: 0.51, c: 0.15 * p.c, h: p.h }),
    to: oklchToHex({ l: 0.39, c: 0.1 * p.c, h: p.h + 3 }),
    /** primary-400: readable on dark backgrounds. */
    light: oklchToHex({ l: 0.72, c: 0.16 * p.c, h: p.h - 1 }),
    accent: oklchToHex({ l: 0.79, c: 0.18 * a.c, h: a.h }),
  };
}
