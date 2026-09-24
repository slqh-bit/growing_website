"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface RevealGroupContextValue {
  ref: React.RefObject<HTMLDivElement | null>;
  stagger: number;
}

const RevealGroupContext = React.createContext<RevealGroupContextValue | null>(null);

/** Cap the stagger so late grid items don't wait too long. */
const MAX_STAGGER_STEPS = 6;

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay in seconds, added to any stagger from a parent `RevealGroup`. */
  delay?: number;
  /**
   * Animate on first paint with pure CSS instead of waiting for scroll.
   * Use for above-the-fold content so it never depends on hydration.
   */
  immediate?: boolean;
}

/**
 * Fade + rise into view. Server HTML is fully visible: content is only hidden
 * once the head script sets `<html data-js>`, and reduced-motion users get no
 * movement (see globals.css).
 */
export function Reveal({
  children,
  className,
  style,
  delay = 0,
  immediate = false,
  ...props
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const group = React.useContext(RevealGroupContext);
  const [visible, setVisible] = React.useState(false);
  const [staggerDelay, setStaggerDelay] = React.useState(0);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || immediate) return;

    const container = group?.ref.current;
    if (container) {
      const index = Array.prototype.indexOf.call(container.children, el);
      if (index > 0) setStaggerDelay(Math.min(index, MAX_STAGGER_STEPS) * group.stagger);
    }

    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [group, immediate]);

  return (
    <div
      ref={ref}
      className={cn(immediate ? "reveal-now" : "reveal", className)}
      data-visible={visible || undefined}
      style={{ "--reveal-delay": `${delay + staggerDelay}s`, ...style } as React.CSSProperties}
      {...props}
    >
      {children}
    </div>
  );
}

/** Staggers its direct `Reveal` children by their position in the group. */
export function RevealGroup({
  children,
  className,
  stagger = 0.08,
}: {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const value = React.useMemo(() => ({ ref, stagger }), [stagger]);

  return (
    <RevealGroupContext.Provider value={value}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </RevealGroupContext.Provider>
  );
}
