import type { SiteKey } from "../../src/sites/config";

/**
 * Redirects of retired URLs (plan §4.1): the former "Basse tension" and
 * "Moyenne tension" pages are sections of "Installations raccordées" now.
 */
export const redirects: { site: SiteKey; from: string; to: string }[] = [
  { site: "growing", from: "/services/basse-tension", to: "/services/installation-raccordee#commercial" },
  { site: "growing", from: "/services/moyenne-tension", to: "/services/installation-raccordee#industriel" },
];
