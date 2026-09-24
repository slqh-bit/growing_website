"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/**
 * Accessible single-open accordion (FAQ). Pure CSS height animation
 * (grid-template-rows 0fr → 1fr) — no animation library in the bundle — and
 * every answer stays in the server HTML, so search engines index them all.
 * Closed panels are `inert`: hidden from keyboard and assistive tech.
 */
export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.id ?? null);
  const baseId = React.useId();

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((item) => {
        const isOpen = open === item.id;
        const buttonId = `${baseId}-${item.id}-q`;
        const panelId = `${baseId}-${item.id}-a`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-start transition-colors hover:bg-surface-muted"
              >
                <span className="font-semibold text-foreground">{item.question}</span>
                <ChevronDown
                  className={cn(
                    "size-5 shrink-0 text-primary-600 transition-transform duration-300",
                    isOpen && "rotate-180",
                  )}
                  aria-hidden
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              inert={!isOpen}
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-300 ease-in-out",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="whitespace-pre-line px-5 pb-5 text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
