"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface WallItem {
  id: string;
  src: string;
  kind: "logo" | "photo";
  category: string;
  name: string;
}

export interface WallCategory {
  value: string;
  label: string;
}

/** Color coding per category (dot + active filter chip). */
const tones: Record<string, { dot: string; chip: string }> = {
  state: { dot: "bg-sky-500", chip: "border-sky-600 bg-sky-600 text-white" },
  local: { dot: "bg-emerald-500", chip: "border-emerald-600 bg-emerald-600 text-white" },
  health: { dot: "bg-rose-500", chip: "border-rose-600 bg-rose-600 text-white" },
  media: { dot: "bg-violet-500", chip: "border-violet-600 bg-violet-600 text-white" },
  private: { dot: "bg-amber-500", chip: "border-amber-600 bg-amber-600 text-white" },
};
const fallbackTone = { dot: "bg-primary-500", chip: "border-primary-600 bg-primary-600 text-white" };

/** Filterable, color-coded wall of client logos and project photos. */
export function ClientReferencesWall({
  items,
  categories,
  allLabel,
}: {
  items: WallItem[];
  categories: WallCategory[];
  allLabel: string;
}) {
  const [active, setActive] = React.useState("all");
  const counts = new Map<string, number>();
  for (const item of items) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  const visible = active === "all" ? items : items.filter((i) => i.category === active);
  const filters = [{ value: "all", label: allLabel }, ...categories.filter((c) => counts.has(c.value))];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={allLabel}>
        {filters.map((f) => {
          const selected = active === f.value;
          const tone = tones[f.value] ?? fallbackTone;
          return (
            <button
              key={f.value}
              type="button"
              aria-pressed={selected}
              onClick={() => setActive(f.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200",
                selected
                  ? cn(f.value === "all" ? "border-primary-600 bg-primary-600 text-white" : tone.chip, "shadow-sm")
                  : "border-border bg-surface text-foreground hover:-translate-y-0.5 hover:border-primary-300",
              )}
            >
              {f.value !== "all" && (
                <span className={cn("size-2 rounded-full", selected ? "bg-white" : tone.dot)} aria-hidden />
              )}
              {f.label}
              <span className={cn("text-xs tabular-nums", selected ? "text-white/80" : "text-muted-foreground")}>
                {f.value === "all" ? items.length : counts.get(f.value)}
              </span>
            </button>
          );
        })}
      </div>

      <motion.ul layout className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {visible.map((item) => {
            const tone = tones[item.category] ?? fallbackTone;
            return (
              <motion.li
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                title={item.name}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] bg-white">
                  <Image
                    src={item.src}
                    alt={item.name}
                    fill
                    unoptimized
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className={cn(
                      "transition-transform duration-500 group-hover:scale-105",
                      item.kind === "logo" ? "object-contain p-5" : "object-cover",
                    )}
                  />
                </div>
                <div className="flex items-start gap-2 border-t border-border px-3.5 py-3">
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", tone.dot)} aria-hidden />
                  <span className="text-sm font-medium leading-snug text-foreground">{item.name}</span>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </motion.ul>
    </div>
  );
}
