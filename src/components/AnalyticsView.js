"use client";

import { BarChart3, Clock, Target, Award } from "lucide-react";
import { CATEGORIES } from "./DailyLogs";

export default function AnalyticsView({ activities = [], goals = [] }) {
  // Compute category totals
  const categoryTotals = CATEGORIES.map((cat) => {
    const matching = activities.filter((a) => a.category === cat.id);
    const totalMinutes = matching.reduce((sum, item) => sum + (Number(item.duration) || 0), 0);
    return {
      ...cat,
      minutes: totalMinutes,
      count: matching.length,
    };
  });

  const grandTotalMinutes = categoryTotals.reduce((sum, c) => sum + c.minutes, 0);
  const grandTotalHours = Math.floor(grandTotalMinutes / 60);
  const grandTotalRemainingMins = grandTotalMinutes % 60;

  // Goals completion
  const dailyGoals = goals.filter((g) => g.frequency === "daily");
  const completedDailyCount = dailyGoals.filter((g) => g.completedToday).length;
  const goalRate = dailyGoals.length > 0 ? Math.round((completedDailyCount / dailyGoals.length) * 100) : 0;

  // Longest streak
  const maxStreak = goals.reduce((max, g) => Math.max(max, Number(g.streak) || 0), 0);

  return (
    <div className="space-y-4">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total Tracked Time</span>
            <div className="w-7 h-7 rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-slate-900 dark:text-white">
            {grandTotalHours}h {grandTotalRemainingMins}m
          </div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Across {activities.length} recorded sessions
          </div>
        </div>

        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Daily Goal Hit Rate</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-slate-900 dark:text-white">{goalRate}%</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {completedDailyCount} of {dailyGoals.length} daily goals completed today
          </div>
        </div>

        <div className="card-clean p-4 sm:p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Longest Streak</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2.5 text-2xl font-bold text-slate-900 dark:text-white">{maxStreak} Days</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Highest consecutive habit streak achieved
          </div>
        </div>
      </div>

      {/* Category Time Distribution */}
      <div className="card-clean p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Time Distribution by Category
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total: {grandTotalHours}h {grandTotalRemainingMins}m
          </span>
        </div>

        {grandTotalMinutes === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            No activities recorded yet. Log an activity to see your breakdown!
          </div>
        ) : (
          <div className="space-y-3.5">
            {categoryTotals.map((cat) => {
              const Icon = cat.icon;
              const percentage =
                grandTotalMinutes > 0 ? Math.round((cat.minutes / grandTotalMinutes) * 100) : 0;
              const h = Math.floor(cat.minutes / 60);
              const m = cat.minutes % 60;

              return (
                <div key={cat.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center ${cat.bg} ${cat.color} border ${cat.border}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {cat.label}
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        ({cat.count} {cat.count === 1 ? "log" : "logs"})
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {h > 0 ? `${h}h ${m}m` : `${m}m`}
                      </span>
                      <span className="text-slate-400 text-xs w-9 text-right">{percentage}%</span>
                    </div>
                  </div>

                  {/* Clean Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        cat.id === "Work"
                          ? "bg-blue-500"
                          : cat.id === "Workout"
                          ? "bg-orange-500"
                          : cat.id === "Study"
                          ? "bg-emerald-500"
                          : cat.id === "Hobbies"
                          ? "bg-purple-500"
                          : cat.id === "Health"
                          ? "bg-rose-500"
                          : "bg-slate-500"
                      }`}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
