"use client";

import { useState } from "react";
import {
  Briefcase,
  Dumbbell,
  BookOpen,
  Palette,
  HeartPulse,
  Clock,
  Plus,
  Trash2,
  Calendar,
  X,
} from "lucide-react";
import { addActivity, deleteActivity, getTodayDateString } from "@/lib/db";

export const CATEGORIES = [
  { id: "Work", label: "Work", icon: Briefcase, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/60", border: "border-blue-200 dark:border-blue-900/60" },
  { id: "Workout", label: "Workout", icon: Dumbbell, color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-950/60", border: "border-orange-200 dark:border-orange-900/60" },
  { id: "Study", label: "Study", icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/60", border: "border-emerald-200 dark:border-emerald-900/60" },
  { id: "Hobbies", label: "Hobbies", icon: Palette, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-950/60", border: "border-purple-200 dark:border-purple-900/60" },
  { id: "Health", label: "Health", icon: HeartPulse, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/60", border: "border-rose-200 dark:border-rose-900/60" },
  { id: "Other", label: "Other", icon: Clock, color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-100 dark:bg-slate-800", border: "border-slate-200 dark:border-slate-700" },
];

export default function DailyLogs({
  userId,
  activities = [],
  selectedDate,
  setSelectedDate,
  isFormOpen,
  setIsFormOpen,
}) {
  const [filterCategory, setFilterCategory] = useState("All");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Form states
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Work");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [activityDate, setActivityDate] = useState(selectedDate || getTodayDateString());

  const todayStr = getTodayDateString();

  const handleQuickDuration = (minutes) => {
    setDuration((prev) => (Number(prev) || 0) + minutes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !userId) return;

    try {
      setIsSubmitting(true);
      await addActivity(userId, {
        title: title.trim(),
        category,
        duration: Number(duration) || 15,
        notes: notes.trim(),
        date: activityDate,
      });

      setTitle("");
      setNotes("");
      setDuration(30);
      setIsFormOpen(false);
    } catch (err) {
      console.error("Error adding activity:", err);
      alert("Failed to save activity: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (activityId) => {
    if (!confirm("Are you sure you want to delete this activity log?")) return;
    try {
      setDeletingId(activityId);
      await deleteActivity(userId, activityId);
    } catch (err) {
      console.error("Error deleting activity:", err);
      alert("Failed to delete activity: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    const matchesDate = !selectedDate || act.date === selectedDate;
    const matchesCat = filterCategory === "All" || act.category === filterCategory;
    return matchesDate && matchesCat;
  });

  const totalFilteredMinutes = filteredActivities.reduce((acc, curr) => acc + (Number(curr.duration) || 0), 0);
  const totalHours = Math.floor(totalFilteredMinutes / 60);
  const totalMins = totalFilteredMinutes % 60;

  const getCategoryMeta = (catName) => {
    return CATEGORIES.find((c) => c.id === catName) || CATEGORIES[5];
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="card-clean p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Daily Activity Logs
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredActivities.length} {filteredActivities.length === 1 ? "log" : "logs"}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record what you accomplished today across work, fitness, and hobbies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Selector */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setActivityDate(e.target.value);
              }}
              className="bg-transparent text-slate-700 dark:text-slate-200 font-medium focus:outline-hidden text-xs cursor-pointer"
            />
            {selectedDate !== todayStr && (
              <button
                onClick={() => {
                  setSelectedDate(todayStr);
                  setActivityDate(todayStr);
                }}
                className="ml-2 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
              >
                Today
              </button>
            )}
          </div>

          {/* Add Activity Button */}
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="btn-primary px-3.5 py-1.5 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
          >
            {isFormOpen ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            <span>{isFormOpen ? "Cancel" : "Add Log"}</span>
          </button>
        </div>
      </div>

      {/* Expandable Add Activity Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="card-clean p-5 border-indigo-200 dark:border-indigo-900/60 shadow-sm animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Log New Activity</span>
            </h3>
            <span className="text-xs text-slate-400">Date: {activityDate}</span>
          </div>

          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Activity Title <span className="text-red-500">*</span>
              </label>
              <input
                id="activity-title-input"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Code review, 5km morning run, Read 20 pages"
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 placeholder:text-slate-400"
              />
            </div>

            {/* Category selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-md shadow-violet-500/25 scale-[1.03]"
                          : "bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500 hover:-translate-y-0.5 active:scale-95"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duration with quick add */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Duration (Minutes)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="1440"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-24 px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                  />
                  <div className="flex items-center space-x-1">
                    {[15, 30, 45, 60].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => handleQuickDuration(m)}
                        className="px-2.5 py-1.5 text-xs font-semibold bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 rounded-lg border border-violet-200/60 dark:border-violet-800/60 hover:-translate-y-0.5 active:scale-90 transition-all cursor-pointer shadow-xs"
                      >
                        +{m}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={activityDate}
                  onChange={(e) => setActivityDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes (Optional)
              </label>
              <textarea
                rows="2"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you achieve? Key thoughts or reflections..."
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400"
              />
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
                {isSubmitting ? "Saving..." : "Save Activity"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Category Filter Pills & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-0.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterCategory("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              filterCategory === "All"
                ? "bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-md shadow-violet-500/20 scale-105"
                : "bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:-translate-y-0.5 active:scale-95"
            }`}
          >
            All ({activities.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = activities.filter((a) => a.category === cat.id).length;
            const isSelected = filterCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setFilterCategory(cat.id)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 scale-105"
                    : "bg-white dark:bg-slate-800 hover:bg-violet-50 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-300 hover:-translate-y-0.5 active:scale-95"
                }`}
              >
                <span>{cat.label}</span>
                {count > 0 && <span className="opacity-70 text-[10px]">({count})</span>}
              </button>
            );
          })}
        </div>

        {filteredActivities.length > 0 && (
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Total:{" "}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {totalHours > 0 ? `${totalHours}h ${totalMins}m` : `${totalMins}m`}
            </span>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        {filteredActivities.length === 0 ? (
          <div className="card-clean p-8 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                No activities logged yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                {selectedDate === todayStr
                  ? "You haven't logged any activities today. Click 'Add Log' to record what you did!"
                  : `No activities found for ${selectedDate}.`}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="btn-secondary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log first activity</span>
            </button>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const meta = getCategoryMeta(act.category);
            const Icon = meta.icon;
            const hours = Math.floor((Number(act.duration) || 0) / 60);
            const mins = (Number(act.duration) || 0) % 60;
            const durationDisplay =
              hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ""}` : `${mins}m`;

            return (
              <div
                key={act.id}
                className="card-clean p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${meta.bg} ${meta.color} border ${meta.border}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {act.title}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${meta.bg} ${meta.color} border ${meta.border}`}
                      >
                        {act.category}
                      </span>
                      <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                        {act.date}
                      </span>
                    </div>

                    {act.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800 mt-1 max-w-xl">
                        {act.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{durationDisplay}</span>
                  </div>

                  <button
                    onClick={() => handleDelete(act.id)}
                    disabled={deletingId === act.id}
                    title="Delete log"
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
