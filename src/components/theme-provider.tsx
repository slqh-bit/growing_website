"use client";

import * as React from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  /** `null` until the client has read the theme applied by the init script. */
  theme: Theme | null;
  toggleTheme: () => void;
}

declare global {
  interface Window {
    __gtHydrated?: boolean;
  }
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "gt-theme";
const DARK_QUERY = "(prefers-color-scheme: dark)";

/**
 * Light/dark theme provider. The init script (see `initScript`) applies the
 * theme before first paint; this provider only reads it back, so hydration
 * never flips the page to light. A theme is persisted only when the user
 * toggles it — otherwise the site keeps following the OS preference.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme | null>(null);

  React.useEffect(() => {
    window.__gtHydrated = true;
    setTheme(readAppliedTheme());

    const media = window.matchMedia(DARK_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      if (safeGet(STORAGE_KEY)) return; // explicit choice wins
      const next: Theme = e.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next: Theme = (theme ?? readAppliedTheme()) === "dark" ? "light" : "dark";
    applyTheme(next);
    safeSet(STORAGE_KEY, next);
    setTheme(next);
  }, [theme]);

  const value = React.useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/**
 * Runs in <head> before first paint:
 *  - applies the stored or OS theme (no flash of the wrong theme);
 *  - sets `data-js` so reveal-on-scroll content may start hidden;
 *  - if the app hasn't hydrated after 4s (JS failed to load), removes
 *    `data-js` so that content becomes visible anyway.
 */
export const initScript = `(function(){var r=document.documentElement;try{var t=localStorage.getItem('${STORAGE_KEY}');if(t!=='dark'&&t!=='light'){t=window.matchMedia('${DARK_QUERY}').matches?'dark':'light';}if(t==='dark'){r.classList.add('dark');}r.style.colorScheme=t;}catch(e){}r.setAttribute('data-js','');setTimeout(function(){if(!window.__gtHydrated){r.removeAttribute('data-js');}},4000);})();`;

function readAppliedTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore (private mode, blocked storage) */
  }
}
