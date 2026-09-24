import {
  Award,
  BatteryCharging,
  Cable,
  Droplets,
  Eye,
  Headphones,
  Heart,
  MapPin,
  PlugZap,
  ShieldCheck,
  Sun,
  Wrench,
  Zap,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { isIconName, type IconName } from "@/lib/icons";

/** Must cover every name the CMS offers (see src/lib/icons.ts). */
const iconMap: Record<IconName, LucideIcon> = {
  PlugZap,
  Droplets,
  BatteryCharging,
  Cable,
  Zap,
  Sun,
  ShieldCheck,
  MapPin,
  Wrench,
  Headphones,
  Award,
  Heart,
  Eye,
};

/** Renders a CMS-selected icon by name; unknown names fall back to the sun. */
export function DynamicIcon({
  name,
  ...props
}: { name: string | null | undefined } & Omit<LucideProps, "name">) {
  const Icon = isIconName(name) ? iconMap[name] : Sun;
  return <Icon aria-hidden {...props} />;
}
