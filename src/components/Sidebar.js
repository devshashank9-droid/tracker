"use client";

import {
  LayoutDashboard,
  CalendarCheck2,
  Target,
  BarChart3,
  LogOut,
  Sparkles,
  Flame,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
  streakCount = 0,
}) {
  const { user, logout, isDemoMode } = useAuth();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "activities", label: "Daily Logs", icon: CalendarCheck2 },
    { id: "goals", label: "Goals & Habits", icon: Target },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-64 flex-shrink-0 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Logo */}
          <div className="h-16 px-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-base bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 tracking-tight">
                  LifePulse
                </span>
                <span className="block text-[10px] uppercase font-semibold text-violet-600 dark:text-violet-400 tracking-wider">
                  Tracker
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg md:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Compact Streak Badge */}
          <div className="px-4 py-3.5">
            <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/50 rounded-xl p-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">
                    Streak
                  </div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {streakCount} {streakCount === 1 ? "Day" : "Days"} Active
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-600 text-white shadow-md shadow-violet-500/25 font-semibold scale-[1.02]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-700 dark:hover:text-violet-300 hover:translate-x-1 active:scale-[0.98]"
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform ${isActive ? "text-white scale-110" : "text-slate-400 dark:text-slate-500"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Logout */}
        <div className="p-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center space-x-2.5 mb-2.5 overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User avatar"}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-violet-500/30 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-cyan-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs">
                {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="overflow-hidden min-w-0">
              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {user?.displayName || "User"}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {user?.email || "Logged In"}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                isDemoMode
                  ? "bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
              }`}
            >
              {isDemoMode ? "Guest Mode" : "Google Live"}
            </span>

            <button
              onClick={logout}
              title="Sign Out"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
