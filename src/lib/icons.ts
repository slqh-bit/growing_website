/**
 * Icon names editors can pick in the CMS. `DynamicIcon` maps each name to a
 * lucide-react component with a `Record<IconName, …>`, so adding a name here
 * without an icon (or vice versa) is a type error.
 */

/** Icons offered for Services. */
export const serviceIconNames = ["PlugZap", "Droplets", "BatteryCharging", "Cable", "Zap", "Sun"] as const;
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
] as const;
export type IconName = (typeof featureIconNames)[number];

export function isIconName(name: string | null | undefined): name is IconName {
  return typeof name === "string" && (featureIconNames as readonly string[]).includes(name);
}
