"use client";

import * as React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessible help tooltip for technical terms (HMT, autonomy…).
 * Opens on hover, keyboard focus and tap; Escape or blur closes it.
 * The text is always in the DOM and linked via aria-describedby, so screen
 * readers announce it when the button is focused.
 */
export function InfoTip({ content, label, className }: { content: string; label: string; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  return (
    <span className={cn("relative inline-flex align-middle", className)}>
      <button
        type="button"
        aria-label={label}
        aria-describedby={id}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
        className="inline-flex size-5 items-center justify-center rounded-full text-primary-600 transition-colors hover:bg-primary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:hover:bg-primary-900/50"
      >
        <Info className="size-4" aria-hidden />
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute bottom-full start-0 z-30 mb-2 w-64 max-w-[80vw] rounded-lg bg-foreground px-3 py-2 text-xs font-normal leading-relaxed text-background shadow-lg transition-all duration-150",
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}
