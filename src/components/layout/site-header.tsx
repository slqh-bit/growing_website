"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Menu, X, ArrowRight, ListChecks } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo, type Brand } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface HeaderNavItem {
  label: string;
  href: string;
  comingSoon?: boolean | null;
}

/** Sticky header. Menu items come from the CMS Navigation global. */
export function SiteHeader({ items, brand }: { items: HeaderNavItem[]; brand: Brand }) {
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/85 shadow-sm backdrop-blur-md"
          : "border-transparent bg-background/60 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <Logo brand={brand} />
        </Link>

        {/* Desktop nav — from xl only: the French labels plus the actions need the
            whole max-w-6xl container (at lg, a 1024px window leaves ~960px). */}
        <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary">
          {items.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "relative whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "text-brand"
                  : "text-foreground/80 hover:text-foreground",
              )}
            >
              <span className="inline-flex items-center gap-1.5">
                {item.label}
                {item.comingSoon && (
                  <Badge variant="outline" className="px-1.5 py-0 text-[9px]">
                    {tc("comingSoon")}
                  </Badge>
                )}
              </span>
              {isActive(item.href) && (
                <span className="absolute inset-x-2.5 -bottom-px h-0.5 rounded-full bg-primary-600" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
          <LanguageSwitcher />
          {/* Labelled while the menu is collapsed; icon-only next to it (xl), where the label doesn't fit in French. */}
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex">
            <Link href="/suivi" aria-label={tc("trackRequest")} title={tc("trackRequest")}>
              <ListChecks className="size-4" aria-hidden />
              <span className="xl:hidden">{tc("trackRequest")}</span>
            </Link>
          </Button>
          <Button asChild variant="solar" size="sm" className="hidden md:inline-flex">
            <Link href="/devis">
              {tc("requestQuote")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
          </Button>

          {/* Mobile toggle */}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 xl:hidden",
          open ? "max-h-[32rem]" : "max-h-0 border-t-0",
        )}
      >
        <nav className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
          {items.map((item) => (
            <Link
              key={`${item.href}-${item.label}`}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-100"
                  : "text-foreground hover:bg-surface-muted",
              )}
            >
              {item.label}
              {item.comingSoon && (
                <Badge variant="outline" className="text-[9px]">
                  {tc("comingSoon")}
                </Badge>
              )}
            </Link>
          ))}
          <Button asChild variant="outline" className="mt-2">
            <Link href="/suivi">
              <ListChecks className="size-4" aria-hidden />
              {tc("trackRequest")}
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button asChild variant="solar" className="flex-1">
              <Link href="/devis">{tc("requestQuote")}</Link>
            </Button>
            <ThemeToggle className="border border-border" />
          </div>
        </nav>
      </div>
    </header>
  );
}
