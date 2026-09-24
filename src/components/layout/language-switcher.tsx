"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, Check, ChevronDown } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeNames, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const localeShort: Record<Locale, string> = {
  fr: "FR",
  ar: "ع",
  en: "EN",
};

/** Language switcher that preserves the current path and swaps only the locale. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const active = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === active) return;
    // `pathname` from next-intl is the resolved, locale-agnostic path; the
    // router re-prefixes it with the chosen locale. Query and hash are read
    // at click time (useSearchParams would force a Suspense boundary on every
    // statically rendered page). `push` keeps the previous language in history.
    const { search, hash } = window.location;
    router.push(`${pathname}${search}${hash}`, { locale: next });
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Globe className="size-4" aria-hidden />
        <span className="sr-only">{t("switchLanguage")}:</span>
        <span className="min-w-5 text-center">{localeShort[active]}</span>
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute end-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-lg"
        >
          {locales.map((loc) => (
            <li key={loc}>
              <button
                type="button"
                role="option"
                aria-selected={loc === active}
                onClick={() => switchTo(loc)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-surface-muted",
                  loc === active ? "font-semibold text-brand" : "text-foreground",
                )}
              >
                <span dir={loc === "ar" ? "rtl" : "ltr"}>{localeNames[loc]}</span>
                {loc === active && <Check className="size-4" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
