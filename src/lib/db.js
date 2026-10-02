import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";

// ==========================================
// Helper Utilities
// ==========================================
export const getTodayDateString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Local storage fallback for demo or when Firebase credentials aren't set yet
const LOCAL_STORAGE_ACTIVITIES_KEY = "lifetrack_demo_activities_";
const LOCAL_STORAGE_GOALS_KEY = "lifetrack_demo_goals_";

const getLocalData = (key, userId) => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(`${key}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Local storage read error", e);
    return [];
  }
};

const setLocalData = (key, userId, data) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${key}${userId}`, JSON.stringify(data));
    window.dispatchEvent(
      new CustomEvent("lifetrack_db_update", { detail: { key, userId } })
    );
  } catch (e) {
    console.error("Local storage write error", e);
  }
};

// ==========================================
// DAILY ACTIVITIES (CRUD Operations)
// Collection: users/{userId}/activities
// ==========================================

/**
 * Add a new activity for a user
 */
export async function addActivity(userId, activityData) {
  if (!userId) throw new Error("User ID is required to add an activity.");

  const activityPayload = {
    userId,
    title: activityData.title.trim(),
    category: activityData.category || "Work",
    duration: Number(activityData.duration) || 0, // duration in minutes
    notes: activityData.notes ? activityData.notes.trim() : "",
    date: activityData.date || getTodayDateString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
    const newDoc = { id: "local_" + Date.now(), ...activityPayload };
    setLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId, [newDoc, ...local]);
    return newDoc;
  }

  const activitiesCol = collection(db, "users", userId, "activities");
  const docRef = await addDoc(activitiesCol, {
    ...activityPayload,
    serverCreatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...activityPayload };
}

/**
 * Fetch activities for a user, optionally filtered by date
 */
export async function getActivities(userId, date = null) {
  if (!userId) return [];

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
    if (date) {
      return local.filter((item) => item.date === date);
    }
    return local;
  }

  try {
    const activitiesCol = collection(db, "users", userId, "activities");
    let q;

    if (date) {
      q = query(activitiesCol, where("date", "==", date));
    } else {
      q = query(activitiesCol);
    }

    const snapshot = await getDocs(q);
    const activities = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));

    // Sort client-side to avoid Firestore composite index requirement
    return activities.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (error) {
    console.error("Error fetching activities from Firestore:", error);
    // Graceful fallback to local cache if error
    const local = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
    return date ? local.filter((item) => item.date === date) : local;
  }
}

/**
 * Real-time listener for activities
 */
export function subscribeToActivities(userId, dateFilter = null, callback) {
  if (!userId) return () => {};

  if (!isFirebaseConfigured || !db) {
    const notify = () => {
      const data = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
      const filtered = dateFilter ? data.filter((item) => item.date === dateFilter) : data;
      callback(filtered);
    };
    notify();

    const handleUpdate = (e) => {
      if (e.detail?.userId === userId && e.detail?.key === LOCAL_STORAGE_ACTIVITIES_KEY) {
        notify();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("lifetrack_db_update", handleUpdate);
      return () => window.removeEventListener("lifetrack_db_update", handleUpdate);
    }
    return () => {};
  }

  try {
    const activitiesCol = collection(db, "users", userId, "activities");
    let q = query(activitiesCol);
    if (dateFilter) {
      q = query(activitiesCol, where("date", "==", dateFilter));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const activities = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
        activities.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(activities);
      },
      (error) => {
        console.error("Firestore onSnapshot error for activities:", error);
        const local = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
        callback(dateFilter ? local.filter((item) => item.date === dateFilter) : local);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("Error setting up activities subscriber:", err);
    return () => {};
  }
}

/**
 * Update an existing activity
 */
export async function updateActivity(userId, activityId, updatedData) {
  if (!userId || !activityId) throw new Error("Missing parameters");

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
    const updated = local.map((item) =>
      item.id === activityId
        ? { ...item, ...updatedData, updatedAt: new Date().toISOString() }
        : item
    );
    setLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId, updated);
    return;
  }

  const docRef = doc(db, "users", userId, "activities", activityId);
  await updateDoc(docRef, {
    ...updatedData,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete an activity
 */
export async function deleteActivity(userId, activityId) {
  if (!userId || !activityId) throw new Error("Missing parameters");

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId);
    const filtered = local.filter((item) => item.id !== activityId);
    setLocalData(LOCAL_STORAGE_ACTIVITIES_KEY, userId, filtered);
    return;
  }

  const docRef = doc(db, "users", userId, "activities", activityId);
  await deleteDoc(docRef);
}

// ==========================================
// GOALS & HABITS (CRUD Operations)
// Collection: users/{userId}/goals
// ==========================================

const INITIAL_SAMPLE_GOALS = [
  {
    title: "Drink 3L of water",
    category: "Health",
    frequency: "daily",
    targetCount: 1,
  },
  {
    title: "Read 20 pages of a book",
    category: "Study",
    frequency: "daily",
    targetCount: 1,
  },
  {
    title: "30-minute workout session",
    category: "Workout",
    frequency: "daily",
    targetCount: 1,
  },
  {
    title: "Complete weekly review",
    category: "Work",
    frequency: "weekly",
    targetCount: 1,
  },
];

/**
 * Add a new goal
 */
export async function addGoal(userId, goalData) {
  if (!userId) throw new Error("User ID is required to add a goal.");

  const today = getTodayDateString();
  const goalPayload = {
    userId,
    title: goalData.title.trim(),
    category: goalData.category || "General",
    frequency: goalData.frequency || "daily", // 'daily' | 'weekly'
    completed: false,
    lastCompletedDate: null,
    completedDates: [],
    streak: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
    const newDoc = { id: "local_goal_" + Date.now(), ...goalPayload };
    setLocalData(LOCAL_STORAGE_GOALS_KEY, userId, [newDoc, ...local]);
    return newDoc;
  }

  const goalsCol = collection(db, "users", userId, "goals");
  const docRef = await addDoc(goalsCol, {
    ...goalPayload,
    serverCreatedAt: serverTimestamp(),
  });

  return { id: docRef.id, ...goalPayload };
}

/**
 * Seed initial goals if user has none
 */
export async function seedInitialGoalsIfEmpty(userId) {
  if (!userId) return;
  const currentGoals = await getGoals(userId);
  if (currentGoals.length === 0) {
    for (const sample of INITIAL_SAMPLE_GOALS) {
      await addGoal(userId, sample);
    }
  }
}

/**
 * Fetch all goals for a user
 */
export async function getGoals(userId) {
  if (!userId) return [];

  const today = getTodayDateString();

  if (!isFirebaseConfigured || !db) {
    let local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
    if (local.length === 0) {
      // populate default initial goals for smooth demo
      local = INITIAL_SAMPLE_GOALS.map((g, idx) => ({
        id: `demo_goal_${idx}`,
        userId,
        ...g,
        completed: idx === 0, // mark one completed for nice demo preview
        lastCompletedDate: idx === 0 ? today : null,
        completedDates: idx === 0 ? [today] : [],
        streak: idx === 0 ? 3 : 0,
        createdAt: new Date().toISOString(),
      }));
      setLocalData(LOCAL_STORAGE_GOALS_KEY, userId, local);
    }
    // Update daily completion status based on today's date
    return local.map((g) => ({
      ...g,
      completedToday: g.frequency === "daily" ? g.lastCompletedDate === today : Boolean(g.completed),
    }));
  }

  try {
    const goalsCol = collection(db, "users", userId, "goals");
    const snapshot = await getDocs(goalsCol);
    const goals = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const completedToday =
        data.frequency === "daily" ? data.lastCompletedDate === today : Boolean(data.completed);
      return {
        id: docSnap.id,
        ...data,
        completedToday,
      };
    });

    return goals.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  } catch (error) {
    console.error("Error fetching goals from Firestore:", error);
    const local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
    return local;
  }
}

/**
 * Real-time listener for goals
 */
export function subscribeToGoals(userId, callback) {
  if (!userId) return () => {};

  const today = getTodayDateString();

  if (!isFirebaseConfigured || !db) {
    const notify = () => {
      const goals = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId).map((g) => ({
        ...g,
        completedToday: g.frequency === "daily" ? g.lastCompletedDate === today : Boolean(g.completed),
      }));
      callback(goals);
    };
    notify();

    const handleUpdate = (e) => {
      if (e.detail?.userId === userId && e.detail?.key === LOCAL_STORAGE_GOALS_KEY) {
        notify();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("lifetrack_db_update", handleUpdate);
      return () => window.removeEventListener("lifetrack_db_update", handleUpdate);
    }
    return () => {};
  }

  try {
    const goalsCol = collection(db, "users", userId, "goals");
    const unsubscribe = onSnapshot(
      goalsCol,
      (snapshot) => {
        const goals = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const completedToday =
            data.frequency === "daily" ? data.lastCompletedDate === today : Boolean(data.completed);
          return {
            id: docSnap.id,
            ...data,
            completedToday,
          };
        });
        goals.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        callback(goals);
      },
      (error) => {
        console.error("Firestore onSnapshot error for goals:", error);
        const local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
        callback(local);
      }
    );

    return unsubscribe;
  } catch (err) {
    console.error("Error setting up goals subscriber:", err);
    return () => {};
  }
}

/**
 * Toggle goal completion status
 */
export async function toggleGoalCompleted(userId, goalId, isCurrentlyCompleted, targetDate = null) {
  if (!userId || !goalId) throw new Error("Missing parameters");

  const today = targetDate || getTodayDateString();
  const nextCompletedState = !isCurrentlyCompleted;

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
    const updated = local.map((goal) => {
      if (goal.id !== goalId) return goal;

      let completedDates = Array.isArray(goal.completedDates) ? [...goal.completedDates] : [];
      let streak = Number(goal.streak) || 0;

      if (nextCompletedState) {
        if (!completedDates.includes(today)) completedDates.push(today);
        streak += 1;
      } else {
        completedDates = completedDates.filter((d) => d !== today);
        streak = Math.max(0, streak - 1);
      }

      return {
        ...goal,
        completed: nextCompletedState,
        lastCompletedDate: nextCompletedState ? today : null,
        completedDates,
        streak,
        completedToday: nextCompletedState,
        updatedAt: new Date().toISOString(),
      };
    });
    setLocalData(LOCAL_STORAGE_GOALS_KEY, userId, updated);
    return;
  }

  const docRef = doc(db, "users", userId, "goals", goalId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const currentData = docSnap.data();
  let completedDates = Array.isArray(currentData.completedDates) ? [...currentData.completedDates] : [];
  let streak = Number(currentData.streak) || 0;

  if (nextCompletedState) {
    if (!completedDates.includes(today)) completedDates.push(today);
    streak += 1;
  } else {
    completedDates = completedDates.filter((d) => d !== today);
    streak = Math.max(0, streak - 1);
  }

  await updateDoc(docRef, {
    completed: nextCompletedState,
    lastCompletedDate: nextCompletedState ? today : null,
    completedDates,
    streak,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Delete a goal
 */
export async function deleteGoal(userId, goalId) {
  if (!userId || !goalId) throw new Error("Missing parameters");

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
    const filtered = local.filter((item) => item.id !== goalId);
    setLocalData(LOCAL_STORAGE_GOALS_KEY, userId, filtered);
    return;
  }

  const docRef = doc(db, "users", userId, "goals", goalId);
  await deleteDoc(docRef);
}

/**
 * Update a goal
 */
export async function updateGoal(userId, goalId, goalData) {
  if (!userId || !goalId) throw new Error("Missing parameters");

  if (!isFirebaseConfigured || !db) {
    const local = getLocalData(LOCAL_STORAGE_GOALS_KEY, userId);
    const updated = local.map((item) =>
      item.id === goalId ? { ...item, ...goalData, updatedAt: new Date().toISOString() } : item
    );
    setLocalData(LOCAL_STORAGE_GOALS_KEY, userId, updated);
    return;
  }

  const docRef = doc(db, "users", userId, "goals", goalId);
  await updateDoc(docRef, {
    ...goalData,
    updatedAt: new Date().toISOString(),
  });
}
