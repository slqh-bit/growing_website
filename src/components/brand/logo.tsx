import { Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteSettings } from "@/content/site";

/** Wordmark + sun glyph. Replace the glyph with the brand SVG when available. */
export function Logo({
  className,
  showText = true,
}: {
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
          <span className="text-base font-bold tracking-tight text-foreground">
            {siteSettings.companyName}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-primary-600">
            Solar &amp; Electrical
          </span>
        </span>
      )}
    </span>
  );
}
