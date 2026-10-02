# LifePulse — Daily Life & Progress Tracker

A full-stack daily life, habit, and progress tracking web application built with **Next.js (App Router)**, **Tailwind CSS**, **Lucide React**, and **Firebase (Authentication & Firestore)**.

---

## 🚀 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Design & Styling:** Tailwind CSS (Clean, minimalist, and user-friendly interface)
- **Night / Dark Mode:** Integrated theme engine with Sun/Moon switcher and persistent preference
- **Icons:** Lucide React
- **Backend & Auth:** Firebase v12 (Google Authentication & Cloud Firestore)

---

## 📁 Project Architecture

```
tracker/
├── .env.example                # Example environment variables template
├── .env.local                  # Local environment file (add your Firebase keys here)
├── firebase.js                 # Root Firebase configuration re-export
├── package.json
└── src/
    ├── app/
    │   ├── globals.css         # Global styling and animations
    │   ├── layout.js           # Root layout wrapped with AuthProvider
    │   └── page.js             # Main page: Landing page & Dashboard view
    ├── components/
    │   ├── AnalyticsView.js    # Time distribution and streak analytics
    │   ├── DailyLogs.js        # Daily activity logging (CRUD, categories, presets)
    │   ├── FirebaseBanner.js   # Live connection status banner
    │   ├── FirebaseSetupModal.js # Interactive Firebase Console setup walkthrough
    │   ├── GoalTracker.js      # Daily & weekly goals with checkboxes & streaks
    │   ├── Header.js           # Greeting header with Google profile name & actions
    │   ├── LandingPage.js      # Protected route barrier with Google Sign-In
    │   ├── ProgressOverview.js # Dynamic progress bar, streak counter & stats
    │   └── Sidebar.js          # Responsive sidebar navigation & user profile
    ├── context/
    │   └── AuthContext.js      # Google Auth state, login/logout, guest demo mode
    └── lib/
        ├── db.js               # User-scoped Firestore CRUD helpers (activities & goals)
        └── firebase.js         # Firebase App, Auth, and Firestore initialization
```

---

## 🔒 Data Isolation & Firestore Structure

Every record is isolated and tied to the user's Google UID:
- **Daily Activities:** `users/{userId}/activities/{activityId}`
  - `userId`: string
  - `title`: string
  - `category`: Work | Workout | Study | Hobbies | Health | Other
  - `duration`: number (in minutes)
  - `notes`: string
  - `date`: YYYY-MM-DD
  - `createdAt`: serverTimestamp
- **Goals & Habits:** `users/{userId}/goals/{goalId}`
  - `userId`: string
  - `title`: string
  - `category`: string
  - `frequency`: 'daily' | 'weekly'
  - `completed`: boolean
  - `completedDates`: array of completed date strings
  - `streak`: number of consecutive completed days

---

## 🛡️ Recommended Firestore Security Rules

In the Firebase Console under **Firestore Database > Rules**, you can use these rules to ensure users can only read and write their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## ⚙️ Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env.local` (see setup guide below).

3. Start the Next.js development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.
