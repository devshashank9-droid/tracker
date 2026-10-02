"use client";

import { Menu, Plus, Calendar, HelpCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function Header({
  setMobileOpen,
  onOpenActivityModal,
  onOpenGoalModal,
  onOpenSetupModal,
}) {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getFormattedDate = () => {
    const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    return new Date().toLocaleDateString(undefined, options);
  };

  const firstName = user?.displayName ? user.displayName.split(" ")[0] : "Friend";

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Greeting */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {getGreeting()},{" "}
              <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 font-extrabold">{firstName}</span> 👋
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-violet-500" />
              <span>{getFormattedDate()}</span>
            </div>
          </div>
        </div>

        {/* Right: Theme Toggle & Quick Action Buttons */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          <ThemeToggle />

          <button
            onClick={onOpenSetupModal}
            title="Firebase Console Setup Guide"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 hover:text-violet-600 dark:hover:text-violet-300 rounded-xl transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Firebase Config</span>
          </button>

          <button
            onClick={onOpenGoalModal}
            className="btn-secondary group px-3.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200 text-violet-600 dark:text-violet-400" />
            <span className="hidden xs:inline">New Goal</span>
            <span className="xs:hidden">Goal</span>
          </button>

          <button
            onClick={onOpenActivityModal}
            className="btn-primary group px-3.5 py-1.5 text-xs font-semibold rounded-xl cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-200" />
            <span className="hidden xs:inline">Log Activity</span>
            <span className="xs:hidden">Log</span>
          </button>
        </div>
      </div>
    </header>
  );
}
