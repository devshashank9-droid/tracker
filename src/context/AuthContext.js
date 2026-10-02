"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "@/lib/firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  isFirebaseConfigured: false,
  isDemoMode: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
  loginAsDemoUser: () => {},
});

const DEMO_USER_KEY = "lifetrack_demo_user_active";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check if demo user was active
    const savedDemo = typeof window !== "undefined" ? localStorage.getItem(DEMO_USER_KEY) : null;
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setUser(parsed);
        setIsDemoMode(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }

    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Explorer",
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL || null,
            isDemo: false,
          });
          setIsDemoMode(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem(DEMO_USER_KEY);
          }
        } else {
          // If no Firebase user and not in demo mode
          setUser((prev) => (prev?.isDemo ? prev : null));
        }
        setLoading(false);
      },
      (authError) => {
        console.error("Firebase auth state change error:", authError);
        setError(authError.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    setError(null);

    if (!isFirebaseConfigured || !auth || !googleProvider) {
      const err = new Error(
        "Firebase is not yet configured. Please set your credentials in .env.local or explore in Demo Mode."
      );
      setError(err.message);
      throw err;
    }

    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      setUser({
        uid: loggedUser.uid,
        displayName: loggedUser.displayName || loggedUser.email?.split("@")[0] || "Explorer",
        email: loggedUser.email,
        photoURL: loggedUser.photoURL || null,
        isDemo: false,
      });
      setIsDemoMode(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem(DEMO_USER_KEY);
      }
      return loggedUser;
    } catch (err) {
      console.error("Google sign-in error:", err);
      // Give readable error message for common Firebase auth errors
      let friendlyMessage = err.message;
      if (err.code === "auth/popup-closed-by-user") {
        friendlyMessage = "Sign-in popup was closed before completing.";
      } else if (err.code === "auth/unauthorized-domain") {
        friendlyMessage =
          "This domain (localhost) is not authorized in Firebase Console > Authentication > Settings > Authorized domains.";
      } else if (err.code === "auth/operation-not-allowed") {
        friendlyMessage =
          "Google sign-in is not enabled. Go to Firebase Console > Authentication > Sign-in method and enable Google.";
      }
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginAsDemoUser = () => {
    const demoUser = {
      uid: "demo_user_101",
      displayName: "Alex Morgan",
      email: "alex.demo@lifeflow.app",
      photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      isDemo: true,
    };
    setUser(demoUser);
    setIsDemoMode(true);
    setError(null);
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    }
  };

  const logout = async () => {
    try {
      if (auth && !isDemoMode) {
        await signOut(auth);
      }
      setUser(null);
      setIsDemoMode(false);
      if (typeof window !== "undefined") {
        localStorage.removeItem(DEMO_USER_KEY);
      }
    } catch (err) {
      console.error("Error signing out:", err);
      setError(err.message);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isFirebaseConfigured,
        isDemoMode,
        loginWithGoogle,
        logout,
        loginAsDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
