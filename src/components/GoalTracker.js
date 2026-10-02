"use client";

import { useState } from "react";
import {
  Target,
  CheckCircle2,
  Plus,
  Trash2,
  Flame,
  Check,
  X,
} from "lucide-react";
import { addGoal, toggleGoalCompleted, deleteGoal, getTodayDateString } from "@/lib/db";

const GOAL_CATEGORIES = ["Health", "Fitness", "Learning", "Work", "Habit", "Mindset"];

const QUICK_SUGGESTIONS = [
  { title: "Drink 3L of water", category: "Health", frequency: "daily" },
  { title: "Read 20 pages of a book", category: "Learning", frequency: "daily" },
  { title: "30-minute workout session", category: "Fitness", frequency: "daily" },
  { title: "Meditate for 10 minutes", category: "Mindset", frequency: "daily" },
  { title: "Review weekly priorities", category: "Work", frequency: "weekly" },
];

export default function GoalTracker({
  userId,
  goals = [],
  isFormOpen,
  setIsFormOpen,
}) {
  const [filterFrequency, setFilterFrequency] = useState("all"); // 'all' | 'daily' | 'weekly'
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Form inputs
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Health");
  const [frequency, setFrequency] = useState("daily");

  const todayStr = getTodayDateString();

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !userId) return;

    try {
      setIsSubmitting(true);
      await addGoal(userId, {
        title: title.trim(),
        category,
        frequency,
      });

      setTitle("");
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error creating goal:", err);
      alert("Failed to save goal: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickAdd = async (suggestion) => {
    if (!userId) return;
    try {
      setIsSubmitting(true);
      await addGoal(userId, suggestion);
    } catch (err) {
      console.error("Error adding quick suggestion:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (goal) => {
    if (!userId) return;
    try {
      setTogglingId(goal.id);
      await toggleGoalCompleted(userId, goal.id, goal.completedToday, todayStr);
    } catch (err) {
      console.error("Error toggling goal:", err);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (goalId) => {
    if (!confirm("Are you sure you want to remove this goal?")) return;
    try {
      setDeletingId(goalId);
      await deleteGoal(userId, goalId);
    } catch (err) {
      console.error("Error deleting goal:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredGoals = goals.filter((g) => {
    if (filterFrequency === "daily") return g.frequency === "daily";
    if (filterFrequency === "weekly") return g.frequency === "weekly";
    return true;
  });

  const dailyGoals = goals.filter((g) => g.frequency === "daily");
  const completedDailyCount = dailyGoals.filter((g) => g.completedToday).length;

  return (
    <div className="space-y-4">
      {/* Top Header Card */}
      <div className="card-clean p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Habits &amp; Goals
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              {completedDailyCount} / {dailyGoals.length} Done Today
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Check off daily habits to build your streak and stay accountable.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Goal Toggle */}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="btn-primary px-3.5 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isFormOpen ? "Cancel" : "New Goal"}</span>
          </button>
        </div>
      </div>

      {/* Add Goal Form */}
      {isFormOpen && (
        <form
          onSubmit={handleAddGoal}
          className="card-clean p-5 border-indigo-200 dark:border-indigo-900/60 shadow-sm animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Define a New Goal or Habit
            </h3>
          </div>

          <div className="space-y-4">
            {/* Goal Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Goal Title <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Drink 3L water, Read 20 pages, 10,000 steps"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400"
              />
            </div>

            {/* Category and Frequency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                >
                  {GOAL_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frequency */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Frequency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFrequency("daily")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                      frequency === "daily"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/25 scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:-translate-y-0.5 active:scale-95"
                    }`}
                  >
                    Daily Goal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFrequency("weekly")}
                    className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-all duration-200 cursor-pointer ${
                      frequency === "weekly"
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/25 scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:-translate-y-0.5 active:scale-95"
                    }`}
                  >
                    Weekly Goal
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Suggestions */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1.5">
                Quick 1-Click Suggestions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_SUGGESTIONS.slice(0, 3).map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => {
                      setTitle(item.title);
                      setCategory(item.category);
                      setFrequency(item.frequency);
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 rounded-lg border border-violet-200/60 dark:border-violet-800/60 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    + {item.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end space-x-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="btn-secondary px-4 py-2 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary px-4 py-2 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? "Creating..." : "Save Goal"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setFilterFrequency("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filterFrequency === "all"
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-violet-500/20 scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            All ({goals.length})
          </button>
          <button
            onClick={() => setFilterFrequency("daily")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filterFrequency === "daily"
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-violet-500/20 scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            Daily Goals ({dailyGoals.length})
          </button>
          <button
            onClick={() => setFilterFrequency("weekly")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filterFrequency === "weekly"
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-violet-500/20 scale-105"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            Weekly Goals ({goals.filter((g) => g.frequency === "weekly").length})
          </button>
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-2">
        {filteredGoals.length === 0 ? (
          <div className="card-clean p-8 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No goals found
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                Start tracking a daily habit or weekly milestone to build your momentum!
              </p>
            </div>

            <div className="pt-2">
              <span className="text-xs font-medium text-slate-400 block mb-2">
                Quick start recommendations:
              </span>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-md mx-auto">
                {QUICK_SUGGESTIONS.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => handleQuickAdd(item)}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 rounded-lg border border-violet-200/60 dark:border-violet-800/60 hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{item.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const isCompleted = Boolean(goal.completedToday);
            const isToggling = togglingId === goal.id;

            return (
              <div
                key={goal.id}
                className={`card-clean p-3 sm:p-4 flex items-center justify-between gap-3 transition-colors ${
                  isCompleted
                    ? "bg-slate-50/70 dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800"
                    : "bg-white dark:bg-slate-900"
                }`}
              >
                {/* Left: Checkbox + Title */}
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <button
                    onClick={() => handleToggle(goal)}
                    disabled={isToggling}
                    className={`cube-checkbox w-6 h-6 rounded-lg flex items-center justify-center transition-all flex-shrink-0 cursor-pointer ${
                      isCompleted
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30 scale-100"
                        : "border-2 border-slate-300 dark:border-slate-600 hover:border-violet-500 dark:hover:border-violet-400 bg-white dark:bg-slate-800 shadow-xs"
                    }`}
                  >
                    <Check
                      className={`w-3.5 h-3.5 stroke-[3] transition-transform ${
                        isCompleted ? "scale-100 opacity-100" : "scale-50 opacity-0"
                      }`}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`text-sm font-semibold transition-all ${
                          isCompleted
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {goal.title}
                      </span>

                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.2 rounded-full ${
                          goal.frequency === "daily"
                            ? "bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-900/40"
                            : "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200/60 dark:border-cyan-900/40"
                        }`}
                      >
                        {goal.frequency}
                      </span>

                      <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.2 rounded">
                        {goal.category}
                      </span>
                    </div>

                    {isCompleted && (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed today
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Streak & Delete */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {goal.streak > 0 && (
                    <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-bold border border-orange-200/60 dark:border-orange-900/50">
                      <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                      <span>{goal.streak}d</span>
                    </div>
                  )}

                  <button
                    onClick={() => handleDelete(goal.id)}
                    disabled={deletingId === goal.id}
                    title="Remove goal"
                    className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all duration-150 hover:scale-110 active:scale-90 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
