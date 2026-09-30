"use client";

import { useEffect } from "react";

/**
 * Lands on `#anchor` once the page has fully loaded. The browser's own jump
 * happens while the page is still streaming / images are loading, so a link
 * like /services/installation-raccordee#industriel (e.g. from a redirect)
 * could stop short of its section.
 */
export function ScrollToHash() {
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const go = () => document.getElementById(id)?.scrollIntoView({ block: "start" });
    if (document.readyState === "complete") {
      requestAnimationFrame(go);
      return;
    }
    window.addEventListener("load", go, { once: true });
    return () => window.removeEventListener("load", go);
  }, []);
  return null;
}
