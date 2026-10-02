"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ className = "" }) {
  const { isDark, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`} />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      aria-label={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-violet-50 dark:hover:bg-slate-800 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-md hover:shadow-violet-500/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-90 transition-all duration-200 ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-90 duration-300" />
      ) : (
        <Moon className="w-4 h-4 text-violet-600 dark:text-violet-300 transition-transform -rotate-12 hover:rotate-0 duration-300" />
      )}
    </button>
  );
}
