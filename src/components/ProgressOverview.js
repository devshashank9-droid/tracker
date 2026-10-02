"use client";

import { CheckCircle2, Flame, Clock, Target, Sparkles, TrendingUp } from "lucide-react";

export default function ProgressOverview({
  dailyGoals = [],
  completedGoalsCount = 0,
  totalDailyGoals = 0,
  totalMinutesToday = 0,
  activitiesCountToday = 0,
  streakCount = 0,
}) {
  const completionPercentage =
    totalDailyGoals > 0 ? Math.round((completedGoalsCount / totalDailyGoals) * 100) : 0;

  const hours = Math.floor(totalMinutesToday / 60);
  const minutes = totalMinutesToday % 60;
  const formattedTime =
    hours > 0 ? `${hours}h ${minutes > 0 ? `${minutes}m` : ""}` : `${minutes}m`;

  const getEncouragement = () => {
    if (totalDailyGoals === 0) return "Add your first daily goal to get started today.";
    if (completionPercentage === 100) return "All daily goals completed! Great work today! 🎉";
    if (completionPercentage >= 75) return "Almost done! Keep the momentum going! 🚀";
    if (completionPercentage >= 50) return "Halfway there! Keep it up! 💪";
    if (completionPercentage > 0) return "Good start! Keep checking off your habits! ✨";
    return "Ready to conquer today? Check off your first habit! 🎯";
  };

  return (
    <div className="space-y-4">
      {/* Clean Main Progress Card */}
      <div className="card-clean p-5 sm:p-6 bg-gradient-to-r from-violet-500/10 via-white/80 to-cyan-500/10 dark:from-violet-950/30 dark:via-slate-900/80 dark:to-cyan-950/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                Today&apos;s Progress
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-900/50">
                {completionPercentage}% Completed
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {completedGoalsCount} of {totalDailyGoals} Goals Done
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              {getEncouragement()}
            </p>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 self-start sm:self-auto">
            {/* Streak Badge */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/80 dark:border-orange-900/50 shadow-xs">
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Streak
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {streakCount} {streakCount === 1 ? "Day" : "Days"}
                </div>
              </div>
            </div>

            {/* Time Logged Badge */}
            <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-900/50 shadow-xs">
              <Clock className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
                  Time Logged
                </div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {formattedTime}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Progress Bar */}
        <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-500 rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${Math.min(100, Math.max(3, completionPercentage))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Daily Goals</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {completedGoalsCount}
              <span className="text-sm font-normal text-slate-400">/{totalDailyGoals}</span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                completionPercentage >= 100
                  ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            >
              {completionPercentage}%
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {totalDailyGoals - completedGoalsCount > 0
              ? `${totalDailyGoals - completedGoalsCount} remaining today`
              : "All goals completed"}
          </div>
        </div>

        {/* Metric 2 */}
        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Active Time</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{formattedTime}</div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-100 dark:bg-cyan-950/80 text-cyan-700 dark:text-cyan-300">
              {activitiesCountToday} Logs
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tracked across activities today
          </div>
        </div>

        {/* Metric 3 */}
        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Current Streak</span>
            <div className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 flex items-baseline justify-between">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {streakCount} <span className="text-sm font-normal text-slate-400">Days</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300">
              Active 🔥
            </span>
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Consecutive daily goal streak
          </div>
        </div>
      </div>
    </div>
  );
}
