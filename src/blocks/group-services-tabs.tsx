"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { DynamicIcon } from "@/components/ui/dynamic-icon";
import { cn } from "@/lib/utils";

export interface CompanyServices {
  key: string;
  name: string;
  colors: { from: string; to: string };
  services: { id: number; title: string; description: string; icon: string; href: string | null }[];
}

/**
 * "Services by company" tabs (group site): one tab per company, its
 * activities as cards linking to their page on that company's site.
 */
export function GroupServicesTabs({ companies }: { companies: CompanyServices[] }) {
  const [active, setActive] = React.useState(0);
  const tabsId = React.useId();
  const current = companies[active];
  if (!current) return null;

  // Arrow keys move between tabs (WAI-ARIA tabs pattern).
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const rtl = getComputedStyle(e.currentTarget).direction === "rtl";
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (active + step + companies.length) % companies.length;
    setActive(next);
    document.getElementById(`${tabsId}-tab-${next}`)?.focus();
  }

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="bg-surface-muted inline-flex max-w-full flex-wrap gap-1 rounded-full p-1.5"
      >
        {companies.map((c, i) => {
          const selected = i === active;
          return (
            <button
              key={c.key}
              id={`${tabsId}-tab-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${tabsId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={cn(
                "focus-visible:ring-ring rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 focus-visible:ring-2 focus-visible:outline-none",
                selected ? "text-white shadow-md" : "text-muted-foreground hover:text-foreground",
              )}
              style={
                selected
                  ? { backgroundImage: `linear-gradient(135deg, ${c.colors.from}, ${c.colors.to})` }
                  : undefined
              }
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <div
        id={`${tabsId}-panel`}
        role="tabpanel"
        aria-labelledby={`${tabsId}-tab-${active}`}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {current.services.map((s, i) => {
          const card = (
            <div
              className="rise-in border-border bg-surface-muted/40 group-hover:bg-surface flex h-full flex-col gap-3 rounded-2xl border p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span
                className="inline-flex size-11 items-center justify-center rounded-xl text-white"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${current.colors.from}, ${current.colors.to})`,
                }}
              >
                <DynamicIcon name={s.icon} className="size-5" />
              </span>
              <h3 className="text-foreground font-semibold">{s.title}</h3>
              <p className="text-muted-foreground text-sm">{s.description}</p>
              {s.href && (
                <span className="text-brand mt-auto inline-flex items-center gap-1 pt-1 text-sm font-semibold">
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                    aria-hidden
                  />
                </span>
              )}
            </div>
          );
          return s.href ? (
            <a
              key={`${current.key}-${s.id}`}
              href={s.href}
              className="group focus-visible:ring-ring block rounded-2xl focus-visible:ring-2 focus-visible:outline-none"
            >
              {card}
            </a>
          ) : (
            <div key={`${current.key}-${s.id}`} className="group">
              {card}
            </div>
          );
        })}
      </div>
    </div>
  );
}
