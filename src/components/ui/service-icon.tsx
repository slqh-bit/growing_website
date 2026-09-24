import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { cn } from "@/lib/utils";

/** A CMS icon inside the branded tile used on service and project cards. */
export function ServiceIcon({
  name,
  className,
  iconClassName,
}: {
  name: string | null | undefined;
  className?: string;
  iconClassName?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-12 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-200",
        className,
      )}
    >
      <DynamicIcon name={name} className={cn("size-6", iconClassName)} />
    </span>
  );
}
