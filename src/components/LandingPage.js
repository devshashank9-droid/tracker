"use client";

import { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  Flame,
  Clock,
  ArrowRight,
  ExternalLink,
  Target,
  HelpCircle,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";

export default function LandingPage({ onOpenSetupModal }) {
  const { loginWithGoogle, loginAsDemoUser, error, isFirebaseConfigured } = useAuth();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Interactive Live Preview Checklist
  const [previewHabits, setPreviewHabits] = useState([
    { id: 1, title: "Drink 3L of water", category: "Health", completed: true, color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/40" },
    { id: 2, title: "30-minute workout session", category: "Fitness", completed: true, color: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-900/40" },
    { id: 3, title: "Read 20 pages of a book", category: "Learning", completed: false, color: "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 border-violet-200 dark:border-violet-900/40" },
  ]);

  const togglePreviewHabit = (id) => {
    setPreviewHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: !h.completed } : h))
    );
  };

  const previewCompletedCount = previewHabits.filter((h) => h.completed).length;
  const previewPercent = Math.round((previewCompletedCount / previewHabits.length) * 100);

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setLoginError(null);
      await loginWithGoogle();
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950/75 flex flex-col justify-between selection:bg-violet-500 selection:text-white transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-violet-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400 tracking-tight">
              LifePulse
            </span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Daily Life &amp; Progress Tracker
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <ThemeToggle />

          <button
            onClick={onOpenSetupModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 rounded-xl shadow-xs transition-all hover:-translate-y-0.5 active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
            <span>Firebase Guide</span>
          </button>

          <button
            onClick={loginAsDemoUser}
            className="btn-secondary px-3.5 py-2 text-xs font-semibold rounded-xl cursor-pointer"
          >
            <span>Instant Demo</span>
          </button>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex flex-col items-center text-center">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-50 dark:bg-violet-950/60 border border-violet-200/80 dark:border-violet-800/60 text-violet-700 dark:text-violet-300 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-500 animate-pulse" />
          <span>Simple, Clean &amp; Effortless Progress Tracking</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight max-w-2xl">
          Organize Your Day. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 bg-clip-text text-transparent dark:from-violet-400 dark:via-indigo-300 dark:to-cyan-400">
            Build Unstoppable Consistency.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
          Log activities, check off daily habits, and keep track of your growth.
          Everything stays safely synced to your account with Firebase.
        </p>

        {/* Error Notification */}
        {(loginError || error) && (
          <div className="mt-5 w-full max-w-md p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-xs text-red-700 dark:text-red-300 text-left space-y-1">
            <div className="font-bold">Authentication Notice:</div>
            <p>{loginError || error}</p>
            {!isFirebaseConfigured && (
              <button
                onClick={onOpenSetupModal}
                className="mt-1 text-violet-700 dark:text-violet-400 underline font-semibold block cursor-pointer"
              >
                Click here for Firebase Console setup instructions &rarr;
              </button>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-md">
          {/* Google Sign-In */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full sm:w-auto flex-1 flex items-center justify-center space-x-3 px-5 py-3 bg-white dark:bg-slate-800 hover:bg-violet-50/50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-sm rounded-xl border border-slate-300 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-lg hover:shadow-violet-500/15 hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isLoggingIn ? "Signing in..." : "Continue with Google"}</span>
          </button>

          {/* Guest Demo */}
          <button
            onClick={loginAsDemoUser}
            className="btn-primary group w-full sm:w-auto px-5 py-3 text-sm font-semibold rounded-xl cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Try Instant Demo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
          No credit card required • Instant access with Google or Guest Mode
        </p>

        {/* Clean Interactive Preview Mockup Card */}
        <div className="mt-12 w-full max-w-2xl card-clean p-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-red-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">
                Today&apos;s Progress Preview (Interactive)
              </span>
            </div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 px-2.5 py-0.5 rounded-full border border-violet-200/60 dark:border-violet-900/50">
              {previewPercent}% Done
            </span>
          </div>

          {/* Sample Progress Bar */}
          <div className="space-y-1.5 mb-5">
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span>Daily Goal Completion</span>
              <span className="font-bold text-slate-900 dark:text-white">{previewCompletedCount} of {previewHabits.length} Completed</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${previewPercent}%` }}
              />
            </div>
          </div>

          {/* Interactive Checklist Items */}
          <div className="space-y-2 text-xs">
            {previewHabits.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => togglePreviewHabit(item.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer text-left hover:-translate-y-0.5 active:scale-[0.98] ${
                  item.completed
                    ? "bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800"
                    : "bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 shadow-xs"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                    item.completed
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xs scale-100"
                      : "border-2 border-slate-300 dark:border-slate-600 hover:border-violet-500"
                  }`}
                >
                  {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
                <span
                  className={`font-medium flex-1 transition-all ${
                    item.completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-800 dark:text-slate-200"
                  }`}
                >
                  {item.title}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${item.color}`}>
                  {item.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 Core Value Cards */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full text-left">
          <div className="card-clean p-5 text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Daily Activity Logs
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Log work, workouts, study, and hobbies in seconds with duration presets and optional notes.
            </p>
          </div>

          <div className="card-clean p-5 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Habits &amp; Goals
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Track daily and weekly milestones with simple checkboxes and visual completion counters.
            </p>
          </div>

          <div className="card-clean p-5 text-left">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Private Cloud Sync
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every log is tied to your Google UID in Firestore. Your data is private and always persistent.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-5 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>LifePulse — Built with Next.js, Tailwind CSS &amp; Firebase</span>
          <button
            onClick={onOpenSetupModal}
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer inline-flex items-center gap-1"
          >
            Firebase Console Configuration Guide
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </footer>
    </div>
  );
}
