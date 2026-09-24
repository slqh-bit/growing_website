import { Inter, IBM_Plex_Sans_Arabic } from "next/font/google";

/** Latin UI font. */
export const latin = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/** Arabic-capable font, loaded for the RTL locale. */
export const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});
