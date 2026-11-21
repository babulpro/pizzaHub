"use client";

import { useEffect, useState } from "react";
import showToast from "@/lib/toast";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  const applyTheme = (newTheme: "dark" | "light") => {
    const root = document.documentElement;
    if (newTheme === "light") {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      root.classList.remove("light");
      root.classList.add("dark");
    }
    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute("content", newTheme);
    }
  };

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("pizzahub_theme");
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        applyTheme(stored);
      } else {
        setTheme("dark");
        applyTheme("dark");
      }
    } catch {
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    try {
      localStorage.setItem("pizzahub_theme", next);
    } catch {}
    applyTheme(next);
    showToast.info(
      `${next === "dark" ? "🌙 Night Mode" : "☀️ Day Mode"}`,
      `Theme switched to ${next} mood.`
    );
  };

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-xl border border-zinc-800 bg-zinc-900/60" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
      aria-label={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-850/80 text-sm shadow-sm transition hover:border-amber-500 hover:bg-zinc-800 active:scale-95"
    >
      {theme === "dark" ? (
        <span className="text-amber-400" title="Switch to Day Mode">☀️</span>
      ) : (
        <span className="text-amber-500" title="Switch to Night Mode">🌙</span>
      )}
    </button>
  );
}