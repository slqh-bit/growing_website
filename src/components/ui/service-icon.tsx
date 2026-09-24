import { PlugZap, Droplets, BatteryCharging, Cable, Zap, Sun, type LucideIcon } from "lucide-react";
import { isServiceIconName, type ServiceIconName } from "@/lib/service-icons";
import { cn } from "@/lib/utils";

/** Must cover every name the CMS offers (see src/lib/service-icons.ts). */
const iconMap: Record<ServiceIconName, LucideIcon> = {
  PlugZap,
  Droplets,
  BatteryCharging,
  Cable,
  Zap,
  Sun,
};

/** Renders a service's lucide icon by name inside a branded tile. */
export function ServiceIcon({
  name,
  className,
  iconClassName,
}: {
  name: string;
  className?: string;
  iconClassName?: string;
}) {
  const Icon = isServiceIconName(name) ? iconMap[name] : Sun;
  return (
    <span
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200",
        className,
      )}
    >
      <Icon className={cn("size-6", iconClassName)} aria-hidden />
    </span>
  );
}
