"use client";

import { AlertCircle, CheckCircle2, ChevronRight, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function FirebaseBanner({ onOpenSetupModal }) {
  const { isFirebaseConfigured, isDemoMode } = useAuth();

  if (isFirebaseConfigured && !isDemoMode) {
    return (
      <div className="bg-emerald-50 border-b border-emerald-100 px-4 py-2 flex items-center justify-between text-xs text-emerald-800">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            <strong>Firebase Live Connected:</strong> Authenticated with Google Auth & Firestore Cloud Database.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 border-b border-amber-200/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800">
      <div className="flex items-center gap-2.5">
        <span className="p-1 bg-amber-500/20 text-amber-700 rounded-md flex-shrink-0">
          <AlertCircle className="w-3.5 h-3.5" />
        </span>
        <span className="font-medium text-slate-700">
          {isDemoMode ? (
            <>
              You are exploring in <strong>Interactive Demo Mode</strong> with instant local storage persistence.
            </>
          ) : (
            <>
              Firebase credentials are not set in <strong>.env.local</strong> yet.
            </>
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSetupModal}
          className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900 bg-white/90 hover:bg-white px-2.5 py-1 rounded-md border border-violet-200/60 shadow-xs hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-3 h-3 text-amber-500" />
          Firebase Console Setup Guide
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
