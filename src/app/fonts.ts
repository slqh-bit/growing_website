import localFont from "next/font/local";

/**
 * Latin UI font: Inter (SIL OFL 1.1, see src/assets/fonts/), variable 100–900,
 * Google Fonts' "latin" subset. Self-hosted so builds never need network access
 * (Docker, CI); next/font still preloads it and generates the size-adjusted
 * Arial fallback that prevents layout shift.
 */
export const latin = localFont({
  src: "../assets/fonts/inter-latin-variable.woff2",
  weight: "100 900",
  style: "normal",
  variable: "--font-inter",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

/* The Arabic font is self-hosted (public/fonts + @font-face in globals.css) with a
   unicode-range, so only pages containing Arabic text download it. */
