import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";

/** Wordmark + sun glyph. `name` comes from Site settings (companyName). */
export function Logo({
  name,
  className,
  showText = true,
}: {
  name: string;
  className?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="bg-solar inline-flex size-9 items-center justify-center rounded-lg text-white shadow-sm">
        <Sun className="size-5" aria-hidden />
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className="text-base font-bold tracking-tight text-foreground">{name}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary-700 dark:text-primary-300" dir="ltr">
            Solar &amp; Electrical
          </span>
        </span>
      )}
    </span>
  );
}
