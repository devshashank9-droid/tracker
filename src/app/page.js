"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import FirebaseBanner from "@/components/FirebaseBanner";
import FirebaseSetupModal from "@/components/FirebaseSetupModal";
import LandingPage from "@/components/LandingPage";
import ProgressOverview from "@/components/ProgressOverview";
import DailyLogs from "@/components/DailyLogs";
import GoalTracker from "@/components/GoalTracker";
import AnalyticsView from "@/components/AnalyticsView";
import {
  subscribeToActivities,
  subscribeToGoals,
  getTodayDateString,
  seedInitialGoalsIfEmpty,
} from "@/lib/db";
import { Sparkles, Loader2 } from "lucide-react";

const Background3D = dynamic(() => import("@/components/3d/Background3D"), {
  ssr: false,
});

export default function Home() {
  const { user, loading } = useAuth();

  // Navigation & Modal states
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'activities' | 'goals' | 'analytics'
  const [mobileOpen, setMobileOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);

  // Filtered date state
  const [selectedDate, setSelectedDate] = useState(getTodayDateString());

  // Real-time data from Firestore / Local cache
  const [activities, setActivities] = useState([]);
  const [goals, setGoals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Subscribe to Firestore data when user is authenticated
  useEffect(() => {
    if (!user?.uid) {
      setActivities([]);
      setGoals([]);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    // Seed default goals if empty so new users have initial momentum
    seedInitialGoalsIfEmpty(user.uid).catch((e) => console.log("Seeding check:", e));

    // Listen to activities
    const unsubActivities = subscribeToActivities(user.uid, null, (fetchedActivities) => {
      setActivities(fetchedActivities);
      setDataLoading(false);
    });

    // Listen to goals
    const unsubGoals = subscribeToGoals(user.uid, (fetchedGoals) => {
      setGoals(fetchedGoals);
      setDataLoading(false);
    });

    return () => {
      unsubActivities();
      unsubGoals();
    };
  }, [user?.uid]);

  // Derived progress overview calculations
  const todayStr = getTodayDateString();
  const todayActivities = activities.filter((a) => a.date === todayStr);
  const totalMinutesToday = todayActivities.reduce((acc, a) => acc + (Number(a.duration) || 0), 0);

  const dailyGoals = goals.filter((g) => g.frequency === "daily");
  const completedGoalsCount = dailyGoals.filter((g) => g.completedToday).length;
  const totalDailyGoals = dailyGoals.length;

  // Streak calculation: max streak among goals
  const streakCount = goals.reduce((max, g) => Math.max(max, Number(g.streak) || 0), 0);

  // If initial auth is checking, show clean loading state
  if (loading) {
    return (
      <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950/75 flex flex-col items-center justify-center space-y-3 transition-colors">
        <Background3D />
        <div className="relative z-10 flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-violet-500/25">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-600 dark:text-violet-400" />
            <span>Loading LifePulse...</span>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render the landing page (protected route)
  if (!user) {
    return (
      <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950/75">
        <Background3D />
        <div className="relative z-10">
          <LandingPage onOpenSetupModal={() => setSetupModalOpen(true)} />
          <FirebaseSetupModal
            isOpen={setupModalOpen}
            onClose={() => setSetupModalOpen(false)}
          />
        </div>
      </div>
    );
  }

  // Authenticated Dashboard
  return (
    <div className="relative min-h-screen bg-slate-50/70 dark:bg-slate-950/75 flex flex-col transition-colors duration-200">
      {/* 3D Ambient Background Scene */}
      <Background3D />

      <div className="relative z-10 flex-1 flex flex-col">
        {/* Top Firebase Configuration Status Banner */}
        <FirebaseBanner onOpenSetupModal={() => setSetupModalOpen(true)} />

        {/* Main Layout: Sidebar + Dashboard Content */}
        <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
          streakCount={streakCount}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            setMobileOpen={setMobileOpen}
            onOpenActivityModal={() => {
              if (activeTab !== "dashboard" && activeTab !== "activities") {
                setActiveTab("activities");
              }
              setIsActivityFormOpen(true);
            }}
            onOpenGoalModal={() => {
              if (activeTab !== "dashboard" && activeTab !== "goals") {
                setActiveTab("goals");
              }
              setIsGoalFormOpen(true);
            }}
            onOpenSetupModal={() => setSetupModalOpen(true)}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
            {/* View 1: Main Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Visual Progress Overview */}
                <ProgressOverview
                  dailyGoals={dailyGoals}
                  completedGoalsCount={completedGoalsCount}
                  totalDailyGoals={totalDailyGoals}
                  totalMinutesToday={totalMinutesToday}
                  activitiesCountToday={todayActivities.length}
                  streakCount={streakCount}
                />

                {/* 2-Column Responsive Split: Daily Logs on Left, Goals on Right */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Daily Logs (7 columns on large screens) */}
                  <div className="lg:col-span-7">
                    <DailyLogs
                      userId={user.uid}
                      activities={activities}
                      selectedDate={selectedDate}
                      setSelectedDate={setSelectedDate}
                      isFormOpen={isActivityFormOpen}
                      setIsFormOpen={setIsActivityFormOpen}
                    />
                  </div>

                  {/* Right Column: Goal Tracking (5 columns on large screens) */}
                  <div className="lg:col-span-5">
                    <GoalTracker
                      userId={user.uid}
                      goals={goals}
                      isFormOpen={isGoalFormOpen}
                      setIsFormOpen={setIsGoalFormOpen}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* View 2: Daily Logs Dedicated Tab */}
            {activeTab === "activities" && (
              <div className="max-w-4xl mx-auto animate-fadeIn">
                <DailyLogs
                  userId={user.uid}
                  activities={activities}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  isFormOpen={isActivityFormOpen}
                  setIsFormOpen={setIsActivityFormOpen}
                />
              </div>
            )}

            {/* View 3: Goals & Habits Dedicated Tab */}
            {activeTab === "goals" && (
              <div className="max-w-3xl mx-auto animate-fadeIn">
                <GoalTracker
                  userId={user.uid}
                  goals={goals}
                  isFormOpen={isGoalFormOpen}
                  setIsFormOpen={setIsGoalFormOpen}
                />
              </div>
            )}

            {/* View 4: Analytics Tab */}
            {activeTab === "analytics" && (
              <div className="max-w-4xl mx-auto animate-fadeIn">
                <AnalyticsView activities={activities} goals={goals} />
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Firebase Setup Modal Guide */}
      <FirebaseSetupModal
        isOpen={setupModalOpen}
        onClose={() => setSetupModalOpen(false)}
      />
      </div>
    </div>
  );
}
