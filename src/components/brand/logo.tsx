import { useId } from "react";
import { cn } from "@/lib/utils";

/** "GT" badge — vector version of the brand logo (also src/app/icon.svg). */
export function LogoMark({ className }: { className?: string }) {
  // Unique per instance: the logo renders in both header and footer.
  const gradientId = useId();
  return (
    <svg viewBox="0 0 64 64" className={cn("size-9 shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a8d45e" />
          <stop offset="1" stopColor="#74b84c" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="12" fill={`url(#${gradientId})`} />
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fill="#fff"
        fontFamily="Inter, Arial, Helvetica, sans-serif"
        fontSize="34"
        fontWeight="800"
        letterSpacing="-1"
      >
        GT
      </text>
    </svg>
  );
}

/**
 * Brand logo: GT badge + two-line wordmark ("GROWING / TECHNOLOGIES").
 * `name` comes from Site settings (companyName); its first word is the top line.
 */
export function Logo({
  name,
  className,
  showText = true,
}: {
  name: string;
  className?: string;
  showText?: boolean;
}) {
  const [first, ...rest] = name.trim().split(/\s+/);
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} dir="ltr">
      <LogoMark />
      {showText && (
        <span className="flex flex-col uppercase leading-none">
          <span className="sr-only">{name}</span>
          <span aria-hidden className="text-[17px] font-extrabold tracking-wide text-[#2d6a3e] dark:text-[#a8d45e]">
            {first}
          </span>
          {rest.length > 0 && (
            <span aria-hidden className="mt-0.5 text-[10.5px] font-semibold tracking-[0.12em] text-[#33503d] dark:text-[#d3e4c8]">
              {rest.join(" ")}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
