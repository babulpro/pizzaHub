"use client";

import { useEffect, useState } from "react";
import showToast from "@/lib/toast";

interface ThemeToggleProps {
  variant?: "icon" | "row";
}

export default function ThemeToggle({ variant = "icon" }: ThemeToggleProps) {
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
    if (variant === "row") {
      return (
        <div className="h-12 w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 animate-pulse" />
      );
    }
    return (
      <div className="h-9 w-9 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60" />
    );
  }

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/70 p-3.5 transition-colors hover:border-amber-500/50"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-lg">
            {theme === "dark" ? "🌙" : "☀️"}
          </span>
          <div className="text-left">
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              {theme === "dark" ? "Night Mode" : "Day Mode"}
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Tap to switch to {theme === "dark" ? "Light theme" : "Dark theme"}
            </p>
          </div>
        </div>

        {/* Sliding Pill Indicator */}
        <div className={`relative h-6 w-11 rounded-full transition-colors ${
          theme === "dark" ? "bg-zinc-700" : "bg-amber-500"
        }`}>
          <div className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            theme === "dark" ? "left-0.5" : "left-5.5"
          }`} />
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
      aria-label={theme === "dark" ? "Switch to Day Mode" : "Switch to Night Mode"}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-100 dark:bg-zinc-800 text-sm shadow-xs transition hover:border-amber-500 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-95"
    >
      {theme === "dark" ? (
        <span className="text-amber-400" title="Switch to Day Mode">☀️</span>
      ) : (
        <span className="text-amber-500" title="Switch to Night Mode">🌙</span>
      )}
    </button>
  );
}
