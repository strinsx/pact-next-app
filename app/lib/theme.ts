"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "pact-theme";

let cachedTheme: Theme = "light";
const themeListeners = new Set<() => void>();

function applyTheme(theme: Theme) {
  cachedTheme = theme;
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore storage errors
  }
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  return () => {
    themeListeners.delete(onStoreChange);
  };
}

function getThemeSnapshot() {
  if (typeof document !== "undefined") {
    cachedTheme = document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }
  return cachedTheme;
}

function getThemeServerSnapshot() {
  return "light" as Theme;
}

export function toggleTheme() {
  const next: Theme = cachedTheme === "dark" ? "light" : "dark";
  applyTheme(next);
  themeListeners.forEach((listener) => listener());
}

export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    getThemeServerSnapshot
  );
}
