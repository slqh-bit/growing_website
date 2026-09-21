"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

/** Accessible single-open accordion for the FAQ. */
export function Accordion({ items }: { items: AccordionItemData[] }) {
  const [open, setOpen] = React.useState<string | null>(items[0]?.id ?? null);

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
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
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-muted-foreground">{item.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
