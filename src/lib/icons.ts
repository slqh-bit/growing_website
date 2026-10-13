/**
 * Icon names editors can pick in the CMS. `DynamicIcon` maps each name to a
 * lucide-react component with a `Record<IconName, …>`, so adding a name here
 * without an icon (or vice versa) is a type error.
 */

/** Icons offered for Services and their page sections (solar, security, video analysis & AI, networks, AV, IoT, B2G). */
export const serviceIconNames = [
  "PlugZap",
  "Droplets",
  "BatteryCharging",
  "Cable",
  "Zap",
  "Sun",
  "House",
  "Building2",
  "Factory",
  "Tractor",
  "Lightbulb",
  "RadioTower",
  "Cctv",
  "Siren",
  "Fingerprint",
  "Flame",
  "Network",
  "Router",
  "Wifi",
  "Server",
  "Phone",
  "ScanBarcode",
  "Store",
  "Monitor",
  "Presentation",
  "Tv",
  "ListOrdered",
  "Video",
  "Cpu",
  "Landmark",
  "ScanSearch",
  "BrainCircuit",
] as const;
export type ServiceIconName = (typeof serviceIconNames)[number];

/** Icons offered for Features block items (a superset of the service icons). */
export const featureIconNames = [
  ...serviceIconNames,
  "ShieldCheck",
  "MapPin",
  "Wrench",
  "Headphones",
  "Award",
  "Heart",
  "Eye",
  "UserRound",
  "Briefcase",
  "Newspaper",
] as const;
export type IconName = (typeof featureIconNames)[number];

export function isIconName(name: string | null | undefined): name is IconName {
  return typeof name === "string" && (featureIconNames as readonly string[]).includes(name);
}
