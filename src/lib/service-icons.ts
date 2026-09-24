/**
 * Icon names an editor can pick for a service. `ServiceIcon` maps each name to
 * a lucide-react component with a `Record<ServiceIconName, …>`, so adding a
 * name here without an icon (or vice versa) is a type error.
 */
export const serviceIconNames = ["PlugZap", "Droplets", "BatteryCharging", "Cable", "Zap", "Sun"] as const;
export type ServiceIconName = (typeof serviceIconNames)[number];

export function isServiceIconName(name: string): name is ServiceIconName {
  return (serviceIconNames as readonly string[]).includes(name);
}
