import { Inter } from "next/font/google";

/** Latin UI font. */
export const latin = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/* The Arabic font is self-hosted (public/fonts + @font-face in globals.css) with a
   unicode-range, so only pages containing Arabic text download it. */
